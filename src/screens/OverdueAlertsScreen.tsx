import React, { useCallback, useState } from 'react';
import { View, ScrollView, Text, StyleSheet, Linking } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AlertTriangle, Phone, ChevronRight } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBg, Pressable, Eyebrow, AnimatedNumber } from '@/components/Chrome';
import { TopBar } from '@/components/TopBar';
import { c } from '@/components/tokens';
import { getAllStores } from '@/database/queries';
import type { Store } from '@/types';
import type { RootStackParamList } from '@/navigation/types';
import { useApp } from '@/store/AppContext';
import { getInitials } from '@/utils/storeHelpers';
import { formatDAFull } from '@/utils/currency';
import { isoNow } from '@/utils/dates';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp } from 'react-native-reanimated';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function OverdueAlertsScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { refreshKey } = useApp();
  
  const [alerts, setAlerts] = useState<(Store & { daysSincePayment: number })[]>([]);
  const [byDebt, setByDebt] = useState<Store[]>([]);
  const [totalAlertDebt, setTotalAlertDebt] = useState(0);

  const load = useCallback(async () => {
    const all = await getAllStores();
    
    // Compute byDebt
    const withDebt = all.filter(s => s.current_balance > 0).sort((a, b) => b.current_balance - a.current_balance);
    setByDebt(withDebt);
    
    // Compute alerts (10+ days overdue)
    const nowMs = new Date(isoNow()).getTime();
    const computedAlerts = withDebt.map(s => {
      let days = 999;
      if (s.last_payment_date) {
        const lastMs = new Date(s.last_payment_date).getTime();
        days = Math.floor((nowMs - lastMs) / (1000 * 3600 * 24));
      }
      return { ...s, daysSincePayment: days };
    }).filter(s => s.daysSincePayment >= 10).sort((a, b) => b.daysSincePayment - a.daysSincePayment);
    
    setAlerts(computedAlerts);
    setTotalAlertDebt(computedAlerts.reduce((sum, s) => sum + s.current_balance, 0));
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load, refreshKey])
  );

  return (
    <StatusBg>
      <TopBar title="Impayés" onBack={() => navigation.goBack()} rightIcon="none" />
      
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + 70, paddingBottom: insets.bottom + 24 }}
      >
        <Animated.View entering={FadeInUp.duration(400)} style={styles.bannerContainer}>
          <View style={styles.bannerInner}>
            <LinearGradient
              colors={['rgba(255,77,77,0.10)', 'rgba(255,77,77,0.04)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
            <View style={styles.bannerIconBox}>
              <AlertTriangle size={16} color={c.red} strokeWidth={2.4} />
            </View>
            <View style={styles.bannerContent}>
              <Text style={styles.bannerTitle}>
                {alerts.length} magasin{alerts.length > 1 ? 's' : ''} — plus de 10 jours sans paiement
              </Text>
              <View style={styles.bannerAmountRow}>
                <AnimatedNumber value={totalAlertDebt} duration={900} style={styles.bannerAmount} />
                <Text style={styles.bannerCurrency}>DA</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        <View style={styles.sectionHeader}>
          <Eyebrow dot={c.red}>Magasins en alerte</Eyebrow>
        </View>

        <View style={styles.alertsList}>
          {alerts.map((a, i) => {
            const severity = Math.min(1, a.daysSincePayment / 20);
            const color = severity > 0.8 ? c.red : c.amber;
            
            return (
              <Animated.View key={a.store_id} entering={FadeInUp.delay(0.05 * i * 1000 + 150).duration(350)}>
                <Pressable
                  stretch={false}
                  onPress={() => navigation.navigate('StoreProfile', { storeId: a.store_id })}
                  style={[styles.alertRow, i === alerts.length - 1 && { borderBottomWidth: 0 }]}
                >
                  <View style={styles.alertAvatarBox}>
                    <LinearGradient colors={['#2a2a2a', '#161616']} style={[StyleSheet.absoluteFillObject, { borderRadius: 14 }]} />
                    <Text style={styles.alertInitials}>{getInitials(a.name)}</Text>
                    <View style={[styles.alertDot, { backgroundColor: color, shadowColor: color }]} />
                  </View>
                  
                  <View style={styles.alertMid}>
                    <Text style={styles.alertName}>{a.name}</Text>
                    <Text style={[styles.alertDays, { color }]}>
                      Dernier paiement : il y a {a.daysSincePayment} jours
                    </Text>
                  </View>
                  
                  <Pressable
                    stretch={false}
                    onPress={() => a.phone && Linking.openURL(`tel:${a.phone}`)}
                    style={styles.phoneBtn}
                  >
                    <LinearGradient colors={['#1f1f1f', '#161616']} style={StyleSheet.absoluteFillObject} />
                    <Phone size={13} color={c.white} strokeWidth={2.2} />
                  </Pressable>
                </Pressable>
              </Animated.View>
            );
          })}
        </View>

        <View style={styles.sectionHeader}>
          <Eyebrow>Tous les magasins par dette</Eyebrow>
        </View>

        <View style={styles.byDebtList}>
          {byDebt.map((s, i) => (
            <Animated.View key={s.store_id} entering={FadeInUp.delay(0.04 * i * 1000 + 300).duration(300)}>
              <Pressable
                stretch={false}
                onPress={() => navigation.navigate('StoreProfile', { storeId: s.store_id })}
                style={[styles.debtRow, i === byDebt.length - 1 && { borderBottomWidth: 0 }]}
              >
                <View style={styles.debtAvatarBox}>
                  <LinearGradient colors={['#1f1f1f', '#161616']} style={StyleSheet.absoluteFillObject} />
                  <Text style={styles.debtInitials}>{getInitials(s.name)}</Text>
                </View>
                
                <View style={styles.debtMid}>
                  <Text style={styles.debtName}>{s.name}</Text>
                  <Text style={styles.debtArea}>{s.neighborhood || '—'}</Text>
                </View>
                
                <View style={styles.debtRight}>
                  <Text style={styles.debtAmount}>{formatDAFull(s.current_balance)}</Text>
                  <Text style={styles.debtCurrency}>DA</Text>
                  <ChevronRight size={13} color={c.white40} strokeWidth={2} />
                </View>
              </Pressable>
            </Animated.View>
          ))}
        </View>
      </ScrollView>
    </StatusBg>
  );
}

const styles = StyleSheet.create({
  bannerContainer: {
    paddingHorizontal: 22,
    paddingBottom: 22,
  },
  bannerInner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,77,77,0.20)',
    overflow: 'hidden',
  },
  bannerIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: c.redDim,
    borderWidth: 1,
    borderColor: 'rgba(255,77,77,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerContent: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: c.white,
    marginBottom: 4,
  },
  bannerAmountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  bannerAmount: {
    fontSize: 22,
    fontFamily: 'Inter_600SemiBold',
    color: c.red,
    letterSpacing: -0.8,
  },
  bannerCurrency: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    color: c.white40,
  },
  sectionHeader: {
    paddingHorizontal: 22,
    marginBottom: 12,
  },
  alertsList: {
    paddingHorizontal: 22,
    paddingBottom: 28,
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: c.borderLight,
  },
  alertAvatarBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: c.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertInitials: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    color: c.white,
  },
  alertDot: {
    position: 'absolute',
    bottom: -3,
    right: -3,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2.5,
    borderColor: c.bg,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 4,
  },
  alertMid: {
    flex: 1,
    minWidth: 0,
  },
  alertName: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: c.white,
    marginBottom: 3,
    letterSpacing: -0.2,
  },
  alertDays: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
  },
  phoneBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: c.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  byDebtList: {
    paddingHorizontal: 22,
  },
  debtRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: c.borderLight,
  },
  debtAvatarBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: c.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  debtInitials: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    color: c.white,
  },
  debtMid: {
    flex: 1,
    minWidth: 0,
  },
  debtName: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    color: c.white,
    marginBottom: 2,
  },
  debtArea: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: c.white40,
  },
  debtRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  debtAmount: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: c.white,
    letterSpacing: -0.3,
  },
  debtCurrency: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
    color: c.white40,
  },
});
