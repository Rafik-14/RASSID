import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Banknote, Plus } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBg, Pressable, ElevatedCard, Eyebrow, AnimatedNumber } from '@/components/Chrome';
import { TopBar } from '@/components/TopBar';
import { c } from '@/components/tokens';
import type { RootStackParamList } from '@/navigation/types';
import { LinearGradient } from 'expo-linear-gradient';
import { getMonthlyChartData } from '@/database/queries';
import Toast from 'react-native-toast-message';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function PaymentsScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const [monthTotal, setMonthTotal] = useState(0);

  useFocusEffect(
    useCallback(() => {
      getMonthlyChartData(2)
        .then(data => setMonthTotal(data.total))
        .catch((e: any) => {
          console.error('Load error:', e);
          Toast.show({
            type: 'error',
            text1: 'Erreur de chargement',
            text2: e.message || 'Impossible de charger les données.',
          });
        });
    }, [])
  );

  return (
    <StatusBg>
      <TopBar title="Paiements" />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 22, paddingTop: insets.top + 72, paddingBottom: insets.bottom + 100 }}>
        
        <Text style={styles.pageTitle}>Paiements</Text>
        <Text style={styles.pageSubtitle}>
          Enregistrez un encaissement depuis la fiche magasin ou via une nouvelle opération.
        </Text>

        <ElevatedCard style={styles.monthCard} glow="rgba(45, 212, 191, 0.14)">
          <Eyebrow dot={c.green} style={{ marginBottom: 12 }}>CE MOIS</Eyebrow>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
            <AnimatedNumber value={monthTotal} style={styles.amountText} />
            <Text style={styles.currencyText}>DA</Text>
          </View>
          <Text style={styles.monthSubtitle}>Encaissé</Text>
        </ElevatedCard>

        <Eyebrow style={{ marginTop: 28, marginBottom: 14 }}>COMMENT COMMENCER</Eyebrow>

        <ElevatedCard style={styles.emptyCard}>
          <View style={{ alignItems: 'center', width: '100%' }}>
            <View style={styles.emptyIconBg}>
              <Banknote size={20} color={c.green} strokeWidth={2.4} />
            </View>
            <Text style={styles.emptyTitle}>Aucun encaissement récent</Text>
            <Text style={styles.emptySub}>
              Démarrez depuis un magasin ou créez une opération directe.
            </Text>

            <Pressable
              stretch={false}
              onPress={() => navigation.navigate('NewOperation', { type: 'paiement' })}
              style={styles.button}
            >
              <LinearGradient
                colors={['#9bff1f', c.lime, '#66c000']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[StyleSheet.absoluteFillObject, { borderRadius: 100 }]}
              />
              <Plus size={18} color={c.ink} strokeWidth={2.5} />
              <Text style={styles.buttonText}>Nouveau paiement</Text>
            </Pressable>
          </View>
        </ElevatedCard>

      </ScrollView>
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
    color: c.green, // specific to Paiements screen
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
  emptyCard: {
    padding: 28,
    alignItems: 'center',
    borderRadius: 24,
  },
  emptyIconBg: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: c.greenDim,
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
});
