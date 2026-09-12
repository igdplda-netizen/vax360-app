import { View, Text, StyleSheet, TouchableOpacity, ScrollView, useColorScheme } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useApp } from '../context/AppContext';
import { Colors } from '../constants/colors';
import { getAdministrationSite, VACCINE_SCHEDULE } from '../constants/vaccines';
import { Ionicons } from '@expo/vector-icons';
import { shadows } from '../utils/shadows';

const CATEGORY_COLORS = {
  mandatory:   { bg: '#dbeafe', text: '#1e40af', icon: 'shield-checkmark' as const },
  recommended: { bg: '#fef3c7', text: '#92400e', icon: 'star' as const },
  travel:      { bg: '#e0e7ff', text: '#3730a3', icon: 'airplane' as const },
};

export default function VaccineInfoScreen() {
  const { vaccineId } = useLocalSearchParams<{ vaccineId: string }>();
  const { t, state } = useApp();
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const isPt = state.language === 'pt';

  const vaccine = VACCINE_SCHEDULE.find(v => v.id === vaccineId);

  if (!vaccine) {
    return (
      <View style={[styles.container, {
        backgroundColor: isDark ? Colors.background.dark : Colors.background.light,
        justifyContent: 'center', alignItems: 'center',
      }]}>
        <Ionicons name="alert-circle-outline" size={48} color={Colors.danger} />
        <Text style={{ color: Colors.danger, marginTop: 12, fontWeight: '600' }}>Vacina não encontrada.</Text>
      </View>
    );
  }

  const name          = isPt ? vaccine.namePt : vaccine.nameEn;
  const description   = isPt ? vaccine.descriptionPt : vaccine.description;
  const benefits      = isPt ? vaccine.benefitsPt : vaccine.benefits;
  const sideEffects   = isPt ? vaccine.sideEffectsPt : vaccine.sideEffects;
  const age           = isPt ? vaccine.ageLabelPt : vaccine.ageLabel;
  const category      = vaccine.category || 'mandatory';
  const catStyle      = CATEGORY_COLORS[category];
  const categoryLabel = t(
    category === 'mandatory' ? 'mandatoryVaccines'
    : category === 'recommended' ? 'recommendedVaccines'
    : 'travelVaccines'
  );
  const info = vaccine.detailedInfo;
  const administration = getAdministrationSite(vaccine);

  const bg   = isDark ? Colors.background.dark : Colors.background.light;
  const surf = isDark ? Colors.surface.dark : Colors.surface.light;
  const tc   = isDark ? Colors.text.dark.primary : Colors.text.light.primary;
  const ts   = isDark ? Colors.text.dark.secondary : Colors.text.light.secondary;

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Top bar */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.6}>
            <Ionicons name="arrow-back" size={24} color={tc} />
          </TouchableOpacity>
        </View>

        {/* Hero card */}
        <View style={[styles.heroCard, { backgroundColor: surf, ...shadows.lg() }]}>
          {/* Category + dose badges */}
          <View style={styles.badgeRow}>
            <View style={[styles.catBadge, { backgroundColor: catStyle.bg }]}>
              <Ionicons name={catStyle.icon} size={13} color={catStyle.text} />
              <Text style={[styles.catText, { color: catStyle.text }]}>{categoryLabel}</Text>
            </View>
            <View style={[styles.doseBadge, { backgroundColor: Colors.primary + '15' }]}>
              <Ionicons name="repeat" size={13} color={Colors.primary} />
              <Text style={[styles.doseText, { color: Colors.primary }]}>
                {isPt ? `Dose ${vaccine.doseNumber} de ${vaccine.doses}` : `Dose ${vaccine.doseNumber} of ${vaccine.doses}`}
              </Text>
            </View>
          </View>

          <Text style={[styles.heroName, { color: tc }]}>{name}</Text>
          <Text style={[styles.heroDesc, { color: ts }]}>{description}</Text>

          {/* Quick meta */}
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={15} color={Colors.primary} />
              <Text style={[styles.metaLabel, { color: ts }]}>{age}</Text>
            </View>
            <View style={styles.metaDivider} />
            <View style={styles.metaItem}>
              <Ionicons name="repeat-outline" size={15} color={Colors.primary} />
              <Text style={[styles.metaLabel, { color: ts }]}>
                {isPt ? `${vaccine.doses} dose${vaccine.doses > 1 ? 's' : ''}` : `${vaccine.doses} dose${vaccine.doses > 1 ? 's' : ''}`}
              </Text>
            </View>
          </View>
        </View>

        {/* Administration site */}
        <View style={[styles.section, { backgroundColor: surf }]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconBox, { backgroundColor: Colors.primary + '18' }]}>
              <Ionicons name="body" size={18} color={Colors.primary} />
            </View>
            <Text style={[styles.sectionTitle, { color: tc }]}>
              {isPt ? 'Local de aplicação' : 'Administration site'}
            </Text>
          </View>
          <Text style={[styles.infoText, { color: ts }]}>
            {isPt ? administration.sitePt : administration.site}
          </Text>
          <Text style={[styles.infoText, { color: ts, marginTop: 6 }]}>
            {isPt ? 'Via' : 'Route'}: {isPt ? administration.routePt : administration.route}
          </Text>
          <Text style={[styles.infoText, { color: ts, marginTop: 8, fontStyle: 'italic' }]}>
            {isPt
              ? 'O profissional de saúde confirmará o local adequado conforme a idade, o produto e as orientações locais.'
              : 'The health professional will confirm the appropriate site based on age, product and local guidance.'}
          </Text>
        </View>

        {/* Benefits */}
        <View style={[styles.section, { backgroundColor: surf }]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconBox, { backgroundColor: '#dcfce7' }]}>
              <Ionicons name="shield-checkmark" size={18} color={Colors.success} />
            </View>
            <Text style={[styles.sectionTitle, { color: tc }]}>{t('benefits')}</Text>
          </View>
          {benefits.map((b, i) => (
            <View key={i} style={[styles.listItem, i < benefits.length - 1 && { borderBottomWidth: 1, borderBottomColor: isDark ? '#ffffff10' : '#f1f5f9' }]}>
              <Ionicons name="checkmark-circle" size={16} color={Colors.success} style={styles.listIcon} />
              <Text style={[styles.listText, { color: ts }]}>{b}</Text>
            </View>
          ))}
        </View>

        {/* Side Effects */}
        <View style={[styles.section, { backgroundColor: surf }]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconBox, { backgroundColor: '#fef9c3' }]}>
              <Ionicons name="alert-circle" size={18} color={Colors.warning} />
            </View>
            <Text style={[styles.sectionTitle, { color: tc }]}>{t('sideEffects')}</Text>
          </View>
          {sideEffects.map((s, i) => (
            <View key={i} style={[styles.listItem, i < sideEffects.length - 1 && { borderBottomWidth: 1, borderBottomColor: isDark ? '#ffffff10' : '#f1f5f9' }]}>
              <Ionicons name="remove-circle-outline" size={16} color={Colors.warning} style={styles.listIcon} />
              <Text style={[styles.listText, { color: ts }]}>{s}</Text>
            </View>
          ))}
        </View>

        {/* Detailed info */}
        {info && (
          <>
            {/* Mechanism */}
            <View style={[styles.section, { backgroundColor: surf }]}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIconBox, { backgroundColor: Colors.primary + '18' }]}>
                  <Ionicons name="flask" size={18} color={Colors.primary} />
                </View>
                <Text style={[styles.sectionTitle, { color: tc }]}>{t('mechanism')}</Text>
              </View>
              <Text style={[styles.infoText, { color: ts }]}>{isPt ? info.mechanismPt : info.mechanism}</Text>
            </View>

            {/* Composition */}
            <View style={[styles.section, { backgroundColor: surf }]}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIconBox, { backgroundColor: '#f3e8ff' }]}>
                  <Ionicons name="beaker" size={18} color="#8b5cf6" />
                </View>
                <Text style={[styles.sectionTitle, { color: tc }]}>{t('composition')}</Text>
              </View>
              <Text style={[styles.infoText, { color: ts }]}>{isPt ? info.compositionPt : info.composition}</Text>
            </View>

            {/* Contraindications */}
            {(isPt ? info.contraindicationsPt : info.contraindications).length > 0 && (
              <View style={[styles.section, { backgroundColor: surf }]}>
                <View style={styles.sectionHeader}>
                  <View style={[styles.sectionIconBox, { backgroundColor: '#fee2e2' }]}>
                    <Ionicons name="warning" size={18} color={Colors.danger} />
                  </View>
                  <Text style={[styles.sectionTitle, { color: tc }]}>{t('contraindications')}</Text>
                </View>
                {(isPt ? info.contraindicationsPt : info.contraindications).map((c, i) => (
                  <View key={i} style={[styles.listItem, i < info.contraindications.length - 1 && { borderBottomWidth: 1, borderBottomColor: isDark ? '#ffffff10' : '#f1f5f9' }]}>
                    <Ionicons name="close-circle" size={16} color={Colors.danger} style={styles.listIcon} />
                    <Text style={[styles.listText, { color: ts }]}>{c}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Storage */}
            <View style={[styles.section, { backgroundColor: surf, marginBottom: 24 }]}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIconBox, { backgroundColor: '#e0f2fe' }]}>
                  <Ionicons name="snow" size={18} color="#0ea5e9" />
                </View>
                <Text style={[styles.sectionTitle, { color: tc }]}>{t('storageInfo')}</Text>
              </View>
              <Text style={[styles.infoText, { color: ts }]}>{isPt ? info.storagePt : info.storage}</Text>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 40 },

  topBar: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },

  heroCard: { borderRadius: 24, padding: 20, marginBottom: 14 },
  badgeRow: { flexDirection: 'row', gap: 8, marginBottom: 14, flexWrap: 'wrap' },
  catBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  catText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },
  doseBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  doseText: { fontSize: 11, fontWeight: '700' },

  heroName: { fontSize: 22, fontWeight: '800', marginBottom: 10, lineHeight: 28 },
  heroDesc: { fontSize: 14, lineHeight: 22, marginBottom: 16 },

  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaLabel: { fontSize: 13, fontWeight: '500' },
  metaDivider: { width: 1, height: 16, backgroundColor: '#e2e8f0' },

  section: { borderRadius: 16, padding: 16, marginBottom: 12, ...shadows.sm() },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  sectionIconBox: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { fontSize: 15, fontWeight: '700' },

  listItem: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 8 },
  listIcon: { marginTop: 1, marginRight: 10, flexShrink: 0 },
  listText: { fontSize: 14, flex: 1, lineHeight: 20 },

  infoText: { fontSize: 14, lineHeight: 22 },
});
