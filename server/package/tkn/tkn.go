package tkn

import (
	"github.com/golang-jwt/jwt"
	"golang.org/x/crypto/bcrypt"
	"time"
)

func GenerateToken(username string) (string, error) {
	expirationTime := time.Now().Add(3 * 24 * time.Hour)

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"username": username,
		"exp":      expirationTime.Unix(),
	})

	tokenString, err := token.SignedString([]byte("a-big-secret"))
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(bytes), err
}

func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}
