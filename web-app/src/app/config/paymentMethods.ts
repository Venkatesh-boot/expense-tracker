// Configurable payment methods for AddExpensesPage and other modules
export interface PaymentMethodConfig {
  value: string;
  label: string;
  icon: string;
}

export const paymentMethods: PaymentMethodConfig[] = [
  { value: 'Cash', label: 'Cash', icon: '💵' },
  { value: 'Card', label: 'Card', icon: '💳' },
  { value: 'UPI', label: 'UPI', icon: '📱' },
  { value: 'NetBanking', label: 'Net Banking', icon: '🏦' },
  { value: 'Wallet', label: 'Wallet', icon: '👛' },
  { value: 'Cheque', label: 'Cheque', icon: '🧾' },
  { value: 'Other', label: 'Other', icon: '➕' },
];
