package main

import (
	"context"
	"embed"
	"io/fs"
	"log"
	"net/http"

	"my-finances/internal/api"
	"my-finances/internal/db"
	"my-finances/internal/repository"
	"my-finances/internal/service"
)

//go:embed ui/dist/*
var uiFiles embed.FS

func main() {
	if err := db.InitDB(); err != nil {
		log.Printf("Failed to connect to MongoDB: %v. Running without db.", err)
	} else {
		defer db.Client.Disconnect(context.Background())
	}

	mux := http.NewServeMux()

	// Open Routes
	mux.HandleFunc("POST /api/login", api.HandleLogin)
	mux.HandleFunc("POST /api/logout", api.HandleLogout)

	// Protected Routes (API)
	protected := http.NewServeMux()

	accountRepo := &repository.AccountRepository{}
	accountHandler := api.NewAccountHandler(accountRepo)

	txRepo := &repository.TransactionRepository{}
	txService := service.NewTransactionService(txRepo, accountRepo)
	txHandler := api.NewTransactionHandler(txService)

	protected.HandleFunc("GET /api/accounts", accountHandler.HandleGetAccounts)
	protected.HandleFunc("POST /api/accounts", accountHandler.HandleCreateAccount)

	protected.HandleFunc("GET /api/transactions", txHandler.HandleGetTransactions)
	protected.HandleFunc("POST /api/transactions", txHandler.HandleCreateTransaction)

	mux.Handle("/api/", api.AuthMiddleware(protected))

	// Frontend SPA Routes
	dist, err := fs.Sub(uiFiles, "ui/dist")
	if err != nil {
		log.Fatal(err)
	}

	// Handle React Router fallback
	fileServer := http.FileServer(http.FS(dist))
	mux.Handle("/", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// If it's an API route that somehow wasn't caught, return 404
		if r.URL.Path[:4] == "/api" {
			http.NotFound(w, r)
			return
		}

		// Try to find the file
		f, err := dist.Open(r.URL.Path[1:])
		if err == nil {
			f.Close()
			fileServer.ServeHTTP(w, r)
			return
		}

		// Fallback to index.html for SPA
		r.URL.Path = "/"
		fileServer.ServeHTTP(w, r)
	}))

	log.Println("Server listening on :8080")
	if err := http.ListenAndServe(":8080", mux); err != nil {
		log.Fatal(err)
	}
}
