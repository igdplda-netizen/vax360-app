import { Alert } from 'react-native';

export async function exportCertificatePdf(
  currentChild: any,
  vaccines: any[],
  state: any,
  t: any,
  primaryColor: string
) {
  Alert.alert(
    t('exportPdf') || 'Exportar PDF',
    t('pdfWebOnly') || 'A exportação de certificado em PDF com QR Code oficial está disponível na versão Web do aplicativo.'
  );
}
