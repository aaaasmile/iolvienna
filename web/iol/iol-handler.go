package iol

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"strings"
	"text/template"

	"github.com/aaaasmile/iolvienna/conf"
	"github.com/aaaasmile/iolvienna/db"
	"github.com/aaaasmile/iolvienna/web/idl"
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
		doDbRequestWithPosts(w, req, func() (*idl.IolPostResp, error) {
			return db.MatchText(val[0])
		})
		return
	}

	if val, ok := q["date"]; ok {
		log.Println("DO date", val)
		doDbRequestWithPosts(w, req, func() (*idl.IolPostResp, error) {
			return db.PostsOnDate(val[0], false, false)
		})
		return
	}
	if val, ok := q["dateless"]; ok {
		log.Println("DO date less", val)
		doDbRequestWithPosts(w, req, func() (*idl.IolPostResp, error) {
			return db.PostsOnDate(val[0], false, true)
		})
		return
	}
	if val, ok := q["datemore"]; ok {
		log.Println("DO date more", val)
		doDbRequestWithPosts(w, req, func() (*idl.IolPostResp, error) {
			return db.PostsOnDate(val[0], true, false)
		})
		return
	}

	if val, ok := q["rndonuser"]; ok {
		log.Println("DO random post from user", val)
		doDbRequestWithPosts(w, req, func() (*idl.IolPostResp, error) {
			return db.CasoPostfromUser(val[0])
		})
		return
	}

	if val, ok := q["rnd"]; ok {
		log.Println("DO random post from all", val)
		doDbRequestWithPosts(w, req, func() (*idl.IolPostResp, error) {
			return db.CasoPost()
		})
		return
	}

	if val, ok := q["users"]; ok {
		log.Println("DO users", val)
		doDbRequestWithUsers(w, req, func() (*idl.IolUserResp, error) {
			return db.GetUsers(0)
		})
		return
	}

	if val, ok := q["postid"]; ok {
		log.Println("DO postid", val)
		doDbRequestWithPosts(w, req, func() (*idl.IolPostResp, error) {
			return db.GetPostOnID(val[0])
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

func doDbRequestWithPosts(w http.ResponseWriter, req *http.Request, f1 func() (*idl.IolPostResp, error)) {
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

func doDbRequestWithUsers(w http.ResponseWriter, req *http.Request, f1 func() (*idl.IolUserResp, error)) {
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
