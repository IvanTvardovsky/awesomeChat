package main

import (
	"awesomeChat/internal/informing"
	"awesomeChat/internal/structures"
	"awesomeChat/internal/utils"
	"awesomeChat/package/config"
	"awesomeChat/package/database"
	"awesomeChat/package/logger"
	"awesomeChat/package/tkn"
	"database/sql"
	"encoding/json"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
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

func upgradeConnection(c *gin.Context) (*websocket.Conn, error) {
	//todo настроить после тестов
	upgrader.CheckOrigin = func(r *http.Request) bool { return true }

	ws, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		logger.Log.Errorln(err)
		return nil, err
	}
	return ws, nil
}

func connectToChatroom(c *gin.Context, rooms *map[int]*structures.Room) {
	chatNumber, _ := strconv.Atoi(c.Param("num"))
	username := c.Query("username")
	logger.Log.Traceln(username + " wants to connect to room " + c.Param("num"))

	room, exists := (*rooms)[chatNumber]
	if !exists {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Room does not exists"})
		return
	}

	ws, err := upgradeConnection(c)
	if err != nil {
		logger.Log.Errorln("Error upgrading connection:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to upgrade connection"})
		return
	}

	users := &((*rooms)[chatNumber].Users)

	// можно увеличить количество пользователей
	if len(*users) <= 1 {
		informing.InformUserJoined(room, username)
		currentUser := structures.ChatUser{
			Name:       username,
			Connection: ws,
		}
		*users = append(*users, &currentUser)
		logger.Log.Traceln(currentUser.Name + " added to room №" + strconv.Itoa(chatNumber))
	} else {
		logger.Log.Traceln("Too many users in the room")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Too many users in the room"})
		return
	}

	logger.Log.Traceln(fmt.Sprintf("Current amount of users in room %d: %d", chatNumber, len((*rooms)[chatNumber].Users)))
	informing.SetRoomName(ws, room.Name, room.Number)
	go reader(ws, room)
}

func createChatroom(c *gin.Context, rooms *map[int]*structures.Room) {
	chatNumber, _ := strconv.Atoi(c.Param("num"))
	username := c.Query("username")
	roomname := c.Query("roomname")
	logger.Log.Traceln(username + " wants to connect to room " + c.Param("num"))

	room, exists := (*rooms)[chatNumber]
	if exists {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Room already exists"})
		return
	}

	ws, err := upgradeConnection(c)
	if err != nil {
		logger.Log.Errorln("Error upgrading connection:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to upgrade connection"})
		return
	}

	currentUser := structures.ChatUser{
		Name:       username,
		Connection: ws,
	}
	room = &structures.Room{
		Number: chatNumber,
		Name:   roomname,
		Users:  []*structures.ChatUser{&currentUser}, // сразу инициализация
	}
	(*rooms)[chatNumber] = room
	logger.Log.Traceln("Created room №" + strconv.Itoa(chatNumber))
	logger.Log.Traceln(currentUser.Name + " added to room")

	logger.Log.Traceln(fmt.Sprintf("Current amount of users in room %d: %d", chatNumber, len((*rooms)[chatNumber].Users)))
	informing.SetRoomName(ws, room.Name, room.Number)
	go reader(ws, room)
}

// для первичной проверки клиентом можно ли зайти в чатрум (?)
func isPossibleToConnectToChatroom(c *gin.Context, rooms *map[int]*structures.Room) {
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
		informing.InformUserLeft(room, leftUser)
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

		switch receivedMessage.Type {
		case "usual":
			for _, user := range room.Users { // отправить сообщение всем пользователям в комнате, кроме отправителя
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

	res, err := utils.IsUsernameTaken(user.Username, db)
	if err != nil {
		logger.Log.Errorln("Error querying database: " + err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal Server Error"})
		return
	}
	if res == true {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Username is already taken"})
		return
	}

	user.PasswordHash, err = tkn.HashPassword(user.Password)

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
	if tkn.CheckPasswordHash(user.Password, databaseUser.PasswordHash) == false {
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

	// connectToChatRoom/%room_id?username=: upgrade -> connect user to room id
	// createChatRoom/%room_id?username=&roomname= -> create room, connect user

	router.GET("/connectToChatroom/:num", func(c *gin.Context) {
		connectToChatroom(c, &rooms)
	})
	router.GET("/createChatroom/:num", func(c *gin.Context) {
		createChatroom(c, &rooms)
	})
	router.POST("/connect", func(c *gin.Context) {
		isPossibleToConnectToChatroom(c, &rooms)
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
