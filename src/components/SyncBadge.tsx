import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { RefreshCw } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { c } from './tokens';

interface SyncBadgeProps {
  pending: number;
  syncing: boolean;
  onSync: () => void;
}

export function SyncBadge({ pending, syncing, onSync }: SyncBadgeProps) {
  const hasPending = pending > 0;
  
  const rotation = useSharedValue(0);
  
  React.useEffect(() => {
    if (hasPending || syncing) {
      rotation.value = withRepeat(
        withTiming(360, { duration: 2400, easing: Easing.linear }),
        -1,
        false
      );
    } else {
      rotation.value = 0;
    }
  }, [hasPending, syncing]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View style={styles.container}>
      <Pressable 
        onPress={onSync} 
        disabled={syncing}
        style={({ pressed }) => [
          styles.badge,
          { backgroundColor: hasPending ? c.amberDim : c.white06, borderWidth: 1, borderColor: hasPending ? 'rgba(251,191,36,0.2)' : 'rgba(52,211,153,0.2)' },
          { opacity: pressed ? 0.7 : 1 }
        ]}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Animated.View style={[animatedStyle]}>
            {syncing ? (
              <ActivityIndicator size="small" color={hasPending ? c.amber : c.green} />
            ) : (
              <RefreshCw size={14} color={hasPending ? c.amber : c.green} strokeWidth={2.5} />
            )}
          </Animated.View>
          <Text style={[
            styles.label, 
            { color: hasPending ? c.amber : c.white40 }
          ]}>
            {hasPending ? `${pending} en attente` : 'Synchronisé'}
          </Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  label: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
  },
});
