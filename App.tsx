import 'react-native-get-random-values';
import 'react-native-gesture-handler';
import React, { useCallback, useEffect, useState } from 'react';
import Toast from 'react-native-toast-message';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity, Platform, UIManager } from 'react-native';
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
import { hasRepProfile, getRepProfile } from '@/services/repService';
import { applyRepProfile, hasSupabase } from '@/config/env';
import { ProfileSetupScreen } from '@/screens/ProfileSetupScreen';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { getSession } from '@/api/supabase';
import { LoginScreen } from '@/screens/LoginScreen';
import { registerBackgroundSync } from '@/services/backgroundSync';
import { initCrashReporting } from '@/services/crashReporting';
import { DialogProvider } from '@/components/DialogProvider';
import { NetworkBanner } from '@/components/NetworkBanner';
import { SyncLockScreen } from '@/components/SyncLockScreen';

initCrashReporting();

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

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
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const handleLogout = useCallback(() => {
    setAuthed(false);
    setShowLogin(true);
  }, []);

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

  const renderShell = (
    content: React.ReactNode,
    options: { showNetwork?: boolean } = {}
  ) => (
    <DialogProvider>
      <SafeAreaProvider onLayout={onLayout}>
        {content}
        {options.showNetwork && <NetworkBanner />}
        <StatusBar style="light" />
        <Toast />
      </SafeAreaProvider>
    </DialogProvider>
  );

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
    return renderShell(
      isSyncLock ? (
        <SyncLockScreen
          lockReason={lockReason}
          onUnlocked={() => {
            setLockReason(null);
            setAuthed(true);
          }}
        />
      ) : (
        <View style={styles.splash}>
          <Text style={styles.logo}>RASSID</Text>
          <Text style={styles.lock}>{lockReason}</Text>
        </View>
      )
    );
  }

  if (!authed) {
    return renderShell(
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
    );
  }

  return renderShell(
    <AppProvider onLogout={handleLogout}>
      <NavigationContainer theme={navTheme}>
        <ErrorBoundary>
          <RootNavigator />
        </ErrorBoundary>
      </NavigationContainer>
    </AppProvider>,
    { showNetwork: true }
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
