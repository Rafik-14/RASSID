/** RASSID design tokens — dark theme palette (matching tokens.ts) */
import { c } from '@/components/tokens';

export const colors = {
  bg: c.bg,
  bg2: c.bg2,
  bg3: c.bg3,
  border: c.border,

  /** Brand anchor — CTA, headers, active states */
  teal: c.lime,
  /** Pressed / deep lime */
  teal2: '#66c000',
  /** Lime tint background */
  tealBg: c.limeDim,
  /** Secondary accent */
  tealMid: c.lime,

  ink: c.ink,
  gray: c.white40,
  gray2: c.white70,

  red: c.red,
  alertBg: c.redDim,
  alertText: c.red,

  amber: c.amber,

  /** Payments received / credit badges */
  green: c.green,
  greenBg: c.greenDim,
} as const;

/** Text/icons rendered on a lime primary surface */
export const onPrimary = c.ink;

/** Muted chart bar fills */
export const chartMuted = {
  delivery: 'rgba(127,227,0,0.25)',
  payment: 'rgba(52,211,153,0.25)',
} as const;

export const radii = {
  device: 32,
  frame: 24,
  card: 22,
  button: 16,
  pill: 100,
} as const;

export const fonts = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;
