import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useColorScheme, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp, Child, VaccineStatus } from '../../context/AppContext';
import { Colors } from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { VACCINE_SCHEDULE, Vaccine } from '../../constants/vaccines';
import { jsPDF } from 'jspdf/dist/jspdf.es.min.js';
import QRCode from 'qrcode';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

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
];

export default function ScheduleScreen() {
  const { state, t, getVaccinesForChild, markVaccineCompleted, markVaccinePending } = useApp();
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const [exporting, setExporting] = useState(false);
  const primaryColor = state.partnerBranding?.primaryColor || Colors.primary;
  const currentChild = state.children.find(c => c.id === state.currentChildId);

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
      markVaccineCompleted(currentChild.id, vaccineId);
    }
  };

  // Helper formats
  const fmtDate = (dStr: string) => {
    try {
      const parts = dStr.split('-');
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    } catch {
      return dStr;
    }
  };

  const getAgeMonths = (birthDate: string) => {
    const birth = new Date(birthDate);
    const now = new Date();
    return (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  };

  // PDF Export logic
  const handleExportPDF = async () => {
    if (exporting) return;
    setExporting(true);

    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const verifyUrl = `${window.location.origin}/?verify=${currentChild.id}`;

      // Generate QR Code Base64
      const qrDataUrl = await QRCode.toDataURL(verifyUrl, { margin: 1 });

      const sortedVaxes = [...vaccines].sort(
        (a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
      );

      const rowsPerPage = 20;
      const totalPages = Math.ceil(sortedVaxes.length / rowsPerPage) || 1;

      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        if (pageNum > 1) doc.addPage();

        // 1. Outer Container Border
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(218, 224, 233);
        doc.setLineWidth(0.4);
        doc.roundedRect(15, 15, 180, 267, 5, 5, 'FD');

        // 2. Header Box (dynamic partner color)
        const hexToRgb = (hex: string) => {
          const bigint = parseInt(hex.replace('#', ''), 16);
          return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
        };
        const [r, g, b] = hexToRgb(primaryColor);
        doc.setFillColor(r, g, b);
        doc.roundedRect(15, 15, 180, 28, 5, 5, 'F');
        doc.rect(15, 25, 180, 18, 'F');

        // Header Text
        doc.setTextColor(255, 255, 255);
        doc.setFont('Helvetica', 'Bold');
        doc.setFontSize(18);
        doc.text(t('certificate') || 'Certificado de Vacinação', 23, 26);

        doc.setFont('Helvetica', 'Normal');
        doc.setFontSize(9.5);
        doc.text(t('digital_health_platform') || 'Plataforma Digital de Saúde', 23, 37);

        // 3. Child Info Card
        doc.setFillColor(240, 244, 248);
        doc.roundedRect(23, 50, 164, 26, 3, 3, 'F');

        // Info card vertical accent line
        doc.setFillColor(r, g, b);
        doc.rect(27, 54, 1.5, 18, 'F');
        doc.rect(106, 54, 1.5, 18, 'F');

        // Column 1
        doc.setTextColor(r, g, b);
        doc.setFont('Helvetica', 'Bold');
        doc.setFontSize(9.5);
        doc.text((t('child_name') || 'Criança') + ': ', 31, 60);
        const childNameLabelWidth = doc.getTextWidth((t('child_name') || 'Criança') + ': ');
        doc.setTextColor(51, 51, 51);
        doc.setFont('Helvetica', 'Normal');
        doc.text(currentChild.name, 31 + childNameLabelWidth, 60);

        doc.setTextColor(r, g, b);
        doc.setFont('Helvetica', 'Bold');
        doc.text((t('registry_id') || 'ID Registro') + ': ', 31, 70);
        const registryIdLabelWidth = doc.getTextWidth((t('registry_id') || 'ID Registro') + ': ');
        doc.setTextColor(51, 51, 51);
        doc.setFont('Helvetica', 'Normal');
        doc.text(`VAX-${currentChild.id.toUpperCase()}`, 31 + registryIdLabelWidth, 70);

        // Column 2
        doc.setTextColor(r, g, b);
        doc.setFont('Helvetica', 'Bold');
        doc.text((t('dob') || 'Nascimento') + ': ', 110, 60);
        const dobLabelWidth = doc.getTextWidth((t('dob') || 'Nascimento') + ': ');
        doc.setTextColor(51, 51, 51);
        doc.setFont('Helvetica', 'Normal');
        doc.text(`${fmtDate(currentChild.birthDate)} (${getAgeMonths(currentChild.birthDate)}m)`, 110 + dobLabelWidth, 60);

        doc.setTextColor(r, g, b);
        doc.setFont('Helvetica', 'Bold');
        doc.text((t('document_status') || 'Estado') + ': ', 110, 70);
        const statusLabelWidth = doc.getTextWidth((t('document_status') || 'Estado') + ': ');
        doc.setTextColor(51, 51, 51);
        doc.setFont('Helvetica', 'Normal');
        doc.text(t('document_active') || 'Ativo / Válido', 110 + statusLabelWidth, 70);

        // 4. Table Header
        doc.setFillColor(r, g, b);
        doc.rect(23, 84, 112, 9, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFont('Helvetica', 'Bold');
        doc.setFontSize(8);
        doc.text(t('vaccine_imunizer') || 'Vacina', 25, 90);
        doc.text(t('vaccine_dose') || 'Dose', 75, 90);
        doc.text(t('date_applied') || 'Aplicada Em', 90, 90);
        doc.text(t('status_label') || 'Estado', 112, 90);

        // Separators
        doc.setDrawColor(255, 255, 255);
        doc.setLineWidth(0.3);
        doc.line(73, 84, 73, 93);
        doc.line(88, 84, 88, 93);
        doc.line(110, 84, 110, 93);

        // 5. Table Rows
        let yCurrent = 93;
        const pageVaxes = sortedVaxes.slice((pageNum - 1) * rowsPerPage, pageNum * rowsPerPage);

        pageVaxes.forEach((v, idx) => {
          const isEven = idx % 2 === 0;
          doc.setFillColor(isEven ? 255 : 247, isEven ? 255 : 250, isEven ? 255 : 252);
          doc.rect(23, yCurrent, 112, 7, 'F');

          doc.setDrawColor(218, 224, 233);
          doc.setLineWidth(0.25);
          doc.line(73, yCurrent, 73, yCurrent + 7);
          doc.line(88, yCurrent, 88, yCurrent + 7);
          doc.line(110, yCurrent, 110, yCurrent + 7);
          doc.line(23, yCurrent + 7, 135, yCurrent + 7);

          const vName = state.language === 'pt' ? v.namePt : v.nameEn;
          const parts = vName.split(' - ');
          const nameOnly = parts[0];
          const doseOnly = parts[1] || (v.id === 'bcg' || v.id === 'yellow-fever' ? (t('single_dose') || 'Dose Única') : '—');

          doc.setTextColor(51, 51, 51);
          doc.setFont('Helvetica', 'Bold');
          doc.setFontSize(7.5);
          doc.text(nameOnly, 25, yCurrent + 4.8);

          doc.setFont('Helvetica', 'Normal');
          doc.text(doseOnly, 75, yCurrent + 4.8);

          const dateText = v.completedDate ? fmtDate(v.completedDate) : (t('awaiting') || 'Pendente');
          doc.text(dateText, 90, yCurrent + 4.8);

          // Status Badge
          if (v.status === 'completed') {
            doc.setFillColor(220, 252, 231);
            doc.roundedRect(112.5, yCurrent + 1.5, 20, 4, 1.2, 1.2, 'F');
            doc.setTextColor(21, 128, 61);
            doc.setFont('Helvetica', 'Bold');
            doc.setFontSize(6.5);
            doc.text(t('done_badge') || 'Feito', 122.5, yCurrent + 4.4, { align: 'center' });
          } else {
            doc.setFillColor(224, 231, 255);
            doc.roundedRect(112.5, yCurrent + 1.5, 20, 4, 1.2, 1.2, 'F');
            doc.setTextColor(67, 56, 202);
            doc.setFont('Helvetica', 'Bold');
            doc.setFontSize(6.5);
            doc.text(t('awaiting') || 'Pendente', 122.5, yCurrent + 4.4, { align: 'center' });
          }

          yCurrent += 7;
        });

        // Fill remaining rows
        const emptyRows = rowsPerPage - pageVaxes.length;
        for (let i = 0; i < emptyRows; i++) {
          const isEven = (pageVaxes.length + i) % 2 === 0;
          doc.setFillColor(isEven ? 255 : 247, isEven ? 255 : 250, isEven ? 255 : 252);
          doc.rect(23, yCurrent, 112, 7, 'F');
          doc.setDrawColor(218, 224, 233);
          doc.line(73, yCurrent, 73, yCurrent + 7);
          doc.line(88, yCurrent, 88, yCurrent + 7);
          doc.line(110, yCurrent, 110, yCurrent + 7);
          doc.line(23, yCurrent + 7, 135, yCurrent + 7);
          yCurrent += 7;
        }

        // 6. QR Code Card
        doc.setDrawColor(180, 200, 215);
        doc.setLineWidth(0.35);
        doc.setLineDash([1.5, 1.5], 0);
        doc.roundedRect(139, 84, 48, 65, 4, 4, 'D');
        doc.setLineDash([], 0);

        doc.addImage(qrDataUrl, 'PNG', 145, 90, 36, 36);

        doc.setTextColor(r, g, b);
        doc.setFont('Helvetica', 'Bold');
        doc.setFontSize(7.5);
        doc.text(t('scan_to_validate') || 'Digitalize para Validar', 163, 132, { align: 'center' });

        doc.setTextColor(119, 119, 119);
        doc.setFont('Helvetica', 'Normal');
        doc.setFontSize(6.5);
        doc.text(t('electronic_validation') || 'Validação eletrónica da autenticidade', 163, 138, { align: 'center' });
        doc.text(t('guaranteed_authenticity') || 'Garantia de segurança sanitária Vax360', 163, 142, { align: 'center' });

        // 7. Footer
        doc.setDrawColor(218, 224, 233);
        doc.setLineWidth(0.4);
        doc.line(23, 262, 187, 262);

        doc.setTextColor(136, 136, 136);
        doc.setFont('Helvetica', 'Normal');
        doc.setFontSize(6.5);
        doc.text(t('certificate_footer_msg') || 'Este documento certifica o histórico de imunização registado na plataforma oficial Vax360.', 23, 268, { maxWidth: 105 });

        if (state.partnerBranding) {
          doc.setFontSize(7);
          doc.text('Parceiro oficial:', 132, 268);
          doc.addImage(state.partnerBranding.logo, 'PNG', 132, 271, 30, 8);
        }
      }

      // Output PDF
      const pdfBase64 = doc.output('datauristring').split(',')[1];

      if (Capacitor.isNativePlatform()) {
        const filename = `certificado_${currentChild.id}.pdf`;
        // Save using FileSystem
        const writeRes = await Filesystem.writeFile({
          path: filename,
          data: pdfBase64,
          directory: Directory.Cache
        });

        // Share
        await Share.share({
          title: `Certificado Vax360 - ${currentChild.name}`,
          text: `Aqui está o certificado de vacinação da criança ${currentChild.name}`,
          url: writeRes.uri,
          dialogTitle: 'Partilhar Certificado de Vacinação'
        });
      } else {
        // Direct browser download
        doc.save(`certificado_${currentChild.id}.pdf`);
      }
    } catch (err: any) {
      Alert.alert('Erro ao Exportar', err.message || 'Falha ao gerar certificado PDF.');
    }
    setExporting(false);
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

        {groups.map(group => {
          const groupVaccines = vaccines.filter(v => v.group === group.key);
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
                        {v.status === 'completed' ? t('completed') : v.scheduledDate}
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
        })}
      </ScrollView>
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
  groupCard: { borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
  vaccineRow: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  vaccineRowBorder: { borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  vaccineInfo: { flex: 1 },
  vaccineName: { fontSize: 15, fontWeight: '600' },
  vaccineStatus: { fontSize: 12, marginTop: 2, fontWeight: '500' },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2 },
  placeholderText: { fontSize: 14, textAlign: 'center', marginTop: 12 },
});
