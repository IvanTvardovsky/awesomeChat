package handlers

import (
	"awesomeChat/internal/informing"
	"awesomeChat/internal/myws"
	"awesomeChat/internal/structures"
	"awesomeChat/package/logger"
	"awesomeChat/package/tkn"
	"awesomeChat/package/web"
	"database/sql"
	"errors"
	"fmt"
	"github.com/gin-gonic/gin"
	"math/rand"
	"net/http"
	"regexp"
	"strconv"
	"strings"
	"time"
)

func Register(c *gin.Context, db *sql.DB) {
	var user structures.RegisterRequest

	if err := c.ShouldBindJSON(&user); err != nil {
		logger.Log.Errorln("Error binding JSON:", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
		return
	}

	if len(user.Username) > 20 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Username must be less than 20 symbols"})
		return
	}

	if !isValidEmail(user.Email) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid email format"})
		return
	}

	if taken, err := isCredentialTaken(db, "username", user.Username); err != nil || taken {
		handleCredentialCheck(c, err, taken, "Username is already taken")
		return
	}

	if taken, err := isCredentialTaken(db, "email", user.Email); err != nil || taken {
		handleCredentialCheck(c, err, taken, "Email is already taken")
		return
	}

	hashedPassword, err := tkn.HashPassword(user.Password)
	if err != nil {
		logger.Log.Errorln("Password hash error:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}

	if _, err := db.Exec(
		"INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3)",
		user.Username,
		user.Email,
		hashedPassword,
	); err != nil {
		logger.Log.Errorln("Database insert error:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Registration failed"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Registration successful"})
}

func isCredentialTaken(db *sql.DB, field string, value string) (bool, error) {
	var count int
	err := db.QueryRow(
		fmt.Sprintf("SELECT COUNT(*) FROM users WHERE %s = $1", field),
		value,
	).Scan(&count)
	return count > 0, err
}

func handleCredentialCheck(c *gin.Context, err error, taken bool, message string) {
	if err != nil {
		logger.Log.Errorln("Database query error:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}
	if taken {
		c.JSON(http.StatusBadRequest, gin.H{"error": message})
	}
}

func isValidEmail(email string) bool {
	emailRegex := `^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,4}$`
	return regexp.MustCompile(emailRegex).MatchString(strings.ToLower(email))
}

func Login(c *gin.Context, db *sql.DB) {
	var credentials structures.LoginRequest

	if err := c.ShouldBindJSON(&credentials); err != nil {
		logger.Log.Errorln("Error binding JSON:", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
		return
	}

	logger.Log.Traceln(credentials)

	var user struct {
		ID           int
		PasswordHash string
	}

	err := db.QueryRow(
		"SELECT user_id, password_hash FROM users WHERE username = $1 OR email = $1",
		credentials.Identifier,
	).Scan(&user.ID, &user.PasswordHash)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			logger.Log.Traceln("sql Invalid credentials")
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		} else {
			logger.Log.Errorln("Database query error:", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		}
		return
	}

	if !tkn.CheckPasswordHash(credentials.Password, user.PasswordHash) {
		logger.Log.Traceln("hash Invalid credentials")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	tokenString, err := tkn.GenerateJWT(user.ID)
	if err != nil {
		logger.Log.Errorln("Token generation error:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}

	c.SetCookie("auth_token", tokenString, 3600*24, "/", "localhost", false, true)
	c.JSON(http.StatusOK, gin.H{
		"message": "Login successful",
		"user_id": user.ID,
	})
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
