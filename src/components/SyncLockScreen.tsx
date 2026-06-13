import React, { useCallback, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import Toast from 'react-native-toast-message';
import { colors } from '@/config/theme';
import { useDialog } from '@/components/DialogProvider';
import { c } from '@/components/tokens';
import { pushSyncQueue } from '@/services/syncService';
import { authenticateUser, isOfflineLocked } from '@/services/securityService';

interface SyncLockScreenProps {
  lockReason: string;
  onUnlocked: () => void;
}

export function SyncLockScreen({ lockReason, onUnlocked }: SyncLockScreenProps) {
  const { showDialog } = useDialog();
  const [syncing, setSyncing] = useState(false);
  const isSyncLock = lockReason.includes('synchronisation');

  const runSync = useCallback(async () => {
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
          const ok = await authenticateUser();
          if (ok) onUnlocked();
        }
      } else {
        showDialog({
          title: 'Échec de la synchronisation',
          message: result.message,
          accentColor: c.amber,
          buttons: [
            { text: 'Annuler', style: 'cancel' },
            { text: 'Réessayer', onPress: runSync },
          ],
        });
      }
    } catch (e: any) {
      showDialog({
        title: 'Erreur de synchronisation',
        message: e.message || 'Erreur inconnue',
        accentColor: c.amber,
        buttons: [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Réessayer', onPress: runSync },
        ],
      });
    } finally {
      setSyncing(false);
    }
  }, [onUnlocked, showDialog]);

  return (
    <View style={styles.splash}>
      <Text style={styles.logo}>RASSID</Text>
      <Text style={styles.lock}>{lockReason}</Text>
      {isSyncLock && (
        <TouchableOpacity
          style={styles.syncButton}
          onPress={runSync}
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
