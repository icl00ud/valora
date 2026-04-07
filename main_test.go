package main

import (
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
	"testing/fstest"
	"time"
)

func TestSPAHandlerShortPathFallsBackToIndex(t *testing.T) {
	handler := newSPAHandler(fstest.MapFS{
		"index.html": {Data: []byte("index")},
	})

	req := httptest.NewRequest(http.MethodGet, "/x", nil)
	rec := httptest.NewRecorder()

	handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d", http.StatusOK, rec.Code)
	}

	if rec.Body.String() != "index" {
		t.Fatalf("expected body %q, got %q", "index", rec.Body.String())
	}
}

func TestSPAHandlerAPIRouteReturnsNotFound(t *testing.T) {
	handler := newSPAHandler(fstest.MapFS{
		"index.html": {Data: []byte("index")},
	})

	req := httptest.NewRequest(http.MethodGet, "/api/anything", nil)
	rec := httptest.NewRecorder()

	handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusNotFound {
		t.Fatalf("expected status %d, got %d", http.StatusNotFound, rec.Code)
	}
}

func TestGetSessionTTLDefaultsToSevenDays(t *testing.T) {
	_ = os.Unsetenv("SESSION_TTL_HOURS")
	if got := getSessionTTL(); got != 7*24*time.Hour {
		t.Fatalf("expected 168h, got %v", got)
	}
}

func TestGetSessionTTLReadsValidEnv(t *testing.T) {
	t.Setenv("SESSION_TTL_HOURS", "24")
	if got := getSessionTTL(); got != 24*time.Hour {
		t.Fatalf("expected 24h, got %v", got)
	}
}
