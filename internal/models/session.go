package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Session struct {
	ID         primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID     primitive.ObjectID `bson:"user_id" json:"userId"`
	TokenHash  string             `bson:"token_hash" json:"-"`
	CreatedAt  time.Time          `bson:"created_at" json:"createdAt"`
	ExpiresAt  time.Time          `bson:"expires_at" json:"expiresAt"`
	LastSeenAt time.Time          `bson:"last_seen_at" json:"lastSeenAt"`
}
