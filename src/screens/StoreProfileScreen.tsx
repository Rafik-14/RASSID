import React, { useCallback, useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  Linking,
  Platform,
} from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Phone, MessageCircle, MapPin, Car, Banknote, Undo2, Tag, ArrowUpRight } from 'lucide-react-native';
import { StatusBg, Pressable, ElevatedCard, AnimatedNumber, Eyebrow, GradientText } from '@/components/Chrome';
import { TopBar } from '@/components/TopBar';
import { c } from '@/components/tokens';
import { getStoreById } from '@/database/queries';
import type { Store, OperationType } from '@/types';
import type { RootStackParamList } from '@/navigation/types';
import { formatDAFull } from '@/utils/currency';
import { formatDateFr } from '@/utils/dates';
import { useApp } from '@/store/AppContext';
import { getInitials } from '@/utils/storeHelpers';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'StoreProfile'>;

function InfoRow({ label, value, color, last }: { label: string; value: string; color?: string; last?: boolean }) {
  return (
    <View style={[styles.infoRow, !last && styles.infoRowBorder]}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, { color: color || c.white }]}>{value}</Text>
    </View>
  );
}

export function StoreProfileScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const { refreshKey } = useApp();
  const [store, setStore] = useState<Store | null>(null);

  const load = useCallback(async () => {
    setStore(await getStoreById(route.params.storeId));
  }, [route.params.storeId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load, refreshKey])
  );

  if (!store) {
    return (
      <StatusBg>
        <TopBar title="…" onBack={() => navigation.goBack()} />
      </StatusBg>
    );
  }

  const isPositive = store.current_balance > 0;

  const openOp = (type: OperationType) => {
    navigation.navigate('NewOperation', { storeId: store.store_id, type });
  };

  const handlePhone = () => {
    if (store.phone) Linking.openURL(`tel:${store.phone}`);
  };

  const handleMessage = () => {
    if (store.phone) Linking.openURL(`sms:${store.phone}`);
  };

  const handleMap = () => {
    if (store.address) {
      Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(store.address)}`);
    } else if (store.neighborhood) {
      Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(store.neighborhood)}`);
    }
  };

  return (
    <StatusBg>
      <TopBar title={store.name} onBack={() => navigation.goBack()} rightIcon="none" />
      
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + 70, paddingBottom: insets.bottom + 110 }}
      >
        <Animated.View entering={FadeInUp.duration(400)} style={styles.headerArea}>
          <View style={styles.initialsBox}>
            <LinearGradient
              colors={['#2a2a2a', '#161616']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
            <Text style={styles.initialsText}>{getInitials(store.name)}</Text>
          </View>
          <GradientText style={styles.storeName} colors={['#ffffff', '#b8b8b8']}>
            {store.name}
          </GradientText>
          <View style={styles.subtitleRow}>
            <Text style={styles.subtitleText}>{store.neighborhood}</Text>
            <View style={styles.dotSeparator} />
            <Text style={styles.subtitleText}>{store.contact_person || 'Gérant inconnu'}</Text>
          </View>

          <View style={styles.quickActions}>
            <Pressable stretch={false} onPress={handlePhone} style={styles.quickActionBtn}>
              <LinearGradient colors={['#1d1d1d', '#161616']} style={StyleSheet.absoluteFillObject} />
              <Phone size={13} color={c.white} strokeWidth={2.2} />
              <Text style={styles.quickActionText}>Appeler</Text>
            </Pressable>
            <Pressable stretch={false} onPress={handleMessage} style={styles.quickActionBtn}>
              <LinearGradient colors={['#1d1d1d', '#161616']} style={StyleSheet.absoluteFillObject} />
              <MessageCircle size={13} color={c.white} strokeWidth={2.2} />
              <Text style={styles.quickActionText}>Message</Text>
            </Pressable>
            <Pressable stretch={false} onPress={handleMap} style={styles.quickActionBtn}>
              <LinearGradient colors={['#1d1d1d', '#161616']} style={StyleSheet.absoluteFillObject} />
              <MapPin size={13} color={c.white} strokeWidth={2.2} />
              <Text style={styles.quickActionText}>Itinéraire</Text>
            </Pressable>
          </View>
        </Animated.View>

        <View style={styles.heroWrapper}>
          <ElevatedCard
            glow={isPositive ? 'rgba(255,77,77,0.20)' : 'rgba(52,211,153,0.20)'}
            style={styles.heroCard}
          >
            <Eyebrow style={{ marginBottom: 12 }} dot={isPositive ? c.red : c.green}>
              {isPositive ? 'Doit au distributeur' : 'Compte soldé'}
            </Eyebrow>
            <View style={styles.amountRow}>
              <GradientText
                style={StyleSheet.flatten([styles.amountValue, !isPositive && { color: c.green }])}
                colors={isPositive ? ['#ffffff', '#b8b8b8'] : ['#34D399', '#1faa78']}
              >
                {store.current_balance}
              </GradientText>
              <Text style={styles.amountCurrency}>DA</Text>
            </View>
          </ElevatedCard>
        </View>

        <View style={styles.sectionHeader}>
          <Eyebrow>Informations</Eyebrow>
        </View>
        
        <View style={styles.infoBoxWrapper}>
          <View style={styles.infoBox}>
            <LinearGradient colors={['#1d1d1d', '#141414']} style={StyleSheet.absoluteFillObject} />
            <InfoRow label="Gérant" value={store.contact_person || '—'} />
            <InfoRow label="Téléphone" value={store.phone || '—'} />
            <InfoRow label="Quartier" value={store.neighborhood || '—'} />
            <InfoRow
              label="Dette actuelle"
              value={store.current_balance > 0 ? formatDAFull(store.current_balance) : '—'}
              color={store.current_balance > 0 ? c.red : c.green}
            />
            <InfoRow label="Total livré" value={formatDAFull(store.total_delivered)} />
            <InfoRow label="Total encaissé" value={formatDAFull(store.total_collected)} color={c.green} />
            <InfoRow label="Dernière livraison" value={formatDateFr(store.last_delivery_date) || '—'} />
            <InfoRow label="Dernier paiement" value={formatDateFr(store.last_payment_date) || '—'} last />
          </View>
        </View>

        <View style={styles.historyWrapper}>
          <Pressable onPress={() => navigation.navigate('StoreHistory', { storeId: store.store_id })} style={styles.historyBtn}>
            <LinearGradient colors={['#1d1d1d', '#141414']} style={StyleSheet.absoluteFillObject} />
            <Text style={styles.historyText}>Historique des opérations</Text>
            <ArrowUpRight size={14} color={c.lime} strokeWidth={2.5} />
          </Pressable>
        </View>
      </ScrollView>

      {/* Action Dock */}
      <View style={[styles.dockContainer, { paddingBottom: insets.bottom || 24, paddingTop: 32 }]}>
        <BlurView intensity={12} tint="dark" style={StyleSheet.absoluteFillObject} />
        <LinearGradient
          colors={['rgba(10,10,10,0)', 'rgba(10,10,10,0.85)', '#0A0A0A']}
          locations={[0, 0.35, 0.7]}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.dockInner}>
          <Pressable stretch={false} onPress={() => openOp('livraison')} style={styles.dockBtnPrimary}>
            <LinearGradient
              colors={['#9bff1f', c.lime, '#66c000']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
            <Car size={16} color={c.ink} strokeWidth={2.5} />
            <Text style={styles.dockPrimaryText}>Livraison</Text>
          </Pressable>

          <Pressable stretch={false} onPress={() => openOp('paiement')} style={styles.dockBtnSecondary}>
            <LinearGradient colors={['#1f1f1f', '#161616']} style={StyleSheet.absoluteFillObject} />
            <Banknote size={15} color={c.white} strokeWidth={2} />
            <Text style={styles.dockSecondaryText}>Paiement</Text>
          </Pressable>

          <Pressable stretch={false} onPress={() => openOp('retour')} style={styles.dockBtnSecondary}>
            <LinearGradient colors={['#1f1f1f', '#161616']} style={StyleSheet.absoluteFillObject} />
            <Undo2 size={15} color={c.white} strokeWidth={2} />
            <Text style={styles.dockSecondaryText}>Retour</Text>
          </Pressable>

          <Pressable stretch={false} onPress={() => openOp('avoir')} style={styles.dockBtnSecondary}>
            <LinearGradient colors={['#1f1f1f', '#161616']} style={StyleSheet.absoluteFillObject} />
            <Tag size={15} color={c.white} strokeWidth={2} />
            <Text style={styles.dockSecondaryText}>Avoir</Text>
          </Pressable>
        </View>
      </View>
    </StatusBg>
  );
}

const styles = StyleSheet.create({
  headerArea: {
    paddingHorizontal: 22,
    paddingBottom: 24,
  },
  initialsBox: {
    width: 60,
    height: 60,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: c.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 10,
  },
  initialsText: {
    fontSize: 19,
    fontFamily: 'Inter_700Bold',
    color: c.white,
  },
  storeName: {
    fontSize: 26,
    fontFamily: 'Inter_600SemiBold',
    color: c.white,
    letterSpacing: -1.2,
    marginBottom: 4,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 18,
  },
  subtitleText: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: c.white40,
  },
  dotSeparator: {
    width: 3,
    height: 3,
    borderRadius: 3,
    backgroundColor: c.white40,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 8,
  },
  quickActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: c.borderLight,
    overflow: 'hidden',
  },
  quickActionText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: c.white,
  },
  heroWrapper: {
    paddingHorizontal: 22,
    paddingBottom: 24,
  },
  heroCard: {
    padding: 22,
    borderRadius: 22,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  amountValue: {
    fontSize: 44,
    fontFamily: 'Inter_600SemiBold',
    color: c.red,
    letterSpacing: -2,
    lineHeight: 48,
  },
  amountCurrency: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: c.white40,
  },
  sectionHeader: {
    paddingHorizontal: 22,
    paddingBottom: 12,
  },
  infoBoxWrapper: {
    paddingHorizontal: 22,
    paddingBottom: 18,
  },
  infoBox: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: c.borderLight,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  infoRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: c.borderLight,
  },
  infoLabel: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: c.white40,
  },
  infoValue: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    letterSpacing: -0.2,
  },
  historyWrapper: {
    paddingHorizontal: 22,
  },
  historyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: c.borderLight,
    overflow: 'hidden',
  },
  historyText: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    color: c.white,
  },
  dockContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 30,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.02)',
  },
  dockInner: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
  },
  dockBtnPrimary: {
    flex: 1.4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 100,
    paddingVertical: 14,
    shadowColor: c.lime,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 28,
    elevation: 10,
    overflow: 'hidden',
  },
  dockPrimaryText: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    color: c.ink,
    letterSpacing: -0.2,
  },
  dockBtnSecondary: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: c.borderLight,
    paddingVertical: 10,
    overflow: 'hidden',
  },
  dockSecondaryText: {
    fontSize: 10,
    fontFamily: 'Inter_500Medium',
    color: c.white,
  },
});
