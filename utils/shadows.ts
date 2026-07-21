import { Platform, ViewStyle } from 'react-native';

/**
 * Cross-platform shadow utility.
 * - Web: uses boxShadow CSS string
 * - iOS: uses shadowColor/shadowOffset/shadowOpacity/shadowRadius
 * - Android: uses elevation
 *
 * Usage: ...shadow(2, 8, 0.05) or ...shadow(4, 16, 0.05, '#6366f1')
 */
export function shadow(
  elevation: number,
  radius: number,
  opacity: number,
  color: string = '#000'
): ViewStyle {
  if (Platform.OS === 'web') {
    return {
      // @ts-ignore - boxShadow is valid on web via react-native-web
      boxShadow: `0px ${elevation}px ${radius}px rgba(${hexToRgb(color)}, ${opacity})`,
    };
  }

  if (Platform.OS === 'ios') {
    return {
      shadowColor: color,
      shadowOffset: { width: 0, height: elevation },
      shadowOpacity: opacity,
      shadowRadius: radius,
    };
  }

  // Android
  return {
    elevation: Math.ceil(elevation),
  };
}

/**
 * Predefined shadow presets for consistent styling.
 */
export const shadows = {
  /** Subtle card shadow — elevation: 1 */
  sm: () => shadow(1, 4, 0.03),
  /** Medium shadow — elevation: 2 */
  md: () => shadow(2, 8, 0.05),
  /** Large card shadow — elevation: 4 */
  lg: () => shadow(4, 16, 0.05),
  /** Primary button shadow */
  primary: (color: string = '#6366f1') => shadow(4, 8, 0.25, color),
  /** Strong shadow (modals, overlays) */
  xl: () => shadow(10, 20, 0.25),
} as const;

function hexToRgb(hex: string): string {
  if (hex.startsWith('rgba') || hex.startsWith('rgb')) {
    // Already rgb format, extract numbers
    const match = hex.match(/[\d.]+/g);
    if (match && match.length >= 3) return `${match[0]}, ${match[1]}, ${match[2]}`;
  }
  const cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0] + cleanHex[0], 16);
    const g = parseInt(cleanHex[1] + cleanHex[1], 16);
    const b = parseInt(cleanHex[2] + cleanHex[2], 16);
    return `${r}, ${g}, ${b}`;
  }
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}
