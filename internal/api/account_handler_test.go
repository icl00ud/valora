package api

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"valora/internal/repository"
)

func TestAccountHandlerRequiresAuthenticatedUser(t *testing.T) {
	h := NewAccountHandler(&repository.AccountRepository{})
	req := httptest.NewRequest(http.MethodGet, "/api/accounts", nil)
	rec := httptest.NewRecorder()

	h.HandleGetAccounts(rec, req)

	if rec.Code != http.StatusUnauthorized {
		t.Fatalf("expected status %d, got %d", http.StatusUnauthorized, rec.Code)
	}
}
