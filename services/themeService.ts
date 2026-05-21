import { Theme } from '../types';

export const THEME_STORAGE_KEY = 'cadence-theme';

function isTheme(value: string | null): value is Theme {
  return value === Theme.LIGHT || value === Theme.DARK;
}

export function readStoredTheme(storage: Storage | undefined = globalThis.localStorage): Theme | null {
  try {
    const value = storage?.getItem(THEME_STORAGE_KEY) ?? null;
    return isTheme(value) ? value : null;
  } catch {
    return null;
  }
}

export function resolveInitialTheme(): Theme {
  return readStoredTheme() ?? Theme.DARK;
}

export function applyTheme(theme: Theme, root: HTMLElement = document.documentElement): void {
  root.classList.toggle('dark', theme === Theme.DARK);
  root.style.colorScheme = theme;
}

export function persistTheme(theme: Theme, storage: Storage | undefined = globalThis.localStorage): void {
  try {
    storage?.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Ignore storage failures and keep the in-memory theme state.
  }
}
