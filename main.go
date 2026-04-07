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

	accountRepo := &repository.AccountRepository{}
	accountHandler := api.NewAccountHandler(accountRepo)

	txRepo := &repository.TransactionRepository{}
	txService := service.NewTransactionService(txRepo, accountRepo)
	txHandler := api.NewTransactionHandler(txService)

	mux.HandleFunc("GET /api/accounts", accountHandler.HandleGetAccounts)
	mux.HandleFunc("POST /api/accounts", accountHandler.HandleCreateAccount)

	mux.HandleFunc("GET /api/transactions", txHandler.HandleGetTransactions)
	mux.HandleFunc("POST /api/transactions", txHandler.HandleCreateTransaction)

	dist, err := fs.Sub(uiFiles, "ui/dist")
	if err != nil {
		log.Fatal(err)
	}

	mux.Handle("/", http.FileServer(http.FS(dist)))

	log.Println("Server listening on :8080")
	if err := http.ListenAndServe(":8080", mux); err != nil {
		log.Fatal(err)
	}
}
