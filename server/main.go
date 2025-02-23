package main

import (
	"awesomeChat/internal/handlers"
	"awesomeChat/internal/myws"
	"awesomeChat/internal/structures"
	"awesomeChat/package/config"
	"awesomeChat/package/database"
	"awesomeChat/package/logger"
	"awesomeChat/package/web"
	"database/sql"
	"github.com/gin-gonic/gin"
	"io"
	"sort"
	"time"
)

// todo
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		//tokenString, err := c.Cookie("auth_token")
		//if err != nil {
		//	c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		//	return
		//}
		//
		//claims, err := tkn.ParseJWT(tokenString)
		//if err != nil {
		//	c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
		//	return
		//}
		//
		//c.Set("userID", claims.UserID)
		c.Next()
	}
}

func main() {
	cfg := config.GetConfig()
	time.Sleep(5 * time.Second)
	db := database.InitPostgres(cfg)
	//redisClient := database.InitRedis(cfg)

	defer func(db *sql.DB) {
		err := db.Close()
		if err != nil {
			logger.Log.Errorln("Error closing PG database: " + err.Error())
		}
	}(db)
	//defer func(redisClient *redis.Client) {
	//	err := redisClient.Close()
	//	if err != nil {
	//		logger.Log.Errorln("Error closing Redis database: " + err.Error())
	//	}
	//}(redisClient)

	logger.Log.Infoln("Starting service...")
	router := gin.Default()
	gin.SetMode(gin.ReleaseMode)
	gin.DefaultWriter = io.Discard
	router.Use(web.CORSMiddleware())

	server := myws.NewWebSocketServer()
	var rooms = make(map[int]*structures.Room)

	logger.Log.Infoln("Serving handlers...")

	router.POST("/login", func(c *gin.Context) {
		handlers.Login(c, db /*, redisClient*/)
	})
	router.GET("/logout", func(c *gin.Context) {
		//login(c, db) //todo
	})
	router.POST("/register", func(c *gin.Context) {
		handlers.Register(c, db)
	})
	router.GET("/connectToChatroom/:num", AuthMiddleware(), func(c *gin.Context) {
		handlers.ConnectToChatroom(c, &rooms)
	})
	router.GET("/createChatroom/", AuthMiddleware(), func(c *gin.Context) {
		handlers.CreateChatroom(c, &rooms)
	})
	router.GET("/roomUpdates", func(c *gin.Context) {
		server.HandleConnections(c.Writer, c.Request, &rooms)
	})
	router.GET("/categories", func(c *gin.Context) {
		handlers.GetCategories(c, db)
	})
	router.GET("/categories/:id", func(c *gin.Context) {
		handlers.GetCategory(c, db)
	})
	router.GET("/search", func(c *gin.Context) {
		handlers.SearchTopics(c, db)
	})
	//router.POST("/categories/:id", func(c *gin.Context) {
	//	handlers.UpdateStatistics(c, db)
	//})

	go server.HandleMessages()
	go func() {
		for {
			time.Sleep(5 * time.Second)
			roomsToSend := *structures.MakeRoomList(&rooms)
			sort.Slice(roomsToSend, func(i, j int) bool {
				return (roomsToSend)[i].ID < (roomsToSend)[j].ID
			})
			logger.Log.Traceln("Room update 5s: ", roomsToSend)
			server.Broadcast <- roomsToSend
		}
	}()

	logger.Log.Info("Starting router...")
	logger.Log.Trace("On port :" + cfg.Listen.Port)
	logger.Log.Fatal(router.Run(":" + cfg.Listen.Port))
}
