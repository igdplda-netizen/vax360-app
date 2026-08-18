import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import QRCode from 'qrcode';
import { formatToDeviceDate } from './date';

/**
 * Native (iOS/Android) certificate export.
 * Builds an HTML version of the certificate (matching the web/jsPDF layout),
 * renders it to a PDF file with expo-print, then opens the system share
 * sheet so the user can view, print or save the document.
 */
export async function exportCertificatePdf(
  currentChild: any,
  vaccines: any[],
  state: any,
  t: any,
  primaryColor: string
): Promise<{ blobUrl: string; download: () => void; dataUri: string } | null> {
  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  const verifyUrl = `${domain ? `https://${domain}` : 'https://vax360.app'}/?verify=${currentChild.id}`;

  // Pure-JS SVG QR (no canvas needed on native)
  const qrSvg: string = await QRCode.toString(verifyUrl, { type: 'svg', margin: 1 });

  const fmtDate = (dStr: string) => formatToDeviceDate(dStr);

  const getAgeLabel = (birthDate: string): string => {
    const birth = new Date(birthDate);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 30) return `${diffDays} ${diffDays === 1 ? 'dia de vida' : 'dias de vida'}`;
    const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
    if (months < 24) return `${months}m`;
    const years = Math.floor(months / 12);
    const rem = months % 12;
    return rem > 0 ? `${years}a ${rem}m` : `${years}a`;
  };

  const getSUSId = (id: string): string => {
    const year = new Date().getFullYear();
    const suffix = id.replace(/-/g, '').toUpperCase().slice(0, 4);
    return `SUS-${year}-${suffix}`;
  };

  const primary = /^#[0-9a-fA-F]{6}$/.test(primaryColor || '') ? primaryColor : '#6366f1';

  const sortedVaxes = [...vaccines].sort(
    (a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
  );

  const esc = (s: any) =>
    String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  // Only allow safe image sources for the partner logo (untrusted input)
  const safeLogoSrc = (src: any): string | null => {
    if (typeof src !== 'string') return null;
    const trimmed = src.trim();
    if (/^https?:\/\//i.test(trimmed) || /^data:image\/(png|jpe?g|gif|webp);base64,/i.test(trimmed)) {
      return trimmed;
    }
    return null;
  };

  const rows = sortedVaxes
    .map((v, i) => {
      const nameOnly = state.language === 'pt' ? v.namePt : v.nameEn;
      const parts = (state.language === 'pt' ? v.ageLabelPt : v.ageLabel).split(' – ');
      const doseOnly =
        parts[1] ||
        (v.id === 'bcg' || v.id === 'yellow-fever' ? (t('single_dose') || 'Dose Única') : '—');
      const dateText = v.completedDate ? fmtDate(v.completedDate) : (t('awaiting') || 'Pendente');
      const done = v.status === 'completed';
      const badge = done
        ? `<span class="badge done">${esc(t('done_badge') || '✓ Feita')}</span>`
        : `<span class="badge pending">${esc(t('awaiting') || 'Pendente')}</span>`;
      return `<tr class="${i % 2 === 0 ? 'even' : 'odd'}">
        <td class="vname">${esc(nameOnly)}</td>
        <td>${esc(doseOnly)}</td>
        <td>${esc(dateText)}</td>
        <td>${badge}</td>
      </tr>`;
    })
    .join('');

  const logoSrc = safeLogoSrc(state.partnerBranding?.logo);
  const partnerBlock = logoSrc
    ? `<div class="partner"><div>Logo parceiras:</div><img src="${esc(logoSrc)}" style="height:32px;margin-top:4px" /></div>`
    : state.partnerBranding?.name
      ? `<div class="partner"><div>Logo parceiras:</div><b>${esc(state.partnerBranding.name)}</b></div>`
      : '';

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8" />
<style>
  * { box-sizing: border-box; }
  body { font-family: Helvetica, Arial, sans-serif; margin: 0; padding: 16px; color: #333; }
  .card { border: 1px solid #dae0e9; border-radius: 12px; padding: 14px; }
  .banner { background: ${primary}; color: #fff; border-radius: 8px; padding: 16px 20px; }
  .banner h1 { margin: 0 0 6px; font-size: 20px; }
  .banner p { margin: 0; font-size: 11px; font-weight: normal; }
  .info { background: ${primary}0a; border-radius: 8px; padding: 12px 16px; margin: 14px 0;
          display: flex; flex-wrap: wrap; font-size: 11px; }
  .info div { width: 50%; padding: 4px 0; }
  .info b { color: ${primary}; }
  .content { display: flex; gap: 16px; }
  table { border-collapse: collapse; width: 100%; border: 1px solid #dae0e9; font-size: 9px; }
  thead th { background: ${primary}; color: #fff; text-align: left; padding: 6px 5px; font-size: 9px; }
  td { padding: 5px; }
  tr.even { background: #f8fafc; }
  .vname { font-weight: bold; }
  .badge { display: inline-block; border-radius: 4px; padding: 1px 8px; font-size: 8px; font-weight: bold; }
  .badge.done { background: #dcfce7; color: #15803d; }
  .badge.pending { background: #eff6ff; color: #4338ca; }
  .qrbox { width: 150px; text-align: center; flex-shrink: 0; }
  .qrbox svg { width: 130px; height: 130px; }
  .qrbox .t1 { color: ${primary}; font-weight: bold; font-size: 9px; margin-top: 6px; }
  .qrbox .t2 { color: #777; font-size: 8px; margin-top: 3px; }
  .footer { border-top: 1px solid #dae0e9; margin-top: 18px; padding-top: 8px;
            display: flex; justify-content: space-between; color: #888; font-size: 8px; }
  .footer .msg { max-width: 60%; }
  .partner { font-size: 8.5px; }
</style></head><body>
<div class="card">
  <div class="banner">
    <h1>${esc(t('certificate') || 'Certificado de Vacinação')}</h1>
    <p>${esc(t('digital_health_platform') || 'Plataforma de Saúde Digital - Registro Oficial')}</p>
  </div>
  <div class="info">
    <div><b>${esc(t('child_name') || 'Criança')}:</b> ${esc(currentChild.name)}</div>
    <div><b>${esc(t('dob') || 'Nascimento')}:</b> ${esc(fmtDate(currentChild.birthDate))} (${esc(getAgeLabel(currentChild.birthDate))})</div>
    <div><b>${esc(t('registry_id') || 'Registro ID')}:</b> ${esc(getSUSId(currentChild.id))}</div>
    <div><b>${esc(t('document_status') || 'Estado')}:</b> ${esc(t('document_active') || 'Ativo / Válido')}</div>
  </div>
  <div class="content">
    <table>
      <thead><tr>
        <th>${esc(t('vaccine_imunizer') || 'Vacina')}</th>
        <th>${esc(t('vaccine_dose') || 'Dose')}</th>
        <th>${esc(t('vaccine_date') || 'Data')}</th>
        <th>${esc(t('vaccine_state') || 'Estado')}</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="qrbox">
      ${qrSvg}
      <div class="t1">${esc(t('scan_to_validate') || 'Leia para validar as doses')}</div>
      <div class="t2">${esc(t('electronic_validation') || 'Validação Eletrônica')}</div>
      <div class="t2">${esc(t('guaranteed_authenticity') || 'Autenticidade Garantida')}</div>
    </div>
  </div>
  <div class="footer">
    <div class="msg">${esc(
      t('certificate_footer_msg') ||
        'Documento emitido digitalmente. As informações contidas neste certificado refletem o registro do paciente.'
    )}</div>
    ${partnerBlock}
  </div>
</div>
</body></html>`;

  const { uri } = await Print.printToFileAsync({ html });

  if (await Sharing.isAvailableAsync()) {
    // Share sheet lets the user view, print, or save the PDF
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: `certificado_${currentChild.name.replace(/\s+/g, '_')}.pdf`,
      UTI: 'com.adobe.pdf',
    });
  } else {
    // Fallback: open the native print dialog directly
    await Print.printAsync({ uri });
  }

  return null;
}
