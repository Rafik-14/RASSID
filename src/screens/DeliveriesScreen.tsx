import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Alert } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Truck, Plus } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBg, Pressable, ElevatedCard, Eyebrow, AnimatedNumber } from '@/components/Chrome';
import { TopBar } from '@/components/TopBar';
import { c } from '@/components/tokens';
import type { RootStackParamList } from '@/navigation/types';
import { LinearGradient } from 'expo-linear-gradient';
import { getMonthlyChartData, getGlobalTransactions, voidTransaction } from '@/database/queries';
import type { Transaction } from '@/types';
import { formatDAFull } from '@/utils/currency';
import { formatDateShort } from '@/utils/dates';
import Toast from 'react-native-toast-message';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function DeliveriesScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const [monthTotal, setMonthTotal] = useState(0);
  const [txs, setTxs] = useState<Transaction[]>([]);

  const load = useCallback(() => {
    getMonthlyChartData(1)
      .then(data => setMonthTotal(data.total))
      .catch(console.error);

    getGlobalTransactions(1, 50)
      .then(setTxs)
      .catch(console.error);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const voidedTxIds = new Set(
    txs.filter(t => t.reference_no?.startsWith('VOID-')).map(t => t.reference_no!.replace('VOID-', ''))
  );

  const displayTxs = txs.filter(t => !t.reference_no?.startsWith('VOID-'));

  const handleTxPress = (tx: Transaction) => {
    if (voidedTxIds.has(tx.tx_id)) {
      Toast.show({ type: 'info', text1: 'Info', text2: 'Cette opération est déjà annulée.' });
      return;
    }
    Alert.alert(
      'Options de l\'opération',
      `Que voulez-vous faire avec cette opération de ${formatDAFull(tx.amount).replace(' DA', '')} DA ?`,
      [
        { text: 'Fermer', style: 'cancel' },
        { 
          text: 'Annuler l\'opération', 
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Confirmation',
              'Êtes-vous sûr de vouloir annuler cette opération ?',
              [
                { text: 'Non', style: 'cancel' },
                {
                  text: 'Oui, annuler',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await voidTransaction(tx);
                      Toast.show({ type: 'success', text1: 'Succès', text2: 'Opération annulée avec succès.' });
                      load();
                    } catch (e: any) {
                      Toast.show({ type: 'error', text1: 'Erreur', text2: e.message || 'Impossible d\'annuler.' });
                    }
                  }
                }
              ]
            );
          }
        },
        {
          text: 'Voir le magasin',
          onPress: () => navigation.navigate('StoreProfile', { storeId: tx.store_id })
        }
      ]
    );
  };

  const renderHeader = () => (
    <>
      <Text style={styles.pageTitle}>Livraisons</Text>
      <Text style={styles.pageSubtitle}>
        Enregistrez une livraison depuis la fiche magasin ou créez une nouvelle opération.
      </Text>

      <ElevatedCard style={styles.monthCard} glow="rgba(255, 77, 77, 0.14)">
        <Eyebrow dot={c.red} style={{ marginBottom: 12 }}>CE MOIS</Eyebrow>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
          <AnimatedNumber value={monthTotal} style={styles.amountText} />
          <Text style={styles.currencyText}>DA</Text>
        </View>
        <Text style={styles.monthSubtitle}>Marchandises livrées</Text>
      </ElevatedCard>

      <View style={styles.sectionHeader}>
        <Eyebrow>RÉCENTES</Eyebrow>
        <Pressable
          stretch={false}
          onPress={() => navigation.navigate('NewOperation', { type: 'livraison' })}
          style={styles.smallBtn}
        >
          <Plus size={14} color={c.white} />
          <Text style={styles.smallBtnText}>Nouveau</Text>
        </Pressable>
      </View>
    </>
  );

  const renderEmpty = () => (
    <ElevatedCard style={styles.emptyCard}>
      <View style={{ alignItems: 'center', width: '100%' }}>
        <View style={styles.emptyIconBg}>
          <Truck size={20} color={c.red} strokeWidth={2.4} />
        </View>
        <Text style={styles.emptyTitle}>Aucune livraison récente</Text>
        <Text style={styles.emptySub}>
          Démarrez depuis un magasin ou créez une opération directe.
        </Text>

        <Pressable
          stretch={false}
          onPress={() => navigation.navigate('NewOperation', { type: 'livraison' })}
          style={styles.button}
        >
          <LinearGradient
            colors={['#9bff1f', c.lime, '#66c000']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[StyleSheet.absoluteFillObject, { borderRadius: 100 }]}
          />
          <Plus size={18} color={c.ink} strokeWidth={2.5} />
          <Text style={styles.buttonText}>Nouvelle livraison</Text>
        </Pressable>
      </View>
    </ElevatedCard>
  );

  const renderItem = ({ item }: { item: Transaction }) => {
    const isVoided = voidedTxIds.has(item.tx_id);
    return (
      <Pressable 
        stretch={false}
        style={[styles.txRow, isVoided && { opacity: 0.4 }]} 
        onPress={() => handleTxPress(item)}
      >
        <View style={[styles.txLine, { backgroundColor: c.red }]} />
        <View style={styles.txMid}>
          <Text style={[styles.txStoreName, isVoided && { textDecorationLine: 'line-through' }]} numberOfLines={1}>{item.store_name || 'Magasin'}</Text>
          <Text style={styles.txDate}>{formatDateShort(item.created_at)} · {item.created_at.slice(11, 16)}</Text>
        </View>
        <Text style={[styles.txAmount, { color: c.red }, isVoided && { textDecorationLine: 'line-through' }]}>{formatDAFull(item.amount)}</Text>
      </Pressable>
    );
  };

  return (
    <StatusBg>
      <TopBar title="Livraisons" />
      <FlatList
        data={displayTxs}
        keyExtractor={(item) => item.tx_id}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={{ paddingHorizontal: 22, paddingTop: insets.top + 72, paddingBottom: insets.bottom + 100 }}
      />
    </StatusBg>
  );
}

const styles = StyleSheet.create({
  pageTitle: {
    fontSize: 34,
    fontFamily: 'Inter_600SemiBold',
    color: c.white,
    letterSpacing: -1.2,
    marginBottom: 8,
  },
  pageSubtitle: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: c.white40,
    lineHeight: 22,
    marginBottom: 32,
  },
  monthCard: {
    padding: 24,
    borderRadius: 24,
  },
  amountText: {
    fontSize: 36,
    fontFamily: 'Inter_600SemiBold',
    color: c.white,
    letterSpacing: -1,
  },
  currencyText: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: c.white40,
  },
  monthSubtitle: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    color: c.white40,
    marginTop: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 28,
    marginBottom: 14,
  },
  smallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 100,
  },
  smallBtnText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    color: c.white,
  },
  emptyCard: {
    padding: 28,
    alignItems: 'center',
    borderRadius: 24,
  },
  emptyIconBg: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: c.redDim,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: c.white,
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: c.white40,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  button: {
    height: 48,
    paddingHorizontal: 20,
    borderRadius: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    gap: 8,
    shadowColor: c.lime,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 12,
    overflow: 'hidden',
  },
  buttonText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: c.ink,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: c.borderLight,
  },
  txLine: {
    width: 3,
    height: 36,
    borderRadius: 3,
  },
  txMid: {
    flex: 1,
    minWidth: 0,
  },
  txStoreName: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: c.white,
    marginBottom: 2,
  },
  txDate: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: c.white40,
  },
  txAmount: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
});
