package tkn

import (
	"github.com/golang-jwt/jwt"
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
