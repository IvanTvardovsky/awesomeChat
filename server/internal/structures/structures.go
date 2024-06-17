package structures

import "github.com/gorilla/websocket"

type Config struct {
	Listen  Listener      `yaml:"listen"`
	Storage StorageConfig `yaml:"storage"`
	//Key     JWTSecretKey  `yaml:"authorization"`
}

type Listener struct {
	BindIp string `yaml:"bind_ip"`
	Port   string `yaml:"port"`
}

type StorageConfig struct {
	Host     string `yaml:"host"`
	Port     rune   `yaml:"port"`
	Database string `yaml:"database"`
	Username string `yaml:"username"`
	Password string `yaml:"password"`
}

type LoginRegisterUser struct {
	ID               int    `json:"id"`
	Username         string `json:"username"`
	Password         string `json:"password"`
	PasswordHash     string `json:"passwordHash"`
	RegistrationDate string `json:"registrationDate"`
}

type ChatRequest struct {
	ChatNumber int `json:"chatNumber"`
}

type ChatUser struct {
	Name       string
	Connection *websocket.Conn
}

type Room struct {
	ID       int
	Name     string
	Open     bool
	Password string
	Users    []*ChatUser
	MaxUsers int
}

type RoomForList struct {
	ID       int    `json:"id"`
	Name     string `json:"name"`
	Open     bool   `json:"open"`
	Users    int    `json:"users"`
	MaxUsers int    `json:"maxUsers"`
}

type Message struct {
	Type     string `json:"type"`
	Content  []byte `json:"content"`
	Username string `json:"username"`
}
