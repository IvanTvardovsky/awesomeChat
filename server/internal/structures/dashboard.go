package structures

import "time"

type Category struct {
	ID          string     `json:"id"`
	Title       string     `json:"title"`
	Icon        string     `json:"icon"`
	Description string     `json:"description"`
	Subtopics   []Subtopic `json:"subtopics"`
	//Stats       Stats      `json:"stats"`
}

type Subtopic struct {
	ID          string    `json:"id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Tags        []string  `json:"tags"`
	CreatedAt   time.Time `json:"created_at"`
}

type Stats struct {
	TotalDiscussions int `json:"total_discussions"`
	ActiveUsers      int `json:"active_users"`
}
