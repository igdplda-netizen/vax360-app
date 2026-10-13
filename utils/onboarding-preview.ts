import type { OnboardingConfig } from '../constants/onboarding';

let previewDraft: OnboardingConfig | null = null;

export function setOnboardingPreview(config: OnboardingConfig): void {
  previewDraft = JSON.parse(JSON.stringify(config));
}

export function getOnboardingPreview(): OnboardingConfig | null {
  return previewDraft;
}

export function clearOnboardingPreview(): void {
  previewDraft = null;
}
