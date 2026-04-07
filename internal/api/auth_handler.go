package api

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"

	"valora/internal/service"
)

const sessionCookieName = "session_id"

type AuthHandler struct {
	auth authManager
}

type authManager interface {
	Register(ctx context.Context, name, email, password string) (service.AuthSession, error)
	Login(ctx context.Context, email, password string) (service.AuthSession, error)
	AuthenticateToken(ctx context.Context, token string) (primitive.ObjectID, error)
	Logout(ctx context.Context, token string) error
	SessionTTL() time.Duration
}

type registerRequest struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type loginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func NewAuthHandler(service *service.AuthService) *AuthHandler {
	return &AuthHandler{auth: service}
}

func (h *AuthHandler) HandleRegister(w http.ResponseWriter, r *http.Request) {
	var req registerRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	authSession, err := h.auth.Register(r.Context(), req.Name, req.Email, req.Password)
	if err != nil {
		switch {
		case errors.Is(err, service.ErrEmailAlreadyInUse):
			http.Error(w, "Email already in use", http.StatusConflict)
		case err.Error() == "password must have at least 8 characters" || err.Error() == "email is required" || err.Error() == "name is required" || err.Error() == "invalid email":
			http.Error(w, err.Error(), http.StatusBadRequest)
		default:
			http.Error(w, "Failed to create user", http.StatusInternalServerError)
		}
		return
	}

	h.setSessionCookie(w, authSession.Token, authSession.ExpiresAt)
	respondJSON(w, http.StatusCreated, map[string]string{"message": "Registered successfully"})
}

func (h *AuthHandler) HandleLogin(w http.ResponseWriter, r *http.Request) {
	var req loginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	authSession, err := h.auth.Login(r.Context(), req.Email, req.Password)
	if err != nil {
		switch {
		case errors.Is(err, service.ErrInvalidCredentials):
			http.Error(w, "Invalid credentials", http.StatusUnauthorized)
		default:
			http.Error(w, "Failed to login", http.StatusInternalServerError)
		}
		return
	}

	h.setSessionCookie(w, authSession.Token, authSession.ExpiresAt)
	respondJSON(w, http.StatusOK, map[string]string{"message": "Logged in successfully"})
}

func (h *AuthHandler) HandleLogout(w http.ResponseWriter, r *http.Request) {
	cookie, _ := r.Cookie(sessionCookieName)
	if cookie != nil {
		_ = h.auth.Logout(r.Context(), cookie.Value)
	}

	h.clearSessionCookie(w)
	w.WriteHeader(http.StatusOK)
}

func (h *AuthHandler) AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie(sessionCookieName)
		if err != nil {
			h.clearSessionCookie(w)
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		userID, err := h.auth.AuthenticateToken(r.Context(), cookie.Value)
		if err != nil {
			h.clearSessionCookie(w)
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		next.ServeHTTP(w, r.WithContext(withUserID(r.Context(), userID)))
	})
}

func (h *AuthHandler) setSessionCookie(w http.ResponseWriter, token string, expiresAt time.Time) {
	http.SetCookie(w, &http.Cookie{
		Name:     sessionCookieName,
		Value:    token,
		Expires:  expiresAt,
		HttpOnly: true,
		Secure:   false,
		Path:     "/",
		SameSite: http.SameSiteLaxMode,
		MaxAge:   int(h.auth.SessionTTL().Seconds()),
	})
}

func (h *AuthHandler) clearSessionCookie(w http.ResponseWriter) {
	http.SetCookie(w, &http.Cookie{
		Name:     sessionCookieName,
		Value:    "",
		HttpOnly: true,
		Secure:   false,
		Path:     "/",
		SameSite: http.SameSiteLaxMode,
		MaxAge:   -1,
	})
}

func respondJSON(w http.ResponseWriter, statusCode int, payload interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	_ = json.NewEncoder(w).Encode(payload)
}
