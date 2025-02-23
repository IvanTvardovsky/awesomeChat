package handlers

import (
	"awesomeChat/internal/structures"
	"awesomeChat/package/logger"
	"database/sql"
	"encoding/json"
	"github.com/gin-gonic/gin"
	"net/http"
	"strconv"
)

func GetCategories(c *gin.Context, db *sql.DB) {
	page := c.DefaultQuery("page", "1")
	perPage := c.DefaultQuery("per_page", "10")

	pageInt, err := strconv.Atoi(page)
	if err != nil {
		//todo
	}
	perPageInt, err := strconv.Atoi(perPage)
	if err != nil {
		//todo
	}

	query := `
        SELECT id, title, icon, description 
        FROM categories
        LIMIT $1 OFFSET $2
    `

	rows, err := db.Query(query, perPage, (pageInt-1)*perPageInt)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var categories []structures.Category
	for rows.Next() {
		var cat structures.Category
		err := rows.Scan(
			&cat.ID,
			&cat.Title,
			&cat.Icon,
			&cat.Description,
			//&cat.Stats.TotalDiscussions,
			//&cat.Stats.ActiveUsers,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		categories = append(categories, cat)
	}

	logger.Log.Traceln("categories:", categories)
	logger.Log.Traceln("perPage:", perPage)

	c.JSON(http.StatusOK, gin.H{
		"data": categories,
		"meta": gin.H{
			"page":     page,
			"per_page": perPage,
		},
	})
}

func GetCategory(c *gin.Context, db *sql.DB) {
	id := c.Param("id")

	var category structures.Category
	err := db.QueryRow(`
		SELECT id, title, icon, description 
		FROM categories 
		WHERE id = $1
	`, id).Scan(
		&category.ID,
		&category.Title,
		&category.Icon,
		&category.Description,
	)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Category not found"})
		return
	}

	rows, err := db.Query(`
		SELECT id, title, description, tags, created_at 
		FROM subtopics 
		WHERE category_id = $1
	`, id)

	defer rows.Close()

	for rows.Next() {
		var subtopic structures.Subtopic
		var tagsJSON string
		err := rows.Scan(
			&subtopic.ID,
			&subtopic.Title,
			&subtopic.Description,
			&tagsJSON,
			&subtopic.CreatedAt,
		)
		if err != nil {
			continue
		}
		json.Unmarshal([]byte(tagsJSON), &subtopic.Tags)
		category.Subtopics = append(category.Subtopics, subtopic)
	}

	c.JSON(http.StatusOK, category)
}

func SearchTopics(c *gin.Context, db *sql.DB) {
	query := c.Query("q")
	tags := c.QueryArray("tags")

	searchQuery := `
		SELECT id, title, description 
		FROM subtopics 
		WHERE to_tsvector('russian', title || ' ' || description) @@ to_tsquery('russian', $1)
		AND tags @> $2
	`

	rows, err := db.Query(searchQuery, query, tags)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var results []structures.Subtopic
	for rows.Next() {
		var st structures.Subtopic
		err := rows.Scan(&st.ID, &st.Title, &st.Description)
		if err == nil {
			results = append(results, st)
		}
	}

	c.JSON(http.StatusOK, results)
}
