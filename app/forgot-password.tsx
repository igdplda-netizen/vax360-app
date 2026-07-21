import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, useColorScheme, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '../context/AppContext';
import { Colors } from '../constants/colors';
import { shadows } from '../utils/shadows';
import { Ionicons } from '@expo/vector-icons';

export default function ForgotPasswordScreen() {
  const { resetPassword, t } = useApp();
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const [whatsapp, setWhatsapp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleResetPassword = async () => {
    setErrorMsg('');
    setSuccessMsg('');

    if (!whatsapp || !newPassword || !confirmPassword) {
      setErrorMsg(t('fillAllFields') || 'Por favor, preencha todos os campos.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg(t('passwordsMismatch') || 'As senhas não coincidem.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg(t('passwordTooShort') || 'A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const res = await resetPassword(whatsapp, newPassword);
      if (res.success) {
        setSuccessMsg(t('passwordResetSuccess') || 'Senha redefinida com sucesso!');
        setTimeout(() => {
          router.replace('/login');
        }, 2000);
      } else {
        setErrorMsg(res.error || t('passwordResetError') || 'Erro ao redefinir a senha.');
      }
    } catch {
      setErrorMsg(t('passwordResetError') || 'Erro ao redefinir a senha.');
    }
    setLoading(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? Colors.background.dark : Colors.background.light }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={[styles.logoContainer, { backgroundColor: Colors.primary }]}>
            <Ionicons name="key" size={36} color="#fff" />
          </View>
          <Text style={[styles.title, { color: Colors.primary }]}>{t('appName')}</Text>
          <Text style={[styles.tagline, { color: isDark ? Colors.text.dark.secondary : Colors.text.light.secondary }]}>
            {t('resetPasswordTagline') || 'Redefina a sua senha'}
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: isDark ? Colors.surface.dark : Colors.surface.light }]}>
          <Text style={[styles.cardTitle, { color: isDark ? Colors.text.dark.primary : Colors.text.light.primary }]}>
            {t('resetPassword') || 'Redefinir Senha'}
          </Text>

          {!!errorMsg && (
            <View style={styles.errorAlert}>
              <Ionicons name="alert-circle" size={18} color={Colors.danger} />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          )}

          {!!successMsg && (
            <View style={styles.successAlert}>
              <Ionicons name="checkmark-circle" size={18} color="#16a34a" />
              <Text style={styles.successText}>{successMsg}</Text>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: isDark ? Colors.text.dark.secondary : Colors.text.light.secondary }]}>
              {t('whatsapp')}
            </Text>
            <View style={[styles.inputWrapper, { borderColor: isDark ? Colors.border.dark : Colors.border.light }]}>
              <Ionicons name="logo-whatsapp" size={20} color={isDark ? Colors.text.dark.tertiary : Colors.text.light.tertiary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: isDark ? Colors.text.dark.primary : Colors.text.light.primary }]}
                placeholder="Ex: 923000000"
                placeholderTextColor={isDark ? Colors.text.dark.tertiary : Colors.text.light.tertiary}
                value={whatsapp}
                onChangeText={setWhatsapp}
                keyboardType="phone-pad"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: isDark ? Colors.text.dark.secondary : Colors.text.light.secondary }]}>
              {t('newPassword') || 'Nova Senha'}
            </Text>
            <View style={[styles.inputWrapper, { borderColor: isDark ? Colors.border.dark : Colors.border.light }]}>
              <Ionicons name="lock-closed" size={20} color={isDark ? Colors.text.dark.tertiary : Colors.text.light.tertiary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: isDark ? Colors.text.dark.primary : Colors.text.light.primary }]}
                placeholder="••••••••"
                placeholderTextColor={isDark ? Colors.text.dark.tertiary : Colors.text.light.tertiary}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: isDark ? Colors.text.dark.secondary : Colors.text.light.secondary }]}>
              {t('confirmPassword') || 'Confirmar Senha'}
            </Text>
            <View style={[styles.inputWrapper, { borderColor: isDark ? Colors.border.dark : Colors.border.light }]}>
              <Ionicons name="lock-closed" size={20} color={isDark ? Colors.text.dark.tertiary : Colors.text.light.tertiary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: isDark ? Colors.text.dark.primary : Colors.text.light.primary }]}
                placeholder="••••••••"
                placeholderTextColor={isDark ? Colors.text.dark.tertiary : Colors.text.light.tertiary}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.resetBtn, { backgroundColor: Colors.primary }]}
            onPress={handleResetPassword}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.resetBtnText}>{t('resetPassword') || 'Redefinir Senha'}</Text>
                <Ionicons name="refresh-outline" size={20} color="#fff" />
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.backLink} onPress={() => router.replace('/login')} activeOpacity={0.6}>
            <Text style={[styles.backLinkText, { color: Colors.primary }]}>
              {t('backToLogin') || 'Voltar ao Login'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40, justifyContent: 'center', minHeight: '100%' },
  header: { alignItems: 'center', marginBottom: 36 },
  logoContainer: { width: 72, height: 72, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  title: { fontSize: 30, fontWeight: '800', letterSpacing: -0.5 },
  tagline: { fontSize: 15, marginTop: 6, textAlign: 'center' },
  card: { borderRadius: 24, padding: 24, ...shadows.lg() },
  cardTitle: { fontSize: 22, fontWeight: '800', marginBottom: 20 },
  errorAlert: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fef2f2', padding: 12, borderRadius: 12, marginBottom: 16, gap: 8 },
  errorText: { color: '#b91c1c', fontSize: 13, fontWeight: '600', flex: 1 },
  successAlert: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0fdf4', padding: 12, borderRadius: 12, marginBottom: 16, gap: 8 },
  successText: { color: '#16a34a', fontSize: 13, fontWeight: '600', flex: 1 },
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 13, fontWeight: '700', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 12 },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, paddingVertical: 12, fontSize: 15, fontWeight: '600' },
  resetBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 14, gap: 8, marginTop: 12, ...shadows.primary() },
  resetBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  backLink: { alignItems: 'center', marginTop: 16 },
  backLinkText: { fontSize: 14, fontWeight: '700' },
});
