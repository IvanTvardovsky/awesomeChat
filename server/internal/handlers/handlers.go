package handlers

import (
	"awesomeChat/internal/auth"
	"awesomeChat/internal/informing"
	"awesomeChat/internal/myws"
	"awesomeChat/internal/structures"
	"awesomeChat/package/logger"
	"awesomeChat/package/tkn"
	"awesomeChat/package/web"
	"database/sql"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis/v8"
	"math/rand"
	"net/http"
	"strconv"
	"time"
)

func Register(c *gin.Context, db *sql.DB) {
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

	res, err := auth.IsUsernameTaken(user.Username, db)
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

func Login(c *gin.Context, db *sql.DB, rc *redis.Client) {
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

	if tkn.CheckPasswordHash(user.Password, databaseUser.PasswordHash) == false {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	//SID := tkn.RandString(32)

	//cookie, err := c.Cookie("censorship")

	str := "censorship"

	/*if err != nil {
		cookie = "NotSet"
		c.SetCookie("censorship", str, 30, "/", "localhost", false, false)
	}*/

	c.SetCookie("censorship", str, 900, "/", "localhost", false, true)

	//err = rc.Set(c.Request.Context(), SID, "user_id", 2*time.Hour).Err()

	c.JSON(http.StatusOK, gin.H{"message": "Logged in"})
}

func ConnectToChatroom(c *gin.Context, rooms *map[int]*structures.Room) {
	chatNumber, _ := strconv.Atoi(c.Param("num"))
	username := c.Query("username")
	password := c.Query("password")
	logger.Log.Traceln(username + " wants to connect to room " + c.Param("num"))

	room, exists := (*rooms)[chatNumber]
	if !exists {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Room does not exists"})
		return
	}

	if !room.Open && room.Password != password {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Wrong password"})
		return
	}

	websocket, err := web.UpgradeConnection(c)
	if err != nil {
		logger.Log.Errorln("Error upgrading connection:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to upgrade connection"})
		return
	}

	users := &((*rooms)[chatNumber].Users)

	// можно увеличить количество пользователей
	if len(*users) < room.MaxUsers {
		informing.InformUserJoined(room, username)
		currentUser := structures.ChatUser{
			Name:       username,
			Connection: websocket,
		}
		*users = append(*users, &currentUser)
		logger.Log.Traceln(currentUser.Name + " added to room №" + strconv.Itoa(chatNumber))
	} else {
		logger.Log.Traceln("Too many users in the room")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Too many users in the room"})
		return
	}

	logger.Log.Traceln(fmt.Sprintf("Current amount of users in room %d: %d", chatNumber, len((*rooms)[chatNumber].Users)))
	informing.SetRoomName(websocket, room.Name, room.ID)
	go myws.Reader(websocket, room, rooms)
}

func getRandomAvailableRoomNumber(rooms *map[int]*structures.Room, maxRooms int) int {
	for {
		rand.Seed(time.Now().UnixNano())
		randomRoom := rand.Intn(maxRooms)
		if _, ok := (*rooms)[randomRoom]; !ok {
			return randomRoom
		}
	}
}

func CreateChatroom(c *gin.Context, rooms *map[int]*structures.Room) {
	//todo вынести забор аргументов в функцию?
	username := c.Query("username")
	roomname := c.Query("roomname")
	open, err := strconv.ParseBool(c.Query("open"))
	if err != nil {
		//todo
	}
	password := c.Query("password")
	maxUsers, err := strconv.Atoi(c.Query("maxUsers"))
	if err != nil {
		//todo
	}
	if maxUsers <= 1 {
		maxUsers = 10
	}

	chatNumber := getRandomAvailableRoomNumber(rooms, 1000)

	logger.Log.Traceln(fmt.Sprintf("%s wants to connect to room %d", username, chatNumber))

	room, exists := (*rooms)[chatNumber]
	if exists {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Room already exists"})
		return
	}

	if !open && password == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Password is empty"})
		return
	}

	websocket, err := web.UpgradeConnection(c)
	if err != nil {
		logger.Log.Errorln("Error upgrading connection:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to upgrade connection"})
		return
	}

	currentUser := structures.ChatUser{
		Name:       username,
		Connection: websocket,
	}
	room = &structures.Room{
		ID:       chatNumber,
		Name:     roomname,
		Open:     open,
		Password: password,
		Users:    []*structures.ChatUser{&currentUser}, // сразу инициализация
		MaxUsers: maxUsers,
	}
	(*rooms)[chatNumber] = room
	logger.Log.Traceln("Created room №" + strconv.Itoa(chatNumber))
	logger.Log.Traceln(currentUser.Name + " added to room")

	logger.Log.Traceln(fmt.Sprintf("Current amount of users in room %d: %d", chatNumber, len((*rooms)[chatNumber].Users)))
	informing.SetRoomName(websocket, room.Name, room.ID)
	go myws.Reader(websocket, room, rooms)
}
