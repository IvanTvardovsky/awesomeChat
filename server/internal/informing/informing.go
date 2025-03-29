package informing

import (
	"awesomeChat/internal/structures"
	"awesomeChat/package/logger"
	"encoding/json"
	"fmt"
	"github.com/gorilla/websocket"
	"strconv"
	"time"
)

func InformUserLeft(room *structures.Room, username string) {
	msg := structures.Message{
		Type:     "userLeft",
		Content:  username + " left the chatroom",
		Username: "default",
	}

	sendToAll(room, msg)
}

func InformUserJoined(room *structures.Room, username string) {
	msg := structures.Message{
		Type:     "userJoined",
		Content:  username + " joined the chatroom",
		Username: "default",
	}

	sendToAll(room, msg)
}

func SetRoomName(ws *websocket.Conn, roomname string, roomNumber int) {
	msg := structures.Message{
		Type:     "setRoomName",
		Content:  "[Room #" + strconv.Itoa(roomNumber) + "]    " + roomname,
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

//func SendSystemMessage(room *structures.Room, content string) {
//	msg := structures.Message{
//		Type:     "system",
//		Content:  content,
//		Username: "system",
//	}
//
//	sendToAll(room, msg)
//}

func sendToAll(room *structures.Room, msg structures.Message) {
	messageToSend, _ := json.Marshal(msg)

	for _, user := range room.Users {
		logger.Log.Traceln("Sending message:", string(messageToSend))
		user.Connection.WriteMessage(websocket.TextMessage, messageToSend)
	}
}

func SendTimerUpdate(room *structures.Room, remaining time.Duration) {
	msg := structures.Message{
		Type: "timer",
		Content: fmt.Sprintf("Time left: %02d:%02d",
			int(remaining.Minutes()),
			int(remaining.Seconds())%60),
	}
	sendToAll(room, msg)
}

func SendDiscussionEnd(room *structures.Room) {
	msg := structures.Message{
		Type:    "discussion_end",
		Content: "Discussion ended! Rate your opponent",
	}
	sendToAll(room, msg)
}

func SendDiscussionStart(room *structures.Room) {
	msg := structures.Message{
		Type:    "discussion_start",
		Content: "Discussion started! You have 10 minutes",
	}
	sendToAll(room, msg)
}

func SendUserReady(room *structures.Room, username string) {
	msg := structures.Message{
		Type:     "system",
		Content:  fmt.Sprintf("User %s is ready to start!", username),
		Username: "system",
	}
	sendToAll(room, msg)
}
