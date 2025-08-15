// utils/currencyFormat.ts
import { currencySymbols } from '../config/currency-config';

export function formatCurrency(amount: number, currency: string, decimals = 2) {
  const symbol = currencySymbols[currency] || currency;
  
  // If the decimal part is zero, show as integer
  if (amount % 1 === 0) {
    return `${symbol}${amount.toFixed(0)}`;
  }
  
  return `${symbol}${amount.toFixed(decimals)}`;
}
