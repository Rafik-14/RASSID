import React, { ReactNode, useEffect } from 'react';
import { View, Text, Pressable as RNPressable, PressableProps, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, Easing, runOnJS, useAnimatedReaction } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import MaskedView from '@react-native-masked-view/masked-view';
import Svg, { Defs, RadialGradient, Stop, Circle, Filter, FeTurbulence, Rect } from 'react-native-svg';
import { c } from './tokens';

export function StatusBg({ children }: { children: ReactNode }) {
  return (
    <View style={styles.statusBg}>
      {children}
    </View>
  );
}

export function Eyebrow({ children, style, dot }: { children: ReactNode; style?: TextStyle; dot?: string }) {
  return (
    <View style={[styles.eyebrowContainer, style]}>
      {dot && (
        <View style={[styles.dot, { backgroundColor: dot, shadowColor: dot }]} />
      )}
      <Text style={[styles.eyebrowText, style]}>{children}</Text>
    </View>
  );
}

export function GradientText({ children, style, colors, start, end }: { children: ReactNode; style?: TextStyle; colors: string[]; start?: {x: number, y: number}; end?: {x: number, y: number} }) {
  return (
    <MaskedView maskElement={<Text style={[style, { backgroundColor: 'transparent' }]}>{children}</Text>}>
      <LinearGradient colors={colors as any} start={start} end={end}>
        <Text style={[style, { opacity: 0 }]}>{children}</Text>
      </LinearGradient>
    </MaskedView>
  );
}

const AnimatedPressable = Animated.createAnimatedComponent(RNPressable);

export function Pressable({
  children,
  onPress,
  style,
  stretch = true,
  onLayout,
}: {
  children: ReactNode;
  onPress?: () => void;
  style?: ViewStyle | any;
  stretch?: boolean;
  onLayout?: (e: any) => void;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <AnimatedPressable
      onLayout={onLayout}
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.96, { stiffness: 600, damping: 30 }); }}
      onPressOut={() => { scale.value = withSpring(1, { stiffness: 600, damping: 30 }); }}
      style={[{ width: stretch ? '100%' : 'auto' }, style, animatedStyle]}
    >
      {children}
    </AnimatedPressable>
  );
}

export function ElevatedCard({
  children,
  style,
  glow,
}: {
  children: ReactNode;
  style?: ViewStyle;
  glow?: string;
}) {
  return (
    <View style={styles.cardShadowContainer}>
      <View style={[styles.cardContainer, style]}>
        <LinearGradient
          colors={['#1d1d1d', '#141414']}
          style={StyleSheet.absoluteFillObject}
        />
        {glow && (
          <View style={[StyleSheet.absoluteFillObject, { overflow: 'hidden', borderRadius: 22 }]}>
            <View style={{ position: 'absolute', top: -50, right: -50, width: 180, height: 180, opacity: 0.35 }}>
              <Svg width="100%" height="100%">
                <Defs>
                  <RadialGradient id="cardGlow" cx="50%" cy="50%" rx="50%" ry="50%" fx="50%" fy="50%">
                    <Stop offset="0%" stopColor={glow} stopOpacity="1" />
                    <Stop offset="100%" stopColor={glow} stopOpacity="0" />
                  </RadialGradient>
                </Defs>
                <Circle cx="50%" cy="50%" r="50%" fill="url(#cardGlow)" />
              </Svg>
            </View>
          </View>
        )}
        <View style={styles.cardHighlight} />
        <View style={{ position: 'relative' }}>
          {children}
        </View>
      </View>
    </View>
  );
}

export function AnimatedNumber({
  value,
  duration = 800,
  style,
}: {
  value: number;
  duration?: number;
  style?: TextStyle;
}) {
  const displayValue = useSharedValue(0);
  const [text, setText] = React.useState('0');

  useEffect(() => {
    displayValue.value = withTiming(value, {
      duration,
      easing: Easing.bezier(0.32, 0.72, 0, 1),
    });
  }, [value, duration]);

  // Use useAnimatedReaction instead of addListener for Reanimated v3+
  useAnimatedReaction(
    () => displayValue.value,
    (currentValue) => {
      runOnJS(setText)(Math.round(currentValue).toLocaleString('fr-FR').replace(/,/g, ' '));
    },
    [displayValue]
  );

  return <Text style={style}>{text}</Text>;
}

const styles = StyleSheet.create({
  statusBg: {
    flex: 1,
    backgroundColor: c.bg,
  },
  eyebrowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 5,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  eyebrowText: {
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
    color: c.white40,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
  cardShadowContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 15,
  },
  cardContainer: {
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#141414',
  },
  cardHighlight: {
    ...StyleSheet.absoluteFillObject,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    borderRadius: 22,
  },
});
