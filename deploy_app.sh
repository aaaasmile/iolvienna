#!/bin/bash
read -p "Deploy the iolservice (vienna.invido.it)? y/n" -n 1 -r
echo    # (optional) move to a new line
if [[ $REPLY =~ ^[Yy]$ ]]
then
    # do dangerous stuff
	echo "build application"
	go build --tags "fts5"
	echo "stop the service"
	sudo systemctl stop iolvienna
	echo "sync static files"
	rsync -av ./static/ /home/igor/app/go/iol-service/static
	rsync -av ./templates/ /home/igor/app/go/iol-service/templates
	#cp /home/igor/app/go/iol-service/config.toml /home/igor/app/go/iol-service/config.toml_old
	#cp ./config.toml /home/igor/app/go/iol-service/config.toml
	echo "Copy the  service binary"
	cp ./iolvienna /home/igor/app/go/iol-service/iolvienna.bin
	sudo systemctl start iolvienna
	echo "Service restarted"
fi
echo "That's all folks!"
