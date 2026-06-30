import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, useColorScheme, ActivityIndicator, Alert, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useApp } from '../context/AppContext';
import { Colors } from '../constants/colors';
import { Ionicons } from '@expo/vector-icons';

export default function TwoFactorScreen() {
  const { login2FA, enable2FA, setup2FA, t } = useApp();
  const router = useRouter();
  const params = useLocalSearchParams<{ tempToken?: string; whatsapp?: string; mode?: 'setup' }>();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const isLoginMode = !params.mode && !!params.tempToken;
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [setupLoading, setSetupLoading] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<{ secret: string; qrCode: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!isLoginMode) {
      // Trigger 2FA setup if in setup mode
      setSetupLoading(true);
      setup2FA()
        .then(data => {
          setQrCodeData(data);
          setSetupLoading(false);
        })
        .catch(err => {
          setErrorMsg(err.message || 'Erro ao carregar dados do 2FA.');
          setSetupLoading(false);
        });
    }
  }, [isLoginMode]);

  const handleVerify = async () => {
    if (code.length !== 6) {
      setErrorMsg('O código deve conter 6 dígitos.');
      return;
    }
    setLoading(true);
    setErrorMsg('');

    if (isLoginMode && params.tempToken) {
      const res = await login2FA(params.tempToken, code);
      setLoading(false);
      if (!res.success) {
        setErrorMsg(res.error || 'Código 2FA incorreto.');
      } else {
        router.replace('/(tabs)');
      }
    } else {
      // Enable 2FA mode
      const success = await enable2FA(code);
      setLoading(false);
      if (!success) {
        setErrorMsg('Código incorreto. Falha ao ativar 2FA.');
      } else {
        Alert.alert(
          'Sucesso',
          'Autenticação de 2 Fatores (2FA) ativada com sucesso!',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      }
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? Colors.background.dark : Colors.background.light }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.6}>
            <Ionicons name="arrow-back" size={24} color={isDark ? Colors.text.dark.primary : Colors.text.light.primary} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: Colors.primary }]}>{t('twoFactor')}</Text>
        </View>

        <View style={[styles.card, { backgroundColor: isDark ? Colors.surface.dark : Colors.surface.light }]}>
          {setupLoading ? (
            <ActivityIndicator size="large" color={Colors.primary} style={{ marginVertical: 30 }} />
          ) : (
            <>
              {/* QR Code display for Setup Mode */}
              {!isLoginMode && qrCodeData && (
                <View style={styles.qrSection}>
                  <Text style={[styles.instructions, { color: isDark ? Colors.text.dark.secondary : Colors.text.light.secondary }]}>
                    1. Faça o scan do QR Code abaixo usando uma app de autenticação (ex: Google Authenticator):
                  </Text>
                  <View style={styles.qrContainer}>
                    <Image
                      source={{ uri: qrCodeData.qrCode }}
                      style={styles.qrImage}
                      resizeMode="contain"
                    />
                  </View>
                  <Text style={[styles.instructions, { color: isDark ? Colors.text.dark.secondary : Colors.text.light.secondary }]}>
                    Ou insira esta chave manualmente:
                  </Text>
                  <Text style={[styles.secretKey, { color: Colors.primary }]}>{qrCodeData.secret}</Text>
                  <Text style={[styles.instructions, { color: isDark ? Colors.text.dark.secondary : Colors.text.light.secondary }]}>
                    2. Insira o código gerado de 6 dígitos para validar:
                  </Text>
                </View>
              )}

              {isLoginMode && (
                <Text style={[styles.instructions, { color: isDark ? Colors.text.dark.secondary : Colors.text.light.secondary, marginBottom: 20 }]}>
                  Insira o código de verificação gerado na sua aplicação autenticadora:
                </Text>
              )}

              {!!errorMsg && (
                <View style={styles.errorAlert}>
                  <Ionicons name="alert-circle" size={18} color={Colors.danger} />
                  <Text style={styles.errorText}>{errorMsg}</Text>
                </View>
              )}

              <View style={styles.inputGroup}>
                <TextInput
                  style={[styles.codeInput, {
                    color: isDark ? Colors.text.dark.primary : Colors.text.light.primary,
                    borderColor: isDark ? Colors.border.dark : Colors.border.light,
                  }]}
                  placeholder="000000"
                  placeholderTextColor={isDark ? Colors.text.dark.tertiary : Colors.text.light.tertiary}
                  value={code}
                  onChangeText={setCode}
                  keyboardType="number-pad"
                  maxLength={6}
                  autoFocus
                />
              </View>

              <TouchableOpacity
                style={[styles.verifyBtn, { backgroundColor: Colors.primary }]}
                onPress={handleVerify}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text style={styles.verifyBtnText}>Verificar Código</Text>
                    <Ionicons name="shield-checkmark-outline" size={20} color="#fff" />
                  </>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 24, paddingTop: 40, paddingBottom: 40, justifyContent: 'center', minHeight: '100%' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, gap: 16 },
  backBtn: { padding: 4 },
  title: { fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
  card: { borderRadius: 24, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 16, elevation: 4 },
  qrSection: { alignItems: 'center', marginBottom: 20 },
  instructions: { fontSize: 14, lineHeight: 20, textAlign: 'center', marginVertical: 8, fontWeight: '500' },
  qrContainer: { padding: 12, backgroundColor: '#fff', borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, marginVertical: 12 },
  qrImage: { width: 180, height: 180 },
  secretKey: { fontSize: 16, fontWeight: '800', letterSpacing: 2, padding: 8, backgroundColor: '#f1f5f9', borderRadius: 8, overflow: 'hidden', textAlign: 'center', marginVertical: 8 },
  errorAlert: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fef2f2', padding: 12, borderRadius: 12, marginBottom: 16, gap: 8 },
  errorText: { color: '#b91c1c', fontSize: 13, fontWeight: '600', flex: 1 },
  inputGroup: { marginBottom: 20, alignItems: 'center' },
  codeInput: { width: '100%', borderWidth: 2, borderRadius: 16, paddingVertical: 14, fontSize: 32, fontWeight: '800', letterSpacing: 8, textAlign: 'center' },
  verifyBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 14, gap: 8, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 2 },
  verifyBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
