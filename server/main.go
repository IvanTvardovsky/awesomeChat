package main

import (
	"awesomeChat1/package/logger"
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

// todo переместить
type ChatRequest struct {
	ChatNumber int `json:"chatNumber"`
}

type User struct {
	Name       string
	Connection *websocket.Conn
}

type Room struct {
	Number int
	Users  []*User
}

func upgradeConnection(c *gin.Context, rooms *map[int]*Room) {
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
		currentUser := User{
			Name:       "User 1",
			Connection: ws,
		}
		room = &Room{
			Number: chatNumber,
			Users:  []*User{&currentUser}, // сразу инициализация
		}
		(*rooms)[chatNumber] = room
		logger.Log.Traceln("Created room №" + strconv.Itoa(chatNumber))
		logger.Log.Traceln(currentUser.Name + " added to room")
	} else {
		users := &((*rooms)[chatNumber].Users)
		//todo if?
		if len(*users) <= 1 {
			currentUser := User{
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

func reader(conn *websocket.Conn, room *Room) {
	defer func() {
		for i, user := range room.Users {
			if user.Connection == conn {
				room.Users = append(room.Users[:i], room.Users[i+1:]...)
				return
			}
		}
	}()
	for {
		_, p, err := conn.ReadMessage()
		if err != nil {
			logger.Log.Traceln("ReadMessage error: " + err.Error())
			logger.Log.Errorln(err)
			return
		}
		logger.Log.Traceln("Received message:", string(p))

		// отправить сообщение всем пользователям в комнате, кроме отправителя
		for _, user := range room.Users {
			if user.Connection != conn {
				err := user.Connection.WriteMessage(websocket.TextMessage, p)
				if err != nil {
					logger.Log.Errorln(err)
				}
			}
		}
	}
}

func homePage(c *gin.Context) {
	fmt.Fprintf(c.Writer, "Home Page")
}

func connectToChatroom(c *gin.Context, rooms *map[int]*Room) {
	var chatNumRequest ChatRequest

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

func main() {
	logger.Log.Infoln("Starting service...")
	router := gin.Default()
	gin.SetMode(gin.ReleaseMode)
	gin.DefaultWriter = io.Discard
	router.Use(CORSMiddleware())

	var rooms = make(map[int]*Room)

	logger.Log.Infoln("Serving handlers...")
	router.GET("/", homePage)
	router.GET("/chatroom/:num", func(c *gin.Context) {
		upgradeConnection(c, &rooms)
	})
	router.POST("/connect", func(c *gin.Context) {
		connectToChatroom(c, &rooms)
	})

	logger.Log.Info("Starting router...")
	logger.Log.Fatal(router.Run(":8080"))
}
