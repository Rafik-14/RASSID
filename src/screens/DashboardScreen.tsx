import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Plus, ChevronRight, Phone } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBg, Eyebrow, Pressable, ElevatedCard, AnimatedNumber, GradientText } from '@/components/Chrome';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, RadialGradient, Stop, Circle } from 'react-native-svg';
import { TopBar } from '@/components/TopBar';
import { KpiRow } from '@/components/KpiRow';
import { ChartCard } from '@/components/ChartCard';
import { StoreRow } from '@/components/StoreRow';
import { SyncBadge } from '@/components/SyncBadge';
import { c } from '@/components/tokens';
import { env } from '@/config/env';
import { getDashboardKpis, getMonthlyChartData, getAllStores } from '@/database/queries';
import type { Store } from '@/types';
import type { RootStackParamList } from '@/navigation/types';
import { useApp } from '@/store/AppContext';
import Toast from 'react-native-toast-message';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence, Easing } from 'react-native-reanimated';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function DashboardScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { refreshKey, pendingSync, syncing, refresh, syncNow } = useApp();
  
  const [kpis, setKpis] = useState({ totalReceivables: 0, activeStores: 0, cashCollectedToday: 0 });
  const [livraisonChart, setLivraisonChart] = useState({ total: 0, points: [] as number[] });
  const [paiementChart, setPaiementChart] = useState({ total: 0, points: [] as number[] });
  const [stores, setStores] = useState<Store[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [k, l, p, s] = await Promise.all([
        getDashboardKpis(),
        getMonthlyChartData(1),
        getMonthlyChartData(2),
        getAllStores(),
      ]);
      setKpis(k);
      setLivraisonChart(l);
      setPaiementChart(p);
      setStores(s);
    } catch (e: any) {
      console.error('Load error:', e);
      Toast.show({
        type: 'error',
        text1: 'Erreur de chargement',
        text2: e.message || 'Impossible de charger les données.',
      });
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load, refreshKey])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    await load();
    setRefreshing(false);
  };

  const handleSync = async () => {
    try {
      const msg = await syncNow();
      Toast.show({ type: 'success', text1: 'Synchronisation', text2: msg });
    } catch (e: any) {
      Toast.show({
        type: 'error',
        text1: 'Échec de la synchronisation',
        text2: e.message || 'Erreur inconnue',
      });
    }
  };

  const overdueStores = stores.filter(s => {
    const lastPayment = s.last_payment_date ? new Date(s.last_payment_date).getTime() : 0;
    const diffDays = Math.floor((Date.now() - lastPayment) / (1000 * 60 * 60 * 24));
    return s.current_balance > 0 && diffDays >= 10;
  });
  const overdueCount = overdueStores.length;
  const route = stores.slice(0, 5); // first 5 stores

  // Fancy Pulse animation for FAB glow
  const glowScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.8);
  React.useEffect(() => {
    glowScale.value = withRepeat(
      withSequence(
        withTiming(1.3, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.2, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.8, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);
  
  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
    opacity: glowOpacity.value,
  }));

  return (
    <StatusBg>
      <TopBar
        title=""
        showAvatar
        onAvatarPress={() => navigation.navigate('ProfileEdit')}
        onRightPress={() => navigation.navigate('OverdueAlerts')}
        rightIcon="bell"
        hasAlerts={overdueCount > 0}
      />

      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + 72, paddingBottom: insets.bottom + 110 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={c.lime} />}
      >
        <View style={styles.greetingSection}>
          <GradientText colors={['#ffffff', '#b8b8b8']} style={styles.greetingText}>
            Bonjour, {env.repName.split(' ')[0]}
          </GradientText>
          <View style={styles.greetingSubtitleRow}>
            <Text style={styles.greetingSubtitle}>Voici votre résumé</Text>
            <SyncBadge pending={pendingSync} syncing={syncing} onSync={handleSync} />
          </View>
        </View>

        <KpiRow
          totalDebt={kpis.totalReceivables}
          storesCount={kpis.activeStores}
          collectedToday={kpis.cashCollectedToday}
          overdueCount={overdueCount}
          onPressDebt={() => navigation.navigate('OverdueAlerts')}
          onPressStores={() => navigation.navigate('Stores' as any)} // Switch tab
          onPressCollected={() => navigation.navigate('Payments' as any)}
        />

        <View style={styles.sectionHeader}>
          <Eyebrow>Activité</Eyebrow>
        </View>

        <View style={styles.chartsRow}>
          <View style={{ flex: 1 }}>
            <Pressable onPress={() => navigation.navigate('Deliveries' as any)}>
              <ChartCard
                title="LIVRAISONS"
                trend={0}
                amount={livraisonChart.total}
                subtitle="marchandises livrées ce mois"
                data={livraisonChart.points}
                color={c.red}
              />
            </Pressable>
          </View>
          <View style={{ flex: 1 }}>
            <Pressable onPress={() => navigation.navigate('Payments' as any)}>
              <ChartCard
                title="PAIEMENTS REÇUS"
                trend={0}
                amount={paiementChart.total}
                subtitle="encaissé ce mois"
                data={paiementChart.points}
                color={c.green}
              />
            </Pressable>
          </View>
        </View>

        {overdueCount > 0 && (
          <View style={styles.alertsSection}>
            <Eyebrow style={{ marginBottom: 12 }}>Alertes</Eyebrow>
            <Pressable onPress={() => navigation.navigate('OverdueAlerts')}>
              <ElevatedCard glow="rgba(255,77,77,0.14)" style={styles.alertCard}>
                <View style={styles.alertCardInner}>
                  <View style={styles.alertIconBg}>
                    <Text style={styles.alertIconText}>!</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.alertTitle}>Voir les impayés</Text>
                    <Text style={styles.alertSubtitle}>
                      {overdueCount} magasin{overdueCount > 1 ? 's' : ''} · plus de 10 jours
                    </Text>
                  </View>
                  <ChevronRight size={14} color={c.white40} />
                </View>
              </ElevatedCard>
            </Pressable>
          </View>
        )}

        <View style={styles.routeHeader}>
          <Eyebrow>Route du jour</Eyebrow>
          <Text style={styles.routeCount}>{route.length} arrêts</Text>
        </View>

        <View style={{ paddingHorizontal: 22 }}>
          {route.map((store, i) => (
            <Pressable
              key={store.store_id}
              stretch={false}
              onPress={() => navigation.navigate('StoreProfile', { storeId: store.store_id })}
              style={[styles.routeItem, i === route.length - 1 && { borderBottomWidth: 0 }]}
            >
              <View style={styles.routeNumberBox}>
                <LinearGradient colors={['#1f1f1f', '#161616']} style={StyleSheet.absoluteFillObject} />
                <Text style={styles.routeNumberText}>{i + 1}</Text>
              </View>
              <View style={styles.routeMid}>
                <Text style={styles.routeName}>{store.name}</Text>
                <View style={styles.routeSubRow}>
                  <Text style={styles.routeSub}>{store.neighborhood || 'Inconnu'}</Text>
                  <View style={styles.routeSubDot} />
                  <Phone size={9} color={c.white40} strokeWidth={2.5} />
                  <Text style={[styles.routeSub, { fontVariant: ['tabular-nums'] }]}>
                    {store.phone || 'Aucun'}
                  </Text>
                </View>
              </View>
              <Text style={[styles.routeDebt, { color: store.current_balance > 0 ? c.white : c.green }]}>
                {store.current_balance > 0 ? store.current_balance.toLocaleString('fr-FR').replace(/,/g, ' ') + ' DA' : 'Soldé'}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* DEV Wipe Button */}
        {__DEV__ && (
          <Pressable
            onPress={async () => {
              try {
                const { getSupabase } = require('@/api/supabase');
                const supabase = getSupabase();
                if (supabase) {
                  await supabase.auth.signOut();
                }
                const AsyncStorage = require('@react-native-async-storage/async-storage').default;
                const SecureStore = require('expo-secure-store');
                await AsyncStorage.removeItem('supabase_session');
                await AsyncStorage.removeItem('rep_profile');
                await SecureStore.deleteItemAsync('supabase_encryption_key');
                const { getDatabase } = require('@/database');
                const db = await getDatabase();
                await db.execAsync('PRAGMA foreign_keys = OFF; DROP TABLE IF EXISTS transaction_items; DROP TABLE IF EXISTS transactions; DROP TABLE IF EXISTS products; DROP TABLE IF EXISTS stores; DROP TABLE IF EXISTS sync_meta; PRAGMA foreign_keys = ON; PRAGMA user_version = 0;');
                Toast.show({ type: 'success', text1: 'App Reset', text2: 'Please restart the Expo Go app completely!' });
              } catch (e) {
                console.error(e);
              }
            }}
            style={{ marginHorizontal: 22, marginTop: 40, padding: 16, backgroundColor: 'rgba(255,0,0,0.1)', borderRadius: 12, alignItems: 'center' }}
          >
            <Text style={{ color: '#ff4444', fontFamily: 'Inter_600SemiBold' }}>DEV: Réinitialiser l'app</Text>
          </Pressable>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* FAB */}
      <View style={[styles.fabContainer, { bottom: insets.bottom + 85 }]}>
        <Animated.View style={[styles.fabGlow, glowStyle]}>
          <Svg width={120} height={120}>
            <Defs>
              <RadialGradient id="glow" cx="50%" cy="50%" rx="50%" ry="50%" fx="50%" fy="50%">
                <Stop offset="0%" stopColor={c.lime} stopOpacity="0.8" />
                <Stop offset="50%" stopColor={c.lime} stopOpacity="0.4" />
                <Stop offset="100%" stopColor={c.lime} stopOpacity="0" />
              </RadialGradient>
            </Defs>
            <Circle cx="60" cy="60" r="60" fill="url(#glow)" />
          </Svg>
        </Animated.View>
        <Animated.View style={[styles.fabGlow, { top: -20, left: -20, opacity: 0.5 }]}>
          <Svg width={96} height={96}>
            <Defs>
              <RadialGradient id="innerGlow" cx="50%" cy="50%" rx="50%" ry="50%" fx="50%" fy="50%">
                <Stop offset="0%" stopColor={c.white} stopOpacity="0.6" />
                <Stop offset="100%" stopColor={c.lime} stopOpacity="0" />
              </RadialGradient>
            </Defs>
            <Circle cx="48" cy="48" r="48" fill="url(#innerGlow)" />
          </Svg>
        </Animated.View>
        <Pressable
          stretch={false}
          onPress={() => navigation.navigate('NewOperation', {})}
          style={styles.fabBtn}
        >
          <LinearGradient
            colors={['#9bff1f', c.lime, '#66c000']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
          <Plus size={28} color={c.ink} strokeWidth={2.4} />
        </Pressable>
      </View>
    </StatusBg>
  );
}

const styles = StyleSheet.create({
  greetingSection: {
    paddingHorizontal: 22,
    marginBottom: 20,
    marginTop: 4,
  },
  greetingText: {
    fontSize: 28,
    fontFamily: 'Inter_600SemiBold',
    color: c.white,
    letterSpacing: -1.2,
    lineHeight: 30,
    marginBottom: 4,
  },
  greetingSubtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  greetingSubtitle: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: c.white40,
  },
  sectionHeader: {
    paddingHorizontal: 22,
    paddingBottom: 8,
  },
  chartsRow: {
    flexDirection: 'row',
    paddingHorizontal: 22,
    gap: 10,
    marginBottom: 24,
  },
  alertsSection: {
    paddingHorizontal: 22,
    paddingBottom: 24,
  },
  alertCard: {
    padding: 14,
    borderRadius: 16,
  },
  alertCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  alertIconBg: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: c.redDim,
    borderWidth: 1,
    borderColor: 'rgba(255,77,77,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertIconText: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
    color: c.red,
  },
  alertTitle: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    color: c.white,
  },
  alertSubtitle: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    color: c.red,
  },
  routeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingBottom: 12,
  },
  routeCount: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: c.white40,
  },
  fabContainer: {
    position: 'absolute',
    right: 22,
    zIndex: 20,
  },
  fabGlow: {
    position: 'absolute',
    top: -32,
    left: -32,
  },
  fabBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: c.lime,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 32,
    elevation: 10,
    overflow: 'hidden', // Add to clip the inner gradient
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: c.borderLight,
  },
  routeNumberBox: {
    width: 24,
    height: 24,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: c.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  routeNumberText: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    color: c.white40,
  },
  routeMid: {
    flex: 1,
    minWidth: 0,
  },
  routeName: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    color: c.white,
    marginBottom: 1,
  },
  routeSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  routeSubDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: c.white40,
  },
  routeSub: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: c.white40,
  },
  routeDebt: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    fontVariant: ['tabular-nums'],
  },
});
