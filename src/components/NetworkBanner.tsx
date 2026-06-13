import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as Network from 'expo-network';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { c } from './tokens';
import { WifiOff } from 'lucide-react-native';

export function NetworkBanner() {
  const insets = useSafeAreaInsets();
  const [isOffline, setIsOffline] = React.useState(false);
  const translateY = useSharedValue(-15);
  const opacity = useSharedValue(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const check = async () => {
      try {
        const state = await Network.getNetworkStateAsync();
        setIsOffline(!state.isConnected || !state.isInternetReachable);
      } catch {
        // Ignore — assume online if we can't check
      }
    };

    check();
    intervalRef.current = setInterval(check, 10000); // Check every 10s
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (isOffline) {
      translateY.value = withTiming(0, { duration: 250, easing: Easing.out(Easing.quad) });
      opacity.value = withTiming(1, { duration: 200 });
    } else {
      translateY.value = withTiming(-15, { duration: 200 });
      opacity.value = withTiming(0, { duration: 150 });
    }
  }, [isOffline]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[styles.container, { top: insets.top + 12 }, animatedStyle]}
      pointerEvents="none"
    >
      <View style={styles.inner}>
        <WifiOff size={12} color={c.red} strokeWidth={2.5} />
        <Text style={styles.text}>Hors ligne</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignSelf: 'center',
    zIndex: 999,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 77, 77, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 77, 0.25)',
    borderRadius: 100,
    paddingVertical: 5,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  text: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    color: c.red,
    letterSpacing: -0.2,
  },
});
