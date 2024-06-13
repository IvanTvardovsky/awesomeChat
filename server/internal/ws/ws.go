package ws

import (
	"awesomeChat/internal/informing"
	"awesomeChat/internal/structures"
	"awesomeChat/package/logger"
	"encoding/json"
	"github.com/gorilla/websocket"
)

func Reader(conn *websocket.Conn, room *structures.Room) {
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