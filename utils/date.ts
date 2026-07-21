import { Platform, Alert } from 'react-native';

export type DateFormat = 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';

export function getDeviceDateFormat(): DateFormat {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    try {
      const testDate = new Date(2024, 11, 31);
      const localeString = testDate.toLocaleDateString();
      if (localeString.startsWith('2024')) {
        return 'YYYY-MM-DD';
      }
      const dayIndex = localeString.indexOf('31');
      const monthIndex = localeString.indexOf('12');
      if (dayIndex !== -1 && monthIndex !== -1 && dayIndex < monthIndex) {
        return 'DD/MM/YYYY';
      }
    } catch (_) {}
  }
  // Default to DD/MM/YYYY for Portuguese-speaking countries or fallback
  return 'DD/MM/YYYY';
}

export function formatToDeviceDate(isoDateString: string): string {
  if (!isoDateString) return '';
  const parts = isoDateString.split('-');
  if (parts.length !== 3) return isoDateString;
  const [year, month, day] = parts;
  
  const format = getDeviceDateFormat();
  if (format === 'DD/MM/YYYY') {
    return `${day}/${month}/${year}`;
  } else if (format === 'MM/DD/YYYY') {
    return `${month}/${day}/${year}`;
  } else {
    return isoDateString;
  }
}

export function parseInputDate(text: string, format: DateFormat): string | null {
  const clean = text.replace(/[^0-9]/g, '');
  if (clean.length !== 8) return null;
  
  let day = '', month = '', year = '';
  if (format === 'DD/MM/YYYY') {
    day = clean.substring(0, 2);
    month = clean.substring(2, 4);
    year = clean.substring(4, 8);
  } else if (format === 'MM/DD/YYYY') {
    month = clean.substring(0, 2);
    day = clean.substring(2, 4);
    year = clean.substring(4, 8);
  } else {
    year = clean.substring(0, 4);
    month = clean.substring(4, 6);
    day = clean.substring(6, 8);
  }
  
  const d = parseInt(day, 10);
  const m = parseInt(month, 10);
  const y = parseInt(year, 10);
  
  if (m < 1 || m > 12) return null;
  if (d < 1 || d > 31) return null;
  if (y < 1900 || y > 2100) return null;
  
  const dateObj = new Date(y, m - 1, d);
  if (dateObj.getFullYear() !== y || dateObj.getMonth() !== m - 1 || dateObj.getDate() !== d) {
    return null;
  }
  
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

export function formatInputText(text: string, format: DateFormat): string {
  const clean = text.replace(/[^0-9]/g, '');
  if (format === 'YYYY-MM-DD') {
    if (clean.length <= 4) return clean;
    if (clean.length <= 6) return `${clean.substring(0, 4)}-${clean.substring(4)}`;
    return `${clean.substring(0, 4)}-${clean.substring(4, 6)}-${clean.substring(6, 8)}`;
  } else {
    if (clean.length <= 2) return clean;
    if (clean.length <= 4) return `${clean.substring(0, 2)}/${clean.substring(2)}`;
    return `${clean.substring(0, 2)}/${clean.substring(2, 4)}/${clean.substring(4, 8)}`;
  }
}

export function promptForDate(
  language: 'pt' | 'en',
  onConfirm: (dateStr: string) => void
) {
  const deviceFormat = getDeviceDateFormat();
  const todayIso = new Date().toISOString().split('T')[0];
  const todayFormatted = formatToDeviceDate(todayIso);

  if (Platform.OS === 'web') {
    const promptText = language === 'pt'
      ? `Insira a data de aplicação da vacina (${deviceFormat}):`
      : `Enter the vaccine application date (${deviceFormat}):`;
    const val = window.prompt(promptText, todayFormatted);
    if (val === null) return; // User cancelled
    const parsed = parseInputDate(val, deviceFormat);
    if (!parsed) {
      alert(language === 'pt' ? 'Data inválida! Por favor use o formato: ' + deviceFormat : 'Invalid date! Please use format: ' + deviceFormat);
      return;
    }
    onConfirm(parsed);
  } else if (Platform.OS === 'ios') {
    Alert.prompt(
      language === 'pt' ? 'Data de Aplicação' : 'Application Date',
      language === 'pt' ? `Digite a data (${deviceFormat}):` : `Enter the date (${deviceFormat}):`,
      [
        { text: language === 'pt' ? 'Cancelar' : 'Cancel', style: 'cancel' },
        {
          text: 'OK',
          onPress: (val?: string) => {
            if (!val) return;
            const parsed = parseInputDate(val, deviceFormat);
            if (!parsed) {
              Alert.alert(language === 'pt' ? 'Erro' : 'Error', language === 'pt' ? 'Data inválida!' : 'Invalid date!');
              return;
            }
            onConfirm(parsed);
          }
        }
      ],
      'plain-text',
      todayFormatted
    );
  } else {
    Alert.alert(
      language === 'pt' ? 'Data de Aplicação' : 'Application Date',
      language === 'pt' 
        ? `A vacina foi aplicada hoje (${todayFormatted})?`
        : `Was the vaccine applied today (${todayFormatted})?`,
      [
        { text: language === 'pt' ? 'Cancelar' : 'Cancel', style: 'cancel' },
        {
          text: language === 'pt' ? 'Sim (Hoje)' : 'Yes (Today)',
          onPress: () => onConfirm(todayIso)
        },
        {
          text: language === 'pt' ? 'Não (Digitar)' : 'No (Type)',
          onPress: () => {
            Alert.alert(
              language === 'pt' ? 'Data customizada' : 'Custom Date',
              language === 'pt'
                ? 'Para digitar uma data customizada, por favor use a versão Web ou iOS.'
                : 'To enter a custom date, please use the Web or iOS version.'
            );
          }
        }
      ]
    );
  }
}
