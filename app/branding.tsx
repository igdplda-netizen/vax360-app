import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, useColorScheme, ActivityIndicator, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '../context/AppContext';
import { Colors } from '../constants/colors';
import { Ionicons } from '@expo/vector-icons';

export default function BrandingScreen() {
  const { state, updateBranding, loadBranding, t } = useApp();
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const [logo, setLogo] = useState('');
  const [link, setLink] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#6366f1');
  const [secondaryColor, setSecondaryColor] = useState('#8b5cf6');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (state.token && state.userRole === 'superadmin') {
      loadBranding().then(() => {
        if (state.partnerBranding) {
          setLogo(state.partnerBranding.logo || '');
          setLink(state.partnerBranding.link || '');
          setPrimaryColor(state.partnerBranding.primaryColor || '#6366f1');
          setSecondaryColor(state.partnerBranding.secondaryColor || '#8b5cf6');
        }
      });
    } else {
      router.replace('/login');
    }
  }, [state.token, state.userRole]);

  const handleSave = async () => {
    if (!logo || !link) {
      Alert.alert('Aviso', 'Por favor, preencha o link e a URL da logo.');
      return;
    }
    setSaving(true);
    const success = await updateBranding({ logo, link, primaryColor, secondaryColor });
    setSaving(false);
    if (success) {
      Alert.alert('Sucesso', 'Configurações de marca atualizadas com sucesso!');
    } else {
      Alert.alert('Erro', 'Falha ao salvar configurações de marca.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? Colors.background.dark : Colors.background.light }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/(tabs)');
            }
          }} activeOpacity={0.6}>
            <Ionicons name="arrow-back" size={24} color={isDark ? Colors.text.dark.primary : Colors.text.light.primary} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: Colors.primary }]}>{t('brandingSettings')}</Text>
        </View>

        <View style={[styles.card, { backgroundColor: isDark ? Colors.surface.dark : Colors.surface.light }]}>
          {/* Logo URL */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: isDark ? Colors.text.dark.secondary : Colors.text.light.secondary }]}>
              URL do Logotipo do Parceiro
            </Text>
            <TextInput
              style={[styles.input, { color: isDark ? Colors.text.dark.primary : Colors.text.light.primary, borderColor: isDark ? Colors.border.dark : Colors.border.light }]}
              placeholder="Ex: https://dominio.com/logo.png ou Base64"
              placeholderTextColor={isDark ? Colors.text.dark.tertiary : Colors.text.light.tertiary}
              value={logo}
              onChangeText={setLogo}
            />
          </View>

          {/* Link URL */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: isDark ? Colors.text.dark.secondary : Colors.text.light.secondary }]}>
              Website / Link de Redirecionamento
            </Text>
            <TextInput
              style={[styles.input, { color: isDark ? Colors.text.dark.primary : Colors.text.light.primary, borderColor: isDark ? Colors.border.dark : Colors.border.light }]}
              placeholder="Ex: https://parceiro.com"
              placeholderTextColor={isDark ? Colors.text.dark.tertiary : Colors.text.light.tertiary}
              value={link}
              onChangeText={setLink}
              autoCapitalize="none"
            />
          </View>

          {/* Colors */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={[styles.inputLabel, { color: isDark ? Colors.text.dark.secondary : Colors.text.light.secondary }]}>
                Cor Primária
              </Text>
              <TextInput
                style={[styles.input, { color: isDark ? Colors.text.dark.primary : Colors.text.light.primary, borderColor: isDark ? Colors.border.dark : Colors.border.light }]}
                placeholder="#6366f1"
                placeholderTextColor={isDark ? Colors.text.dark.tertiary : Colors.text.light.tertiary}
                value={primaryColor}
                onChangeText={setPrimaryColor}
                autoCapitalize="none"
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={[styles.inputLabel, { color: isDark ? Colors.text.dark.secondary : Colors.text.light.secondary }]}>
                Cor Secundária
              </Text>
              <TextInput
                style={[styles.input, { color: isDark ? Colors.text.dark.primary : Colors.text.light.primary, borderColor: isDark ? Colors.border.dark : Colors.border.light }]}
                placeholder="#8b5cf6"
                placeholderTextColor={isDark ? Colors.text.dark.tertiary : Colors.text.light.tertiary}
                value={secondaryColor}
                onChangeText={setSecondaryColor}
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Preview Section */}
          {!!logo && (
            <View style={styles.previewSection}>
              <Text style={[styles.previewLabel, { color: isDark ? Colors.text.dark.secondary : Colors.text.light.secondary }]}>
                Visualização do Logotipo
              </Text>
              <View style={styles.logoPreviewBg}>
                <Image source={{ uri: logo }} style={styles.logoPreview} resizeMode="contain" />
              </View>
            </View>
          )}

          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: Colors.primary }]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.8}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.saveBtnText}>Salvar Branding</Text>
                <Ionicons name="save-outline" size={20} color="#fff" />
              </>
            )}
          </TouchableOpacity>
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
  inputGroup: { marginBottom: 16, gap: 6 },
  inputLabel: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, fontWeight: '600' },
  row: { flexDirection: 'row', gap: 16 },
  previewSection: { marginVertical: 12, alignItems: 'center' },
  previewLabel: { fontSize: 13, fontWeight: '700', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  logoPreviewBg: { padding: 12, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  logoPreview: { width: 140, height: 60 },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 14, gap: 8, marginTop: 12, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 2 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
