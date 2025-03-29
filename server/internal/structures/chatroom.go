package structures

import (
	"github.com/gorilla/websocket"
	"sync"
	"time"
)

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

	ReadyUsers       map[string]bool
	DiscussionActive bool
	StartTime        time.Time
	Duration         time.Duration
	Mu               sync.Mutex

	AssignedTheses []string          // назначенные тезисы для дискуссии
	UserTheses     map[string]string // маппинг пользователь -> тезис
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
	Type     string `json:"type"` // "usual", "system", "ready_check", "timer", "discussion_start", "discussion_end"
	Content  string `json:"content"`
	Username string `json:"username"`
	UserID   string `json:"userID"`
}
