package handlers

import (
	"awesomeChat/internal/structures"
	"awesomeChat/package/logger"
	"awesomeChat/package/tkn"
	"database/sql"
	"errors"
	"fmt"
	"github.com/gin-gonic/gin"
	"net/http"
	"regexp"
	"strings"
)

func Register(c *gin.Context, db *sql.DB) {
	var user structures.RegisterRequest

	if err := c.ShouldBindJSON(&user); err != nil {
		logger.Log.Errorln("Error binding JSON:", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
		return
	}

	if len(user.Username) > 20 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Username must be less than 20 symbols"})
		return
	}

	if !isValidEmail(user.Email) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid email format"})
		return
	}

	if taken, err := isCredentialTaken(db, "username", user.Username); err != nil || taken {
		handleCredentialCheck(c, err, taken, "Username is already taken")
		return
	}

	if taken, err := isCredentialTaken(db, "email", user.Email); err != nil || taken {
		handleCredentialCheck(c, err, taken, "Email is already taken")
		return
	}

	hashedPassword, err := tkn.HashPassword(user.Password)
	if err != nil {
		logger.Log.Errorln("Password hash error:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}

	if _, err := db.Exec(
		"INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3)",
		user.Username,
		user.Email,
		hashedPassword,
	); err != nil {
		logger.Log.Errorln("Database insert error:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Registration failed"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Registration successful"})
}

func isCredentialTaken(db *sql.DB, field string, value string) (bool, error) {
	var count int
	err := db.QueryRow(
		fmt.Sprintf("SELECT COUNT(*) FROM users WHERE %s = $1", field),
		value,
	).Scan(&count)
	return count > 0, err
}

func handleCredentialCheck(c *gin.Context, err error, taken bool, message string) {
	if err != nil {
		logger.Log.Errorln("Database query error:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}
	if taken {
		c.JSON(http.StatusBadRequest, gin.H{"error": message})
	}
}

func isValidEmail(email string) bool {
	emailRegex := `^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,4}$`
	return regexp.MustCompile(emailRegex).MatchString(strings.ToLower(email))
}

func Login(c *gin.Context, db *sql.DB) {
	var credentials structures.LoginRequest

	if err := c.ShouldBindJSON(&credentials); err != nil {
		logger.Log.Errorln("Error binding JSON:", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
		return
	}

	var user struct {
		ID           int
		Username     string
		PasswordHash string
	}

	err := db.QueryRow(
		"SELECT user_id, username, password_hash FROM users WHERE username = $1 OR email = $1",
		credentials.Username,
	).Scan(&user.ID, &user.Username, &user.PasswordHash)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			logger.Log.Traceln("sql Invalid credentials")
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		} else {
			logger.Log.Errorln("Database query error:", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		}
		return
	}

	if !tkn.CheckPasswordHash(credentials.Password, user.PasswordHash) {
		logger.Log.Traceln("hash Invalid credentials")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	tokenString, err := tkn.GenerateJWT(user.ID)
	if err != nil {
		logger.Log.Errorln("Token generation error:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}

	c.SetCookie("auth_token", tokenString, 3600*24, "/", "localhost", false, true)
	c.JSON(http.StatusOK, gin.H{
		"message": "Login successful",
		"user_id": user.ID,
	})
}
