import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/colors';
import { useApp } from '../context/AppContext';
import type { OnboardingConfig, OnboardingLanguage } from '../constants/onboarding';
import { clearOnboardingPreview, getOnboardingPreview } from '../utils/onboarding-preview';

type Language = 'pt' | 'en' | 'fr' | 'af';
type Copy = {
  skip: string;
  stepLabel: string;
  eyebrow: string;
  title: string;
  body: string;
  note: string;
  back: string;
  next: string;
  enter: string;
  artLabel: string;
};

const copy: Record<Language, Copy[]> = {
  pt: [
    {
      stepLabel: 'Passo',
      skip: 'Saltar',
      eyebrow: 'Conheça o Vax360',
      title: 'Informação clara. Sem precisar de conta.',
      body: 'Explore informações sobre vacinas e encontre respostas úteis para cuidar de quem mais importa.',
      note: 'Pode começar a explorar agora.',
      back: 'Voltar',
      next: 'Seguinte',
      enter: 'Entrar na aplicação',
      artLabel: 'Informação de saúde ao seu alcance',
    },
    {
      stepLabel: 'Passo',
      skip: 'Saltar',
      eyebrow: 'Um plano para cada idade',
      title: 'Saiba o que vem a seguir.',
      body: 'Consulte o calendário de vacinação e veja como cada dose ajuda a proteger o seu filho ao longo do crescimento.',
      note: 'As vacinas ajudam a proteger em cada etapa.',
      back: 'Voltar',
      next: 'Seguinte',
      enter: 'Entrar na aplicação',
      artLabel: 'Calendário de vacinação',
    },
    {
      stepLabel: 'Passo',
      skip: 'Saltar',
      eyebrow: 'Os registos da sua família',
      title: 'Adicione crianças quando estiver pronto.',
      body: 'Com uma conta, pode guardar os dados e manter os registos de vacinação dos seus filhos seguros num só lugar.',
      note: 'Criar conta é opcional. Pode fazê-lo mais tarde.',
      back: 'Voltar',
      next: 'Seguinte',
      enter: 'Entrar na aplicação',
      artLabel: 'Registos familiares guardados em segurança',
    },
  ],
  en: [
    {
      stepLabel: 'Step',
      skip: 'Skip',
      eyebrow: 'Meet Vax360',
      title: 'Clear vaccine information. No account needed.',
      body: 'Explore vaccine information and find helpful answers for caring for the people who matter most.',
      note: 'You can start exploring right away.',
      back: 'Back',
      next: 'Next',
      enter: 'Enter the app',
      artLabel: 'Health information at your fingertips',
    },
    {
      stepLabel: 'Step',
      skip: 'Skip',
      eyebrow: 'A plan for every age',
      title: 'Know what comes next.',
      body: 'Explore the vaccination schedule and see how each dose helps protect your child as they grow.',
      note: 'Vaccines help protect at every stage.',
      back: 'Back',
      next: 'Next',
      enter: 'Enter the app',
      artLabel: 'Vaccination schedule',
    },
    {
      stepLabel: 'Step',
      skip: 'Skip',
      eyebrow: 'Your family’s records',
      title: 'Add children when you’re ready.',
      body: 'With an account, you can save your details and keep your children’s vaccination records safe in one place.',
      note: 'An account is optional. You can create one later.',
      back: 'Back',
      next: 'Next',
      enter: 'Enter the app',
      artLabel: 'Family records kept safe',
    },
  ],
  fr: [
    {
      stepLabel: 'Étape',
      skip: 'Passer',
      eyebrow: 'Découvrez Vax360',
      title: 'Des informations claires, sans compte.',
      body: 'Consultez les informations sur les vaccins et trouvez des réponses utiles pour prendre soin de votre famille.',
      note: 'Vous pouvez explorer dès maintenant.',
      back: 'Retour',
      next: 'Suivant',
      enter: 'Ouvrir l’application',
      artLabel: 'Les informations santé à portée de main',
    },
    {
      stepLabel: 'Étape',
      skip: 'Passer',
      eyebrow: 'Un calendrier pour chaque âge',
      title: 'Sachez ce qui vient ensuite.',
      body: 'Consultez le calendrier vaccinal et découvrez comment chaque dose aide à protéger votre enfant en grandissant.',
      note: 'Les vaccins aident à protéger à chaque étape.',
      back: 'Retour',
      next: 'Suivant',
      enter: 'Ouvrir l’application',
      artLabel: 'Calendrier vaccinal',
    },
    {
      stepLabel: 'Étape',
      skip: 'Passer',
      eyebrow: 'Les dossiers de votre famille',
      title: 'Ajoutez vos enfants quand vous le souhaitez.',
      body: 'Avec un compte, gardez vos informations et les dossiers de vaccination de vos enfants en sécurité, au même endroit.',
      note: 'Le compte est facultatif. Vous pourrez le créer plus tard.',
      back: 'Retour',
      next: 'Suivant',
      enter: 'Ouvrir l’application',
      artLabel: 'Dossiers familiaux protégés',
    },
  ],
  af: [
    {
      stepLabel: 'Stap',
      skip: 'Slaan oor',
      eyebrow: 'Ontmoet Vax360',
      title: 'Duidelike entstofinligting. Geen rekening nodig nie.',
      body: 'Verken entstofinligting en kry nuttige antwoorde om te help sorg vir die mense wat die meeste saak maak.',
      note: 'Jy kan dadelik begin verken.',
      back: 'Terug',
      next: 'Volgende',
      enter: 'Gaan na die toepassing',
      artLabel: 'Gesondheidsinligting binne jou bereik',
    },
    {
      stepLabel: 'Stap',
      skip: 'Slaan oor',
      eyebrow: '’n Plan vir elke ouderdom',
      title: 'Weet wat volgende kom.',
      body: 'Kyk na die entstofskedule en sien hoe elke dosis jou kind help beskerm terwyl hulle groei.',
      note: 'Entstowwe help beskerm in elke fase.',
      back: 'Terug',
      next: 'Volgende',
      enter: 'Gaan na die toepassing',
      artLabel: 'Entstofskedule',
    },
    {
      stepLabel: 'Stap',
      skip: 'Slaan oor',
      eyebrow: 'Jou gesin se rekords',
      title: 'Voeg kinders by wanneer jy gereed is.',
      body: 'Met ’n rekening kan jy jou besonderhede stoor en jou kinders se entstofrekords veilig op een plek hou.',
      note: '’n Rekening is opsioneel. Jy kan dit later skep.',
      back: 'Terug',
      next: 'Volgende',
      enter: 'Gaan na die toepassing',
      artLabel: 'Gesinsrekords veilig bewaar',
    },
  ],
};

export const BUILT_IN_ONBOARDING_COPY: Record<OnboardingLanguage, { eyebrow: string; title: string; body: string; note: string }[]> = {
  pt: copy.pt.map(({ eyebrow, title, body, note }) => ({ eyebrow, title, body, note })),
  en: copy.en.map(({ eyebrow, title, body, note }) => ({ eyebrow, title, body, note })),
  fr: copy.fr.map(({ eyebrow, title, body, note }) => ({ eyebrow, title, body, note })),
  af: copy.af.map(({ eyebrow, title, body, note }) => ({ eyebrow, title, body, note })),
};

const steps = [
  { icon: 'search-outline' as const, accent: '#E5A65B', mark: '01' },
  { icon: 'calendar-outline' as const, accent: '#4E9A8A', mark: '02' },
  { icon: 'folder-open-outline' as const, accent: '#D47C68', mark: '03' },
];

export default function OnboardingScreen() {
  const { completeOnboarding, state, onboardingConfig } = useApp();
  const router = useRouter();
  const params = useLocalSearchParams<{ preview?: string }>();
  const isPreview = params.preview === '1';
  const previewConfig = isPreview ? getOnboardingPreview() : null;
  const effectiveConfig: OnboardingConfig = previewConfig || onboardingConfig;
  const { width, height } = useWindowDimensions();
  const [step, setStep] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);
  const fade = useRef(new Animated.Value(1)).current;
  const isDark = state.theme === 'dark';
  const language: Language = state.language in copy ? state.language : 'pt';
  const configuredStep = effectiveConfig.steps.length ? effectiveConfig.steps[step] : undefined;
  const configuredText = configuredStep?.[language];
  const portugueseText = configuredStep?.pt;
  const baseCopy = copy[language][Math.min(step, copy[language].length - 1)];
  const currentCopy: Copy = configuredStep ? {
    ...baseCopy,
    eyebrow: configuredText?.eyebrow ?? portugueseText?.eyebrow ?? baseCopy.eyebrow,
    title: configuredText?.title ?? portugueseText?.title ?? baseCopy.title,
    body: configuredText?.body ?? portugueseText?.body ?? baseCopy.body,
    note: configuredText?.note ?? portugueseText?.note ?? baseCopy.note,
  } : baseCopy;
  const totalSteps = effectiveConfig.steps.length || 3;
  const isLastStep = step === totalSteps - 1;
  const palette = {
    background: isDark ? Colors.background.dark : '#F7F4EC',
    surface: isDark ? Colors.surface.dark : '#FFFEFA',
    text: isDark ? Colors.text.dark.primary : '#263D3A',
    muted: isDark ? Colors.text.dark.secondary : '#657875',
    border: isDark ? Colors.border.dark : '#E8E3D8',
    soft: isDark ? '#263B3A' : '#EAF1E8',
  };
  const isWide = width >= 760;
  const isCompact = !isWide && height < 740;

  useEffect(() => {
    fade.setValue(0);
    Animated.timing(fade, {
      toValue: 1,
      duration: 260,
      useNativeDriver: true,
    }).start();
  }, [step, fade]);

  if (isPreview && (!state.token || !['admin', 'superadmin'].includes(state.userRole || ''))) {
    return <Redirect href="/(tabs)" />;
  }
  if (isPreview && !previewConfig) return <Redirect href={'/admin-onboarding' as any} />;
  if (!isPreview && !onboardingConfig.enabled) return <Redirect href="/(tabs)" />;

  const changeStep = (nextStep: number) => {
    if (nextStep >= 0 && nextStep < totalSteps) setStep(nextStep);
  };

  const finish = async () => {
    if (isCompleting) return;
    if (isPreview) {
      clearOnboardingPreview();
      if (router.canGoBack()) router.back();
      else router.replace('/admin-onboarding' as any);
      return;
    }
    setIsCompleting(true);
    try {
      await completeOnboarding();
      router.replace('/(tabs)');
    } finally {
      setIsCompleting(false);
    }
  };

  const illustration = steps[step % steps.length];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.background }]}>
      <View style={styles.page}>
        <View style={[styles.topbar, { maxWidth: isWide ? 1040 : 560 }]}>
          <View style={styles.brand}>
            <View style={[styles.brandMark, { backgroundColor: Colors.primary }]}>
              <Ionicons name="medical" size={17} color="#FFFDF6" />
            </View>
            <Text style={[styles.brandName, { color: palette.text }]}>Vax360</Text>
          </View>
          <Pressable
            onPress={finish}
            disabled={isCompleting}
            accessibilityRole="button"
            accessibilityLabel={isPreview ? 'Voltar ao editor' : currentCopy.skip}
            hitSlop={10}
            style={({ pressed }) => [styles.skipButton, pressed && styles.pressed]}
          >
            <Text style={[styles.skipText, { color: palette.muted }]}>{isPreview ? 'Voltar ao editor' : currentCopy.skip}</Text>
            <Ionicons name={isPreview ? 'arrow-back' : 'arrow-forward'} size={15} color={palette.muted} />
          </Pressable>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { maxWidth: isWide ? 1040 : 560 }]}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={[styles.main, isWide && styles.mainWide]}>
            <Animated.View
              style={[
                styles.artPanel,
                isCompact && styles.artPanelCompact,
                { backgroundColor: palette.soft, opacity: fade },
                isWide && styles.artPanelWide,
              ]}
              accessibilityLabel={currentCopy.artLabel}
            >
              <View style={[styles.orbit, { borderColor: `${illustration.accent}40` }]} />
              <View style={[styles.orbit, styles.orbitInner, { borderColor: `${illustration.accent}35` }]} />
              <View style={[styles.sunDisc, { backgroundColor: `${illustration.accent}24` }]} />
              <View style={[styles.leafDisc, { backgroundColor: `${Colors.primary}16` }]} />
              <View style={[styles.illustrationCard, { backgroundColor: palette.surface }]}>
                <View style={[styles.illustrationIcon, { backgroundColor: `${illustration.accent}20` }]}>
                  <Ionicons name={illustration.icon} size={39} color={illustration.accent} />
                </View>
                <View style={styles.miniLines}>
                  <View style={[styles.miniLine, { backgroundColor: palette.border, width: '74%' }]} />
                  <View style={[styles.miniLine, { backgroundColor: palette.border, width: '51%' }]} />
                </View>
                <View style={[styles.checkBadge, { backgroundColor: Colors.primary }]}>
                  <Ionicons name="checkmark" size={17} color="#FFFDF6" />
                </View>
              </View>
              <View style={[styles.artCaption, { backgroundColor: palette.surface }]}>
                <View style={[styles.captionDot, { backgroundColor: illustration.accent }]} />
                <Text style={[styles.artCaptionText, { color: palette.text }]}>{currentCopy.artLabel}</Text>
              </View>
              <Text style={[styles.artIndex, { color: isDark ? '#B2C5B9' : '#91A29A' }]}>{illustration.mark}</Text>
            </Animated.View>

            <Animated.View style={[styles.message, isWide && styles.messageWide, { opacity: fade, transform: [{ translateY: fade.interpolate({ inputRange: [0, 1], outputRange: [9, 0] }) }] }]}>
              <View style={styles.progressHeading}>
                <Text style={[styles.eyebrow, { color: Colors.primary }]}>{currentCopy.eyebrow}</Text>
                <Text style={[styles.progressText, { color: palette.muted }]}>
                  {currentCopy.stepLabel} {step + 1}<Text style={styles.progressSlash}> / {totalSteps}</Text>
                </Text>
              </View>
              <View style={styles.progressTrack} accessibilityRole="progressbar" accessibilityValue={{ min: 1, max: totalSteps, now: step + 1 }}>
                {Array.from({ length: totalSteps }, (_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.progressSegment,
                      { backgroundColor: index <= step ? Colors.primary : palette.border },
                    ]}
                  />
                ))}
              </View>

              <Text style={[styles.title, isCompact && styles.titleCompact, { color: palette.text }]}>{currentCopy.title}</Text>
              <Text style={[styles.body, { color: palette.muted }]}>{currentCopy.body}</Text>

              <View style={[styles.note, { borderColor: palette.border }]}>
                <Ionicons name="information-circle-outline" size={18} color={illustration.accent} />
                <Text style={[styles.noteText, { color: palette.muted }]}>{currentCopy.note}</Text>
              </View>
            </Animated.View>
          </View>
        </ScrollView>

        <View style={[styles.footer, { maxWidth: isWide ? 1040 : 560, borderTopColor: palette.border }]}>
          <View style={styles.footerInner}>
            {step > 0 ? (
              <Pressable
                onPress={() => changeStep(step - 1)}
                accessibilityRole="button"
                accessibilityLabel={currentCopy.back}
                style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
              >
                <Ionicons name="arrow-back" size={18} color={palette.text} />
                <Text style={[styles.backText, { color: palette.text }]}>{currentCopy.back}</Text>
              </Pressable>
            ) : (
              <View style={styles.backPlaceholder} />
            )}
            <Pressable
              onPress={isLastStep ? finish : () => changeStep(step + 1)}
              disabled={isCompleting}
              accessibilityRole="button"
              accessibilityLabel={isLastStep ? currentCopy.enter : currentCopy.next}
              accessibilityState={{ disabled: isCompleting }}
              style={({ pressed }) => [
                styles.primaryButton,
                { backgroundColor: Colors.primary },
                pressed && !isCompleting && styles.primaryPressed,
                isCompleting && styles.disabledButton,
              ]}
            >
              <Text style={styles.primaryText}>
                {isLastStep ? currentCopy.enter : currentCopy.next}
              </Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFDF6" />
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  page: { flex: 1, minHeight: 0, alignItems: 'center', width: '100%' },
  topbar: {
    width: '100%',
    minHeight: 66,
    flexShrink: 0,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 9, flexShrink: 0 },
  brandMark: { width: 31, height: 31, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  brandName: { fontSize: 18, fontWeight: '800', letterSpacing: -0.45 },
  skipButton: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingVertical: 10, paddingLeft: 12, flexShrink: 1 },
  skipText: { fontSize: 14, fontWeight: '600', flexShrink: 1 },
  pressed: { opacity: 0.66 },
  scroll: { flex: 1, minHeight: 0, width: '100%' },
  scrollContent: { flexGrow: 1, alignSelf: 'center', width: '100%', paddingHorizontal: 24, paddingTop: 10, paddingBottom: 26 },
  main: { flexGrow: 1, flexShrink: 0, justifyContent: 'center' },
  mainWide: { flexDirection: 'row', alignItems: 'center', gap: 68, paddingVertical: 20 },
  artPanel: {
    height: 255,
    flexShrink: 0,
    width: '100%',
    borderRadius: 30,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 27,
  },
  artPanelCompact: { height: 200, marginBottom: 20 },
  artPanelWide: { flex: 1, height: 400, marginBottom: 0 },
  orbit: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbitInner: { width: 168, height: 168, borderRadius: 84, borderStyle: 'dashed' },
  sunDisc: { position: 'absolute', width: 95, height: 95, borderRadius: 48, top: 36, right: '18%' },
  leafDisc: { position: 'absolute', width: 76, height: 76, borderRadius: 38, bottom: 31, left: '16%' },
  illustrationCard: {
    width: 166,
    height: 146,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#314D43',
    shadowOpacity: 0.13,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 9 },
    elevation: 5,
  },
  illustrationIcon: { width: 75, height: 75, borderRadius: 25, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  miniLines: { gap: 5, alignItems: 'center' },
  miniLine: { height: 4, borderRadius: 3 },
  checkBadge: {
    position: 'absolute',
    top: 11,
    right: 11,
    width: 27,
    height: 27,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  artCaption: {
    position: 'absolute',
    bottom: 15,
    maxWidth: '92%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  captionDot: { width: 6, height: 6, borderRadius: 3 },
  artCaptionText: { fontSize: 11, fontWeight: '600', flexShrink: 1 },
  artIndex: { position: 'absolute', top: 18, right: 20, fontSize: 12, fontWeight: '700', letterSpacing: 1.4 },
  message: { width: '100%' },
  messageWide: { flex: 1, maxWidth: 420 },
  progressHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 11 },
  eyebrow: { flex: 1, fontSize: 12, fontWeight: '800', letterSpacing: 1.05, textTransform: 'uppercase' },
  progressText: { flexShrink: 0, fontSize: 12, fontWeight: '700', fontVariant: ['tabular-nums'] },
  progressSlash: { opacity: 0.58 },
  progressTrack: { flexDirection: 'row', gap: 5, marginBottom: 22 },
  progressSegment: { flex: 1, height: 4, borderRadius: 4 },
  title: { fontSize: 30, lineHeight: 36, fontWeight: '800', letterSpacing: -0.9, marginBottom: 12 },
  titleCompact: { fontSize: 26, lineHeight: 32 },
  body: { fontSize: 15, lineHeight: 23 },
  note: { flexDirection: 'row', alignItems: 'center', gap: 9, borderTopWidth: 1, paddingTop: 15, marginTop: 21 },
  noteText: { flex: 1, fontSize: 12, lineHeight: 18, fontWeight: '500' },
  footer: { width: '100%', flexShrink: 0, borderTopWidth: StyleSheet.hairlineWidth, paddingHorizontal: 24, paddingTop: 14, paddingBottom: 12 },
  footerInner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 14 },
  backButton: { minHeight: 50, flexShrink: 1, flexBasis: 88, flexDirection: 'row', alignItems: 'center', gap: 8 },
  backText: { fontSize: 14, fontWeight: '700', flexShrink: 1 },
  backPlaceholder: { flexBasis: 88, flexShrink: 1 },
  primaryButton: {
    flex: 1,
    minWidth: 0,
    minHeight: 52,
    paddingHorizontal: 21,
    paddingVertical: 12,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 11,
    shadowColor: '#284E42',
    shadowOpacity: 0.19,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  primaryPressed: { transform: [{ scale: 0.98 }], opacity: 0.9 },
  disabledButton: { opacity: 0.65 },
  primaryText: { color: '#FFFDF6', fontSize: 15, fontWeight: '700', flexShrink: 1, textAlign: 'center' },
});
