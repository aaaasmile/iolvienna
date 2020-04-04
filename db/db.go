package db

import (
	"database/sql"
	"fmt"
	"log"
	"math"
	"math/rand"
	"time"

	"../web/idl"
	_ "github.com/mattn/go-sqlite3"
)

var (
	connDb *sql.DB
)

const (
	pageSize = 10
)

func OpenDatabase() {
	var err error
	connDb, err = sql.Open("sqlite3", "db/iolvienna.db")
	if err != nil {
		log.Fatal("Open connection with db failed: ", err.Error())
	}
}

func PostsOnDate(dateText string, more bool, less bool) (*idl.IolPostResp, error) {
	qs := `SELECT rowid FROM iol_post WHERE date_published >= ? LIMIT(%d);`
	if more {
		qs = `SELECT rowid FROM iol_post WHERE date_published > ? LIMIT(%d);`
	} else if less {
		qs = `SELECT rowid FROM iol_post WHERE date_published < ? ORDER BY date_published DESC LIMIT(%d);`
	}
	qs = fmt.Sprintf(qs, pageSize)
	log.Printf(qs)
	rows, err := connDb.Query(qs, dateText)
	if err != nil {
		return nil, err
	}

	defer rows.Close()
	res := &idl.IolPostResp{
		Posts: []idl.IolPost{},
	}
	var rowid int
	ids := []int{}
	for rows.Next() {
		if err := rows.Scan(&rowid); err != nil {
			return nil, err
		}
		ids = append(ids, rowid)
	}
	if less {
		// need to reverse the slice to restore the odere ASC
		for i, j := 0, len(ids)-1; i < j; i, j = i+1, j-1 {
			ids[i], ids[j] = ids[j], ids[i]
		}
	}
	//fmt.Println(ids)
	if len(ids) > 0 {
		prepareSlice(ids, res)

		log.Printf("Prepared %d posts\n", len(res.Posts))
	}

	return res, nil
}

func GetUsers(page int) (*idl.IolUserResp, error) {
	q := `SELECT count(id) as thecount, user_name from iol_post GROUP BY user_name ORDER BY thecount DESC LIMIT 50;`
	//fmt.Printf("Query:", q)
	rows, err := connDb.Query(q)
	if err != nil {
		return nil, err
	}

	defer rows.Close()
	res := &idl.IolUserResp{
		Users: []idl.IolUser{},
		Page:  page,
	}
	username := ""
	count := 0
	for rows.Next() {
		if err := rows.Scan(&count, &username); err != nil {
			return nil, err
		}
		//log.Printf("Append user %s with count %d", username, count)
		res.Users = append(res.Users, idl.IolUser{UserName: username, NumMsg: count})
	}
	return res, nil
}

func CasoPost() (*idl.IolPostResp, error) {
	q := `SELECT id from iol_post;`
	rows, err := connDb.Query(q)
	if err != nil {
		return nil, err
	}

	defer rows.Close()
	res := &idl.IolPostResp{
		Posts: []idl.IolPost{},
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

func GetPostOnID(postid string) (*idl.IolPostResp, error) {
	q := `SELECT id from iol_post where post_id = ?;`
	rows, err := connDb.Query(q, postid)
	if err != nil {
		return nil, err
	}

	defer rows.Close()
	res := &idl.IolPostResp{
		Posts: []idl.IolPost{},
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

func CasoPostfromUser(user string) (*idl.IolPostResp, error) {
	q := `SELECT id from iol_post where user_name = ?;`
	rows, err := connDb.Query(q, user)
	if err != nil {
		return nil, err
	}

	defer rows.Close()
	res := &idl.IolPostResp{
		Posts: []idl.IolPost{},
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

func MatchText(textMatch string) (*idl.IolPostResp, error) {
	q := `SELECT playsrowid from playsearch WHERE text MATCH ?;`

	rows, err := connDb.Query(q, textMatch)
	if err != nil {
		return nil, err
	}

	defer rows.Close()
	res := &idl.IolPostResp{
		Posts: []idl.IolPost{},
	}
	var rowid int
	ids := []int{}
	for rows.Next() {
		if err := rows.Scan(&rowid); err != nil {
			return nil, err
		}
		ids = append(ids, rowid)
	}
	log.Printf("Found %d posts", len(ids))
	if len(ids) > 0 {
		//log.Printf("Found ids: %v (len %d)", ids, len(ids))
		shuffle(ids)
		//log.Printf("After shuffle ids: %v (len %d)", ids, len(ids))
		prepareSlice(ids, res)
		log.Printf("Prepared %d posts\n", len(res.Posts))
	}

	return res, nil
}

func prepareSlice(ids []int, res *idl.IolPostResp) {
	maxItems := math.Min(float64(len(ids)), pageSize)
	for i := 0; i < int(maxItems); i++ {
		selected := ids[i]
		qs := `SELECT user_name, date_published, post_content, post_id, post_parent_id FROM iol_post WHERE rowid = ?;`
		//fmt.Println(qs, selected)
		row := connDb.QueryRow(qs, selected)
		var userName, datePublished, postContent, postid string
		var postParentid sql.NullString
		switch err := row.Scan(&userName, &datePublished, &postContent, &postid, &postParentid); err {
		case sql.ErrNoRows:
			log.Println("No rows were returned!")
		case nil:
			//fmt.Println(userName, datePublished, postContent)
			post := idl.IolPost{
				UserName:     userName,
				Date:         datePublished,
				Content:      postContent,
				PostID:       postid,
				PostParentID: postParentid.String,
			}
			res.Posts = append(res.Posts, post)
		default:
			log.Println("Error on row scan:", err)
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
