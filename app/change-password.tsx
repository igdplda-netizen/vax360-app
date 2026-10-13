import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, useColorScheme, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { authDestination } from '../utils/auth-navigation';
import { useApp } from '../context/AppContext';
import { Colors } from '../constants/colors';
import { shadows } from '../utils/shadows';
import { Ionicons } from '@expo/vector-icons';

export default function ChangePasswordScreen() {
  const { changeOwnPassword, logout, t } = useApp();
  const router = useRouter();
  const params = useLocalSearchParams<{ next?: string }>();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleChangePassword = async () => {
    setErrorMsg('');
    setSuccessMsg('');

    if (!newPassword || !confirmPassword) {
      setErrorMsg(t('fillAllFields') || 'Please fill all fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg(t('passwordMismatch') || 'Passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg(t('passwordTooShort') || 'Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const res = await changeOwnPassword(newPassword);
      if (res.success) {
        setSuccessMsg(t('changePasswordSuccess') || 'Password changed successfully!');
        // Brief pause so the user sees the success message, then navigate to home
        setTimeout(() => {
          router.replace(authDestination(params.next));
        }, 1500);
      } else {
        setErrorMsg(res.error || t('changePasswordFailed') || 'Failed to change password.');
      }
    } catch {
      setErrorMsg(t('changePasswordFailed') || 'Failed to change password.');
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? Colors.background.dark : Colors.background.light }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={[styles.logoContainer, { backgroundColor: Colors.warning || '#f59e0b' }]}>
            <Ionicons name="shield-checkmark" size={36} color="#fff" />
          </View>
          <Text style={[styles.title, { color: Colors.primary }]}>{t('appName')}</Text>
          <Text style={[styles.tagline, { color: isDark ? Colors.text.dark.secondary : Colors.text.light.secondary }]}>
            {t('changePasswordTagline') || 'Set a new secure password to continue'}
          </Text>
        </View>

        <View style={[styles.warningBanner, { backgroundColor: '#fef3c7', borderColor: '#f59e0b' }]}>
          <Ionicons name="warning" size={18} color="#d97706" />
          <Text style={styles.warningText}>
            {t('changePasswordRequired') || 'You must set a new password before continuing.'}
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: isDark ? Colors.surface.dark : Colors.surface.light }]}>
          <Text style={[styles.cardTitle, { color: isDark ? Colors.text.dark.primary : Colors.text.light.primary }]}>
            {t('changePassword') || 'Change Password'}
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
              {t('newPassword') || 'New Password'}
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
                autoFocus
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: isDark ? Colors.text.dark.secondary : Colors.text.light.secondary }]}>
              {t('confirmPassword') || 'Confirm Password'}
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
            style={[styles.submitBtn, { backgroundColor: Colors.primary }]}
            onPress={handleChangePassword}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.submitBtnText}>{t('changePasswordBtn') || 'Set New Password'}</Text>
                <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutLink} onPress={handleLogout} activeOpacity={0.6}>
            <Ionicons name="log-out-outline" size={16} color={Colors.danger} style={{ marginRight: 4 }} />
            <Text style={[styles.logoutLinkText, { color: Colors.danger }]}>
              {t('logout') || 'Logout'}
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
  header: { alignItems: 'center', marginBottom: 16 },
  logoContainer: { width: 72, height: 72, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  title: { fontSize: 30, fontWeight: '800', letterSpacing: -0.5 },
  tagline: { fontSize: 15, marginTop: 6, textAlign: 'center' },
  warningBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1.5, borderRadius: 12, padding: 12, marginBottom: 16 },
  warningText: { color: '#92400e', fontSize: 13, fontWeight: '600', flex: 1 },
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
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 14, gap: 8, marginTop: 12, ...shadows.primary() },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  logoutLink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 16 },
  logoutLinkText: { fontSize: 14, fontWeight: '700' },
});
