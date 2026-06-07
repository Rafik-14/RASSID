import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { c } from './tokens';
import { ElevatedCard, Pressable, AnimatedNumber, Eyebrow } from './Chrome';

interface KpiRowProps {
  totalDebt: number;
  storesCount: number;
  collectedToday: number;
  overdueCount: number;
  onPressDebt: () => void;
  onPressStores: () => void;
  onPressCollected: () => void;
}

export function KpiRow({
  totalDebt,
  storesCount,
  collectedToday,
  overdueCount,
  onPressDebt,
  onPressStores,
  onPressCollected,
}: KpiRowProps) {
  return (
    <View style={styles.container}>
      <Pressable onPress={onPressDebt} style={styles.topRow}>
        <ElevatedCard glow="rgba(255,77,77,0.14)" style={styles.debtCard}>
          <View style={styles.debtHeader}>
            <Eyebrow dot={c.red}>CRÉANCES</Eyebrow>
            <View style={styles.debtPill}>
              <Text style={styles.debtPillText}>Dette active</Text>
            </View>
          </View>
          <View style={styles.valueRow}>
            <AnimatedNumber value={totalDebt} style={styles.debtValue} />
            <Text style={styles.daLabel}>DA</Text>
          </View>
        </ElevatedCard>
      </Pressable>

      <View style={styles.bottomRow}>
        <Pressable style={{ flex: 1 }} onPress={onPressStores}>
          <ElevatedCard style={styles.storesCard} glow="rgba(251, 191, 36, 0.14)">
            <Eyebrow dot={c.amber} style={{ marginBottom: 12 }}>MAGASINS</Eyebrow>
            <AnimatedNumber value={storesCount} style={styles.storesValue} duration={700} />
            <Text style={styles.storesSubText}>
              {overdueCount > 0 ? `${overdueCount} en alerte` : 'Aucune alerte'}
            </Text>
          </ElevatedCard>
        </Pressable>
        
        <Pressable style={{ flex: 1 }} onPress={onPressCollected}>
          <ElevatedCard glow="rgba(52,211,153,0.10)" style={styles.collectedCard}>
            <Eyebrow dot={c.green} style={{ marginBottom: 12 }}>ENCAISSÉ</Eyebrow>
            <View style={styles.valueRow}>
              <AnimatedNumber value={collectedToday} style={styles.collectedValue} />
              <Text style={styles.daLabel}>DA</Text>
            </View>
            <Text style={styles.collectedSubText}>Aujourd'hui</Text>
          </ElevatedCard>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 22,
    marginBottom: 26,
  },
  topRow: {
    width: '100%',
  },
  bottomRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  debtCard: {
    padding: 16,
    borderRadius: 18,
    justifyContent: 'space-between',
  },
  storesCard: {
    padding: 14,
    borderRadius: 18,
  },
  collectedCard: {
    padding: 14,
    borderRadius: 18,
  },
  debtHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  debtPill: {
    backgroundColor: c.redDim,
    borderWidth: 1,
    borderColor: 'rgba(255,77,77,0.2)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 100,
  },
  debtPillText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    color: c.red,
    letterSpacing: 0.2,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  debtValue: {
    fontSize: 32,
    fontFamily: 'Inter_600SemiBold',
    color: c.white,
    letterSpacing: -1,
  },
  daLabel: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    color: c.white40,
  },
  storesValue: {
    fontSize: 26,
    fontFamily: 'Inter_600SemiBold',
    color: c.white,
    letterSpacing: -0.6,
    marginBottom: 0,
  },
  storesSubText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: c.amber,
    marginTop: 4,
  },
  collectedValue: {
    fontSize: 26,
    fontFamily: 'Inter_600SemiBold',
    color: c.green,
    letterSpacing: -0.6,
    marginBottom: 0,
  },
  collectedSubText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: c.white40,
    marginTop: 4,
  },
});
