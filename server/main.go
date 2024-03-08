package main

import (
	"awesomeChat1/internal/structures"
	"awesomeChat1/package/config"
	"awesomeChat1/package/database"
	"awesomeChat1/package/logger"
	"awesomeChat1/package/tkn"
	"database/sql"
	"encoding/json"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"golang.org/x/crypto/bcrypt"
	"io"
	"net/http"
	"strconv"
)

func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

func upgradeConnection(c *gin.Context, rooms *map[int]*structures.Room) {
	//todo настроить после тестов
	upgrader.CheckOrigin = func(r *http.Request) bool { return true }

	ws, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		logger.Log.Errorln(err)
	}

	chatNumber, _ := strconv.Atoi(c.Param("num"))
	logger.Log.Traceln(chatNumber)

	room, exists := (*rooms)[chatNumber]
	if !exists {
		currentUser := structures.ChatUser{
			Name:       "User 1",
			Connection: ws,
		}
		room = &structures.Room{
			Number: chatNumber,
			Users:  []*structures.ChatUser{&currentUser}, // сразу инициализация
		}
		(*rooms)[chatNumber] = room
		logger.Log.Traceln("Created room №" + strconv.Itoa(chatNumber))
		logger.Log.Traceln(currentUser.Name + " added to room")
	} else {
		users := &((*rooms)[chatNumber].Users)
		//todo if?
		if len(*users) <= 1 {
			currentUser := structures.ChatUser{
				Name:       "User 2",
				Connection: ws,
			}
			*users = append(*users, &currentUser)
			logger.Log.Traceln(currentUser.Name + " added to room №" + strconv.Itoa(chatNumber))
		} else {
			logger.Log.Traceln("Too many users in the room")
		}
	}
	logger.Log.Traceln("Current amount of users: " + strconv.Itoa(len((*rooms)[chatNumber].Users)))

	go reader(ws, room)
}

func informUserLeft(room *structures.Room, username string) {
	msg := structures.Message{
		Type:     "userLeft",
		Content:  []byte(username + " left the chatroom"),
		Username: "default",
	}

	messageToSend, err := json.Marshal(msg)
	if err != nil {
		logger.Log.Errorln(err)
	}
	logger.Log.Traceln("Sending:", string(messageToSend))

	for _, user := range room.Users {
		err = user.Connection.WriteMessage(websocket.TextMessage, messageToSend)
		if err != nil {
			logger.Log.Errorln(err)
		}
	}
}

func reader(conn *websocket.Conn, room *structures.Room) {
	var leftUser string
	defer func() {
		for i, user := range room.Users {
			if user.Connection == conn {
				room.Users = append(room.Users[:i], room.Users[i+1:]...)
				leftUser = user.Name
				break
			}
		}
		informUserLeft(room, leftUser)
	}()

	for {
		_, p, err := conn.ReadMessage()
		if err != nil {
			logger.Log.Traceln("ReadMessage error: " + err.Error())
			logger.Log.Errorln(err)
			return
		}
		logger.Log.Traceln("Received message:", string(p))

		var receivedMessage structures.Message
		err = json.Unmarshal(p, &receivedMessage)

		// отправить сообщение всем пользователям в комнате, кроме отправителя
		if receivedMessage.Type == "usual" {
			for _, user := range room.Users {
				if user.Connection != conn {
					err = user.Connection.WriteMessage(websocket.TextMessage, p)
					if err != nil {
						logger.Log.Errorln(err)
					}
				}
			}
		}
	}
}

func connectToChatroom(c *gin.Context, rooms *map[int]*structures.Room) {
	var chatNumRequest structures.ChatRequest

	if err := c.BindJSON(&chatNumRequest); err != nil {
		//      gin.H ~ map[string]interface{}
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	chatNumber := chatNumRequest.ChatNumber

	room, exists := (*rooms)[chatNumber]
	if !exists {
		c.JSON(http.StatusOK, gin.H{
			"success": true,
		})
	} else {
		if len(room.Users) <= 1 {
			c.JSON(http.StatusOK, gin.H{
				"success": true,
			})
		} else {
			c.JSON(http.StatusForbidden, gin.H{
				"error": "Chat room is full. Cannot connect.",
			})
		}
	}

}

func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(bytes), err
}

func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

func isUsernameTaken(username string, db *sql.DB) (bool, error) {
	var count int
	if err := db.QueryRow("SELECT COUNT(*) FROM users WHERE username = $1",
		username).Scan(&count); err != nil {
		return false, err
	}
	return count > 0, nil
}

func register(c *gin.Context, db *sql.DB) {
	var user structures.LoginRegisterUser

	err := c.ShouldBindJSON(&user)
	if err != nil {
		logger.Log.Errorln("Error unmarshalling JSON: " + err.Error())
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if len(user.Username) > 20 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Username must be less than 20 symbols"})
		return
	}

	res, err := isUsernameTaken(user.Username, db)
	if err != nil {
		logger.Log.Errorln("Error querying database: " + err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal Server Error"})
		return
	}
	if res == true {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Username is already taken"})
		return
	}

	user.PasswordHash, err = HashPassword(user.Password)

	_, err = db.Exec("INSERT INTO users (username, password_hash) VALUES ($1, $2)", user.Username, user.PasswordHash)
	if err != nil {
		fmt.Println("Error inserting data:", err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Registration successful"})
}

func login(c *gin.Context, db *sql.DB) {
	var user structures.LoginRegisterUser

	err := c.ShouldBindJSON(&user)
	if err != nil {
		logger.Log.Errorln("Error unmarshalling JSON: " + err.Error())
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	logger.Log.Infoln(user.Username, user.Password)

	var databaseUser structures.LoginRegisterUser
	err = db.QueryRow("SELECT user_id, password_hash FROM users WHERE username = $1", user.Username).Scan(&databaseUser.ID, &databaseUser.PasswordHash)
	if err != nil {
		logger.Log.Errorln("Error querying database: " + err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal Server Error"})
		return
	}

	logger.Log.Infoln(databaseUser.PasswordHash)
	if CheckPasswordHash(user.Password, databaseUser.PasswordHash) == false {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	logger.Log.Traceln(user.Username)
	token, err := tkn.GenerateToken(user.Username)
	if err != nil {
		logger.Log.Errorln("Error while generating token: " + err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	fmt.Println(token)
	c.JSON(http.StatusOK, gin.H{"token": token})
}

func main() {
	cfg := config.GetConfig()
	db := database.Init(cfg)

	defer func(db *sql.DB) {
		err := db.Close()
		if err != nil {
			logger.Log.Errorln("Error closing database: " + err.Error())
		}
	}(db)

	logger.Log.Infoln("Starting service...")
	router := gin.Default()
	gin.SetMode(gin.ReleaseMode)
	gin.DefaultWriter = io.Discard
	router.Use(CORSMiddleware())

	var rooms = make(map[int]*structures.Room)

	logger.Log.Infoln("Serving handlers...")

	router.GET("/chatroom/:num", func(c *gin.Context) {
		upgradeConnection(c, &rooms)
	})
	router.POST("/connect", func(c *gin.Context) {
		connectToChatroom(c, &rooms)
	})
	router.POST("/login", func(c *gin.Context) {
		login(c, db)
	})
	router.POST("/register", func(c *gin.Context) {
		register(c, db)
	})

	logger.Log.Info("Starting router...")
	logger.Log.Trace("On port :" + cfg.Listen.Port)
	logger.Log.Fatal(router.Run(":" + cfg.Listen.Port))
}
