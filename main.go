package main

import (
	"flag"
	"fmt"
	"os"

	"./web"
)

var (
	Appname = "iol-service"
	Buildnr = "0.2.1"
)

func main() {
	var configfile = flag.String("config", "config.toml", "Configuration file path")
	var ver = flag.Bool("version", false, "Prints current version")
	if *ver {
		fmt.Printf("%s, version: %s", Appname, Buildnr)
		os.Exit(0)
	}
	web.RunService(*configfile)
}
