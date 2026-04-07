package auth

import "testing"

func TestNormalizeEmail(t *testing.T) {
	got := NormalizeEmail("  USER@Email.COM ")
	if got != "user@email.com" {
		t.Fatalf("expected normalized email, got %q", got)
	}
}

func TestValidatePassword(t *testing.T) {
	if err := ValidatePassword("1234567"); err == nil {
		t.Fatalf("expected error for short password")
	}

	if err := ValidatePassword("12345678"); err != nil {
		t.Fatalf("expected valid password, got %v", err)
	}
}

func TestValidateEmail(t *testing.T) {
	if err := ValidateEmail(""); err == nil {
		t.Fatalf("expected empty email to fail")
	}

	if err := ValidateEmail("not-an-email"); err == nil {
		t.Fatalf("expected invalid email format")
	}

	if err := ValidateEmail("ok@example.com"); err != nil {
		t.Fatalf("expected valid email, got %v", err)
	}
}

func TestSessionTokenAndHash(t *testing.T) {
	token, err := GenerateSessionToken()
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if len(token) < 40 {
		t.Fatalf("token too short: %d", len(token))
	}

	h1 := HashSessionToken(token)
	h2 := HashSessionToken(token)
	if h1 != h2 || h1 == "" {
		t.Fatalf("expected deterministic non-empty hash")
	}
}
