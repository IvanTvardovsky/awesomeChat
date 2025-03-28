package myws

import (
	"awesomeChat/internal/informing"
	"awesomeChat/internal/structures"
	"awesomeChat/package/logger"
	"encoding/json"
	"fmt"
	"github.com/gorilla/websocket"
	"net/http"
	"sync"
	"time"
)

func Reader(conn *websocket.Conn, room *structures.Room, rooms *map[int]*structures.Room) {
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
		logger.Log.Traceln(fmt.Sprintf("Current amount of users in room %d: %d", room.ID, len(room.Users)))
		if len(room.Users) == 0 {
			delete(*rooms, room.ID)
			logger.Log.Traceln(fmt.Sprintf("Deleting room %d", room.ID))
		}
	}()

	for {
		_, p, err := conn.ReadMessage()
		if err != nil {
			logger.Log.Traceln("ReadMessage error: " + err.Error())
			return
		}
		logger.Log.Traceln("Received message:", string(p))

		var msg structures.Message
		err = json.Unmarshal(p, &msg)
		if err != nil {
			logger.Log.Traceln("Unmarshal message error: " + err.Error())
			return
		}

		switch msg.Type {
		case "usual":
			for _, user := range room.Users {
				if user.Connection != conn { // отправить сообщение всем пользователям в комнате, кроме отправителя
					err = user.Connection.WriteMessage(websocket.TextMessage, p)
					if err != nil {
						logger.Log.Errorln(err)
					}
				}
			}
		case "ready_check":
			handleReadyCheck(room, conn, msg.Username)
		case "rate":
			//handleRating(room, msg)
		}
	}
}

func handleReadyCheck(room *structures.Room, conn *websocket.Conn, username string) {
	room.Mu.Lock()
	defer room.Mu.Unlock()

	room.ReadyUsers[username] = true

	if len(room.ReadyUsers) == 2 {
		startDiscussion(room)
	}
}

func startDiscussion(room *structures.Room) {
	room.DiscussionActive = true
	room.Duration = 10 * time.Minute
	room.StartTime = time.Now()

	// отправка стартового сообщения
	informing.SendDiscussionStart(room)

	// запуск таймера
	go discussionTimer(room)
}

// в логике таймера
func discussionTimer(room *structures.Room) {
	ticker := time.NewTicker(1 * time.Minute) // отправляем обновления раз в минуту
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			remaining := room.Duration - time.Since(room.StartTime)
			if remaining <= 0 {
				informing.SendDiscussionEnd(room)
				return
			}
			informing.SendTimerUpdate(room, remaining)
		}
	}
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

type WebSocketServer struct {
	clients   map[*websocket.Conn]any
	Broadcast chan []structures.RoomForList
	mu        sync.Mutex
}

func NewWebSocketServer() *WebSocketServer {
	return &WebSocketServer{
		clients:   make(map[*websocket.Conn]any),
		Broadcast: make(chan []structures.RoomForList),
	}
}
