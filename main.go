package main

import (
	"flag"
	"fmt"
	"os"

	"./web"
	"./web/idl"
)

func main() {
	var configfile = flag.String("config", "config.toml", "Configuration file path")
	var ver = flag.Bool("version", false, "Prints current version")
	if *ver {
		fmt.Printf("%s, version: %s", idl.Appname, idl.Buildnr)
		os.Exit(0)
	}
	web.RunService(*configfile)
}
