package main

import (
	"embed"
	"io/fs"
	"log"
	"net/http"
)

//go:embed ui/dist/*
var uiFiles embed.FS

func main() {
	dist, err := fs.Sub(uiFiles, "ui/dist")
	if err != nil {
		log.Fatal(err)
	}

	http.Handle("/", http.FileServer(http.FS(dist)))

	log.Println("Server listening on :8080")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatal(err)
	}
}
