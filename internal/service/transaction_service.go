package service

import (
	"context"
	"fmt"
	"time"

	"valora/internal/models"
	"valora/internal/repository"

	"go.mongodb.org/mongo-driver/bson"
	"valora/internal/db"
)

type TransactionService struct {
	txRepo      *repository.TransactionRepository
	accountRepo *repository.AccountRepository
}

func NewTransactionService(txRepo *repository.TransactionRepository, accRepo *repository.AccountRepository) *TransactionService {
	return &TransactionService{
		txRepo:      txRepo,
		accountRepo: accRepo,
	}
}

func (s *TransactionService) CreateTransaction(ctx context.Context, tx *models.Transaction) error {
	var account models.Account
	err := db.DB.Collection("accounts").FindOne(ctx, bson.M{"_id": tx.AccountID}).Decode(&account)
	if err != nil {
		return fmt.Errorf("failed to find account: %w", err)
	}

	if account.Type == models.CreditCard {
		if account.ClosingDay == nil || account.DueDay == nil {
			return fmt.Errorf("credit card account missing closing or due day")
		}

		txYear, txMonth, txDay := tx.Date.Date()
		closingDay := *account.ClosingDay
		dueDay := *account.DueDay

		var dueMonth time.Month = txMonth
		var dueYear int = txYear

		if txDay >= closingDay {
			dueMonth++
			if dueMonth > 12 {
				dueMonth = 1
				dueYear++
			}
		}

		// Adjust for cases where due day is before closing day
		if dueDay < closingDay {
			dueMonth++
			if dueMonth > 12 {
				dueMonth = 1
				dueYear++
			}
		}

		tx.EffectiveDate = time.Date(dueYear, dueMonth, dueDay, 0, 0, 0, 0, tx.Date.Location())
	} else {
		tx.EffectiveDate = tx.Date
	}

	if err := s.txRepo.CreateTransaction(ctx, tx); err != nil {
		return err
	}

	// Update account balance
	if tx.EffectiveDate.Before(time.Now()) || tx.EffectiveDate.Equal(time.Now()) {
		_, err = db.DB.Collection("accounts").UpdateOne(
			ctx,
			bson.M{"_id": account.ID},
			bson.M{"$inc": bson.M{"current_balance": tx.Amount}},
		)
		if err != nil {
			return fmt.Errorf("failed to update account balance: %w", err)
		}
	}

	return nil
}

func (s *TransactionService) GetTransactions(ctx context.Context) ([]models.Transaction, error) {
	return s.txRepo.GetTransactions(ctx)
}
