import React from 'react';
import { Image, StyleSheet, Platform, Text } from 'react-native';

/**
 * Cross-platform flag icons using inline SVG data URIs.
 * Emoji flags fail on many web environments (Replit iframe, Windows browsers),
 * so we use actual SVG flag images encoded as data URIs.
 */

// Simplified flag SVGs as data URIs - works on all platforms
const FLAG_SVGS: Record<string, string> = {
  // Great Britain (English)
  gb: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 30'%3E%3CclipPath id='a'%3E%3Cpath d='M0 0v30h60V0z'/%3E%3C/clipPath%3E%3CclipPath id='b'%3E%3Cpath d='M30 15h30v15zv15H0zH0V0zV0h30z'/%3E%3C/clipPath%3E%3Cg clip-path='url(%23a)'%3E%3Cpath d='M0 0v30h60V0z' fill='%23012169'/%3E%3Cpath d='M0 0l60 30m0-30L0 30' stroke='%23fff' stroke-width='6'/%3E%3Cpath d='M0 0l60 30m0-30L0 30' clip-path='url(%23b)' stroke='%23C8102E' stroke-width='4'/%3E%3Cpath d='M30 0v30M0 15h60' stroke='%23fff' stroke-width='10'/%3E%3Cpath d='M30 0v30M0 15h60' stroke='%23C8102E' stroke-width='6'/%3E%3C/g%3E%3C/svg%3E`,

  // Angola (Portuguese)
  ao: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 40'%3E%3Crect width='60' height='20' fill='%23CC092F'/%3E%3Crect y='20' width='60' height='20' fill='%23000'/%3E%3Cg transform='translate(30,20)' fill='%23FFCB00'%3E%3Ccircle r='6' fill='none' stroke='%23FFCB00' stroke-width='1.5'/%3E%3Cpath d='M-2,-1 L0,-6 L2,-1 Z'/%3E%3Cpath d='M-7,2 Q0,-2 7,2' fill='none' stroke='%23FFCB00' stroke-width='1.5'/%3E%3Cpath d='M-4,0 L-6,5 M4,0 L6,5' stroke='%23FFCB00' stroke-width='1'/%3E%3C/g%3E%3C/svg%3E`,

  // France (French)
  fr: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 40'%3E%3Crect width='20' height='40' fill='%23002395'/%3E%3Crect x='20' width='20' height='40' fill='%23fff'/%3E%3Crect x='40' width='20' height='40' fill='%23ED2939'/%3E%3C/svg%3E`,

  // South Africa (Afrikaans)
  za: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 40'%3E%3Crect width='60' height='40' fill='%23fff'/%3E%3Crect y='0' width='60' height='16' fill='%23DE3831'/%3E%3Crect y='24' width='60' height='16' fill='%23002395'/%3E%3Crect y='14' width='60' height='12' fill='%23fff'/%3E%3Crect y='15.5' width='60' height='9' fill='%23007A4D'/%3E%3Cpath d='M0 0L20 20L0 40Z' fill='%23007A4D'/%3E%3Cpath d='M0 3L17 20L0 37Z' fill='%23FFB612'/%3E%3Cpath d='M0 5.5L14.5 20L0 34.5Z' fill='%23000'/%3E%3C/svg%3E`,
};

// Map language codes to country codes
const LANG_TO_FLAG: Record<string, string> = {
  en: 'gb',
  pt: 'ao',
  fr: 'fr',
  af: 'za',
};

// Fallback emoji flags (for native platforms where they work fine)
const LANG_TO_EMOJI: Record<string, string> = {
  en: '🇬🇧',
  pt: '🇦🇴',
  fr: '🇫🇷',
  af: '🇿🇦',
};

interface FlagIconProps {
  languageCode: string;
  size?: number;
}

export default function FlagIcon({ languageCode, size = 24 }: FlagIconProps) {
  const countryCode = LANG_TO_FLAG[languageCode];
  const svgUri = countryCode ? FLAG_SVGS[countryCode] : undefined;

  // On web, always use SVG images (emoji flags often break)
  if (Platform.OS === 'web' && svgUri) {
    return (
      <Image
        source={{ uri: svgUri }}
        style={[styles.flag, { width: size * 1.5, height: size, borderRadius: 3 }]}
        resizeMode="cover"
      />
    );
  }

  // On native platforms, try SVG first, fall back to emoji
  if (svgUri) {
    return (
      <Image
        source={{ uri: svgUri }}
        style={[styles.flag, { width: size * 1.5, height: size, borderRadius: 3 }]}
        resizeMode="cover"
      />
    );
  }

  // Ultimate fallback: emoji
  const emoji = LANG_TO_EMOJI[languageCode] || '🏳️';
  return (
    <Text style={{ fontSize: size - 4 }}>{emoji}</Text>
  );
}

const styles = StyleSheet.create({
  flag: {
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.1)',
  },
});
