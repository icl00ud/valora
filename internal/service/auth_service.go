package service

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"golang.org/x/crypto/bcrypt"

	"valora/internal/auth"
	"valora/internal/models"
	"valora/internal/repository"
)

var (
	ErrInvalidCredentials = errors.New("invalid credentials")
	ErrInvalidSession     = errors.New("invalid session")
	ErrEmailAlreadyInUse  = errors.New("email already in use")
)

type AuthSession struct {
	UserID    primitive.ObjectID
	Token     string
	ExpiresAt time.Time
}

type userStore interface {
	Create(ctx context.Context, user *models.User) error
	FindByEmail(ctx context.Context, email string) (*models.User, error)
}

type sessionStore interface {
	Create(ctx context.Context, session *models.Session) error
	FindActiveByTokenHash(ctx context.Context, tokenHash string, now time.Time) (*models.Session, error)
	DeleteByTokenHash(ctx context.Context, tokenHash string) error
}

type AuthService struct {
	users    userStore
	sessions sessionStore
	ttl      time.Duration
	now      func() time.Time
}

func NewAuthService(users userStore, sessions sessionStore, ttl time.Duration) *AuthService {
	if ttl <= 0 {
		ttl = 7 * 24 * time.Hour
	}

	return &AuthService{
		users:    users,
		sessions: sessions,
		ttl:      ttl,
		now:      time.Now,
	}
}

func (s *AuthService) Register(ctx context.Context, name, email, password string) (AuthSession, error) {
	normalizedEmail := auth.NormalizeEmail(email)
	if err := auth.ValidateEmail(normalizedEmail); err != nil {
		return AuthSession{}, err
	}
	if strings.TrimSpace(name) == "" {
		return AuthSession{}, fmt.Errorf("name is required")
	}
	if err := auth.ValidatePassword(password); err != nil {
		return AuthSession{}, err
	}

	passwordHash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return AuthSession{}, err
	}

	now := s.now()
	user := &models.User{
		Name:         strings.TrimSpace(name),
		Email:        normalizedEmail,
		PasswordHash: string(passwordHash),
		CreatedAt:    now,
		UpdatedAt:    now,
	}

	if err := s.users.Create(ctx, user); err != nil {
		if errors.Is(err, repository.ErrDuplicate) {
			return AuthSession{}, ErrEmailAlreadyInUse
		}
		return AuthSession{}, err
	}

	return s.createSession(ctx, user.ID)
}

func (s *AuthService) Login(ctx context.Context, email, password string) (AuthSession, error) {
	normalizedEmail := auth.NormalizeEmail(email)
	if err := auth.ValidateEmail(normalizedEmail); err != nil {
		return AuthSession{}, ErrInvalidCredentials
	}

	user, err := s.users.FindByEmail(ctx, normalizedEmail)
	if err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			return AuthSession{}, ErrInvalidCredentials
		}
		return AuthSession{}, err
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)); err != nil {
		return AuthSession{}, ErrInvalidCredentials
	}

	return s.createSession(ctx, user.ID)
}

func (s *AuthService) AuthenticateToken(ctx context.Context, token string) (primitive.ObjectID, error) {
	if token == "" {
		return primitive.NilObjectID, ErrInvalidSession
	}

	tokenHash := auth.HashSessionToken(token)
	session, err := s.sessions.FindActiveByTokenHash(ctx, tokenHash, s.now())
	if err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			return primitive.NilObjectID, ErrInvalidSession
		}
		return primitive.NilObjectID, err
	}

	return session.UserID, nil
}

func (s *AuthService) Logout(ctx context.Context, token string) error {
	if token == "" {
		return nil
	}

	return s.sessions.DeleteByTokenHash(ctx, auth.HashSessionToken(token))
}

func (s *AuthService) SessionTTL() time.Duration {
	return s.ttl
}

func (s *AuthService) createSession(ctx context.Context, userID primitive.ObjectID) (AuthSession, error) {
	token, err := auth.GenerateSessionToken()
	if err != nil {
		return AuthSession{}, err
	}

	now := s.now()
	expiresAt := now.Add(s.ttl)
	session := &models.Session{
		UserID:     userID,
		TokenHash:  auth.HashSessionToken(token),
		CreatedAt:  now,
		ExpiresAt:  expiresAt,
		LastSeenAt: now,
	}

	if err := s.sessions.Create(ctx, session); err != nil {
		return AuthSession{}, err
	}

	return AuthSession{
		UserID:    userID,
		Token:     token,
		ExpiresAt: expiresAt,
	}, nil
}
