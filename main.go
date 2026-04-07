package main

import (
	"context"
	"embed"
	"io/fs"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"valora/internal/api"
	"valora/internal/db"
	"valora/internal/repository"
	"valora/internal/service"
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
	sessionTTL := getSessionTTL()

	userRepo := &repository.UserRepository{}
	sessionRepo := &repository.SessionRepository{}
	authService := service.NewAuthService(userRepo, sessionRepo, sessionTTL)
	authHandler := api.NewAuthHandler(authService)

	// Open Routes
	mux.HandleFunc("POST /api/register", authHandler.HandleRegister)
	mux.HandleFunc("POST /api/login", authHandler.HandleLogin)
	mux.HandleFunc("POST /api/logout", authHandler.HandleLogout)

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

	mux.Handle("/api/", authHandler.AuthMiddleware(protected))

	// Frontend SPA Routes
	dist, err := fs.Sub(uiFiles, "ui/dist")
	if err != nil {
		log.Fatal(err)
	}
	mux.Handle("/", newSPAHandler(dist))

	log.Println("Server listening on :8080")
	if err := http.ListenAndServe(":8080", mux); err != nil {
		log.Fatal(err)
	}
}

func getSessionTTL() time.Duration {
	hoursRaw := os.Getenv("SESSION_TTL_HOURS")
	if hoursRaw == "" {
		return 7 * 24 * time.Hour
	}

	hours, err := strconv.Atoi(hoursRaw)
	if err != nil || hours <= 0 {
		return 7 * 24 * time.Hour
	}

	return time.Duration(hours) * time.Hour
}

func newSPAHandler(dist fs.FS) http.Handler {
	// Handle React Router fallback
	fileServer := http.FileServer(http.FS(dist))

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// If it's an API route that somehow wasn't caught, return 404
		if strings.HasPrefix(r.URL.Path, "/api") {
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
	})
}
