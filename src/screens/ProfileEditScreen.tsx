import React, { useEffect, useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Check } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBg, Pressable } from '@/components/Chrome';
import { TopBar } from '@/components/TopBar';
import { c } from '@/components/tokens';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import Toast from 'react-native-toast-message';
import { getRepProfile, saveRepProfile } from '@/services/repService';
import { applyRepProfile } from '@/config/env';
import { validateAlgerianPhone } from '@/utils/validation';
import { signOut } from '@/api/supabase';
import { useDialog } from '@/components/DialogProvider';
import { useApp } from '@/store/AppContext';

import { computeInitials } from '@/utils/text';

export function ProfileEditScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { showDestructive } = useDialog();
  const { logout } = useApp();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const initials = name.trim().length > 0 ? computeInitials(name) : '?';

  useEffect(() => {
    getRepProfile().then((p) => {
      if (p) {
        setName(p.name);
        setPhone(p.phone || '');
      }
    });
  }, []);

  const handleSave = async () => {
    const phoneErr = validateAlgerianPhone(phone);
    if (phoneErr) {
      setPhoneError(phoneErr);
      return;
    }
    setPhoneError(null);
    if (!name.trim()) {
      Toast.show({ type: 'error', text1: 'Nom requis' });
      return;
    }
    setSaving(true);
    try {
      const saved = await saveRepProfile({ name, phone });
      applyRepProfile(saved.name, saved.initials);
      Toast.show({ type: 'success', text1: 'Profil mis à jour' });
      navigation.goBack();
    } catch {
      Toast.show({ type: 'error', text1: 'Erreur', text2: 'Impossible de sauvegarder.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <StatusBg>
      <TopBar title="Profil" onBack={() => navigation.goBack()} rightIcon="none" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View
          style={[
            styles.container,
            { paddingTop: (insets.top || 48) + 72, paddingBottom: (insets.bottom || 24) + 100 },
          ]}
        >
          {/* Live avatar */}
          <Animated.View entering={FadeIn.duration(500)} style={styles.avatarWrapper}>
            <View style={styles.avatar}>
              <LinearGradient
                colors={['#9bff1f', c.lime, '#5fc000']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFillObject}
              />
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          </Animated.View>

          {/* Fields */}
          <Animated.View entering={FadeInUp.duration(450).delay(100)} style={styles.card}>
            <LinearGradient
              colors={['#1d1d1d', '#141414']}
              style={StyleSheet.absoluteFillObject}
            />

            {/* Name */}
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>NOM COMPLET *</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Amine Messaoud"
                placeholderTextColor={c.white40}
                autoCapitalize="words"
                returnKeyType="next"
                style={styles.fieldInput}
                maxLength={80}
              />
            </View>

            <View style={styles.divider} />

            {/* Phone */}
            <View style={[styles.fieldRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.fieldLabel}>TÉLÉPHONE</Text>
              <TextInput
                value={phone}
                onChangeText={(t) => { setPhone(t); setPhoneError(null); }}
                placeholder="0555 12 34 56"
                placeholderTextColor={c.white40}
                keyboardType="phone-pad"
                returnKeyType="done"
                onSubmitEditing={handleSave}
                style={styles.fieldInput}
              />
            </View>
            {phoneError && <Text style={{ fontSize: 11, fontFamily: 'Inter_400Regular', color: '#FF4D4D', marginTop: 4, paddingHorizontal: 18 }}>{phoneError}</Text>}
          </Animated.View>

          <Animated.View entering={FadeInUp.duration(450).delay(200)} style={{ width: '100%', marginTop: 24 }}>
            <Pressable
              onPress={() => {
                showDestructive({
                  title: 'Se déconnecter',
                  message: 'Vos données locales seront conservées. Vous devrez vous reconnecter pour synchroniser.',
                  confirmText: 'Déconnexion',
                  onConfirm: async () => {
                    try {
                      await signOut();
                      logout();
                      Toast.show({ type: 'success', text1: 'Déconnecté' });
                    } catch (e) {
                      Toast.show({ type: 'error', text1: 'Erreur', text2: 'Impossible de se déconnecter.' });
                    }
                  },
                });
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                paddingVertical: 14,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: 'rgba(255,77,77,0.2)',
                backgroundColor: 'rgba(255,77,77,0.06)',
              }}
            >
              <Text style={{ fontSize: 14, fontFamily: 'Inter_600SemiBold', color: '#FF4D4D' }}>Se déconnecter</Text>
            </Pressable>
          </Animated.View>
        </View>

        {/* Action Dock */}
        <Animated.View
          entering={FadeInUp.duration(450).delay(180)}
          style={[styles.dock, { paddingBottom: (insets.bottom || 24) + 12 }]}
        >
          <BlurView
            intensity={24}
            tint="dark"
            style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(10,10,10,0.75)' }]}
          />
          <Pressable
            stretch={false}
            onPress={handleSave}
            style={[styles.btn, saving && { opacity: 0.7 }]}
          >
            <LinearGradient
              colors={['#9bff1f', c.lime, '#66c000']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
            <Check size={17} color={c.ink} strokeWidth={3} />
            <Text style={styles.btnText}>
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </Text>
          </Pressable>
        </Animated.View>
      </KeyboardAvoidingView>
    </StatusBg>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  avatarWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  avatarGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: c.lime,
    opacity: 0.18,
    shadowColor: c.lime,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 32,
    elevation: 0,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: c.lime,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 8,
  },
  avatarText: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    color: c.ink,
    letterSpacing: -1,
  },
  card: {
    width: '100%',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: c.borderLight,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 10,
  },
  fieldRow: {
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  fieldLabel: {
    fontSize: 9,
    fontFamily: 'Inter_600SemiBold',
    color: c.white40,
    letterSpacing: 1.8,
    marginBottom: 8,
  },
  fieldInput: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: c.white,
    padding: 0,
    letterSpacing: -0.3,
  },
  divider: {
    height: 1,
    backgroundColor: c.borderLight,
    marginHorizontal: 18,
  },
  dock: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 20,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.03)',
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 16,
    paddingVertical: 15,
    overflow: 'hidden',
    shadowColor: c.lime,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.45,
    shadowRadius: 28,
    elevation: 10,
  },
  btnText: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    color: c.ink,
    letterSpacing: -0.2,
  },
});
