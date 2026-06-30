import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, useColorScheme } from 'react-native';
import { useApp, Language } from '../../context/AppContext';
import { Colors } from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen() {
  const { state, setLanguage, setTheme, t } = useApp();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'en', label: t('english'), flag: '🇬🇧' },
    { code: 'pt', label: t('portuguese'), flag: '🇧🇷' },
    { code: 'fr', label: t('french'), flag: '🇫🇷' },
    { code: 'af', label: t('afrikaans'), flag: '🇿🇦' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: isDark ? Colors.background.dark : Colors.background.light }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={[styles.headerTitle, { color: isDark ? Colors.text.dark.primary : Colors.text.light.primary }]}>
          {t('settings')}
        </Text>

        {/* Appearance */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: isDark ? Colors.text.dark.secondary : Colors.text.light.secondary }]}>
            Appearance
          </Text>
          <View style={[styles.card, { backgroundColor: isDark ? Colors.surface.dark : Colors.surface.light }]}>
            <View style={styles.row}>
              <View style={styles.rowIcon}>
                <Ionicons name="moon" size={20} color={Colors.primary} />
              </View>
              <Text style={[styles.rowLabel, { color: isDark ? Colors.text.dark.primary : Colors.text.light.primary }]}>
                {t('darkMode')}
              </Text>
              <Switch
                value={state.theme === 'dark'}
                onValueChange={(v) => setTheme(v ? 'dark' : 'light')}
                trackColor={{ false: '#e2e8f0', true: Colors.primary }}
              />
            </View>
          </View>
        </View>

        {/* Language */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: isDark ? Colors.text.dark.secondary : Colors.text.light.secondary }]}>
            {t('language')}
          </Text>
          <View style={[styles.card, { backgroundColor: isDark ? Colors.surface.dark : Colors.surface.light }]}>
            {languages.map((lang, idx) => (
              <TouchableOpacity
                key={lang.code}
                style={[styles.row, idx < languages.length - 1 && styles.rowBorder]}
                onPress={() => setLanguage(lang.code)}
                activeOpacity={0.6}
              >
                <View style={styles.rowIcon}>
                  <Text style={{ fontSize: 20 }}>{lang.flag}</Text>
                </View>
                <Text style={[styles.rowLabel, { color: isDark ? Colors.text.dark.primary : Colors.text.light.primary }]}>
                  {lang.label}
                </Text>
                {state.language === lang.code && (
                  <Ionicons name="checkmark" size={20} color={Colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: isDark ? Colors.text.dark.secondary : Colors.text.light.secondary }]}>
            {t('about')}
          </Text>
          <View style={[styles.card, { backgroundColor: isDark ? Colors.surface.dark : Colors.surface.light, alignItems: 'center', paddingVertical: 24 }]}>
            <View style={[styles.logoContainer, { backgroundColor: Colors.primary }]}>
              <Ionicons name="medical" size={32} color="#fff" />
            </View>
            <Text style={[styles.appName, { color: isDark ? Colors.text.dark.primary : Colors.text.light.primary }]}>
              {t('appName')}
            </Text>
            <Text style={[styles.version, { color: isDark ? Colors.text.dark.tertiary : Colors.text.light.tertiary }]}>
              {t('version')}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, paddingTop: 60 },
  headerTitle: { fontSize: 28, fontWeight: '800', marginBottom: 24 },
  section: { marginBottom: 20 },
  sectionLabel: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase', marginBottom: 8, letterSpacing: 0.5 },
  card: { borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  rowIcon: { width: 32, alignItems: 'center', marginRight: 12 },
  rowLabel: { flex: 1, fontSize: 15, fontWeight: '600' },
  logoContainer: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  appName: { fontSize: 20, fontWeight: '800', marginBottom: 4 },
  version: { fontSize: 13 },
});
