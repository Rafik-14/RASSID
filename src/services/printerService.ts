import { env } from '@/config/env';
import type { Store, Transaction, TransactionItem } from '@/types';
import { formatDAFull } from '@/utils/currency';
import { formatDateFr } from '@/utils/dates';
import { TX_LABELS } from '@/types';

/**
 * Thermal ESC/POS printing via Bluetooth.
 * Requires a dev build with react-native-bluetooth-escpos-printer for production.
 * This service formats the delivery note text and exposes a print hook.
 */
export interface DeliveryNoteData {
  store: Store;
  transaction: Transaction;
  items: TransactionItem[];
}

export function formatDeliveryNote(data: DeliveryNoteData): string {
  const { store, transaction, items } = data;
  const lines = [
    '================================',
    '     BON DE LIVRAISON',
    `     ${env.repName}`,
    '================================',
    '',
    `Magasin: ${store.name}`,
    `Quartier: ${store.neighborhood}`,
    `Gérant: ${store.contact_person}`,
    `Tél: ${store.phone}`,
    '',
    `Réf: ${transaction.reference_no ?? transaction.tx_id.slice(0, 8).toUpperCase()}`,
    `Date: ${formatDateFr(transaction.created_at)}`,
    `Type: ${TX_LABELS[transaction.tx_type as 1]}`,
    '--------------------------------',
  ];

  for (const item of items) {
    lines.push(
      `${item.product_name ?? 'Article'} x${item.quantity}`,
      `  ${formatDAFull(item.price_at_time * item.quantity)}`
    );
  }

  lines.push(
    '--------------------------------',
    `TOTAL: ${formatDAFull(Math.abs(transaction.amount))}`,
    '',
    'Signature client:',
    '',
    '________________________',
    '',
    'RASSID — Distribution',
    '================================',
  );

  return lines.join('\n');
}

export async function printDeliveryNote(data: DeliveryNoteData): Promise<{ ok: boolean; message: string }> {
  const text = formatDeliveryNote(data);
  // Bluetooth ESC/POS requires native module + dev build
  if (!env.printerMac) {
    return {
      ok: false,
      message: `Impression simulée (configurez EXPO_PUBLIC_PRINTER_MAC).\n\n${text.slice(0, 200)}…`,
    };
  }
  return {
    ok: true,
    message: `Bon de livraison prêt pour l'imprimante ${env.printerMac}`,
  };
}
