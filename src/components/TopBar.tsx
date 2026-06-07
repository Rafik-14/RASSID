import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Bell } from 'lucide-react-native';
import { c } from './tokens';
import { Pressable } from './Chrome';
import { env } from '@/config/env';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

interface TopBarProps {
  title?: string;
  onBack?: () => void;
  onRightPress?: () => void;
  onAvatarPress?: () => void;
  showAvatar?: boolean;
  rightIcon?: 'bell' | 'none';
  hasAlerts?: boolean;
}

export function TopBar({
  title,
  onBack,
  onRightPress,
  onAvatarPress,
  showAvatar = false,
  rightIcon = 'none',
  hasAlerts = false,
}: TopBarProps) {
  const insets = useSafeAreaInsets();
  
  // A simple pulse animation for the notification dot if hasAlerts
  const badgeScale = useSharedValue(1);
  React.useEffect(() => {
    if (hasAlerts) {
      badgeScale.value = withRepeat(
        withTiming(1.4, { duration: 800 }),
        -1,
        true
      );
    } else {
      badgeScale.value = 1;
    }
  }, [hasAlerts]);

  const badgeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: badgeScale.value }],
  }));

  return (
    <View style={[styles.container, { paddingTop: (insets.top || 48) + 12 }]}>
      <View style={styles.left}>
        {onBack && (
          <Pressable stretch={false} onPress={onBack} style={styles.iconBtn}>
            <LinearGradient colors={['#1f1f1f', '#161616']} style={[StyleSheet.absoluteFillObject, { borderRadius: 22 }]} />
            <ArrowLeft size={20} color={c.white} strokeWidth={2.5} />
          </Pressable>
        )}
        {showAvatar && (
          <Pressable stretch={false} onPress={onAvatarPress} style={styles.avatar}>
            <LinearGradient
              colors={[c.lime, '#5fc000']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[StyleSheet.absoluteFillObject, { borderRadius: 22 }]}
            />
          <Text style={styles.avatarText}>{env.repInitials}</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.center}>
        {title ? <Text style={styles.title}>{title}</Text> : null}
      </View>

      <View style={styles.right}>
        {rightIcon === 'bell' && (
          <Pressable stretch={false} onPress={onRightPress} style={styles.iconBtn}>
            <LinearGradient colors={['#1f1f1f', '#161616']} style={[StyleSheet.absoluteFillObject, { borderRadius: 22 }]} />
            <Bell size={18} color={c.white} strokeWidth={2} />
            {hasAlerts && (
              <Animated.View style={[styles.badge, badgeAnimatedStyle]} />
            )}
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingBottom: 8,
    zIndex: 30,
  },
  left: {
    flex: 1,
    alignItems: 'flex-start',
  },
  center: {
    flex: 2,
    alignItems: 'center',
  },
  right: {
    flex: 1,
    alignItems: 'flex-end',
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: c.borderLight,
    backgroundColor: '#161616', // Fallback for inner gradient
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: c.lime, // Fallback
    shadowColor: c.lime,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 5,
  },
  avatarText: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    color: c.ink,
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: c.red,
    shadowColor: c.red,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: c.white,
  },
});
