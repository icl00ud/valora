package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Transaction struct {
	ID            primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	AccountID     primitive.ObjectID `bson:"account_id" json:"accountId"`
	Amount        float64            `bson:"amount" json:"amount"`
	Category      string             `bson:"category" json:"category"`
	Description   string             `bson:"description" json:"description"`
	Date          time.Time          `bson:"date" json:"date"`
	EffectiveDate time.Time          `bson:"effective_date" json:"effectiveDate"`
	IsPaid        bool               `bson:"is_paid" json:"isPaid"`
}
