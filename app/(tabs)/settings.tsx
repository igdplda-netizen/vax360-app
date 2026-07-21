import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, useColorScheme, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp, Language } from '../../context/AppContext';
import { Colors } from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import FlagIcon from '../../components/FlagIcon';
import { shadows } from '../../utils/shadows';

export default function SettingsScreen() {
  const { state, setLanguage, setTheme, logout, get2FAStatus, disable2FA, t, isOnline } = useApp();
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [loading2FA, setLoading2FA] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [disableCode, setDisableCode] = useState('');
  const [disabling, setDisabling] = useState(false);

  const primaryColor = state.partnerBranding?.primaryColor || Colors.primary;

  useEffect(() => {
    if (state.token) {
      setLoading2FA(true);
      get2FAStatus().then(status => {
        setIs2FAEnabled(status);
        setLoading2FA(false);
      });
    }
  }, [state.token]);

  const handle2FAToggle = async (value: boolean) => {
    if (value) {
      // Redirect to Setup screen
      router.push({
        pathname: '/two-factor',
        params: { mode: 'setup' }
      });
    } else {
      // Open modal to input code and disable
      setShowDisableModal(true);
    }
  };

  const handleDisable2FA = async () => {
    if (disableCode.length !== 6) {
      Alert.alert('Aviso', 'Insira o código de 6 dígitos.');
      return;
    }
    setDisabling(true);
    const success = await disable2FA(disableCode);
    setDisabling(false);
    if (success) {
      setIs2FAEnabled(false);
      setShowDisableModal(false);
      setDisableCode('');
      Alert.alert('Sucesso', 'Autenticação de 2 Fatores desativada.');
    } else {
      Alert.alert('Erro', 'Código incorreto. Falha ao desativar.');
    }
  };

  const languages: { code: Language; label: string }[] = [
    { code: 'en', label: t('english') },
    { code: 'pt', label: t('portuguese') },
    { code: 'fr', label: t('french') },
    { code: 'af', label: t('afrikaans') },
  ];

  return (
    <View style={[styles.container, { backgroundColor: isDark ? Colors.background.dark : Colors.background.light }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={[styles.headerTitle, { color: isDark ? Colors.text.dark.primary : Colors.text.light.primary }]}>
          {t('settings')}
        </Text>

        {/* User Info (if logged in) */}
        {state.currentUser && (
          <View style={[styles.card, { backgroundColor: isDark ? Colors.surface.dark : Colors.surface.light, padding: 16, marginBottom: 20 }]}>
            <View style={styles.userInfoRow}>
              <View style={[styles.userAvatar, { backgroundColor: primaryColor + '15' }]}>
                <Ionicons name="person" size={24} color={primaryColor} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.userName, { color: isDark ? Colors.text.dark.primary : Colors.text.light.primary }]}>
                  {state.currentUser.name}
                </Text>
                <Text style={[styles.userMeta, { color: isDark ? Colors.text.dark.secondary : Colors.text.light.secondary }]}>
                  WhatsApp: {state.currentUser.whatsapp}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Admin Navigation */}
        {state.token && (state.userRole === 'admin' || state.userRole === 'superadmin') && (
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: isDark ? Colors.text.dark.secondary : Colors.text.light.secondary }]}>
              Administração
            </Text>
            <View style={[styles.card, { backgroundColor: isDark ? Colors.surface.dark : Colors.surface.light }]}>
              <TouchableOpacity
                style={styles.row}
                onPress={() => router.push('/admin-dashboard')}
                activeOpacity={0.6}
              >
                <View style={styles.rowIcon}>
                  <Ionicons name="medical" size={20} color={primaryColor} />
                </View>
                <Text style={[styles.rowLabel, { color: isDark ? Colors.text.dark.primary : Colors.text.light.primary }]}>
                  {t('adminDashboard') || 'Painel Clínico'}
                </Text>
                <Ionicons name="chevron-forward" size={20} color={isDark ? Colors.text.dark.tertiary : Colors.text.light.tertiary} />
              </TouchableOpacity>

              {state.userRole === 'superadmin' && (
                <TouchableOpacity
                  style={[styles.row, { borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)' }]}
                  onPress={() => router.push('/branding')}
                  activeOpacity={0.6}
                >
                  <View style={styles.rowIcon}>
                    <Ionicons name="color-palette" size={20} color={primaryColor} />
                  </View>
                  <Text style={[styles.rowLabel, { color: isDark ? Colors.text.dark.primary : Colors.text.light.primary }]}>
                    {t('brandingSettings') || 'Definições de Marca'}
                  </Text>
                  <Ionicons name="chevron-forward" size={20} color={isDark ? Colors.text.dark.tertiary : Colors.text.light.tertiary} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Security & 2FA */}
        {state.token && (
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: isDark ? Colors.text.dark.secondary : Colors.text.light.secondary }]}>
              Segurança
            </Text>
            <View style={[styles.card, { backgroundColor: isDark ? Colors.surface.dark : Colors.surface.light }]}>
              <View style={styles.row}>
                <View style={styles.rowIcon}>
                  <Ionicons name="shield-checkmark" size={20} color={primaryColor} />
                </View>
                <Text style={[styles.rowLabel, { color: isDark ? Colors.text.dark.primary : Colors.text.light.primary }]}>
                  {t('twoFactor') || 'Autenticação 2FA'}
                </Text>
                {loading2FA ? (
                  <ActivityIndicator size="small" color={primaryColor} />
                ) : (
                  <Switch
                    value={is2FAEnabled}
                    onValueChange={handle2FAToggle}
                    trackColor={{ false: '#e2e8f0', true: primaryColor }}
                  />
                )}
              </View>
            </View>
          </View>
        )}

        {/* Appearance */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: isDark ? Colors.text.dark.secondary : Colors.text.light.secondary }]}>
            Visual
          </Text>
          <View style={[styles.card, { backgroundColor: isDark ? Colors.surface.dark : Colors.surface.light }]}>
            <View style={styles.row}>
              <View style={styles.rowIcon}>
                <Ionicons name="moon" size={20} color={primaryColor} />
              </View>
              <Text style={[styles.rowLabel, { color: isDark ? Colors.text.dark.primary : Colors.text.light.primary }]}>
                {t('darkMode')}
              </Text>
              <Switch
                value={state.theme === 'dark'}
                onValueChange={(v) => setTheme(v ? 'dark' : 'light')}
                trackColor={{ false: '#e2e8f0', true: primaryColor }}
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
                  <FlagIcon languageCode={lang.code} size={22} />
                </View>
                <Text style={[styles.rowLabel, { color: isDark ? Colors.text.dark.primary : Colors.text.light.primary }]}>
                  {lang.label}
                </Text>
                {state.language === lang.code && (
                  <Ionicons name="checkmark" size={20} color={primaryColor} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Logout Button */}
        {state.token && (
          <TouchableOpacity
            style={[styles.logoutBtn, { borderColor: Colors.danger }]}
            onPress={logout}
            activeOpacity={0.6}
          >
            <Ionicons name="log-out" size={20} color={Colors.danger} />
            <Text style={styles.logoutBtnText}>Terminar Sessão</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Disable 2FA Modal */}
      {showDisableModal && (
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? Colors.surface.dark : Colors.surface.light }]}>
            <Text style={[styles.modalTitle, { color: isDark ? Colors.text.dark.primary : Colors.text.light.primary }]}>
              Desativar Autenticação 2FA
            </Text>
            <Text style={{ fontSize: 13, color: isDark ? Colors.text.dark.secondary : Colors.text.light.secondary, marginBottom: 12 }}>
              Insira o código de 6 dígitos do seu autenticador para confirmar a desativação:
            </Text>
            <TextInput
              style={[styles.modalInput, { color: isDark ? Colors.text.dark.primary : Colors.text.light.primary, borderColor: isDark ? Colors.border.dark : Colors.border.light }]}
              placeholder="000000"
              placeholderTextColor={isDark ? Colors.text.dark.tertiary : Colors.text.light.tertiary}
              value={disableCode}
              onChangeText={setDisableCode}
              keyboardType="number-pad"
              maxLength={6}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => { setShowDisableModal(false); setDisableCode(''); }}>
                <Text style={styles.modalCancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalConfirmBtn, { backgroundColor: Colors.danger }]} onPress={handleDisable2FA} disabled={disabling}>
                {disabling ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.modalConfirmBtnText}>Desativar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, paddingTop: 60, paddingBottom: 40 },
  headerTitle: { fontSize: 28, fontWeight: '800', marginBottom: 24 },
  section: { marginBottom: 20 },
  sectionLabel: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', marginBottom: 8, letterSpacing: 0.5 },
  card: { borderRadius: 16, overflow: 'hidden', ...shadows.sm() },
  userInfoRow: { flexDirection: 'row', alignItems: 'center' },
  userAvatar: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  userName: { fontSize: 16, fontWeight: '800' },
  userMeta: { fontSize: 13, marginTop: 2 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  rowIcon: { width: 32, alignItems: 'center', marginRight: 12 },
  rowLabel: { flex: 1, fontSize: 15, fontWeight: '600' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderRadius: 14, paddingVertical: 14, gap: 8, marginTop: 24, marginBottom: 20 },
  logoutBtnText: { color: Colors.danger, fontSize: 16, fontWeight: '700' },
  modalOverlay: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modalContent: { width: '80%', padding: 24, borderRadius: 20, gap: 16 },
  modalTitle: { fontSize: 18, fontWeight: '800' },
  modalInput: { borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, fontSize: 18, fontWeight: '800', letterSpacing: 4, textAlign: 'center' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  modalCancelBtn: { paddingVertical: 10, paddingHorizontal: 16 },
  modalCancelBtnText: { color: '#64748b', fontSize: 14, fontWeight: '700' },
  modalConfirmBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10 },
  modalConfirmBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
