package api

import (
	"bytes"
	"context"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"

	"valora/internal/service"
)

type fakeAuthService struct {
	registerResp service.AuthSession
	registerErr  error

	loginResp service.AuthSession
	loginErr  error

	authUserID primitive.ObjectID
	authErr    error

	logoutToken string

	ttl time.Duration
}

func (f *fakeAuthService) Register(_ context.Context, _, _, _ string) (service.AuthSession, error) {
	return f.registerResp, f.registerErr
}

func (f *fakeAuthService) Login(_ context.Context, _, _ string) (service.AuthSession, error) {
	return f.loginResp, f.loginErr
}

func (f *fakeAuthService) AuthenticateToken(_ context.Context, _ string) (primitive.ObjectID, error) {
	return f.authUserID, f.authErr
}

func (f *fakeAuthService) Logout(_ context.Context, token string) error {
	f.logoutToken = token
	return nil
}

func (f *fakeAuthService) SessionTTL() time.Duration {
	if f.ttl == 0 {
		return 24 * time.Hour
	}
	return f.ttl
}

func newAuthHandlerForTest(s *fakeAuthService) *AuthHandler {
	return &AuthHandler{auth: s}
}

func TestHandleRegisterSetsSessionCookie(t *testing.T) {
	f := &fakeAuthService{
		registerResp: service.AuthSession{Token: "opaque", ExpiresAt: time.Now().Add(2 * time.Hour)},
		ttl:          48 * time.Hour,
	}
	h := newAuthHandlerForTest(f)

	body := bytes.NewBufferString(`{"name":"Alice","email":"alice@example.com","password":"12345678"}`)
	req := httptest.NewRequest(http.MethodPost, "/api/register", body)
	rec := httptest.NewRecorder()

	h.HandleRegister(rec, req)

	if rec.Code != http.StatusCreated {
		t.Fatalf("expected status %d, got %d", http.StatusCreated, rec.Code)
	}

	if len(rec.Result().Cookies()) == 0 || rec.Result().Cookies()[0].Name != sessionCookieName {
		t.Fatalf("expected session cookie")
	}
}

func TestHandleLoginInvalidCredentialsReturns401(t *testing.T) {
	f := &fakeAuthService{loginErr: service.ErrInvalidCredentials}
	h := newAuthHandlerForTest(f)

	req := httptest.NewRequest(http.MethodPost, "/api/login", bytes.NewBufferString(`{"email":"x","password":"y"}`))
	rec := httptest.NewRecorder()

	h.HandleLogin(rec, req)

	if rec.Code != http.StatusUnauthorized {
		t.Fatalf("expected status %d, got %d", http.StatusUnauthorized, rec.Code)
	}
}

func TestAuthMiddlewareRejectsMissingCookie(t *testing.T) {
	f := &fakeAuthService{}
	h := newAuthHandlerForTest(f)

	next := h.AuthMiddleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))

	req := httptest.NewRequest(http.MethodGet, "/api/accounts", nil)
	rec := httptest.NewRecorder()
	next.ServeHTTP(rec, req)

	if rec.Code != http.StatusUnauthorized {
		t.Fatalf("expected status %d, got %d", http.StatusUnauthorized, rec.Code)
	}
}

func TestAuthMiddlewareInjectsUserIDOnValidSession(t *testing.T) {
	userID := primitive.NewObjectID()
	f := &fakeAuthService{authUserID: userID}
	h := newAuthHandlerForTest(f)

	next := h.AuthMiddleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		got, ok := userIDFromContext(r.Context())
		if !ok || got != userID {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}
		w.WriteHeader(http.StatusOK)
	}))

	req := httptest.NewRequest(http.MethodGet, "/api/accounts", nil)
	req.AddCookie(&http.Cookie{Name: sessionCookieName, Value: "opaque"})
	rec := httptest.NewRecorder()
	next.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d", http.StatusOK, rec.Code)
	}
}
