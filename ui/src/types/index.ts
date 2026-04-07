export type AccountType = 'checking' | 'savings' | 'credit_card';

export interface Account {
  id?: string;
  name: string;
  type: AccountType;
  closingDay?: number;
  dueDay?: number;
  currentBalance: number;
}

export interface Transaction {
  id?: string;
  accountId: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  effectiveDate?: string;
  isPaid: boolean;
}
