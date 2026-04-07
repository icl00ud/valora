package service

import (
	"context"
	"testing"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"golang.org/x/crypto/bcrypt"

	"valora/internal/auth"
	"valora/internal/models"
	"valora/internal/repository"
)

type fakeUserStore struct {
	usersByEmail map[string]*models.User
	errCreate    error
}

func (f *fakeUserStore) Create(_ context.Context, user *models.User) error {
	if f.errCreate != nil {
		return f.errCreate
	}
	if _, ok := f.usersByEmail[user.Email]; ok {
		return repository.ErrDuplicate
	}
	if user.ID == primitive.NilObjectID {
		user.ID = primitive.NewObjectID()
	}
	f.usersByEmail[user.Email] = user
	return nil
}

func (f *fakeUserStore) FindByEmail(_ context.Context, email string) (*models.User, error) {
	if user, ok := f.usersByEmail[email]; ok {
		return user, nil
	}
	return nil, repository.ErrNotFound
}

type fakeSessionStore struct {
	byHash map[string]*models.Session

	created []*models.Session
	deleted []string
}

func (f *fakeSessionStore) Create(_ context.Context, session *models.Session) error {
	if f.byHash == nil {
		f.byHash = map[string]*models.Session{}
	}
	if session.ID == primitive.NilObjectID {
		session.ID = primitive.NewObjectID()
	}
	f.byHash[session.TokenHash] = session
	f.created = append(f.created, session)
	return nil
}

func (f *fakeSessionStore) FindActiveByTokenHash(_ context.Context, tokenHash string, now time.Time) (*models.Session, error) {
	session, ok := f.byHash[tokenHash]
	if !ok || !session.ExpiresAt.After(now) {
		return nil, repository.ErrNotFound
	}
	return session, nil
}

func (f *fakeSessionStore) DeleteByTokenHash(_ context.Context, tokenHash string) error {
	f.deleted = append(f.deleted, tokenHash)
	delete(f.byHash, tokenHash)
	return nil
}

func TestAuthServiceRegisterCreatesUserAndSession(t *testing.T) {
	users := &fakeUserStore{usersByEmail: map[string]*models.User{}}
	sessions := &fakeSessionStore{byHash: map[string]*models.Session{}}
	now := time.Date(2026, 1, 2, 3, 4, 5, 0, time.UTC)

	svc := NewAuthService(users, sessions, 7*24*time.Hour)
	svc.now = func() time.Time { return now }

	authSession, err := svc.Register(context.Background(), "Alice", " ALICE@example.com ", "12345678")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if authSession.UserID == primitive.NilObjectID {
		t.Fatalf("expected user id")
	}
	if authSession.Token == "" {
		t.Fatalf("expected session token")
	}
	if !authSession.ExpiresAt.Equal(now.Add(7 * 24 * time.Hour)) {
		t.Fatalf("unexpected expiresAt: %v", authSession.ExpiresAt)
	}

	created := users.usersByEmail["alice@example.com"]
	if created == nil {
		t.Fatalf("expected stored user")
	}
	if created.PasswordHash == "12345678" {
		t.Fatalf("password must be hashed")
	}

	if len(sessions.created) != 1 {
		t.Fatalf("expected one session, got %d", len(sessions.created))
	}
}

func TestAuthServiceLoginRejectsInvalidPassword(t *testing.T) {
	hash, err := bcrypt.GenerateFromPassword([]byte("correct-password"), bcrypt.DefaultCost)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	users := &fakeUserStore{usersByEmail: map[string]*models.User{
		"alice@example.com": {
			ID:           primitive.NewObjectID(),
			Email:        "alice@example.com",
			PasswordHash: string(hash),
		},
	}}
	sessions := &fakeSessionStore{byHash: map[string]*models.Session{}}

	svc := NewAuthService(users, sessions, 24*time.Hour)
	_, err = svc.Login(context.Background(), "alice@example.com", "wrong")
	if err == nil || err != ErrInvalidCredentials {
		t.Fatalf("expected ErrInvalidCredentials, got %v", err)
	}
}

func TestAuthServiceAuthenticateTokenReturnsUserID(t *testing.T) {
	userID := primitive.NewObjectID()
	token := "opaque-token"
	tokenHash := auth.HashSessionToken(token)

	sessions := &fakeSessionStore{byHash: map[string]*models.Session{
		tokenHash: {
			UserID:    userID,
			TokenHash: tokenHash,
			ExpiresAt: time.Now().Add(2 * time.Hour),
		},
	}}

	svc := NewAuthService(&fakeUserStore{usersByEmail: map[string]*models.User{}}, sessions, time.Hour)

	gotUserID, err := svc.AuthenticateToken(context.Background(), token)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if gotUserID != userID {
		t.Fatalf("expected user id %s, got %s", userID.Hex(), gotUserID.Hex())
	}
}

func TestAuthServiceLogoutDeletesSessionByTokenHash(t *testing.T) {
	sessions := &fakeSessionStore{byHash: map[string]*models.Session{}}
	svc := NewAuthService(&fakeUserStore{usersByEmail: map[string]*models.User{}}, sessions, time.Hour)

	token := "opaque-token"
	if err := svc.Logout(context.Background(), token); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if len(sessions.deleted) != 1 {
		t.Fatalf("expected one deleted hash, got %d", len(sessions.deleted))
	}
	if sessions.deleted[0] != auth.HashSessionToken(token) {
		t.Fatalf("unexpected deleted hash")
	}
}
