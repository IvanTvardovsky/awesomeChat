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

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		logger.Log.Infoln("HI IM censorship")
	}
}

func main() {
	logger.Log.Infoln("Sleeping 10s for database to start...")
	time.Sleep(10 * time.Second)
	cfg := config.GetConfig()
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

	go server.HandleMessages()
	go func() {
		for {
			time.Sleep(5 * time.Second)
			roomsToSend := *structures.MakeRoomList(&rooms)
			sort.Slice(roomsToSend, func(i, j int) bool {
				return (roomsToSend)[i].ID < (roomsToSend)[j].ID
			})
			//logger.Log.Traceln("Room update 5s: ", roomsToSend)
			server.Broadcast <- roomsToSend
		}
	}()

	logger.Log.Info("Starting router...")
	logger.Log.Trace("On port :" + cfg.Listen.Port)
	logger.Log.Fatal(router.Run(":" + cfg.Listen.Port))
}
