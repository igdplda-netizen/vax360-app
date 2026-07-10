import { View, Text, StyleSheet, TouchableOpacity, ScrollView, useColorScheme } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useApp } from '../context/AppContext';
import { Colors } from '../constants/colors';
import { VACCINE_SCHEDULE } from '../constants/vaccines';
import { Ionicons } from '@expo/vector-icons';
import { formatToDeviceDate, promptForDate } from '../utils/date';

const CATEGORY_COLORS = {
  mandatory: { bg: '#dbeafe', text: '#1e40af', icon: 'shield-checkmark' as const },
  recommended: { bg: '#fef3c7', text: '#92400e', icon: 'star' as const },
  travel: { bg: '#e0e7ff', text: '#3730a3', icon: 'airplane' as const },
};

export default function VaccineDetailScreen() {
  const { childId, vaccineId } = useLocalSearchParams<{ childId: string; vaccineId: string }>();
  const { state, t, markVaccineCompleted, markVaccinePending, getVaccinesForChild } = useApp();
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const child = state.children.find(c => c.id === childId);
  const vaccine = VACCINE_SCHEDULE.find(v => v.id === vaccineId);

  if (!child || !vaccine) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? Colors.background.dark : Colors.background.light, justifyContent: 'center', alignItems: 'center' }]}>
        <Text>Vaccine not found</Text>
      </View>
    );
  }

  const vaccines = getVaccinesForChild(child);
  const vData = vaccines.find(v => v.id === vaccineId);
  const isCompleted = vData?.status === 'completed';
  const isPt = state.language === 'pt';

  const handleToggle = () => {
    if (isCompleted) {
      markVaccinePending(childId, vaccineId);
    } else {
      promptForDate(isPt ? 'pt' : 'en', (dateStr) => {
        markVaccineCompleted(childId, vaccineId, dateStr);
      });
    }
  };

  const name = isPt ? vaccine.namePt : vaccine.nameEn;
  const description = isPt ? vaccine.descriptionPt : vaccine.description;
  const benefits = isPt ? vaccine.benefitsPt : vaccine.benefits;
  const sideEffects = isPt ? vaccine.sideEffectsPt : vaccine.sideEffects;
  const category = vaccine.category || 'mandatory';
  const catStyle = CATEGORY_COLORS[category];
  const categoryLabel = t(category === 'mandatory' ? 'mandatoryVaccines' : category === 'recommended' ? 'recommendedVaccines' : 'travelVaccines');
  const info = vaccine.detailedInfo;

  return (
    <View style={[styles.container, { backgroundColor: isDark ? Colors.background.dark : Colors.background.light }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => {
            router.replace('/(tabs)');
          }} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={isDark ? Colors.text.dark.primary : Colors.text.light.primary} />
          </TouchableOpacity>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.card}>
          <View style={styles.badgeRow}>
            <View style={[styles.statusBadge, { backgroundColor: isCompleted ? Colors.vaccine.completed + '15' : Colors.vaccine.pending + '15' }]}>
              <Ionicons name={isCompleted ? 'checkmark-circle' : 'ellipse'} size={16} color={isCompleted ? Colors.vaccine.completed : Colors.vaccine.pending} />
              <Text style={[styles.statusText, { color: isCompleted ? Colors.vaccine.completed : Colors.vaccine.pending }]}>
                {isCompleted ? t('completed') : t('pending')}
              </Text>
            </View>
            <View style={[styles.categoryBadge, { backgroundColor: catStyle.bg }]}>
              <Ionicons name={catStyle.icon} size={14} color={catStyle.text} />
              <Text style={[styles.categoryText, { color: catStyle.text }]}>{categoryLabel}</Text>
            </View>
          </View>

          <Text style={[styles.name, { color: isDark ? Colors.text.dark.primary : Colors.text.light.primary }]}>
            {name}
          </Text>
          <Text style={[styles.description, { color: isDark ? Colors.text.dark.secondary : Colors.text.light.secondary }]}>
            {description}
          </Text>

          <View style={styles.metaRow}>
            <View style={styles.meta}>
              <Ionicons name="calendar" size={16} color={Colors.primary} />
              <Text style={[styles.metaText, { color: isDark ? Colors.text.dark.secondary : Colors.text.light.secondary }]}>
                {isCompleted 
                  ? `${isPt ? 'Aplicada em' : 'Applied on'}: ${vData?.completedDate ? formatToDeviceDate(vData.completedDate) : ''}`
                  : `${t('scheduledFor')}: ${vData?.scheduledDate ? formatToDeviceDate(vData.scheduledDate) : ''}`}
              </Text>
            </View>
            <View style={styles.meta}>
              <Ionicons name="timer" size={16} color={Colors.primary} />
              <Text style={[styles.metaText, { color: isDark ? Colors.text.dark.secondary : Colors.text.light.secondary }]}>
                {isPt ? vaccine.ageLabelPt : vaccine.ageLabel}
              </Text>
            </View>
            <View style={styles.meta}>
              <Ionicons name="repeat" size={16} color={Colors.primary} />
              <Text style={[styles.metaText, { color: isDark ? Colors.text.dark.secondary : Colors.text.light.secondary }]}>
                {isPt ? `Dose ${vaccine.doseNumber} de ${vaccine.doses}` : `Dose ${vaccine.doseNumber} of ${vaccine.doses}`}
              </Text>
            </View>
          </View>
        </View>

        {/* Benefits */}
        <View style={[styles.sectionCard, { backgroundColor: isDark ? Colors.surface.dark : Colors.surface.light }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="shield-checkmark" size={20} color={Colors.success} />
            <Text style={[styles.sectionTitle, { color: isDark ? Colors.text.dark.primary : Colors.text.light.primary }]}>
              {t('benefits')}
            </Text>
          </View>
          {benefits.map((b, i) => (
            <View key={i} style={[styles.listItem, i < benefits.length - 1 && styles.listItemBorder]}>
              <Ionicons name="checkmark" size={16} color={Colors.success} />
              <Text style={[styles.listText, { color: isDark ? Colors.text.dark.secondary : Colors.text.light.secondary }]}>{b}</Text>
            </View>
          ))}
        </View>

        {/* Side Effects */}
        <View style={[styles.sectionCard, { backgroundColor: isDark ? Colors.surface.dark : Colors.surface.light }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="alert-circle" size={20} color={Colors.warning} />
            <Text style={[styles.sectionTitle, { color: isDark ? Colors.text.dark.primary : Colors.text.light.primary }]}>
              {t('sideEffects')}
            </Text>
          </View>
          {sideEffects.map((s, i) => (
            <View key={i} style={[styles.listItem, i < sideEffects.length - 1 && styles.listItemBorder]}>
              <Ionicons name="remove" size={16} color={Colors.warning} />
              <Text style={[styles.listText, { color: isDark ? Colors.text.dark.secondary : Colors.text.light.secondary }]}>{s}</Text>
            </View>
          ))}
        </View>

        {/* Detailed Info */}
        {info && (
          <>
            <View style={[styles.sectionCard, { backgroundColor: isDark ? Colors.surface.dark : Colors.surface.light }]}>
              <View style={styles.sectionHeader}>
                <Ionicons name="flask" size={20} color={Colors.primary} />
                <Text style={[styles.sectionTitle, { color: isDark ? Colors.text.dark.primary : Colors.text.light.primary }]}>
                  {t('mechanism')}
                </Text>
              </View>
              <Text style={[styles.infoText, { color: isDark ? Colors.text.dark.secondary : Colors.text.light.secondary }]}>
                {isPt ? info.mechanismPt : info.mechanism}
              </Text>
            </View>

            <View style={[styles.sectionCard, { backgroundColor: isDark ? Colors.surface.dark : Colors.surface.light }]}>
              <View style={styles.sectionHeader}>
                <Ionicons name="beaker" size={20} color="#8b5cf6" />
                <Text style={[styles.sectionTitle, { color: isDark ? Colors.text.dark.primary : Colors.text.light.primary }]}>
                  {t('composition')}
                </Text>
              </View>
              <Text style={[styles.infoText, { color: isDark ? Colors.text.dark.secondary : Colors.text.light.secondary }]}>
                {isPt ? info.compositionPt : info.composition}
              </Text>
            </View>

            {info.contraindications.length > 0 && (
              <View style={[styles.sectionCard, { backgroundColor: isDark ? Colors.surface.dark : Colors.surface.light }]}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="warning" size={20} color={Colors.danger} />
                  <Text style={[styles.sectionTitle, { color: isDark ? Colors.text.dark.primary : Colors.text.light.primary }]}>
                    {t('contraindications')}
                  </Text>
                </View>
                {(isPt ? info.contraindicationsPt : info.contraindications).map((c, i) => (
                  <View key={i} style={[styles.listItem, i < info.contraindications.length - 1 && styles.listItemBorder]}>
                    <Ionicons name="close-circle" size={16} color={Colors.danger} />
                    <Text style={[styles.listText, { color: isDark ? Colors.text.dark.secondary : Colors.text.light.secondary }]}>{c}</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={[styles.sectionCard, { backgroundColor: isDark ? Colors.surface.dark : Colors.surface.light, marginBottom: 20 }]}>
              <View style={styles.sectionHeader}>
                <Ionicons name="snow" size={20} color="#0ea5e9" />
                <Text style={[styles.sectionTitle, { color: isDark ? Colors.text.dark.primary : Colors.text.light.primary }]}>
                  {t('storageInfo')}
                </Text>
              </View>
              <Text style={[styles.infoText, { color: isDark ? Colors.text.dark.secondary : Colors.text.light.secondary }]}>
                {isPt ? info.storagePt : info.storage}
              </Text>
            </View>
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: isCompleted ? Colors.danger : Colors.primary }]}
          onPress={handleToggle}
          activeOpacity={0.8}
        >
          <Ionicons name={isCompleted ? 'close-circle' : 'checkmark-circle'} size={22} color="#fff" />
          <Text style={styles.actionBtnText}>
            {isCompleted ? t('undo') : t('markDone')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, paddingTop: 60, paddingBottom: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  card: { marginBottom: 20 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  statusText: { fontSize: 13, fontWeight: '700' },
  categoryBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  categoryText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  name: { fontSize: 24, fontWeight: '800', marginBottom: 8 },
  description: { fontSize: 15, lineHeight: 22, marginBottom: 16 },
  metaRow: { gap: 8 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 14, fontWeight: '500' },
  sectionCard: { borderRadius: 16, padding: 16, marginBottom: 12, boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.03)', elevation: 1 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  listItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 8 },
  listItemBorder: { borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  listText: { fontSize: 14, flex: 1, lineHeight: 20 },
  infoText: { fontSize: 14, lineHeight: 22 },
  footer: { paddingHorizontal: 20, paddingBottom: 32, paddingTop: 8 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 16, gap: 8 },
  actionBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
