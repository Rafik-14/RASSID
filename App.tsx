import 'react-native-get-random-values';
import 'react-native-gesture-handler';
import React, { useCallback, useEffect, useState } from 'react';
import Toast from 'react-native-toast-message';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { colors } from '@/config/theme';
import { AppProvider } from '@/store/AppContext';
import { RootNavigator } from '@/navigation/RootNavigator';
import {
  authenticateUser,
  isDeviceCompromised,
  isOfflineLocked,
} from '@/services/securityService';
import { getDatabase } from '@/database';
import { pushSyncQueue } from '@/services/syncService';
import { hasRepProfile, getRepProfile } from '@/services/repService';
import { applyRepProfile, hasSupabase } from '@/config/env';
import { ProfileSetupScreen } from '@/screens/ProfileSetupScreen';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { getSession } from '@/api/supabase';
import { LoginScreen } from '@/screens/LoginScreen';
import { registerBackgroundSync } from '@/services/backgroundSync';
import { initCrashReporting } from '@/services/crashReporting';

initCrashReporting();

SplashScreen.preventAutoHideAsync();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.bg,
    card: colors.bg2,
    border: colors.border,
    primary: colors.teal,
    text: colors.ink,
  },
};

export default function App() {
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [lockReason, setLockReason] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    async function init() {
      if (isDeviceCompromised()) {
        setLockReason('Appareil non sécurisé détecté.');
        setReady(true);
        return;
      }

      await getDatabase();

      // Load rep profile and apply it to env so all screens get the live values
      const profileExists = await hasRepProfile();
      if (!profileExists) {
        setShowProfileSetup(true);
        setReady(true);
        return;
      }
      const profile = await getRepProfile();
      if (profile) applyRepProfile(profile.name, profile.initials);

      if (hasSupabase) {
        const session = await getSession();
        if (!session) {
          setShowLogin(true);
          setReady(true);
          return;
        }
      }

      const locked = await isOfflineLocked();
      if (locked) {
        setLockReason(
          'Aucune synchronisation serveur depuis plus de 72 heures. Connectez-vous et synchronisez.'
        );
        setReady(true);
        return;
      }

      const ok = await authenticateUser();
      setAuthed(ok);
      setReady(true);
    }
    init();
  }, []);

  useEffect(() => {
    registerBackgroundSync();
  }, []);

  const onLayout = useCallback(async () => {
    if (fontsLoaded && ready) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, ready]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const result = await pushSyncQueue();
      if (result.success) {
        Toast.show({
          type: 'success',
          text1: 'Synchronisation réussie',
          text2: result.message,
        });
        const locked = await isOfflineLocked();
        if (!locked) {
          setLockReason(null);
          const ok = await authenticateUser();
          setAuthed(ok);
        }
      } else {
        Toast.show({
          type: 'error',
          text1: 'Échec de la synchronisation',
          text2: result.message,
        });
      }
    } catch (e: any) {
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: e.message || 'Erreur inconnue',
      });
    } finally {
      setSyncing(false);
    }
  };

  if (!fontsLoaded || !ready) {
    return (
      <View style={styles.splash}>
        <Text style={styles.logo}>RASSID</Text>
        <ActivityIndicator color={colors.teal} style={{ marginTop: 16 }} />
      </View>
    );
  }

  if (showProfileSetup) {
    return (
      <SafeAreaProvider onLayout={onLayout}>
        <ProfileSetupScreen
          onComplete={async () => {
            const profile = await getRepProfile();
            if (profile) applyRepProfile(profile.name, profile.initials);
            setShowProfileSetup(false);
            const locked = await isOfflineLocked();
            if (locked) {
              setLockReason(
                'Aucune synchronisation serveur depuis plus de 72 heures. Connectez-vous et synchronisez.'
              );
              return;
            }
            const ok = await authenticateUser();
            setAuthed(ok);
          }}
        />
        <StatusBar style="light" />
        <Toast />
      </SafeAreaProvider>
    );
  }

  if (showLogin) {
    return (
      <SafeAreaProvider onLayout={onLayout}>
        <LoginScreen
          onComplete={async () => {
            setShowLogin(false);
            const locked = await isOfflineLocked();
            if (locked) {
              setLockReason(
                'Aucune synchronisation serveur depuis plus de 72 heures. Connectez-vous et synchronisez.'
              );
              return;
            }
            const ok = await authenticateUser();
            setAuthed(ok);
          }}
        />
        <StatusBar style="light" />
        <Toast />
      </SafeAreaProvider>
    );
  }

  if (lockReason) {
    const isSyncLock = lockReason.includes('synchronisation');
    return (
      <SafeAreaProvider onLayout={onLayout}>
        <View style={styles.splash}>
          <Text style={styles.logo}>RASSID</Text>
          <Text style={styles.lock}>{lockReason}</Text>
          {isSyncLock && (
            <TouchableOpacity
              style={styles.syncButton}
              onPress={handleSync}
              disabled={syncing}
              activeOpacity={0.8}
            >
              {syncing ? (
                <ActivityIndicator color={colors.ink} size="small" />
              ) : (
                <Text style={styles.syncButtonText}>Synchroniser maintenant</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
        <StatusBar style="light" />
        <Toast />
      </SafeAreaProvider>
    );
  }

  if (!authed) {
    return (
      <SafeAreaProvider onLayout={onLayout}>
        <View style={styles.splash}>
          <Text style={styles.logo}>RASSID</Text>
          <Text style={styles.lock}>Authentification requise</Text>
          <TouchableOpacity
            style={styles.syncButton}
            onPress={async () => {
              const ok = await authenticateUser();
              setAuthed(ok);
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.syncButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
        <StatusBar style="light" />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider onLayout={onLayout}>
      <AppProvider>
        <NavigationContainer theme={navTheme}>
          <ErrorBoundary>
            <RootNavigator />
          </ErrorBoundary>
        </NavigationContainer>
      </AppProvider>
      <StatusBar style="light" />
      <Toast />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logo: {
    fontSize: 28,
    fontFamily: 'Inter_600SemiBold',
    color: '#7FE300',
    letterSpacing: 2,
  },
  lock: {
    marginTop: 16,
    fontSize: 13,
    color: 'rgba(240,240,240,0.40)',
    textAlign: 'center',
    fontFamily: 'Inter_400Regular',
    lineHeight: 20,
  },
  syncButton: {
    marginTop: 24,
    backgroundColor: colors.teal,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 200,
  },
  syncButtonText: {
    color: colors.ink,
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
});
