import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useColorScheme, ActivityIndicator, Alert, Modal, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp, Child, VaccineStatus } from '../../context/AppContext';
import { Colors } from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { exportCertificatePdf } from '../../utils/pdf-exporter';
import { formatToDeviceDate, promptForDate } from '../../utils/date';
import { VACCINE_SCHEDULE } from '../../constants/vaccines';
import { shadows } from '../../utils/shadows';

const groups = [
  { key: 'birth', label: 'Ao Nascer', labelEn: 'At Birth' },
  { key: '2m', label: '2 meses', labelEn: '2 months' },
  { key: '3m', label: '3 meses', labelEn: '3 months' },
  { key: '4m', label: '4 meses', labelEn: '4 months' },
  { key: '5m', label: '5 meses', labelEn: '5 months' },
  { key: '6m', label: '6 meses', labelEn: '6 months' },
  { key: '9m', label: '9 meses', labelEn: '9 months' },
  { key: '12m', label: '12 meses', labelEn: '12 months' },
  { key: '15m', label: '15 meses', labelEn: '15 months' },
  { key: '18m', label: '18 meses', labelEn: '18 months' },
  { key: '2y', label: '2 anos', labelEn: '2 years' },
  { key: '4y', label: '4-6 anos', labelEn: '4-6 years' },
  { key: '9y', label: '9-14 anos', labelEn: '9-14 years' },
  { key: '10y', label: '10 anos', labelEn: '10 years' },
  { key: '11y', label: '11-12 anos', labelEn: '11-12 years' },
];

export default function ScheduleScreen() {
  const { state, t, getVaccinesForChild, markVaccineCompleted, markVaccinePending } = useApp();
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const [exporting, setExporting] = useState(false);
  const [pdfDataUri, setPdfDataUri] = useState<string | null>(null);
  const [pdfDownloadFn, setPdfDownloadFn] = useState<(() => void) | null>(null);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const primaryColor = state.partnerBranding?.primaryColor || Colors.primary;
  const currentChild = state.children.find(c => c.id === state.currentChildId);

  React.useEffect(() => {
    if (!state.token) {
      router.replace('/login');
    }
  }, [state.token]);

  if (!state.token) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? Colors.background.dark : Colors.background.light, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!currentChild) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? Colors.background.dark : Colors.background.light, justifyContent: 'center', alignItems: 'center' }]}>
        <Ionicons name="people-outline" size={48} color={isDark ? Colors.text.dark.tertiary : Colors.text.light.tertiary} />
        <Text style={[styles.placeholderText, { color: isDark ? Colors.text.dark.secondary : Colors.text.light.secondary }]}>
          {t('noChildren')}
        </Text>
      </View>
    );
  }

  const vaccines = getVaccinesForChild(currentChild);

  const getStatusColor = (status: VaccineStatus) => {
    switch (status) {
      case 'completed': return Colors.vaccine.completed;
      case 'overdue': return Colors.vaccine.overdue;
      case 'upcoming': return Colors.vaccine.upcoming;
      default: return Colors.vaccine.pending;
    }
  };

  const handleToggle = (vaccineId: string, currentStatus: VaccineStatus) => {
    if (currentStatus === 'completed') {
      markVaccinePending(currentChild.id, vaccineId);
    } else {
      promptForDate(state.language === 'pt' ? 'pt' : 'en', (dateStr) => {
        markVaccineCompleted(currentChild.id, vaccineId, dateStr);
      });
    }
  };

  // PDF Export logic
  const handleExportPDF = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const result = await exportCertificatePdf(currentChild, vaccines, state, t, primaryColor);
      if (result) {
        setPdfDataUri(result.dataUri);
        setPdfDownloadFn(() => result.download);
        setShowPdfModal(true);
      }
    } catch (err: any) {
      Alert.alert('Erro ao Exportar', err.message || 'Falha ao gerar certificado PDF.');
    }
    setExporting(false);
  };

  const closePdfModal = () => {
    setShowPdfModal(false);
    setPdfDataUri(null);
    setPdfDownloadFn(null);
  };

  const [expandedCategory, setExpandedCategory] = useState<Record<string, boolean>>({ mandatory: true, recommended: false, travel: false });

  const toggleCategory = (cat: string) => {
    setExpandedCategory(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const categories = [
    { key: 'mandatory', label: t('mandatoryVaccines') || 'Vacinas Obrigatórias', icon: 'shield-checkmark' as const, color: '#1e40af', bg: '#dbeafe' },
    { key: 'recommended', label: t('recommendedVaccines') || 'Recomendadas (OMS)', icon: 'star' as const, color: '#92400e', bg: '#fef3c7' },
    { key: 'travel', label: t('travelVaccines') || 'Vacinas para Viajantes', icon: 'airplane' as const, color: '#3730a3', bg: '#e0e7ff' },
  ];

  const renderVaccineSection = (categoryKey: string) => {
    const categoryVaccineIds = VACCINE_SCHEDULE.filter(v => (v.category || 'mandatory') === categoryKey).map(v => v.id);
    const categoryVaccines = vaccines.filter(v => categoryVaccineIds.includes(v.id));

    return groups.map(group => {
      const groupVaccines = categoryVaccines.filter(v => v.group === group.key);
      if (groupVaccines.length === 0) return null;

      return (
        <View key={group.key} style={styles.group}>
          <Text style={[styles.groupLabel, { color: isDark ? Colors.text.dark.secondary : Colors.text.light.secondary }]}>
            {state.language === 'pt' ? group.label : group.labelEn}
          </Text>
          <View style={[styles.groupCard, { backgroundColor: isDark ? Colors.surface.dark : Colors.surface.light }]}>
            {groupVaccines.map((v, idx) => (
              <TouchableOpacity
                key={v.id}
                style={[styles.vaccineRow, idx < groupVaccines.length - 1 && styles.vaccineRowBorder]}
                onPress={() => handleToggle(v.id, v.status)}
                activeOpacity={0.6}
              >
                <View style={[styles.statusDot, { backgroundColor: getStatusColor(v.status) }]} />
                <View style={styles.vaccineInfo}>
                  <Text style={[styles.vaccineName, { color: isDark ? Colors.text.dark.primary : Colors.text.light.primary }]}>
                    {state.language === 'pt' ? v.namePt : v.nameEn}
                  </Text>
                  <Text style={[styles.vaccineStatus, { color: getStatusColor(v.status) }]}>
                    {v.status === 'completed' 
                      ? (v.completedDate 
                        ? `${state.language === 'pt' ? 'Tomada em' : 'Taken on'}: ${formatToDeviceDate(v.completedDate)}` 
                        : t('completed')) 
                      : formatToDeviceDate(v.scheduledDate)}
                  </Text>
                </View>
                {v.status === 'completed' ? (
                  <Ionicons name="checkmark-circle" size={24} color={Colors.vaccine.completed} />
                ) : (
                  <View style={[styles.checkbox, { borderColor: isDark ? Colors.border.dark : Colors.border.light }]} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      );
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? Colors.background.dark : Colors.background.light }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header Title with Export PDF */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: isDark ? Colors.text.dark.primary : Colors.text.light.primary }]}>
            {currentChild.name} — {t('schedule')}
          </Text>
          <TouchableOpacity
            style={[styles.pdfBtn, { backgroundColor: primaryColor }]}
            onPress={handleExportPDF}
            disabled={exporting}
            activeOpacity={0.8}
          >
            {exporting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="document-text" size={16} color="#fff" />
                <Text style={styles.pdfBtnText}>PDF</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {categories.map(cat => {
          const catVaccineIds = VACCINE_SCHEDULE.filter(v => (v.category || 'mandatory') === cat.key).map(v => v.id);
          const catVaccines = vaccines.filter(v => catVaccineIds.includes(v.id));
          if (catVaccines.length === 0) return null;

          const isExpanded = expandedCategory[cat.key] !== false;
          const completedCount = catVaccines.filter(v => v.status === 'completed').length;

          return (
            <View key={cat.key} style={{ marginBottom: 8 }}>
              <TouchableOpacity
                style={[styles.categoryHeader, { backgroundColor: cat.bg }]}
                onPress={() => toggleCategory(cat.key)}
                activeOpacity={0.7}
              >
                <View style={styles.categoryHeaderLeft}>
                  <Ionicons name={cat.icon} size={18} color={cat.color} />
                  <Text style={[styles.categoryLabel, { color: cat.color }]}>{cat.label}</Text>
                </View>
                <View style={styles.categoryHeaderRight}>
                  <Text style={[styles.categoryCount, { color: cat.color }]}>{completedCount}/{catVaccines.length}</Text>
                  <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={18} color={cat.color} />
                </View>
              </TouchableOpacity>
              {isExpanded && renderVaccineSection(cat.key)}
            </View>
          );
        })}
      </ScrollView>

      {/* PDF Viewer Modal (Web only) */}
      {showPdfModal && pdfDataUri && (
        <Modal
          visible={showPdfModal}
          transparent={true}
          animationType="fade"
          onRequestClose={closePdfModal}
        >
          <View style={styles.pdfOverlay}>
            <View style={[styles.pdfModalContent, { backgroundColor: isDark ? Colors.surface.dark : Colors.surface.light }]}>
              <View style={[styles.pdfModalHeader, { borderBottomColor: isDark ? Colors.border.dark : Colors.border.light }]}>
                <Text style={[styles.pdfModalTitle, { color: isDark ? Colors.text.dark.primary : Colors.text.light.primary }]}>
                  {t('certificate') || 'Certificado de Vacinação'}
                </Text>
                <TouchableOpacity
                  onPress={closePdfModal}
                  style={styles.pdfCloseBtn}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={24} color={isDark ? Colors.text.dark.primary : Colors.text.light.primary} />
                </TouchableOpacity>
              </View>
              <View style={styles.pdfContainer}>
                {Platform.OS === 'web' ? (
                  <embed
                    src={pdfDataUri}
                    type="application/pdf"
                    style={{ width: '100%', height: '100%', border: 'none', borderRadius: 8 }}
                  />
                ) : (
                  <Text style={{ color: isDark ? Colors.text.dark.primary : Colors.text.light.primary, textAlign: 'center', marginTop: 40 }}>
                    {state.language === 'pt' ? 'PDF gerado com sucesso!' : 'PDF generated successfully!'}
                  </Text>
                )}
              </View>
              <View style={[styles.pdfModalFooter, { borderTopColor: isDark ? Colors.border.dark : Colors.border.light }]}>
                <TouchableOpacity
                  style={[styles.pdfDownloadBtn, { backgroundColor: Colors.primary }]}
                  onPress={() => {
                    if (pdfDownloadFn) pdfDownloadFn();
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons name="download-outline" size={20} color="#fff" />
                  <Text style={styles.pdfDownloadBtnText}>
                    {state.language === 'pt' ? 'Descarregar PDF' : 'Download PDF'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, paddingTop: 60, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerTitle: { fontSize: 18, fontWeight: '800', flex: 1 },
  pdfBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 10, gap: 6 },
  pdfBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  group: { marginBottom: 16 },
  groupLabel: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase', marginBottom: 8, letterSpacing: 0.5 },
  groupCard: { borderRadius: 16, overflow: 'hidden', ...shadows.sm() },
  vaccineRow: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  vaccineRowBorder: { borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  vaccineInfo: { flex: 1 },
  vaccineName: { fontSize: 15, fontWeight: '600' },
  vaccineStatus: { fontSize: 12, marginTop: 2, fontWeight: '500' },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2 },
  placeholderText: { fontSize: 14, textAlign: 'center', marginTop: 12 },
  categoryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 14, marginBottom: 12 },
  categoryHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  categoryHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  categoryLabel: { fontSize: 14, fontWeight: '800', letterSpacing: 0.3 },
  categoryCount: { fontSize: 13, fontWeight: '700' },
  pdfOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  pdfModalContent: {
    width: '90%',
    maxWidth: 800,
    height: '85%',
    borderRadius: 20,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    ...shadows.xl(),
  },
  pdfModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  pdfModalTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  pdfCloseBtn: {
    padding: 4,
  },
  pdfContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 10,
  },
  pdfModalFooter: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pdfDownloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  pdfDownloadBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});
