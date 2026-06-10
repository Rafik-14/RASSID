import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { c } from './tokens';
import { AnimatedNumber, ElevatedCard } from './Chrome';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing, withDelay } from 'react-native-reanimated';

interface ChartCardProps {
  title: string;
  trend: number;
  amount: number;
  subtitle: string;
  data: number[];
  color: string;
}

import { LinearGradient } from 'expo-linear-gradient';
import { Truck, Banknote } from 'lucide-react-native';

function MiniBar({ value, max, color, index, isLast }: { value: number; max: number; color: string; index: number; isLast: boolean }) {
  const heightVal = useSharedValue(0);

  React.useEffect(() => {
    // stagger animation
    heightVal.value = withDelay(
      index * 50 + 200,
      withTiming((value / max) * 100, {
        duration: 600,
        easing: Easing.bezier(0.32, 0.72, 0, 1),
      })
    );
  }, [value, max]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      height: `${heightVal.value}%`,
    };
  });

  return (
    <Animated.View style={[styles.bar, animatedStyle]}>
      <LinearGradient
        colors={isLast ? [color, color + 'aa'] : [color + '66', color + '22']}
        style={{ flex: 1, borderRadius: 3 }}
      />
      {isLast && (
        <View style={[StyleSheet.absoluteFillObject, { 
          shadowColor: color, shadowOpacity: 0.5, shadowRadius: 8, elevation: 4, shadowOffset: { width: 0, height: 0 } 
        }]} />
      )}
    </Animated.View>
  );
}

export function ChartCard({ title, trend, amount, subtitle, data, color }: ChartCardProps) {
  const max = Math.max(...data, 1);
  const trendText = trend > 0 ? `+${trend}%` : `${trend}%`;
  const trendBg = trend > 0 ? c.greenDim : c.redDim;
  const trendColor = trend > 0 ? c.green : c.red;

  return (
    <ElevatedCard style={styles.card}>
      {/* Period pills could go here if interactive, skipping for now per simplified spec implementation */}
      
      <View style={styles.headerRow}>
        <View style={styles.titleContainer}>
          {title === 'LIVRAISONS' ? (
            <Truck size={11} color={color} strokeWidth={2.4} />
          ) : (
            <Banknote size={11} color={color} strokeWidth={2.4} />
          )}
          <Text style={styles.titleText}>{title}</Text>
        </View>
      </View>

      <Text style={styles.subtitle}>{subtitle}</Text>

      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
        <AnimatedNumber value={amount} style={styles.amountText} />
        <Text style={styles.currencyText}>DA</Text>
      </View>

      <View style={styles.chartContainer}>
        {data.map((val, i) => (
          <MiniBar key={i} value={val} max={max} color={color} index={i} isLast={i === data.length - 1} />
        ))}
      </View>
    </ElevatedCard>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
    flex: 1,
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    flexShrink: 1,
    paddingRight: 4,
  },
  titleText: {
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
    color: c.white40,
    letterSpacing: 1.5,
    flexShrink: 1,
  },
  trendBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 100,
  },
  trendText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
  },
  amountText: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: c.white,
    letterSpacing: -0.5,
    fontVariant: ['tabular-nums'],
  },
  currencyText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: c.white40,
  },
  subtitle: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
    color: c.white40,
    marginBottom: 6,
    flexShrink: 1,
    lineHeight: 14,
  },
  chartContainer: {
    height: 38,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
    marginTop: 10,
  },
  bar: {
    flex: 1,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
});
