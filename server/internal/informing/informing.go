package informing

import (
	"awesomeChat/internal/structures"
	"awesomeChat/package/logger"
	"encoding/json"
	"github.com/gorilla/websocket"
	"strconv"
)

func InformUserLeft(room *structures.Room, username string) {
	msg := structures.Message{
		Type:     "userLeft",
		Content:  []byte(username + " left the chatroom"),
		Username: "default",
	}

	messageToSend, err := json.Marshal(msg)
	if err != nil {
		logger.Log.Errorln(err)
	}
	logger.Log.Traceln("Sending:", string(messageToSend))

	for _, user := range room.Users {
		err = user.Connection.WriteMessage(websocket.TextMessage, messageToSend)
		if err != nil {
			logger.Log.Errorln(err)
		}
	}
}

func InformUserJoined(room *structures.Room, username string) {
	msg := structures.Message{
		Type:     "userJoined",
		Content:  []byte(username + " joined the chatroom"),
		Username: "default",
	}

	messageToSend, err := json.Marshal(msg)
	if err != nil {
		logger.Log.Errorln(err)
	}
	logger.Log.Traceln("Sending:", string(messageToSend))

	for _, user := range room.Users {
		err = user.Connection.WriteMessage(websocket.TextMessage, messageToSend)
		if err != nil {
			logger.Log.Errorln(err)
		}
	}
}

func SetRoomName(ws *websocket.Conn, roomname string, roomNumber int) {
	msg := structures.Message{
		Type:     "setRoomName",
		Content:  []byte("[Room #" + strconv.Itoa(roomNumber) + "]    " + roomname),
		Username: "default",
	}

	messageToSend, err := json.Marshal(msg)
	if err != nil {
		logger.Log.Errorln(err)
	}
	logger.Log.Traceln("Sending:", string(messageToSend))

	err = ws.WriteMessage(websocket.TextMessage, messageToSend)
	if err != nil {
		logger.Log.Errorln(err)
	}
}
