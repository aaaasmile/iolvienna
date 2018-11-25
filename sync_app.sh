#!/bin/bash
sudo systemctl stop iolvienna
rsync -av ./static/ /home/igor/app/go/iol-service/static
rsync -av ./templates/ /home/igor/app/go/iol-service/templates
cp /home/igor/app/go/iol-service/config.toml /home/igor/app/go/iol-service/config.toml_old
cp ./config.toml /home/igor/app/go/iol-service/config.toml
cp ./iolvienna /home/igor/app/go/iol-service/iolvienna.bin
sudo systemctl start iolvienna
