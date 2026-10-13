export type OnboardingLanguage = 'pt' | 'en' | 'fr' | 'af';
export interface OnboardingText {
  eyebrow: string;
  title: string;
  body: string;
  note: string;
}
export interface OnboardingConfig {
  enabled: boolean;
  /** Empty means use the built-in translated introduction. */
  steps: Partial<Record<OnboardingLanguage, OnboardingText>>[];
}
export const DEFAULT_ONBOARDING_CONFIG: OnboardingConfig = { enabled: true, steps: [] };
