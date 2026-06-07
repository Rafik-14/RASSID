import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  RefreshControl,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Search, SlidersHorizontal, Plus } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBg, Pressable, Eyebrow } from '@/components/Chrome';
import { TopBar } from '@/components/TopBar';
import { StoreRow } from '@/components/StoreRow';
import { c } from '@/components/tokens';
import { getAllStores } from '@/database/queries';
import type { Store } from '@/types';
import { useApp } from '@/store/AppContext';
import type { RootStackParamList } from '@/navigation/types';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';

// Platform check removed since New Architecture is used

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Filter = 'all' | 'alert' | 'ok' | 'paid';

export function StoresScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { refreshKey, refresh } = useApp();
  
  const [stores, setStores] = useState<Store[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const s = await getAllStores();
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

  const getDaysSincePayment = (s: Store) => {
    if (!s.last_payment_date) return 999;
    return Math.floor((Date.now() - new Date(s.last_payment_date).getTime()) / (1000 * 60 * 60 * 24));
  };

  const filtered = stores.filter((s) => {
    const q = search.toLowerCase();
    const matchQuery = !q || s.name.toLowerCase().includes(q) || (s.neighborhood || '').toLowerCase().includes(q);
    
    const days = getDaysSincePayment(s);
    let matchFilter = true;
    if (filter === 'alert') matchFilter = days >= 10 && s.current_balance > 0;
    else if (filter === 'ok') matchFilter = s.current_balance > 0 && days < 10;
    else if (filter === 'paid') matchFilter = s.current_balance <= 0;

    return matchQuery && matchFilter;
  });

  const counts = {
    all: stores.length,
    alert: stores.filter((s) => getDaysSincePayment(s) >= 10 && s.current_balance > 0).length,
    ok: stores.filter((s) => s.current_balance > 0 && getDaysSincePayment(s) < 10).length,
    paid: stores.filter((s) => s.current_balance <= 0).length,
  };

  const filters: { id: Filter; l: string }[] = [
    { id: 'all', l: 'Tous' },
    { id: 'alert', l: 'Alerte' },
    { id: 'ok', l: 'À jour' },
    { id: 'paid', l: 'Soldés' },
  ];

  const handleFilterChange = (f: Filter) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setFilter(f);
  };

  return (
    <StatusBg>
      {/* Absolute Header Area */}
      <View style={[styles.headerContainer, { paddingTop: insets.top + 28 }]}>
        <Animated.View entering={FadeInUp.duration(400)} style={styles.headerContent}>
          <Text style={styles.headerTitle}>Magasins</Text>
          <Text style={styles.headerSubtitle}>
            {counts.all} actifs · <Text style={{ color: c.amber }}>{counts.alert} en alerte</Text>
          </Text>
        </Animated.View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + 170, paddingBottom: insets.bottom + 160 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={c.lime} />}
      >
        <View style={styles.searchRow}>
          <LinearGradient colors={['#1d1d1d', '#161616']} style={styles.searchInputContainer}>
            <Search size={16} color={c.white40} strokeWidth={2} />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher un magasin…"
              placeholderTextColor={c.white40}
              value={search}
              onChangeText={setSearch}
            />
          </LinearGradient>
        </View>

        <View style={styles.filterPillsContainer}>
          {filters.map((p) => {
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
                  <Text style={[styles.filterPillCount, { color: active ? 'rgba(0,0,0,0.45)' : c.white40 }]}>
                    {counts[p.id]}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.listHeader}>
          <Text style={styles.listHeaderText}>
            {filtered.length} magasin{filtered.length > 1 ? 's' : ''}
          </Text>
        </View>

        <View style={styles.listContainer}>
          {filtered.length === 0 && (
            <Text style={styles.emptyText}>Aucun magasin trouvé</Text>
          )}
          {filtered.map((store, i) => (
            <Animated.View key={store.store_id} entering={FadeInUp.delay(i * 40).duration(300)}>
              <StoreRow
                store={store}
                onPress={() => navigation.navigate('StoreProfile', { storeId: store.store_id })}
              />
            </Animated.View>
          ))}
        </View>
      </ScrollView>

      {/* FAB */}
      <View style={[styles.fabContainer, { bottom: insets.bottom + 85 }]}>
        <Pressable
          stretch={false}
          onPress={() => navigation.navigate('NewStore')}
          style={styles.fabBtn}
        >
          <LinearGradient
            colors={['#9bff1f', c.lime, '#66c000']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[StyleSheet.absoluteFillObject, { borderRadius: 100 }]}
          />
          <Plus size={18} color={c.ink} strokeWidth={2.8} />
          <Text style={styles.fabText}>Nouveau magasin</Text>
        </Pressable>
      </View>
    </StatusBg>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 22,
    backgroundColor: 'rgba(10,10,10,0.85)',
  },
  headerContent: {
    paddingTop: 12,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 40,
    fontFamily: 'Inter_600SemiBold',
    color: c.white,
    letterSpacing: -1.6,
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: c.white40,
  },
  searchRow: {
    flexDirection: 'row',
    paddingHorizontal: 22,
    marginBottom: 18,
    gap: 8,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: c.borderLight,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: c.white,
    padding: 0,
  },
  filterPillsContainer: {
    flexDirection: 'row',
    marginHorizontal: 22,
    marginBottom: 18,
    padding: 4,
    backgroundColor: 'rgba(26,26,26,0.6)',
    borderWidth: 1,
    borderColor: c.borderLight,
    borderRadius: 100,
    gap: 2,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    gap: 6,
  },
  filterPillLabel: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  filterPillCount: {
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
  },
  listHeader: {
    paddingHorizontal: 22,
    paddingBottom: 10,
  },
  listHeaderText: {
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
    color: c.white40,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
  listContainer: {
    paddingHorizontal: 22,
  },
  emptyText: {
    paddingVertical: 32,
    textAlign: 'center',
    fontSize: 12,
    color: c.white40,
    fontFamily: 'Inter_400Regular',
  },
  fabContainer: {
    position: 'absolute',
    right: 22,
    zIndex: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabBtn: {
    height: 52,
    paddingLeft: 18,
    paddingRight: 22,
    borderRadius: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: c.lime,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 12,
    overflow: 'hidden',
  },
  fabText: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    color: c.ink,
    letterSpacing: -0.2,
  },
});
