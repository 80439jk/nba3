export interface FormData {
  state: string;
  dob: string;
  citizenship: string;
  streetAddress: string;
  city: string;
  zip: string;
  annualIncome: string;
  employmentStatus: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  tcpaConsent: boolean;
  honeypot: string;
}

export interface ConfirmationData {
  firstName: string;
  email: string;
  phone: string;
  transactionId: string;
  timestamp: number;
  gtmFired: boolean;
}

const FORM_STORAGE_KEY = 'nba_form_state_v1';
const CONFIRMATION_STORAGE_KEY = 'nba_confirmation_v1';
const LAST_STEP_KEY = 'nba_last_step_v1';
const SUBMISSION_IN_PROGRESS_KEY = 'nba_submitting_v1';
const CONFIRMATION_EXPIRY_MS = 30 * 60 * 1000;

export const getFormData = (): FormData | null => {
  try {
    const stored = sessionStorage.getItem(FORM_STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as FormData;
  } catch {
    return null;
  }
};

export const saveFormData = (data: Partial<FormData>): void => {
  try {
    const existing = getFormData() || getEmptyFormData();
    const updated = { ...existing, ...data };
    sessionStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save form data:', error);
  }
};

export const clearFormData = (): void => {
  try {
    sessionStorage.removeItem(FORM_STORAGE_KEY);
    sessionStorage.removeItem(LAST_STEP_KEY);
    sessionStorage.removeItem(SUBMISSION_IN_PROGRESS_KEY);
  } catch (error) {
    console.error('Failed to clear form data:', error);
  }
};

export const getEmptyFormData = (): FormData => ({
  state: '',
  dob: '',
  citizenship: '',
  streetAddress: '',
  city: '',
  zip: '',
  annualIncome: '',
  employmentStatus: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  tcpaConsent: false,
  honeypot: ''
});

export const getLastCompletedStep = (): number => {
  try {
    const stored = sessionStorage.getItem(LAST_STEP_KEY);
    return stored ? parseInt(stored, 10) : 0;
  } catch {
    return 0;
  }
};

export const setLastCompletedStep = (step: number): void => {
  try {
    sessionStorage.setItem(LAST_STEP_KEY, step.toString());
  } catch (error) {
    console.error('Failed to save last step:', error);
  }
};

export const isSubmissionInProgress = (): boolean => {
  try {
    return sessionStorage.getItem(SUBMISSION_IN_PROGRESS_KEY) === 'true';
  } catch {
    return false;
  }
};

export const setSubmissionInProgress = (inProgress: boolean): void => {
  try {
    if (inProgress) {
      sessionStorage.setItem(SUBMISSION_IN_PROGRESS_KEY, 'true');
    } else {
      sessionStorage.removeItem(SUBMISSION_IN_PROGRESS_KEY);
    }
  } catch (error) {
    console.error('Failed to set submission status:', error);
  }
};

export const saveConfirmation = (data: Omit<ConfirmationData, 'timestamp' | 'gtmFired'>): void => {
  try {
    const confirmation: ConfirmationData = {
      ...data,
      timestamp: Date.now(),
      gtmFired: false
    };
    sessionStorage.setItem(CONFIRMATION_STORAGE_KEY, JSON.stringify(confirmation));
  } catch (error) {
    console.error('Failed to save confirmation:', error);
  }
};

export const getConfirmation = (): ConfirmationData | null => {
  try {
    const stored = sessionStorage.getItem(CONFIRMATION_STORAGE_KEY);
    if (!stored) return null;

    const confirmation = JSON.parse(stored) as ConfirmationData;
    const age = Date.now() - confirmation.timestamp;

    if (age > CONFIRMATION_EXPIRY_MS) {
      clearConfirmation();
      return null;
    }

    return confirmation;
  } catch {
    return null;
  }
};

export const markGtmFired = (): void => {
  try {
    const confirmation = getConfirmation();
    if (confirmation) {
      confirmation.gtmFired = true;
      sessionStorage.setItem(CONFIRMATION_STORAGE_KEY, JSON.stringify(confirmation));
    }
  } catch (error) {
    console.error('Failed to mark GTM fired:', error);
  }
};

export const clearConfirmation = (): void => {
  try {
    sessionStorage.removeItem(CONFIRMATION_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear confirmation:', error);
  }
};
