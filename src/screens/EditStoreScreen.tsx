import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  TextInput,
  Text,
  StyleSheet,
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect, RouteProp } from '@react-navigation/native';
import { Check } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBg, Pressable, Eyebrow } from '@/components/Chrome';
import { TopBar } from '@/components/TopBar';
import { c } from '@/components/tokens';
import { getStoreById, updateStore } from '@/database/queries';
import { useApp } from '@/store/AppContext';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import Toast from 'react-native-toast-message';
import type { RootStackParamList } from '@/navigation/types';

const FIELDS: { key: string; label: string; required?: boolean; placeholder?: string; keyboardType?: any; maxLength?: number }[] = [
  { key: 'name', label: 'Nom du magasin', required: true, placeholder: 'Ex. Épicerie Ben Ali', maxLength: 100 },
  { key: 'neighborhood', label: 'Quartier', placeholder: 'Ex. El Biar', maxLength: 80 },
  { key: 'contact_person', label: 'Gérant', placeholder: 'Ex. Karim Ben Ali', maxLength: 80 },
  { key: 'phone', label: 'Téléphone', placeholder: '0555 12 34 56', keyboardType: 'phone-pad', maxLength: 20 },
  { key: 'address', label: 'Adresse', placeholder: 'Rue, ville', maxLength: 200 },
];

export function EditStoreScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, 'EditStore'>>();
  const insets = useSafeAreaInsets();
  const { refresh } = useApp();
  
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const store = await getStoreById(route.params.storeId);
      if (store) {
        setValues({
          name: store.name || '',
          neighborhood: store.neighborhood || '',
          contact_person: store.contact_person || '',
          phone: store.phone || '',
          address: store.address || '',
        });
      }
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Erreur', text2: 'Impossible de charger le magasin' });
    } finally {
      setLoading(false);
    }
  }, [route.params.storeId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const save = async () => {
    if (!values.name || !values.name.trim()) {
      Toast.show({ type: 'error', text1: 'Erreur', text2: 'Le nom du magasin est requis' });
      return;
    }
    
    try {
      await updateStore(route.params.storeId, {
        name: values.name.trim(),
        neighborhood: values.neighborhood?.trim() || '',
        contact_person: values.contact_person?.trim() || '',
        phone: values.phone?.trim() || '',
        address: values.address?.trim() || '',
      });
      
      await refresh();
      Toast.show({ type: 'success', text1: 'Magasin modifié', text2: values.name.trim() });
      navigation.goBack();
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Erreur', text2: "Impossible de modifier le magasin" });
    }
  };

  if (loading) {
    return (
      <StatusBg>
        <TopBar title="Chargement..." onBack={() => navigation.goBack()} rightIcon="none" />
      </StatusBg>
    );
  }

  return (
    <StatusBg>
      <TopBar title="Modifier le magasin" onBack={() => navigation.goBack()} rightIcon="none" />
      
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + 70, paddingBottom: insets.bottom + 110 }}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View entering={FadeInUp.duration(400)} style={styles.formContainer}>
          <Eyebrow style={{ marginBottom: 14 }}>Informations du magasin</Eyebrow>

          <View style={styles.fieldsWrapper}>
            <LinearGradient colors={['#1d1d1d', '#141414']} style={StyleSheet.absoluteFillObject} />
            
            {FIELDS.map((f, i) => (
              <View
                key={f.key}
                style={[
                  styles.fieldRow,
                  i === FIELDS.length - 1 && { borderBottomWidth: 0 }
                ]}
              >
                <View style={styles.labelRow}>
                  <Text style={styles.labelText}>{f.label}</Text>
                  {f.required && <Text style={styles.requiredStar}>*</Text>}
                </View>
                <TextInput
                  value={values[f.key] || ''}
                  onChangeText={(text) => setValues({ ...values, [f.key]: text })}
                  placeholder={f.placeholder}
                  placeholderTextColor={c.white40}
                  keyboardType={f.keyboardType || 'default'}
                  maxLength={f.maxLength}
                  style={styles.input}
                />
              </View>
            ))}
          </View>
        </Animated.View>
      </ScrollView>

      {/* Action Dock */}
      <View style={[styles.dockContainer, { paddingBottom: insets.bottom || 24, paddingTop: 32 }]} pointerEvents="box-none">
        <BlurView intensity={20} tint="dark" style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(10,10,10,0.6)' }]} pointerEvents="none" />
        <LinearGradient
          colors={['rgba(10,10,10,0)', 'rgba(10,10,10,0.85)', '#0A0A0A']}
          locations={[0, 0.35, 0.7]}
          style={StyleSheet.absoluteFillObject}
          pointerEvents="none"
        />
        <View style={styles.dockInner}>
          <Pressable stretch={false} onPress={save} style={styles.dockBtnPrimary}>
            <LinearGradient
              colors={['#9bff1f', c.lime, '#66c000']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFillObject}
              pointerEvents="none"
            />
            <Check size={16} color={c.ink} strokeWidth={3} />
            <Text style={styles.dockPrimaryText}>Mettre à jour</Text>
          </Pressable>
        </View>
      </View>
    </StatusBg>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    paddingHorizontal: 22,
    paddingBottom: 18,
  },
  fieldsWrapper: {
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
  fieldRow: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: c.borderLight,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  labelText: {
    fontSize: 9.5,
    fontFamily: 'Inter_600SemiBold',
    color: c.white40,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  requiredStar: {
    color: c.red,
    marginLeft: 4,
    fontSize: 10,
  },
  input: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: c.white,
    padding: 0,
    letterSpacing: -0.2,
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
    paddingHorizontal: 16,
  },
  dockBtnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 16,
    paddingVertical: 14,
    overflow: 'hidden',
    shadowColor: c.lime,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 28,
    elevation: 10,
  },
  dockPrimaryText: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    color: c.ink,
    letterSpacing: -0.2,
  },
});
