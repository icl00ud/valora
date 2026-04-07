package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type AccountType string

const (
	CheckingAccount AccountType = "checking"
	SavingsAccount  AccountType = "savings"
	CreditCard      AccountType = "credit_card"
)

type Account struct {
	ID             primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Name           string             `bson:"name" json:"name"`
	Type           AccountType        `bson:"type" json:"type"`
	ClosingDay     *int               `bson:"closing_day,omitempty" json:"closingDay,omitempty"`
	DueDay         *int               `bson:"due_day,omitempty" json:"dueDay,omitempty"`
	CurrentBalance float64            `bson:"current_balance" json:"currentBalance"`
}
