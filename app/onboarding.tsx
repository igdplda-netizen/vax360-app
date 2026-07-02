import { View, Text, StyleSheet, TouchableOpacity, ScrollView, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '../context/AppContext';
import { Colors } from '../constants/colors';
import { Ionicons } from '@expo/vector-icons';

export default function OnboardingScreen() {
  const { completeOnboarding, t } = useApp();
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const handleGetStarted = () => {
    completeOnboarding();
    router.replace('/(tabs)');
  };

  const features = [
    { icon: 'calendar' as const, title: t('smartScheduling'), desc: t('smartSchedulingDesc') },
    { icon: 'shield-checkmark' as const, title: t('securePrivate'), desc: t('securePrivateDesc') },
    { icon: 'people' as const, title: t('multiChild'), desc: t('multiChildDesc') },
    { icon: 'notifications' as const, title: t('reminders'), desc: t('remindersDesc') },
  ];

  return (
    <View style={[styles.container, { backgroundColor: isDark ? Colors.background.dark : Colors.background.light }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="medkit-outline" size={48} color="#fff" />
          </View>
          <Text style={styles.title}>{t('appName')}</Text>
          <Text style={[styles.tagline, { color: isDark ? Colors.text.dark.secondary : Colors.text.light.secondary }]}>
            {t('tagline')}
          </Text>
        </View>

        <View style={styles.features}>
          {features.map((f, i) => (
            <View key={i} style={[styles.featureCard, { backgroundColor: isDark ? Colors.surface.dark : Colors.surface.light }]}>
              <View style={[styles.featureIcon, { backgroundColor: Colors.primary + '15' }]}>
                <Ionicons name={f.icon} size={24} color={Colors.primary} />
              </View>
              <View style={styles.featureText}>
                <Text style={[styles.featureTitle, { color: isDark ? Colors.text.dark.primary : Colors.text.light.primary }]}>
                  {f.title}
                </Text>
                <Text style={[styles.featureDesc, { color: isDark ? Colors.text.dark.secondary : Colors.text.light.secondary }]}>
                  {f.desc}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={handleGetStarted} activeOpacity={0.8}>
          <Text style={styles.buttonText}>{t('getStarted')}</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 20 },
  header: { alignItems: 'center', marginBottom: 40 },
  iconContainer: {
    width: 80, height: 80, borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
  },
  title: { fontSize: 32, fontWeight: '800', color: Colors.primary, letterSpacing: -0.5 },
  tagline: { fontSize: 16, marginTop: 8, textAlign: 'center' },
  features: { gap: 12 },
  featureCard: {
    flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)', elevation: 2,
  },
  featureIcon: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', marginRight: 14,
  },
  featureText: { flex: 1 },
  featureTitle: { fontSize: 15, fontWeight: '700', marginBottom: 3 },
  featureDesc: { fontSize: 13, lineHeight: 18 },
  footer: { paddingHorizontal: 24, paddingBottom: 32, paddingTop: 16 },
  button: {
    backgroundColor: Colors.primary, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center',
    paddingVertical: 16, borderRadius: 16, gap: 8,
    boxShadow: '0px 4px 12px rgba(99, 102, 241, 0.3)', elevation: 4,
  },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
