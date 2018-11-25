package db

import (
	"database/sql"
	"log"
	"math"
	"math/rand"
	"time"

	_ "github.com/mattn/go-sqlite3"
)

var (
	connDb *sql.DB
)

type IolPostResp struct {
	Posts []IolPost
}

type IolPost struct {
	UserName string
	Date     string
	Content  string
}

func OpenDatabase() {
	var err error
	connDb, err = sql.Open("sqlite3", "db/iolvienna.db")
	if err != nil {
		log.Fatal("Open connection with db failed: ", err.Error())
	}
}

func MatchText(textMatch string) (*IolPostResp, error) {
	q := `SELECT playsrowid from playsearch WHERE text MATCH ?;`

	rows, err := connDb.Query(q, textMatch)
	if err != nil {
		return nil, err
	}

	defer rows.Close()
	res := &IolPostResp{
		Posts: []IolPost{},
	}
	var rowid int
	ids := []int{}
	for rows.Next() {
		if err := rows.Scan(&rowid); err != nil {
			return nil, err
		}
		ids = append(ids, rowid)
	}
	if len(ids) > 0 {
		//log.Printf("Found ids: %v (len %d)", ids, len(ids))
		shuffle(ids)
		//log.Printf("After shuffle ids: %v (len %d)", ids, len(ids))
		prepareSlice(ids, res)
		log.Printf("Prepared %d posts\n", len(res.Posts))
	}

	return res, nil
}

func prepareSlice(ids []int, res *IolPostResp) {
	maxItems := math.Min(float64(len(ids)), 10)
	for i := 0; i < int(maxItems); i++ {
		selected := ids[i]
		qs := `SELECT user_name, date_published, post_content FROM iol_post WHERE rowid = ?;`
		//fmt.Println(qs, selected)
		row := connDb.QueryRow(qs, selected)
		var userName, datePublished, postContent string
		switch err := row.Scan(&userName, &datePublished, &postContent); err {
		case sql.ErrNoRows:
			log.Println("No rows were returned!")
		case nil:
			//fmt.Println(userName, datePublished, postContent)
			post := IolPost{
				UserName: userName,
				Date:     datePublished,
				Content:  postContent,
			}
			res.Posts = append(res.Posts, post)
		}
	}
}

func shuffle(vals []int) {
	r := rand.New(rand.NewSource(time.Now().Unix()))
	for len(vals) > 0 {
		n := len(vals)
		randIndex := r.Intn(n)
		vals[n-1], vals[randIndex] = vals[randIndex], vals[n-1]
		vals = vals[:n-1]
	}
}
