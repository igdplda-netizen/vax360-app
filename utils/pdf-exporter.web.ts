import { jsPDF } from 'jspdf/dist/jspdf.es.min.js';
import QRCode from 'qrcode';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { formatToDeviceDate } from './date';

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

/**
 * Generates the PDF document and returns both a blob URL for preview
 * and a direct-download function. This dual approach ensures the PDF
 * works across all web environments (standalone, Replit iframe, Expo Web).
 */
export async function exportCertificatePdf(
  currentChild: any,
  vaccines: any[],
  state: any,
  t: any,
  primaryColor: string
): Promise<{ blobUrl: string; download: () => void; dataUri: string } | null> {
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

    const fmtDate = (dStr: string) => formatToDeviceDate(dStr);

    const getAgeMonths = (birthDate: string) => {
      const birth = new Date(birthDate);
      const now = new Date();
      return (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
    };

    // Parse primary color
    let r = 99, g = 102, b = 241;
    if (primaryColor?.startsWith('#') && primaryColor.length === 7) {
      r = parseInt(primaryColor.slice(1, 3), 16);
      g = parseInt(primaryColor.slice(3, 5), 16);
      b = parseInt(primaryColor.slice(5, 7), 16);
    }

    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      if (pageNum > 1) doc.addPage();

      // 1. Outer Container Border
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(218, 224, 233);
      doc.setLineWidth(0.4);
      doc.roundedRect(10, 5, 190, 282, 6, 6, 'FD');

      // 2. Header Banner
      doc.setFillColor(r, g, b);
      doc.roundedRect(15, 10, 180, 34, 4, 4, 'F');

      // Header Text
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text(t('certificate') || 'Certificado de Vacinação', 23, 26);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.text(t('digital_health_platform') || 'Plataforma Digital de Saúde', 23, 37);

      // 3. Child Info Section
      doc.setFillColor(r, g, b, 0.04);
      doc.roundedRect(23, 52, 164, 26, 4, 4, 'F');

      // Column 1
      doc.setTextColor(r, g, b);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.text((t('child_name') || 'Criança') + ': ', 31, 60);
      const childNameLabelWidth = doc.getTextWidth((t('child_name') || 'Criança') + ': ');
      doc.setTextColor(51, 51, 51);
      doc.setFont('helvetica', 'normal');
      doc.text(currentChild.name, 31 + childNameLabelWidth, 60);

      doc.setTextColor(r, g, b);
      doc.setFont('helvetica', 'bold');
      doc.text((t('registry_id') || 'ID Registro') + ': ', 31, 70);
      const registryIdLabelWidth = doc.getTextWidth((t('registry_id') || 'ID Registro') + ': ');
      doc.setTextColor(51, 51, 51);
      doc.setFont('helvetica', 'normal');
      doc.text(`VAX-${currentChild.id.toUpperCase()}`, 31 + registryIdLabelWidth, 70);

      // Column 2
      doc.setTextColor(r, g, b);
      doc.setFont('helvetica', 'bold');
      doc.text((t('dob') || 'Nascimento') + ': ', 110, 60);
      const dobLabelWidth = doc.getTextWidth((t('dob') || 'Nascimento') + ': ');
      doc.setTextColor(51, 51, 51);
      doc.setFont('helvetica', 'normal');
      doc.text(`${fmtDate(currentChild.birthDate)} (${getAgeMonths(currentChild.birthDate)}m)`, 110 + dobLabelWidth, 60);

      doc.setTextColor(r, g, b);
      doc.setFont('helvetica', 'bold');
      doc.text((t('document_status') || 'Estado') + ': ', 110, 70);
      const statusLabelWidth = doc.getTextWidth((t('document_status') || 'Estado') + ': ');
      doc.setTextColor(51, 51, 51);
      doc.setFont('helvetica', 'normal');
      doc.text(t('document_active') || 'Ativo / Válido', 110 + statusLabelWidth, 70);

      // 4. Table Header
      doc.setFillColor(r, g, b);
      doc.rect(23, 84, 112, 9, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text(t('vaccine_imunizer') || 'Vacina', 25, 90);
      doc.text(t('vaccine_dose') || 'Dose', 75, 90);
      doc.text(t('vaccine_date') || 'Data', 95, 90);
      doc.text(t('vaccine_state') || 'Estado', 115, 90);

      // 5. Table Rows
      const startVaxIdx = (pageNum - 1) * rowsPerPage;
      const pageVaxes = sortedVaxes.slice(startVaxIdx, startVaxIdx + rowsPerPage);

      let yCurrent = 93;
      const rowH = 7;

      pageVaxes.forEach((v, i) => {
        if (i % 2 === 0) {
          doc.setFillColor(248, 250, 252);
        } else {
          doc.setFillColor(255, 255, 255);
        }
        doc.rect(23, yCurrent, 112, rowH, 'F');

        const nameOnly = state.language === 'pt' ? v.namePt : v.nameEn;
        const parts = (state.language === 'pt' ? v.ageLabelPt : v.ageLabel).split(' – ');
        const doseOnly = parts[1] || (v.id === 'bcg' || v.id === 'yellow-fever' ? (t('single_dose') || 'Dose Única') : '—');

        doc.setTextColor(51, 51, 51);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.text(nameOnly, 25, yCurrent + 4.8);

        doc.setFont('helvetica', 'normal');
        doc.text(doseOnly, 75, yCurrent + 4.8);

        const dateText = v.completedDate ? fmtDate(v.completedDate) : (t('awaiting') || 'Pendente');
        doc.text(dateText, 95, yCurrent + 4.8);

        if (v.status === 'completed') {
          doc.setFillColor(220, 252, 231);
          doc.roundedRect(112.5, yCurrent + 1.5, 20, 4, 1.2, 1.2, 'F');
          doc.setTextColor(21, 128, 61);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(6.5);
          doc.text(t('done_badge') || 'Feito', 122.5, yCurrent + 4.4, { align: "center" });
        } else {
          doc.roundedRect(112.5, yCurrent + 1.5, 20, 4, 1.2, 1.2, 'F');
          doc.setTextColor(67, 56, 202);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(6.5);
          doc.text(t('awaiting') || 'Pendente', 122.5, yCurrent + 4.4, { align: "center" });
        }

        yCurrent += rowH;
      });

      // Close table outline
      doc.setDrawColor(218, 224, 233);
      doc.setLineWidth(0.3);
      doc.rect(23, 84, 112, yCurrent - 84);

      // 6. QR Code
      doc.addImage(qrDataUrl, 'PNG', 145, 90, 36, 36);

      doc.setTextColor(r, g, b);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.text(t('scan_to_validate') || 'Digitalize para Validar', 163, 132, { align: 'center' });

      doc.setTextColor(119, 119, 119);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.text(t('electronic_validation') || 'Validação eletrónica da autenticidade', 163, 138, { align: 'center' });
      doc.text(t('guaranteed_authenticity') || 'Garantia de segurança sanitária Vax360', 163, 142, { align: 'center' });

      // 7. Footer
      doc.setDrawColor(218, 224, 233);
      doc.setLineWidth(0.4);
      doc.line(23, 262, 187, 262);

      doc.setTextColor(136, 136, 136);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.text(t('certificate_footer_msg') || 'Este documento certifica o histórico de imunização registado na plataforma oficial Vax360.', 23, 268, { maxWidth: 105 });

      if (state.partnerBranding) {
        doc.setFontSize(7);
        doc.text('Parceiro oficial:', 132, 268);
        doc.addImage(state.partnerBranding.logo, 'PNG', 132, 271, 30, 8);
      }
    }

    const filename = `certificado_${currentChild.name.replace(/\s+/g, '_')}.pdf`;

    // Native platform: use Capacitor Share
    if (Capacitor.isNativePlatform()) {
      const pdfBase64 = doc.output('datauristring').split(',')[1];
      const writeRes = await Filesystem.writeFile({
        path: filename,
        data: pdfBase64,
        directory: Directory.Cache
      });

      await Share.share({
        title: `Certificado Vax360 - ${currentChild.name}`,
        text: `Aqui está o certificado de vacinação da criança ${currentChild.name}`,
        url: writeRes.uri,
        dialogTitle: 'Partilhar Certificado de Vacinação'
      });
      return null;
    }

    // Web platform: return blob URL + download function + data URI
    const blob = doc.output('blob');
    const blobUrl = URL.createObjectURL(blob);
    const dataUri = doc.output('datauristring');

    const download = () => {
      // Strategy 1: try <a> tag download (works on most browsers)
      try {
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      } catch (_) {}

      // Strategy 2: use data URI in a new window
      try {
        const win = window.open('', '_blank');
        if (win) {
          win.document.write(
            `<html><head><title>${filename}</title></head>` +
            `<body style="margin:0"><embed width="100%" height="100%" src="${dataUri}" type="application/pdf" /></body></html>`
          );
          return;
        }
      } catch (_) {}

      // Strategy 3: direct save via jsPDF (last resort)
      doc.save(filename);
    };

    return { blobUrl, download, dataUri };
  } catch (err) {
    console.error('PDF export error:', err);
    throw err;
  }
}
