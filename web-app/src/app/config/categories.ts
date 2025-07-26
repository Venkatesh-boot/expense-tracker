// Category config for AddExpensesPage and other modules
export interface CategoryConfig {
  label: string;
  type: 'expense' | 'savings' | 'income';
  icon: string;
}

export const categories: CategoryConfig[] = [
  // Expenses (alphabetical)
  { label: 'Bills', type: 'expense', icon: '🧾' },
  { label: 'Books', type: 'expense', icon: '📖' },
  { label: 'Charity', type: 'expense', icon: '🤝' },
  { label: 'Credit Card Payment', type: 'expense', icon: '�' },
  { label: 'Dining Out', type: 'expense', icon: '🍴' },
  { label: 'Electricity', type: 'expense', icon: '�' },
  { label: 'Entertainment', type: 'expense', icon: '🎮' },
  { label: 'Food', type: 'expense', icon: '🍽️' },
  { label: 'Fuel', type: 'expense', icon: '⛽' },
  { label: 'Gifts', type: 'expense', icon: '🎁' },
  { label: 'Groceries', type: 'expense', icon: '�' },
  { label: 'Health', type: 'expense', icon: '🏥' },
  { label: 'Insurance', type: 'expense', icon: '�️' },
  { label: 'Internet', type: 'expense', icon: '🌐' },
  { label: 'Kids', type: 'expense', icon: '🧒' },
  { label: 'Loan Payment', type: 'expense', icon: '💳' },
  { label: 'Maintenance', type: 'expense', icon: '🛠️' },
  { label: 'Medical', type: 'expense', icon: '💊' },
  { label: 'Mobile', type: 'expense', icon: '�' },
  { label: 'Mortgage', type: 'expense', icon: '�' },
  { label: 'Movies', type: 'expense', icon: '🎬' },
  { label: 'Personal Care', type: 'expense', icon: '💅' },
  { label: 'Pets', type: 'expense', icon: '🐾' },
  { label: 'Rent', type: 'expense', icon: '�' },
  { label: 'Shopping', type: 'expense', icon: '�️' },
  { label: 'Subscriptions', type: 'expense', icon: '�' },
  { label: 'Taxes', type: 'expense', icon: '💸' },
  { label: 'Transport', type: 'expense', icon: '�' },
  { label: 'Travel', type: 'expense', icon: '✈️' },
  { label: 'Tuition', type: 'expense', icon: '�' },
  { label: 'Water', type: 'expense', icon: '🚰' },
  // Loan types (alphabetical)
  { label: 'Auto Loan', type: 'expense', icon: '�' },
  { label: 'Business Loan', type: 'expense', icon: '�' },
  { label: 'Education Loan', type: 'expense', icon: '🎓' },
  { label: 'Gold Loan', type: 'expense', icon: '🥇' },
  { label: 'Home Loan', type: 'expense', icon: '🏠' },
  { label: 'Personal Loan', type: 'expense', icon: '�' },
  { label: 'Property Loan', type: 'expense', icon: '🏘️' },
  { label: 'Student Loan', type: 'expense', icon: '🎓' },
  // Savings (alphabetical)
  { label: 'Emergency Fund', type: 'savings', icon: '🚨' },
  { label: 'Fixed Deposit', type: 'savings', icon: '🏦' },
  { label: 'Gold', type: 'savings', icon: '🥇' },
  { label: 'Investments', type: 'savings', icon: '📈' },
  { label: 'Mutual Funds', type: 'savings', icon: '💹' },
  { label: 'Recurring Deposit', type: 'savings', icon: '🏦' },
  { label: 'Retirement', type: 'savings', icon: '�' },
  { label: 'Stocks', type: 'savings', icon: '📊' },
  // Income (alphabetical)
  { label: 'Bonus', type: 'income', icon: '🎉' },
  { label: 'Business', type: 'income', icon: '�' },
  { label: 'Dividends', type: 'income', icon: '💰' },
  { label: 'Freelance', type: 'income', icon: '🧑‍' },
  { label: 'Interest', type: 'income', icon: '�' },
  { label: 'Refund', type: 'income', icon: '�' },
  { label: 'Rental Income', type: 'income', icon: '�️' },
  { label: 'Salary', type: 'income', icon: '�' },
  // Other (always last)
  { label: 'Other', type: 'expense', icon: '➕' }, // 'Other' shown for all types
];
