/**
 * Validates an Algerian phone number.
 * Accepted formats:
 * - 05XXXXXXXX, 06XXXXXXXX, 07XXXXXXXX (10 digits)
 * - +213 5XXXXXXXX, +213 6XXXXXXXX, +213 7XXXXXXXX
 * - With optional spaces/dashes between groups
 *
 * Returns null if valid, or an error message string if invalid.
 */
export function validateAlgerianPhone(phone: string): string | null {
  if (!phone || !phone.trim()) return null; // Phone is optional

  // Strip spaces, dashes, dots
  const cleaned = phone.replace(/[\s\-\.()]/g, '');

  // +213 format
  if (cleaned.startsWith('+213')) {
    const rest = cleaned.slice(4);
    if (/^[567]\d{8}$/.test(rest)) return null;
    return 'Format invalide. Ex: +213 555 12 34 56';
  }

  // 0X format
  if (cleaned.startsWith('0')) {
    if (/^0[567]\d{8}$/.test(cleaned)) return null;
    return 'Format invalide. Ex: 0555 12 34 56';
  }

  // Fallback: any 10-digit starting with 05/06/07
  if (/^[567]\d{8}$/.test(cleaned)) return null;

  return 'Numéro de téléphone invalide';
}
