package database

import (
	"awesomeChat/internal/structures"
	"context"
	"github.com/go-redis/redis/v8"
)

// InitRedis todo config
func InitRedis(cfg *structures.Config) *redis.Client {
	var ctx = context.Background()
	redisClient := redis.NewClient(&redis.Options{
		Addr:     "localhost:6379",
		Password: "",
		DB:       0,
	})

	_, err := redisClient.Ping(ctx).Result()
	if err != nil {
		panic(err)
	}

	return redisClient
}
