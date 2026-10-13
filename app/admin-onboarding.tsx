import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Redirect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/colors';
import type { OnboardingConfig, OnboardingLanguage, OnboardingText } from '../constants/onboarding';
import { useApp } from '../context/AppContext';
import { BUILT_IN_ONBOARDING_COPY } from './onboarding';
import { setOnboardingPreview } from '../utils/onboarding-preview';

const LANGUAGES: { key: OnboardingLanguage; label: string; short: string }[] = [
  { key: 'pt', label: 'Português', short: 'PT' },
  { key: 'en', label: 'English', short: 'EN' },
  { key: 'fr', label: 'Français', short: 'FR' },
  { key: 'af', label: 'Afrikaans', short: 'AF' },
];
const FIELDS: { key: keyof OnboardingText; label: string; limit: number; multiline?: boolean }[] = [
  { key: 'eyebrow', label: 'Linha de apoio', limit: 100 },
  { key: 'title', label: 'Título', limit: 160 },
  { key: 'body', label: 'Texto principal', limit: 800, multiline: true },
  { key: 'note', label: 'Nota', limit: 240, multiline: true },
];
const blankText = (): OnboardingText => ({ eyebrow: '', title: '', body: '', note: '' });

function makeDefaultSteps(): OnboardingConfig['steps'] {
  return [0, 1, 2].map((index) => ({
    pt: { ...BUILT_IN_ONBOARDING_COPY.pt[index] },
    en: { ...BUILT_IN_ONBOARDING_COPY.en[index] },
    fr: { ...BUILT_IN_ONBOARDING_COPY.fr[index] },
    af: { ...BUILT_IN_ONBOARDING_COPY.af[index] },
  }));
}

function normalizeConfiguredSteps(config: OnboardingConfig): OnboardingConfig['steps'] {
  if (!config.steps.length) return makeDefaultSteps();
  return config.steps.map((step) => {
    const portuguese = step.pt || blankText();
    const normalized: OnboardingConfig['steps'][number] = { pt: { ...portuguese } };
    LANGUAGES.filter(({ key }) => key !== 'pt').forEach(({ key }) => {
      if (step[key]) normalized[key] = { ...portuguese, ...step[key] };
    });
    return normalized;
  });
}

export default function AdminOnboardingScreen() {
  const { state, onboardingConfig, updateOnboardingConfig } = useApp();
  const router = useRouter();
  const [enabled, setEnabled] = useState(onboardingConfig.enabled);
  const [steps, setSteps] = useState<OnboardingConfig['steps']>(() => normalizeConfiguredSteps(onboardingConfig));
  const [usingDefaults, setUsingDefaults] = useState(onboardingConfig.steps.length === 0);
  const [language, setLanguage] = useState<OnboardingLanguage>('pt');
  const [activeStep, setActiveStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const canManage = !!state.token && (state.userRole === 'admin' || state.userRole === 'superadmin');
  const isDark = state.theme === 'dark';
  const palette = isDark
    ? { bg: Colors.background.dark, surface: Colors.surface.dark, text: Colors.text.dark.primary, muted: Colors.text.dark.secondary, border: Colors.border.dark, field: '#27213A' }
    : { bg: '#F5F2FA', surface: '#FFFFFF', text: '#28213A', muted: '#716A80', border: '#E6E0EF', field: '#FAF8FC' };
  const currentStep = steps[activeStep];
  const selected = currentStep?.[language] || blankText();
  const isValid = useMemo(() => steps.length >= 1 && steps.length <= 3 &&
    steps.every((step) => !!step.pt?.title.trim() && !!step.pt?.body.trim() &&
      LANGUAGES.every(({ key }) => {
        const text = step[key];
        return !text || ((!text.title.trim() && !text.body.trim()) || (!!text.title.trim() && !!text.body.trim()));
      })), [steps]);

  useEffect(() => {
    if (!state.mustChangePassword && canManage) {
      setEnabled(onboardingConfig.enabled);
      setSteps(normalizeConfiguredSteps(onboardingConfig));
      setUsingDefaults(onboardingConfig.steps.length === 0);
    }
  }, [onboardingConfig, state.mustChangePassword, canManage]);

  if (!state.token || (state.userRole !== 'admin' && state.userRole !== 'superadmin')) return <Redirect href="/(tabs)" />;
  if (state.mustChangePassword) return <Redirect href="/change-password" />;

  const updateField = (field: keyof OnboardingText, value: string) => {
    setUsingDefaults(false);
    setMessage(null);
    setSteps((previous) => previous.map((item, index) => {
      if (index !== activeStep) return item;
      const base = item[language] || blankText();
      return { ...item, [language]: { ...base, [field]: value } };
    }));
  };
  const addStep = () => {
    if (steps.length >= 3) return;
    setUsingDefaults(false);
    setSteps((previous) => [...previous, { pt: blankText() }]);
    setActiveStep(steps.length);
    setLanguage('pt');
    setMessage(null);
  };
  const removeStep = () => {
    if (steps.length <= 1) return;
    setUsingDefaults(false);
    setSteps((previous) => previous.filter((_, index) => index !== activeStep));
    setActiveStep(Math.max(0, activeStep - 1));
    setMessage(null);
  };
  const moveStep = (direction: -1 | 1) => {
    const target = activeStep + direction;
    if (target < 0 || target >= steps.length) return;
    setSteps((previous) => {
      const next = [...previous];
      [next[activeStep], next[target]] = [next[target], next[activeStep]];
      return next;
    });
    setActiveStep(target);
    setUsingDefaults(false);
    setMessage(null);
  };
  const resetDraft = () => {
    setSteps(makeDefaultSteps());
    setEnabled(true);
    setUsingDefaults(true);
    setActiveStep(0);
    setLanguage('pt');
    setMessage({ type: 'success', text: 'Rascunho reposto. Guarde para aplicar as alterações.' });
  };
  const preview = () => {
    const previewSteps = usingDefaults ? [] : steps.map((step) => {
      const pt = step.pt || blankText();
      return Object.fromEntries(LANGUAGES.map(({ key }) => [key, step[key] || pt])) as OnboardingConfig['steps'][number];
    });
    setOnboardingPreview({ enabled, steps: previewSteps });
    router.push('/onboarding?preview=1');
  };
  const save = async () => {
    if (!isValid) {
      setMessage({ type: 'error', text: 'Preencha título e texto principal em português e complete os dois campos obrigatórios nas traduções iniciadas.' });
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      const config: OnboardingConfig = {
        enabled,
        steps: usingDefaults ? [] : steps.map((step) => {
          const result: OnboardingConfig['steps'][number] = { pt: step.pt };
          LANGUAGES.filter(({ key }) => key !== 'pt').forEach(({ key }) => {
            const text = step[key];
            if (text && (text.title.trim() || text.body.trim() || text.eyebrow.trim() || text.note.trim())) result[key] = text;
          });
          return result;
        }),
      };
      await updateOnboardingConfig(config);
      setMessage({ type: 'success', text: 'Apresentação guardada com sucesso.' });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Não foi possível guardar. Tente novamente.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: palette.bg }]}>
      <View style={styles.topbar}>
        <Pressable accessibilityRole="button" accessibilityLabel="Voltar às configurações" onPress={() => router.back()} style={styles.back}>
          <Ionicons name="arrow-back" size={21} color={palette.text} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={[styles.kicker, { color: Colors.primary }]}>ADMINISTRAÇÃO</Text>
          <Text style={[styles.screenTitle, { color: palette.text }]}>Apresentação</Text>
        </View>
        <View style={styles.stepCount}>
          <Text style={[styles.stepCountText, { color: Colors.primary }]}>{steps.length} / 3</Text>
        </View>
      </View>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.enableCard, { backgroundColor: palette.surface, borderColor: palette.border }]}>
          <View style={[styles.enableIcon, { backgroundColor: `${Colors.primary}14` }]}>
            <Ionicons name="sparkles-outline" size={20} color={Colors.primary} />
          </View>
          <View style={styles.enableCopy}>
            <Text style={[styles.cardTitle, { color: palette.text }]}>Apresentação inicial</Text>
            <Text style={[styles.helper, { color: palette.muted }]}>Mostrada antes de entrar na aplicação</Text>
          </View>
          <Switch value={enabled} onValueChange={(value) => { setEnabled(value); setMessage(null); }} accessibilityLabel="Ativar apresentação inicial" trackColor={{ false: palette.border, true: Colors.primary }} />
        </View>

        <View style={styles.sectionHeader}>
          <View style={{ flex: 1, minWidth: 180 }}>
            <Text style={[styles.sectionTitle, { color: palette.text }]}>Conteúdo dos passos</Text>
            <Text style={[styles.helper, { color: palette.muted }]}>Português é obrigatório; as restantes línguas são opcionais.</Text>
          </View>
          <Pressable onPress={resetDraft} accessibilityRole="button" style={styles.resetButton}>
            <Ionicons name="refresh-outline" size={16} color={Colors.primary} />
            <Text style={styles.resetText}>Repor padrão</Text>
          </Pressable>
        </View>

        <View style={styles.stepRail}>
          {steps.map((_, index) => (
            <Pressable key={index} onPress={() => setActiveStep(index)} accessibilityRole="tab" accessibilityState={{ selected: activeStep === index }} style={[styles.stepTab, { backgroundColor: activeStep === index ? Colors.primary : palette.surface, borderColor: activeStep === index ? Colors.primary : palette.border }]}>
              <Text style={[styles.stepTabText, { color: activeStep === index ? '#FFFFFF' : palette.muted }]}>Passo {index + 1}</Text>
            </Pressable>
          ))}
          {steps.length < 3 && <Pressable onPress={addStep} accessibilityRole="button" accessibilityLabel="Adicionar passo" style={[styles.addStep, { borderColor: palette.border }]}><Ionicons name="add" size={19} color={Colors.primary} /></Pressable>}
        </View>

        <View style={[styles.editorCard, { backgroundColor: palette.surface, borderColor: palette.border }]}>
          <View style={styles.editorHeading}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardTitle, { color: palette.text }]}>Passo {activeStep + 1}</Text>
              <Text style={[styles.helper, { color: palette.muted }]}>Edite o texto apresentado ao utilizador.</Text>
            </View>
            <View style={styles.reorder}>
              <Pressable onPress={() => moveStep(-1)} disabled={activeStep === 0} accessibilityRole="button" accessibilityLabel="Mover passo para cima" style={styles.iconButton}><Ionicons name="arrow-up" size={17} color={activeStep === 0 ? palette.border : palette.muted} /></Pressable>
              <Pressable onPress={() => moveStep(1)} disabled={activeStep === steps.length - 1} accessibilityRole="button" accessibilityLabel="Mover passo para baixo" style={styles.iconButton}><Ionicons name="arrow-down" size={17} color={activeStep === steps.length - 1 ? palette.border : palette.muted} /></Pressable>
              <Pressable onPress={removeStep} disabled={steps.length <= 1} accessibilityRole="button" accessibilityLabel="Remover passo" style={styles.iconButton}><Ionicons name="trash-outline" size={17} color={steps.length <= 1 ? palette.border : Colors.danger} /></Pressable>
            </View>
          </View>

          <View style={styles.languages}>
            {LANGUAGES.map((item) => {
              const started = !!steps[activeStep]?.[item.key];
              return <Pressable key={item.key} onPress={() => setLanguage(item.key)} accessibilityRole="tab" accessibilityState={{ selected: language === item.key }} style={[styles.languageTab, { borderColor: language === item.key ? Colors.primary : palette.border, backgroundColor: language === item.key ? `${Colors.primary}12` : palette.surface }]}>
                <Text style={[styles.languageShort, { color: language === item.key ? Colors.primary : palette.muted }]}>{item.short}</Text>
                <Text style={[styles.languageLabel, { color: language === item.key ? palette.text : palette.muted }]}>{item.label}</Text>
                {item.key !== 'pt' && <View style={[styles.languageDot, { backgroundColor: started ? '#3E9A76' : palette.border }]} />}
              </Pressable>;
            })}
          </View>

          {language !== 'pt' && !currentStep?.[language] && <View style={[styles.fallbackHint, { backgroundColor: `${Colors.primary}0C` }]}><Ionicons name="information-circle-outline" size={16} color={Colors.primary} /><Text style={[styles.fallbackText, { color: palette.muted }]}>Sem tradução própria: será usado o texto em português até editar esta língua.</Text></View>}
          {FIELDS.map((field) => {
            const value = selected[field.key] || '';
            const required = field.key === 'title' || field.key === 'body';
            return <View key={field.key} style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <Text style={[styles.fieldLabel, { color: palette.text }]}>{field.label}{required ? ' *' : ''}</Text>
                <Text style={[styles.counter, { color: palette.muted }]}>{value.length}/{field.limit}</Text>
              </View>
              <TextInput
                accessibilityLabel={`${field.label}, ${LANGUAGES.find((item) => item.key === language)?.label}`}
                value={value}
                onChangeText={(text) => updateField(field.key, text)}
                maxLength={field.limit}
                multiline={field.multiline}
                textAlignVertical={field.multiline ? 'top' : 'center'}
                placeholder={field.key === 'title' ? 'Escreva um título claro' : field.key === 'body' ? 'Explique o que a pessoa vai encontrar' : 'Opcional'}
                placeholderTextColor={palette.muted}
                style={[styles.input, field.multiline && styles.multiline, { backgroundColor: palette.field, borderColor: palette.border, color: palette.text }]}
              />
            </View>;
          })}
          {language === 'pt' && (!selected.title.trim() || !selected.body.trim()) && <Text style={styles.validationText}>Título e texto principal em português são obrigatórios.</Text>}
        </View>

        {message && <View accessibilityRole="alert" style={[styles.feedback, { backgroundColor: message.type === 'error' ? '#FCEBEA' : '#E7F4ED' }]}>
          <Ionicons name={message.type === 'error' ? 'alert-circle-outline' : 'checkmark-circle-outline'} size={18} color={message.type === 'error' ? '#B5413B' : '#287451'} />
          <Text style={[styles.feedbackText, { color: message.type === 'error' ? '#8F302B' : '#245F43' }]}>{message.text}</Text>
        </View>}
        <View style={{ height: 102 }} />
      </ScrollView>
      <View style={[styles.footer, { backgroundColor: palette.bg, borderTopColor: palette.border }]}>
        <Pressable onPress={preview} accessibilityRole="button" style={[styles.previewButton, { borderColor: palette.border }]}>
          <Ionicons name="eye-outline" size={18} color={Colors.primary} />
          <Text style={[styles.previewText, { color: palette.text }]}>Pré-visualizar</Text>
        </Pressable>
        <Pressable onPress={save} disabled={saving} accessibilityRole="button" accessibilityState={{ disabled: saving }} style={[styles.saveButton, saving && { opacity: 0.7 }]}>
          {saving ? <ActivityIndicator color="#FFFFFF" size="small" /> : <Ionicons name="checkmark" size={19} color="#FFFFFF" />}
          <Text style={styles.saveText}>{saving ? 'A guardar…' : 'Guardar'}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  topbar: { minHeight: 72, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', gap: 12 },
  back: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF80' },
  kicker: { fontSize: 10, fontWeight: '800', letterSpacing: 1.15 },
  screenTitle: { fontSize: 22, fontWeight: '800', letterSpacing: -0.4 },
  stepCount: { minWidth: 48, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: `${Colors.primary}12` },
  stepCountText: { fontSize: 12, fontWeight: '800' },
  content: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 14 },
  enableCard: { minHeight: 78, borderWidth: 1, borderRadius: 18, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  enableIcon: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  enableCopy: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '800' },
  helper: { fontSize: 12, lineHeight: 17, marginTop: 3 },
  sectionHeader: { marginTop: 25, marginBottom: 13, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  sectionTitle: { fontSize: 17, fontWeight: '800', letterSpacing: -0.25 },
  resetButton: { flexDirection: 'row', alignItems: 'center', gap: 5, minHeight: 36, paddingHorizontal: 8 },
  resetText: { color: Colors.primary, fontSize: 12, fontWeight: '700' },
  stepRail: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  stepTab: { height: 40, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center', borderRadius: 13, borderWidth: 1 },
  stepTabText: { fontSize: 12, fontWeight: '800' },
  addStep: { width: 40, height: 40, borderRadius: 13, borderWidth: 1, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  editorCard: { borderWidth: 1, borderRadius: 20, padding: 15 },
  editorHeading: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  reorder: { flexDirection: 'row', gap: 3 },
  iconButton: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
  languages: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, paddingBottom: 14 },
  languageTab: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderRadius: 12, paddingHorizontal: 9, height: 36 },
  languageShort: { fontSize: 10, fontWeight: '900' },
  languageLabel: { fontSize: 11, fontWeight: '700' },
  languageDot: { width: 6, height: 6, borderRadius: 3, marginLeft: 1 },
  fallbackHint: { flexDirection: 'row', alignItems: 'flex-start', gap: 7, padding: 10, borderRadius: 11, marginBottom: 13 },
  fallbackText: { flex: 1, fontSize: 11, lineHeight: 16 },
  fieldGroup: { marginBottom: 13 },
  labelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  fieldLabel: { fontSize: 12, fontWeight: '800' },
  counter: { fontSize: 10, fontVariant: ['tabular-nums'] },
  input: { minHeight: 44, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  multiline: { minHeight: 88, lineHeight: 20 },
  validationText: { color: '#B5413B', fontSize: 11, fontWeight: '600', marginTop: -2 },
  feedback: { marginTop: 12, paddingHorizontal: 12, paddingVertical: 11, borderRadius: 12, flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  feedbackText: { flex: 1, fontSize: 12, lineHeight: 17, fontWeight: '600' },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12, borderTopWidth: StyleSheet.hairlineWidth, flexDirection: 'row', gap: 10 },
  previewButton: { minHeight: 50, flex: 1, borderWidth: 1, borderRadius: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  previewText: { fontSize: 13, fontWeight: '700' },
  saveButton: { minHeight: 50, flex: 1.25, borderRadius: 15, backgroundColor: Colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  saveText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
});
