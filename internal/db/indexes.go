package db

import (
	"context"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func BuildIndexModels() map[string][]mongo.IndexModel {
	return map[string][]mongo.IndexModel{
		"users": {
			{
				Keys: bson.D{{Key: "email", Value: 1}},
				Options: options.Index().
					SetUnique(true).
					SetName("users_email_unique"),
			},
		},
		"sessions": {
			{
				Keys: bson.D{{Key: "token_hash", Value: 1}},
				Options: options.Index().
					SetUnique(true).
					SetName("sessions_token_hash_unique"),
			},
			{
				Keys: bson.D{{Key: "expires_at", Value: 1}},
				Options: options.Index().
					SetExpireAfterSeconds(0).
					SetName("sessions_expires_at_ttl"),
			},
		},
		"accounts": {
			{
				Keys:    bson.D{{Key: "user_id", Value: 1}},
				Options: options.Index().SetName("accounts_user_id"),
			},
		},
		"transactions": {
			{
				Keys:    bson.D{{Key: "user_id", Value: 1}},
				Options: options.Index().SetName("transactions_user_id"),
			},
			{
				Keys:    bson.D{{Key: "user_id", Value: 1}, {Key: "date", Value: 1}},
				Options: options.Index().SetName("transactions_user_id_date"),
			},
		},
	}
}

func EnsureIndexes(ctx context.Context) error {
	for collectionName, indexes := range BuildIndexModels() {
		if _, err := DB.Collection(collectionName).Indexes().CreateMany(ctx, indexes); err != nil {
			return err
		}
	}

	return nil
}
