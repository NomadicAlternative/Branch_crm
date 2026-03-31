export type ToastTone = 'success' | 'error' | 'info';

export interface ToastPayload {
  message: string;
  tone: ToastTone;
}

const FLASH_STORAGE_KEY = 'crm-rama-flash-toast';
const TOAST_EVENT_NAME = 'crm-rama:toast';

export function setFlashToast(payload: ToastPayload) {
  if (typeof window === 'undefined') {
    return;
  }

  window.sessionStorage.setItem(FLASH_STORAGE_KEY, JSON.stringify(payload));
}

export function consumeFlashToast(): ToastPayload | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const rawValue = window.sessionStorage.getItem(FLASH_STORAGE_KEY);
  if (!rawValue) {
    return null;
  }

  window.sessionStorage.removeItem(FLASH_STORAGE_KEY);

  try {
    return JSON.parse(rawValue) as ToastPayload;
  } catch {
    return null;
  }
}

export function showToast(payload: ToastPayload) {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new CustomEvent<ToastPayload>(TOAST_EVENT_NAME, { detail: payload }));
}

export function getToastEventName() {
  return TOAST_EVENT_NAME;
}
