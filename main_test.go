package main

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"testing/fstest"
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
