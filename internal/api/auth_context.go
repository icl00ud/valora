package api

import (
	"context"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type userIDContextKey string

const userIDKey userIDContextKey = "user_id"

func withUserID(ctx context.Context, userID primitive.ObjectID) context.Context {
	return context.WithValue(ctx, userIDKey, userID)
}

func userIDFromContext(ctx context.Context) (primitive.ObjectID, bool) {
	userID, ok := ctx.Value(userIDKey).(primitive.ObjectID)
	return userID, ok
}
