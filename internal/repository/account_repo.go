package repository

import (
	"context"
	"errors"
	"valora/internal/db"
	"valora/internal/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type AccountRepository struct{}

func (r *AccountRepository) CreateAccount(ctx context.Context, userID primitive.ObjectID, account *models.Account) error {
	account.ID = primitive.NewObjectID()
	account.UserID = userID
	collection := db.DB.Collection("accounts")
	_, err := collection.InsertOne(ctx, account)
	return err
}

func (r *AccountRepository) GetAccounts(ctx context.Context, userID primitive.ObjectID) ([]models.Account, error) {
	collection := db.DB.Collection("accounts")
	cursor, err := collection.Find(ctx, bson.M{"user_id": userID})
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

func (r *AccountRepository) FindByIDAndUser(ctx context.Context, accountID, userID primitive.ObjectID) (*models.Account, error) {
	var account models.Account
	err := db.DB.Collection("accounts").FindOne(ctx, bson.M{"_id": accountID, "user_id": userID}).Decode(&account)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, ErrNotFound
		}
		return nil, err
	}

	return &account, nil
}

func (r *AccountRepository) IncrementBalance(ctx context.Context, accountID, userID primitive.ObjectID, amount float64) error {
	_, err := db.DB.Collection("accounts").UpdateOne(
		ctx,
		bson.M{"_id": accountID, "user_id": userID},
		bson.M{"$inc": bson.M{"current_balance": amount}},
	)
	return err
}
