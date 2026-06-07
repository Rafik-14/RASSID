import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { Lock } from 'lucide-react-native';
import { StatusBg, Pressable } from '@/components/Chrome';
import { c } from '@/components/tokens';
import type { RootStackParamList } from '@/navigation/types';
import { useApp } from '@/store/AppContext';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';

type Route = RouteProp<RootStackParamList, 'AuthLock'>;

export function AuthLockScreen() {
  const route = useRoute<Route>();
  const navigation = useNavigation();
  const { syncNow } = useApp();

  const trySync = async () => {
    try {
      const msg = await syncNow();
      Toast.show({ type: 'success', text1: 'Synchronisation réussie', text2: msg });
      navigation.goBack();
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Échec de la synchronisation', text2: e.message || 'Erreur inconnue' });
    }
  };

  return (
    <StatusBg>
      <View style={styles.container}>
        <Text style={styles.logoText}>RASSID</Text>
        <MotiView
          from={{ scale: 0.9, opacity: 0.8 }}
          animate={{ scale: 1.1, opacity: 1 }}
          transition={{
            type: 'timing',
            duration: 1500,
            loop: true,
          }}
          style={styles.iconWrapper}
        >
          <View style={styles.iconGlow} />
          <View style={styles.iconBg}>
            <LinearGradient colors={['#2a2a2a', '#161616']} style={StyleSheet.absoluteFillObject} />
            <Lock size={32} color={c.red} strokeWidth={2.2} />
          </View>
        </MotiView>

        <Text style={styles.title}>Synchronisation requise</Text>
        <Text style={styles.body}>{route.params.reason}</Text>

        <Pressable stretch={false} onPress={trySync} style={styles.btn}>
          <LinearGradient
            colors={[c.red, '#ff4d4dcc']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
          <Text style={styles.btnText}>Synchroniser maintenant</Text>
        </Pressable>
      </View>
    </StatusBg>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  logoText: {
    fontSize: 28,
    fontFamily: 'Inter_600SemiBold',
    color: '#7FE300',
    letterSpacing: 4,
    marginBottom: 32,
  },
  iconWrapper: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  iconGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: c.red,
    borderRadius: 40,
    opacity: 0.2,
    transform: [{ scale: 1.5 }],
    filter: [{ blur: 20 } as any],
  },
  iconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: 'rgba(255,77,77,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  title: {
    fontSize: 22,
    fontFamily: 'Inter_600SemiBold',
    color: c.white,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  body: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: c.white40,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
  },
  btn: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: c.red,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  btnText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: c.white,
  },
});
