package main

import (
	"awesomeChat/internal/handlers"
	"awesomeChat/internal/structures"
	"awesomeChat/package/config"
	"awesomeChat/package/database"
	"awesomeChat/package/logger"
	"awesomeChat/package/web"
	"database/sql"
	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis/v8"
	"io"
)

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		logger.Log.Infoln("HI IM censorship")
	}
}

func main() {
	cfg := config.GetConfig()
	db := database.InitPostgres(cfg)
	redisClient := database.InitRedis(cfg)

	defer func(db *sql.DB) {
		err := db.Close()
		if err != nil {
			logger.Log.Errorln("Error closing database: " + err.Error())
		}
	}(db)
	defer func(redisClient *redis.Client) {
		err := redisClient.Close()
		if err != nil {

		}
	}(redisClient)

	logger.Log.Infoln("Starting service...")
	router := gin.Default()
	gin.SetMode(gin.ReleaseMode)
	gin.DefaultWriter = io.Discard
	router.Use(web.CORSMiddleware())

	var rooms = make(map[int]*structures.Room)

	logger.Log.Infoln("Serving handlers...")

	// connectToChatRoom/%room_id?username=: upgrade -> connect user to room id
	// createChatRoom/%room_id?username=&roomname= -> create room, connect user

	router.POST("/login", func(c *gin.Context) {
		handlers.Login(c, db, redisClient)
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
	router.GET("/createChatroom/:num", AuthMiddleware(), func(c *gin.Context) {
		handlers.CreateChatroom(c, &rooms)
	})
	router.POST("/connect", func(c *gin.Context) {
		//isPossibleToConnectToChatroom(c, &rooms)
	})

	logger.Log.Info("Starting router...")
	logger.Log.Trace("On port :" + cfg.Listen.Port)
	logger.Log.Fatal(router.Run(":" + cfg.Listen.Port))

}
