import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { c } from './tokens';
import type { Store } from '@/types';
import { formatDAFull } from '@/utils/currency';
import {
  getDebtStatus,
  getInitials,
  getDaysWithoutPaymentLabel,
} from '@/utils/storeHelpers';

interface StoreRowProps {
  store: Store;
  onPress: () => void;
  showEye?: boolean;
}

export function StoreRow({ store, onPress }: StoreRowProps) {
  const status = getDebtStatus(store);
  const overdueLabel = getDaysWithoutPaymentLabel(store);
  const overdueStr = overdueLabel ? overdueLabel.split(' ')[0] : null;
  
  let statusColor;
  if (status === 'paid') {
    statusColor = c.green;
  } else if (status === 'moderate') {
    statusColor = c.amber;
  } else {
    statusColor = c.red;
  }

  const badgeText = store.current_balance <= 0 ? 'Soldé' : formatDAFull(store.current_balance);

  return (
    <Pressable 
      style={({ pressed }) => [styles.row, { opacity: pressed ? 0.7 : 1 }]} 
      onPress={onPress}
    >
      <View style={styles.avatar}>
        <Text style={styles.initials}>{getInitials(store.name)}</Text>
        <View style={[styles.notificationDot, { backgroundColor: statusColor }]} />
      </View>
      <View style={styles.middle}>
        <Text style={styles.name} numberOfLines={1}>
          {store.name}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {store.neighborhood || 'Inconnu'}{store.phone ? ` · ${store.phone}` : ''}
          {overdueStr ? <Text style={{ color: statusColor }}> · {overdueStr}</Text> : ''}
        </Text>
      </View>
      <View style={styles.rightSide}>
        <Text style={[styles.debtText, store.current_balance <= 0 && { color: c.green }]}>{badgeText}</Text>
        {store.current_balance > 0 && <Text style={styles.currencyText}>DA</Text>}
      </View>
      <View style={styles.chevron}>
        <ChevronRight size={16} color={c.white40} strokeWidth={2.4} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: c.borderLight,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: c.ink, // Match background to cut out
  },
  initials: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: c.white,
  },
  middle: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: c.white,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: c.white40,
  },
  rightSide: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  debtText: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: c.white,
    letterSpacing: -0.2,
  },
  currencyText: {
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
    color: c.white40,
    marginTop: 2,
  },
  chevron: {
    marginLeft: 10,
  },
});
