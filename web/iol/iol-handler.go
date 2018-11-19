package iol

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"strings"

	"../../db"
)

func checkDoRquest(reqURI string) bool {
	aa := strings.Split(reqURI, "/")
	cmd := aa[len(aa)-1]
	fmt.Println(cmd)
	return strings.HasPrefix(cmd, "do")
}

func IolAPiHandler(w http.ResponseWriter, req *http.Request) {
	switch req.Method {
	case "POST":
		log.Println("POST iol", req.RequestURI)
		u, err := url.Parse(req.RequestURI)
		if err != nil {
			log.Println("Error uri: ", err)
			return
		}
		if ok := checkDoRquest(req.RequestURI); !ok {
			log.Println("Command invalid")
			w.WriteHeader(http.StatusBadRequest)
			w.Write([]byte("400 - Bad Request"))
			return
		}
		q := u.Query()
		fmt.Println(q) // interface: do?req=<string>
		if val, ok := q["req"]; ok {
			log.Println("DO requested", val)
			doSearchPlainText(w, req, val[0])
		}
	}
}

func doSearchPlainText(w http.ResponseWriter, req *http.Request, val string) {
	pp, err := db.MatchText(val)
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
