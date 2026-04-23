import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function parsePrice(priceStr: string): number {
  if (!priceStr) return 0;
  // Remove spaces, currency symbols, and other non-numeric chars except comma/dot
  const cleaned = priceStr.replace(/[^\d,.]/g, '').replace(',', '.');
  const price = parseFloat(cleaned);
  return isNaN(price) ? 0 : price;
}
