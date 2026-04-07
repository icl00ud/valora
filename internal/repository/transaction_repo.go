package repository

import (
	"context"
	"valora/internal/db"
	"valora/internal/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type TransactionRepository struct{}

func (r *TransactionRepository) CreateTransaction(ctx context.Context, transaction *models.Transaction) error {
	transaction.ID = primitive.NewObjectID()
	collection := db.DB.Collection("transactions")
	_, err := collection.InsertOne(ctx, transaction)
	return err
}

func (r *TransactionRepository) GetTransactions(ctx context.Context) ([]models.Transaction, error) {
	collection := db.DB.Collection("transactions")
	cursor, err := collection.Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var transactions []models.Transaction
	if err = cursor.All(ctx, &transactions); err != nil {
		return nil, err
	}

	return transactions, nil
}
