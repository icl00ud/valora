package main

import (
	"context"
	"embed"
	"io/fs"
	"log"
	"net/http"

	"my-finances/internal/db"
)

//go:embed ui/dist/*
var uiFiles embed.FS

func main() {
	if err := db.InitDB(); err != nil {
		log.Printf("Failed to connect to MongoDB: %v. Running without db.", err)
	} else {
		defer db.Client.Disconnect(context.Background())
	}

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
