import React, { useCallback, useState } from 'react';
import { View, ScrollView, Text, StyleSheet, LayoutAnimation, Platform, UIManager } from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { ArrowDown, ArrowUp, Filter } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBg, Pressable, Eyebrow, AnimatedNumber } from '@/components/Chrome';
import { TopBar } from '@/components/TopBar';
import { c } from '@/components/tokens';
import { getStoreTransactions } from '@/database/queries';
import type { Transaction, HistoryFilter } from '@/types';
import { TX_LABELS } from '@/types';
import type { RootStackParamList } from '@/navigation/types';
import { formatDAFull } from '@/utils/currency';
import { formatDateShort } from '@/utils/dates';
import { useApp } from '@/store/AppContext';
import Animated, { FadeInUp } from 'react-native-reanimated';
import Toast from 'react-native-toast-message';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Route = RouteProp<RootStackParamList, 'StoreHistory'>;

const FILTERS: { id: HistoryFilter; l: string }[] = [
  { id: 'all', l: 'Tout' },
  { id: 'livraison', l: 'Livraisons' },
  { id: 'paiement', l: 'Paiements' },
  { id: 'retour', l: 'Retours' },
  { id: 'avoir', l: 'Avoirs' },
];

function groupByDate(txs: Transaction[]): Map<string, Transaction[]> {
  const map = new Map<string, Transaction[]>();
  for (const tx of txs) {
    const day = tx.created_at.slice(0, 10);
    if (!map.has(day)) map.set(day, []);
    map.get(day)!.push(tx);
  }
  return map;
}

function txColor(type: number) {
  switch (type) {
    case 1: return c.red;
    case 2: return c.green;
    case 3: return c.blue;
    case 4: return c.amber;
    default: return c.white40;
  }
}

export function StoreHistoryScreen() {
  const navigation = useNavigation();
  const route = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const { refreshKey } = useApp();
  const [filter, setFilter] = useState<HistoryFilter>('all');
  const [txs, setTxs] = useState<Transaction[]>([]);

  const load = useCallback(async () => {
    try {
      setTxs(await getStoreTransactions(route.params.storeId, filter));
    } catch (e: any) {
      console.error('Load error:', e);
      Toast.show({
        type: 'error',
        text1: 'Erreur de chargement',
        text2: e.message || 'Impossible de charger les données.',
      });
    }
  }, [route.params.storeId, filter]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load, refreshKey])
  );

  const handleFilterChange = (f: HistoryFilter) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setFilter(f);
  };

  const grouped = groupByDate(txs);
  
  // Calculate month net
  let sortant = 0;
  let entrant = 0;
  for (const tx of txs) {
    if (tx.amount > 0) sortant += tx.amount;
    else entrant += Math.abs(tx.amount);
  }
  const net = sortant - entrant;

  return (
    <StatusBg>
      <TopBar 
        title="Historique" 
        onBack={() => navigation.goBack()} 
        rightIcon="none" // we'll use a custom right element if needed, but the design just has Filter icon
        // We could modify TopBar to accept custom right elements, but for now we'll skip the right Filter icon if TopBar doesn't support it, or wait, TopBar takes `onRightPress` and `rightIcon: 'bell' | 'none'`. I'll just use 'none' since filtering is right below.
      />
      
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + 70, paddingBottom: insets.bottom + 24 }}
      >
        <Animated.View entering={FadeInUp.duration(400)} style={styles.heroArea}>
          <Eyebrow style={{ marginBottom: 12 }} dot={c.lime}>Solde net du mois</Eyebrow>
          <View style={styles.netAmountRow}>
            <Text style={styles.netAmountSign}>{net >= 0 ? '+' : ''}</Text>
            <AnimatedNumber value={Math.abs(net)} style={styles.netAmountValue} />
            <Text style={styles.netAmountCurrency}>DA</Text>
          </View>
          
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <View style={[styles.statIconWrapper, { backgroundColor: c.redDim, borderColor: 'rgba(255,77,77,0.2)' }]}>
                <ArrowUp size={11} color={c.red} strokeWidth={3} />
              </View>
              <View>
                <Text style={styles.statLabel}>Sortant</Text>
                <Text style={styles.statValue}>{formatDAFull(sortant)}</Text>
              </View>
            </View>
            
            <View style={styles.statBox}>
              <View style={[styles.statIconWrapper, { backgroundColor: c.greenDim, borderColor: 'rgba(52,211,153,0.2)' }]}>
                <ArrowDown size={11} color={c.green} strokeWidth={3} />
              </View>
              <View>
                <Text style={styles.statLabel}>Entrant</Text>
                <Text style={styles.statValue}>{formatDAFull(entrant)}</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        <View style={styles.filterPillsContainer}>
          {FILTERS.map((p) => {
            const active = p.id === filter;
            return (
              <Pressable
                key={p.id}
                stretch={false}
                onPress={() => handleFilterChange(p.id)}
                style={styles.filterPillWrapper}
              >
                {active && (
                  <View style={[StyleSheet.absoluteFillObject, styles.filterPillActiveBg]} />
                )}
                <View style={styles.filterPillContent}>
                  <Text style={[styles.filterPillLabel, { color: active ? c.ink : c.white }]}>
                    {p.l}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        {txs.length === 0 && (
          <Text style={styles.emptyText}>Aucune opération</Text>
        )}

        {Array.from(grouped.entries()).map(([day, dayTxs], gi) => {
          const dayNet = dayTxs.reduce((s, t) => s + t.amount, 0);
          return (
            <View key={day} style={styles.groupContainer}>
              <View style={styles.groupHeader}>
                <View>
                  <Text style={styles.groupDate}>{formatDateShort(day + 'T12:00:00.000Z')}</Text>
                </View>
                <Text style={[styles.groupNet, { color: dayNet > 0 ? c.red : c.green }]}>
                  {dayNet > 0 ? '+' : ''}{formatDAFull(dayNet)} DA dette
                </Text>
              </View>

              <View style={styles.txList}>
                {dayTxs.map((tx, i) => {
                  const color = txColor(tx.tx_type);
                  const time = tx.created_at.slice(11, 16); // basic HH:MM
                  return (
                    <Animated.View 
                      key={tx.tx_id} 
                      entering={FadeInUp.delay(i * 40).duration(300)}
                      style={[styles.txRow, i === dayTxs.length - 1 && { borderBottomWidth: 0 }]}
                    >
                      <View style={[styles.txLine, { backgroundColor: color, shadowColor: color }]} />
                      <View style={styles.txMid}>
                        <View style={styles.txMidTop}>
                          <Text style={styles.txType}>{TX_LABELS[tx.tx_type as 1]}</Text>
                          <Text style={styles.txTime}>· {time}</Text>
                        </View>
                        <Text style={styles.txNote} numberOfLines={1}>
                          {tx.note || '—'}
                        </Text>
                      </View>
                      <Text style={[styles.txAmount, { color }]}>
                        {tx.amount > 0 ? '+' : ''}{formatDAFull(tx.amount)}
                      </Text>
                    </Animated.View>
                  );
                })}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </StatusBg>
  );
}

const styles = StyleSheet.create({
  heroArea: {
    paddingHorizontal: 22,
    paddingBottom: 24,
  },
  netAmountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginBottom: 18,
  },
  netAmountSign: {
    fontSize: 46,
    fontFamily: 'Inter_600SemiBold',
    color: c.lime,
    letterSpacing: -2.2,
    lineHeight: 48,
  },
  netAmountValue: {
    fontSize: 46,
    fontFamily: 'Inter_600SemiBold',
    color: c.lime,
    letterSpacing: -2.2,
    lineHeight: 48,
  },
  netAmountCurrency: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: c.white40,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 14,
  },
  statBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statIconWrapper: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
    color: c.white40,
    letterSpacing: 0.3,
  },
  statValue: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: c.white,
  },
  filterPillsContainer: {
    flexDirection: 'row',
    marginHorizontal: 22,
    marginBottom: 8,
    padding: 4,
    backgroundColor: 'rgba(26,26,26,0.6)',
    borderWidth: 1,
    borderColor: c.borderLight,
    borderRadius: 100,
    gap: 2,
    overflow: 'hidden',
  },
  filterPillWrapper: {
    flex: 1,
    borderRadius: 100,
    overflow: 'hidden',
  },
  filterPillActiveBg: {
    backgroundColor: c.white,
  },
  filterPillContent: {
    paddingVertical: 6,
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  filterPillLabel: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
  },
  emptyText: {
    paddingVertical: 32,
    textAlign: 'center',
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: c.white40,
  },
  groupContainer: {
    marginTop: 20,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingVertical: 10,
  },
  groupDate: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: c.white,
    letterSpacing: -0.2,
  },
  groupNet: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: -0.2,
  },
  txList: {
    paddingHorizontal: 22,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: c.borderLight,
  },
  txLine: {
    width: 3,
    height: 36,
    borderRadius: 3,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 2,
  },
  txMid: {
    flex: 1,
    minWidth: 0,
  },
  txMidTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  txType: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    color: c.white,
  },
  txTime: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
    color: c.white40,
  },
  txNote: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: c.white40,
  },
  txAmount: {
    fontSize: 13.5,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: -0.3,
  },
});
