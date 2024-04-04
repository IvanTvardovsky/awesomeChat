package utils

import "database/sql"

func IsUsernameTaken(username string, db *sql.DB) (bool, error) {
	var count int
	if err := db.QueryRow("SELECT COUNT(*) FROM users WHERE username = $1",
		username).Scan(&count); err != nil {
		return false, err
	}
	return count > 0, nil
}
