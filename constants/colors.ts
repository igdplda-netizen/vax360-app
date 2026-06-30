export const Colors = {
  primary: '#6366f1',
  primaryLight: '#818cf8',
  primaryDark: '#4f46e5',
  secondary: '#8b5cf6',
  accent: '#06b6d4',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  background: {
    light: '#f8fafc',
    dark: '#0f172a',
  },
  surface: {
    light: '#ffffff',
    dark: '#1e293b',
  },
  text: {
    light: {
      primary: '#1e293b',
      secondary: '#64748b',
      tertiary: '#94a3b8',
    },
    dark: {
      primary: '#f1f5f9',
      secondary: '#cbd5e1',
      tertiary: '#94a3b8',
    },
  },
  border: {
    light: '#e2e8f0',
    dark: '#334155',
  },
  gradient: {
    start: '#6366f1',
    end: '#8b5cf6',
  },
  vaccine: {
    completed: '#22c55e',
    upcoming: '#3b82f6',
    overdue: '#ef4444',
    pending: '#94a3b8',
  },
};

export const useColors = () => {
  return Colors;
};
