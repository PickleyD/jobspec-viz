package database

import (
	"embed"
)

//go:embed migrations/*.sql
var embedMigrations embed.FS

// GetMigrations - parse and get all migrations
func GetMigrations() embed.FS {
	return embedMigrations
}
