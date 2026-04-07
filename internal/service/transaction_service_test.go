package service

import (
	"context"
	"testing"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"

	"valora/internal/models"
	"valora/internal/repository"
)

type fakeTxStore struct {
	transactions []models.Transaction
}

func (f *fakeTxStore) CreateTransaction(_ context.Context, userID primitive.ObjectID, tx *models.Transaction) error {
	clone := *tx
	clone.UserID = userID
	f.transactions = append(f.transactions, clone)
	return nil
}

func (f *fakeTxStore) GetTransactions(_ context.Context, userID primitive.ObjectID) ([]models.Transaction, error) {
	filtered := make([]models.Transaction, 0)
	for _, tx := range f.transactions {
		if tx.UserID == userID {
			filtered = append(filtered, tx)
		}
	}
	return filtered, nil
}

type fakeAccountStore struct {
	accounts map[primitive.ObjectID]models.Account

	incrementCalls int
}

func (f *fakeAccountStore) FindByIDAndUser(_ context.Context, accountID, userID primitive.ObjectID) (*models.Account, error) {
	acc, ok := f.accounts[accountID]
	if !ok || acc.UserID != userID {
		return nil, repository.ErrNotFound
	}
	return &acc, nil
}

func (f *fakeAccountStore) IncrementBalance(_ context.Context, accountID, userID primitive.ObjectID, amount float64) error {
	acc, ok := f.accounts[accountID]
	if !ok || acc.UserID != userID {
		return repository.ErrNotFound
	}
	acc.CurrentBalance += amount
	f.accounts[accountID] = acc
	f.incrementCalls++
	return nil
}

func TestCreateTransactionRejectsAccountFromDifferentUser(t *testing.T) {
	ownerID := primitive.NewObjectID()
	otherUserID := primitive.NewObjectID()
	accountID := primitive.NewObjectID()

	accountStore := &fakeAccountStore{accounts: map[primitive.ObjectID]models.Account{
		accountID: {
			ID:             accountID,
			UserID:         ownerID,
			Type:           models.CheckingAccount,
			CurrentBalance: 100,
		},
	}}

	txStore := &fakeTxStore{}
	svc := NewTransactionService(txStore, accountStore)

	err := svc.CreateTransaction(context.Background(), otherUserID, &models.Transaction{
		AccountID: accountID,
		Amount:    -10,
		Date:      time.Now(),
	})

	if err == nil || err != repository.ErrNotFound {
		t.Fatalf("expected ErrNotFound, got %v", err)
	}
}

func TestGetTransactionsReturnsOnlyCurrentUser(t *testing.T) {
	userA := primitive.NewObjectID()
	userB := primitive.NewObjectID()

	txStore := &fakeTxStore{transactions: []models.Transaction{
		{ID: primitive.NewObjectID(), UserID: userA, Description: "a1"},
		{ID: primitive.NewObjectID(), UserID: userB, Description: "b1"},
		{ID: primitive.NewObjectID(), UserID: userA, Description: "a2"},
	}}

	svc := NewTransactionService(txStore, &fakeAccountStore{accounts: map[primitive.ObjectID]models.Account{}})

	txs, err := svc.GetTransactions(context.Background(), userA)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if len(txs) != 2 {
		t.Fatalf("expected 2 transactions, got %d", len(txs))
	}
}
