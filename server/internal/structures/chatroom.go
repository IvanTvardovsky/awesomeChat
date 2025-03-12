package structures

import "github.com/gorilla/websocket"

type ChatRequest struct {
	ChatNumber int `json:"chatNumber"`
}

type ChatUser struct {
	ID         int
	Name       string
	Connection *websocket.Conn
}

type Room struct {
	ID         int
	Name       string
	Open       bool
	Password   string
	Users      []*ChatUser
	MaxUsers   int
	TopicID    int
	SubtopicID int
}

type RoomForList struct {
	ID         int    `json:"id"`
	Name       string `json:"name"`
	Open       bool   `json:"open"`
	Users      int    `json:"users"`
	MaxUsers   int    `json:"maxUsers"`
	TopicID    int    `json:"topic"`
	SubtopicID int    `json:"subtopic"`
}

type Message struct {
	Type     string `json:"type"`
	Content  []byte `json:"content"`
	Username string `json:"username"`
	UserID   string `json:"userID"`
}
