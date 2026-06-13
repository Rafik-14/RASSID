import React from 'react';
import { View, Text, StyleSheet, Modal, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { c } from './tokens';
import { Pressable } from './Chrome';

const { width: SCREEN_W } = Dimensions.get('window');

export interface DialogButton {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  color?: string;
  onPress?: () => void;
}

export interface DialogConfig {
  title: string;
  message?: string;
  accentColor?: string;
  buttons: DialogButton[];
}

interface AppDialogProps {
  visible: boolean;
  config: DialogConfig | null;
  onDismiss: () => void;
}

export function AppDialog({ visible, config, onDismiss }: AppDialogProps) {
  const scale = useSharedValue(0.93);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    if (visible) {
      scale.value = withTiming(1, {
        duration: 220,
        easing: Easing.bezier(0.16, 1, 0.3, 1),
      });
      opacity.value = withTiming(1, { duration: 180 });
    } else {
      scale.value = withTiming(0.93, { duration: 150 });
      opacity.value = withTiming(0, { duration: 150 });
    }
  }, [visible]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  if (!config) return null;

  const accent = config.accentColor || c.lime;
  const stackButtons = config.buttons.length > 2;

  const handlePress = (btn: DialogButton) => {
    onDismiss();
    // Small delay to let dismiss animation start
    if (btn.onPress) {
      setTimeout(btn.onPress, 120);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent>
      <View style={styles.overlay}>
        <Animated.View style={[StyleSheet.absoluteFillObject, overlayStyle]}>
          <BlurView intensity={45} tint="dark" style={StyleSheet.absoluteFillObject} />
          <View style={styles.overlayDim} />
        </Animated.View>

        {/* Tap outside to dismiss (acts as cancel) */}
        <Pressable
          stretch={true}
          onPress={() => {
            const cancelBtn = config.buttons.find((b) => b.style === 'cancel');
            handlePress(cancelBtn || { text: '', style: 'cancel' });
          }}
          style={StyleSheet.absoluteFillObject}
        >
          <View style={{ flex: 1 }} />
        </Pressable>

        <Animated.View style={[styles.cardContainer, cardStyle]}>
          <View style={styles.card}>
            <LinearGradient
              colors={['#1c1c1e', '#121214']}
              style={StyleSheet.absoluteFillObject}
            />

            {/* Glowing aura inside card background */}
            <View style={[styles.glow, { backgroundColor: accent }]} />

            {/* Top decorative drag handle */}
            <View style={styles.dragHandle} />

            {/* Content */}
            <View style={styles.content}>
              <Text style={styles.title}>{config.title}</Text>
              {config.message ? (
                <Text style={styles.message}>{config.message}</Text>
              ) : null}
            </View>

            {/* Buttons */}
            <View style={[styles.buttonsContainer, stackButtons && styles.buttonsContainerStacked]}>
              {config.buttons.map((btn, i) => {
                const isCancel = btn.style === 'cancel';
                const isDestructive = btn.style === 'destructive';

                const buttonStyle = stackButtons
                  ? [styles.stackedBtn, isCancel ? styles.stackedCancelBtn : styles.stackedActionBtn]
                  : [isCancel ? styles.cancelBtn : styles.actionBtn];

                if (isCancel) {
                  return (
                    <Pressable
                      key={i}
                      stretch={stackButtons}
                      onPress={() => handlePress(btn)}
                      style={buttonStyle}
                    >
                      <Text style={styles.cancelText}>{btn.text}</Text>
                    </Pressable>
                  );
                }

                const btnColor = btn.color || (isDestructive ? '#FF4D4D' : accent);
                const btnTextColor = isDestructive
                  ? '#ffffff'
                  : btnColor === c.lime || btnColor === c.amber || btnColor === c.green
                  ? c.ink
                  : '#ffffff';

                const gradientColors = (
                  isDestructive
                    ? ['#FF5E5E', '#CE2B2B']
                    : btnColor === c.lime
                    ? ['#A3FF33', '#5EAF00']
                    : btnColor === c.green
                    ? ['#34E8A1', '#059669']
                    : [btnColor, btnColor + 'cc']
                ) as [string, string];

                return (
                  <Pressable
                    key={i}
                    stretch={stackButtons}
                    onPress={() => handlePress(btn)}
                    style={buttonStyle}
                  >
                    <LinearGradient
                      colors={gradientColors}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 0, y: 1 }}
                      style={StyleSheet.absoluteFillObject}
                    />
                    <Text style={[styles.actionText, { color: btnTextColor }]}>
                      {btn.text}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  overlayDim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  cardContainer: {
    width: '100%',
    maxWidth: 320,
    zIndex: 10,
  },
  card: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.09)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.45,
    shadowRadius: 36,
    elevation: 24,
  },
  dragHandle: {
    width: 32,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignSelf: 'center',
    marginTop: 10,
  },
  glow: {
    position: 'absolute',
    top: -40,
    alignSelf: 'center',
    width: 140,
    height: 70,
    borderRadius: 70,
    opacity: 0.12,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 22,
    paddingBottom: 4,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: c.white,
    letterSpacing: -0.4,
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: 'rgba(255, 255, 255, 0.65)',
    lineHeight: 20,
    textAlign: 'center',
  },
  buttonsContainer: {
    flexDirection: 'row',
    padding: 16,
    paddingTop: 20,
    gap: 10,
  },
  buttonsContainerStacked: {
    flexDirection: 'column',
    gap: 8,
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 16,
  },
  cancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  cancelText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: c.white70,
  },
  actionBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  stackedBtn: {
    width: '100%',
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  stackedCancelBtn: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  stackedActionBtn: {
    // Gradient handles background
  },
  actionText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
});
