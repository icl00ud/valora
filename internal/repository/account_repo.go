package repository

import (
	"context"
	"valora/internal/db"
	"valora/internal/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type AccountRepository struct{}

func (r *AccountRepository) CreateAccount(ctx context.Context, account *models.Account) error {
	account.ID = primitive.NewObjectID()
	collection := db.DB.Collection("accounts")
	_, err := collection.InsertOne(ctx, account)
	return err
}

func (r *AccountRepository) GetAccounts(ctx context.Context) ([]models.Account, error) {
	collection := db.DB.Collection("accounts")
	cursor, err := collection.Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var accounts []models.Account
	if err = cursor.All(ctx, &accounts); err != nil {
		return nil, err
	}

	return accounts, nil
}
