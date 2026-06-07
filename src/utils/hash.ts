import * as Crypto from 'expo-crypto';

export async function computeTxHash(
  txId: string,
  storeId: string,
  txType: number,
  amount: number,
  createdAt: string,
  parentHash: string | null
): Promise<string> {
  const payload = `${txId}|${storeId}|${txType}|${amount}|${createdAt}|${parentHash ?? 'GENESIS'}`;
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, payload);
}
