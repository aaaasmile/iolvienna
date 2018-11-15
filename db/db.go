package db

import (
	"database/sql"
	"log"

	_ "github.com/mattn/go-sqlite3"
)

var (
	connDb *sql.DB
)

type IolPost struct {
}

func OpenDatabase() {
	var err error
	connDb, err = sql.Open("sqlite3", "iolvienna.db")
	if err != nil {
		log.Fatal("Open connection with db failed: ", err.Error())
	}
}

func MatchText(textMatch string) (*IolPost, error) {
	q := `SELECT rowid from playsearch where text MATCH ?;`

	rows, err := connDb.Query(q, textMatch)
	if err != nil {
		return nil, err
	}

	defer rows.Close()
	res := &IolPost{}
	var rowid int
	for rows.Next() {
		if err := rows.Scan(&rowid); err != nil {
			return nil, err
		}
		// todo collect ids, pick one randomly and present as result
	}
	return res, nil
}
