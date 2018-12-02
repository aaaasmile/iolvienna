package iol

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"strings"
	"text/template"

	"../../conf"
	"../../db"
	"../idl"
)

func checkDoRquest(reqURI string) bool {
	aa := strings.Split(reqURI, "/")
	cmd := aa[len(aa)-1]
	//fmt.Println(cmd)
	return strings.HasPrefix(cmd, "do")
}

func IolAPiHandler(w http.ResponseWriter, req *http.Request) {
	switch req.Method {
	case "GET":
		handleIndexGet(w, req)
	case "POST":
		log.Println("POST iol", req.RequestURI)
		handlePost(w, req)
	}
}

func handlePost(w http.ResponseWriter, req *http.Request) {
	u, err := url.Parse(req.RequestURI)
	if err != nil {
		log.Println("Error uri: ", err)
		return
	}
	if ok := checkDoRquest(req.RequestURI); !ok {
		log.Println("Command invalid", req.RequestURI)
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("400 - Bad Request"))
		return
	}
	q := u.Query()
	log.Println(q) // interface: do?req=<string>
	if val, ok := q["req"]; ok {
		log.Println("DO request", val)
		doDbRequestWithPosts(w, req, func() (*db.IolPostResp, error) {
			return db.MatchText(val[0])
		})
		return
	}

	if val, ok := q["date"]; ok {
		log.Println("DO date", val)
		doDbRequestWithPosts(w, req, func() (*db.IolPostResp, error) {
			return db.PostsOnDate(val[0], false, false)
		})
		//doPostsOnDate(w, req, val[0], false, false)
		return
	}
	if val, ok := q["dateless"]; ok {
		log.Println("DO date less", val)
		doDbRequestWithPosts(w, req, func() (*db.IolPostResp, error) {
			return db.PostsOnDate(val[0], false, true)
		})
		//doPostsOnDate(w, req, val[0], false, true)
		return
	}
	if val, ok := q["datemore"]; ok {
		log.Println("DO date more", val)
		//doPostsOnDate(w, req, val[0], true, false)
		doDbRequestWithPosts(w, req, func() (*db.IolPostResp, error) {
			return db.PostsOnDate(val[0], true, false)
		})
		return
	}

	if val, ok := q["rndonuser"]; ok {
		log.Println("DO random post from user", val)
		//doRandomPostFromUser(w, req, val[0])
		doDbRequestWithPosts(w, req, func() (*db.IolPostResp, error) {
			return db.CasoPostfromUser(val[0])
		})
		return
	}

	log.Println("Command invalid", req.RequestURI)
	w.WriteHeader(http.StatusBadRequest)
	w.Write([]byte("400 - Bad Request"))
}

var (
	tmplIndex *template.Template
)

type PageCtx struct {
	Buildnr string
	RootUrl string
}

func handleIndexGet(w http.ResponseWriter, req *http.Request) {
	pagectx := PageCtx{
		RootUrl: conf.Current.RootURLPattern,
		Buildnr: idl.Buildnr,
	}
	templName := "templates/index.html"
	if conf.Current.UseProdTemplate {
		templName = "templates/index_prod.html"
	}
	if tmplIndex == nil || conf.Current.AlwaysReloadTempl {
		log.Println("Load the template, reload on request is ", conf.Current.AlwaysReloadTempl)
		tmplIndex = template.Must(template.New("AppIndex").ParseFiles(templName))
	}
	err := tmplIndex.ExecuteTemplate(w, "base", pagectx)
	if err != nil {
		log.Fatal(err)
	}
}

// func doPostsOnDate(w http.ResponseWriter, req *http.Request, val string, more bool, less bool) {
// 	pp, err := db.PostsOnDate(val, more, less)
// 	if err != nil {
// 		log.Println("DB error ", err)
// 		w.WriteHeader(http.StatusInternalServerError)
// 		w.Write([]byte("500 - Internal error"))
// 		return
// 	}

// 	js, err := json.Marshal(pp)
// 	if err != nil {
// 		http.Error(w, err.Error(), http.StatusInternalServerError)
// 		return
// 	}

// 	fmt.Fprint(w, string(js))
// 	return
// }

// func doSearchPlainText(w http.ResponseWriter, req *http.Request, val string) {
// 	pp, err := db.MatchText(val)
// 	if err != nil {
// 		log.Println("DB error ", err)
// 		w.WriteHeader(http.StatusInternalServerError)
// 		w.Write([]byte("500 - Internal error"))
// 		return
// 	}

// 	js, err := json.Marshal(pp)
// 	if err != nil {
// 		http.Error(w, err.Error(), http.StatusInternalServerError)
// 		return
// 	}

// 	fmt.Fprint(w, string(js))
// 	return

// }

func doDbRequestWithPosts(w http.ResponseWriter, req *http.Request, f1 func() (*db.IolPostResp, error)) {
	pp, err := f1()
	if err != nil {
		log.Println("DB error ", err)
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("500 - Internal error"))
		return
	}

	js, err := json.Marshal(pp)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	fmt.Fprint(w, string(js))
	return

}
