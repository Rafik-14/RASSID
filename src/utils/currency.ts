/** Format integer DA amounts for display */
export function formatDA(amount: number, compact = false): string {
  const abs = Math.abs(amount);
  if (compact && abs >= 1000) {
    const k = abs / 1000;
    const sign = amount < 0 ? '-' : '';
    return `${sign}${k % 1 === 0 ? k : k.toFixed(1)}K`;
  }
  const formatted = abs.toLocaleString('fr-DZ').replace(/\s/g, ' ');
  return amount < 0 ? `-${formatted}` : formatted;
}

export function formatDAFull(amount: number): string {
  return `${formatDA(amount)} DA`;
}

export function parseDAInput(text: string): number {
  const cleaned = text.replace(/[^\d]/g, '');
  return parseInt(cleaned, 10) || 0;
}
