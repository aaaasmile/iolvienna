package web

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strings"

	"time"

	"../conf"
)

func RunService(configfile string) {

	conf.ReadConfig(configfile)
	log.Println("Configuration is read")

	var wait time.Duration
	serverurl := conf.Current.ServiceURL
	iolServURL := fmt.Sprintf("http://%s%s", strings.Replace(serverurl, "0.0.0.0", "localhost", 1), conf.Current.RootUrlPattern)
	iolServURL = strings.Replace(iolServURL, "127.0.0.1", "localhost", 1)
	log.Println("Server started with URL %s", serverurl)
	log.Println("Try this url: ", iolServURL)

	http.Handle(conf.Current.RootUrlPattern+"static/", http.StripPrefix(conf.Current.RootUrlPattern+"static", http.FileServer(http.Dir("static"))))
	//http.HandleFunc(conf.Current.RootUrlPattern, modix.HandleFastCalculation)

	srv := &http.Server{
		Addr: serverurl,
		// Good practice to set timeouts to avoid Slowloris attacks.
		WriteTimeout: time.Second * 15,
		ReadTimeout:  time.Second * 15,
		IdleTimeout:  time.Second * 60,
		Handler:      nil,
	}
	go func() {
		if err := srv.ListenAndServe(); err != nil {
			log.Println("Server is not listening anymore: ", err)
		}
	}()

	sig := make(chan os.Signal, 1)
	signal.Notify(sig, os.Interrupt) //We'll accept graceful shutdowns when quit via SIGINT (Ctrl+C)
	log.Println("Enter in server loop")
loop:
	for {
		select {
		case <-sig:
			log.Println("stop because interrupt")
			break loop
		}
	}

	ctx, cancel := context.WithTimeout(context.Background(), wait)
	defer cancel()
	srv.Shutdown(ctx)

	log.Println("Bye, service")
}
