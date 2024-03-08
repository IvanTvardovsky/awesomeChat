package database

import (
	"awesomeChat1/internal/structures"
	"awesomeChat1/package/logger"
	"database/sql"
	"fmt"
	_ "github.com/lib/pq"
)

func Init(cfg *structures.Config) *sql.DB {
	logger.Log.Infoln("Connecting to database...")
	logger.Log.Traceln(fmt.Sprintf("Connecting to host=%s port=%d user=%s dbname=%s",
		cfg.Storage.Host, cfg.Storage.Port, cfg.Storage.Username, cfg.Storage.Database))
	psqlconn := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable",
		cfg.Storage.Host, cfg.Storage.Port, cfg.Storage.Username, cfg.Storage.Password, cfg.Storage.Database)

	db, err := sql.Open("postgres", psqlconn)
	if err != nil {
		logger.Log.Fatalln("Can not connect to database: " + err.Error())
	}

	err = db.Ping()
	if err != nil {
		logger.Log.Fatalln("Error pinging database: " + err.Error())
	}

	logger.Log.Infoln("Connected to database")
	return db
}
