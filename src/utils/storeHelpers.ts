import { colors } from '@/config/theme';
import type { Store } from '@/types';
import { daysSince } from './dates';

export type DebtStatus = 'paid' | 'moderate' | 'overdue';

export function getDebtStatus(store: Store): DebtStatus {
  if (store.current_balance <= 0) return 'paid';
  const days = daysSince(store.last_payment_date);
  if (days !== null && days > 10) return 'overdue';
  if (store.current_balance >= 5000) return 'overdue';
  if (store.current_balance >= 3000) return 'moderate';
  return 'moderate';
}

export function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

export function getAvatarColors(status: DebtStatus): { bg: string; text: string } {
  switch (status) {
    case 'paid':
      return { bg: colors.tealBg, text: colors.teal };
    case 'moderate':
      return { bg: '#FBF0E0', text: colors.amber };
    case 'overdue':
    default:
      // semantic danger: red text on alert background, not brand copper
      return { bg: colors.alertBg, text: colors.red };
  }
}

export function getDaysWithoutPaymentLabel(store: Store): string | null {
  const days = daysSince(store.last_payment_date);
  if (days === null || store.current_balance <= 0) return null;
  if (days >= 10) return `${days}j sans paiement`;
  return null;
}
