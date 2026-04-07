package repository

import (
	"context"
	"errors"
	"time"

	"valora/internal/db"
	"valora/internal/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type SessionRepository struct{}

func (r *SessionRepository) Create(ctx context.Context, session *models.Session) error {
	session.ID = primitive.NewObjectID()
	_, err := db.DB.Collection("sessions").InsertOne(ctx, session)
	if err != nil {
		if mongo.IsDuplicateKeyError(err) {
			return ErrDuplicate
		}
		return err
	}

	return nil
}

func (r *SessionRepository) FindActiveByTokenHash(ctx context.Context, tokenHash string, now time.Time) (*models.Session, error) {
	var session models.Session
	err := db.DB.Collection("sessions").FindOne(ctx, bson.M{
		"token_hash": tokenHash,
		"expires_at": bson.M{"$gt": now},
	}).Decode(&session)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, ErrNotFound
		}
		return nil, err
	}

	return &session, nil
}

func (r *SessionRepository) DeleteByTokenHash(ctx context.Context, tokenHash string) error {
	_, err := db.DB.Collection("sessions").DeleteOne(ctx, bson.M{"token_hash": tokenHash})
	return err
}
