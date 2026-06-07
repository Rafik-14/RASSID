import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { AlertCircle } from 'lucide-react-native';
import { c } from './tokens';
import type { Store } from '@/types';
import { formatDAFull } from '@/utils/currency';

interface AlertCardProps {
  store: Store;
  daysOverdue: number;
  onPress: () => void;
}

export function AlertCard({ store, daysOverdue, onPress }: AlertCardProps) {
  const isSevere = daysOverdue >= 30;
  const bg = isSevere ? c.redDim : c.amberDim;
  const iconColor = isSevere ? c.red : c.amber;
  
  return (
    <Pressable 
      style={({ pressed }) => [styles.row, { opacity: pressed ? 0.7 : 1 }]}
      onPress={onPress}
    >
      <View style={[styles.iconCircle, { backgroundColor: bg }]}>
        <AlertCircle size={16} color={iconColor} strokeWidth={2.5} />
      </View>
      
      <View style={styles.middle}>
        <Text style={styles.storeName} numberOfLines={1}>{store.name}</Text>
        <Text style={[styles.daysText, { color: iconColor }]} numberOfLines={1}>
          Dernier paiement: il y a {daysOverdue} jours
        </Text>
      </View>

      <Text style={styles.debtAmount}>{formatDAFull(store.current_balance)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: c.borderLight,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  middle: {
    flex: 1,
    minWidth: 0,
  },
  storeName: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: c.white,
    marginBottom: 2,
  },
  daysText: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  debtAmount: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: c.red,
  },
});
