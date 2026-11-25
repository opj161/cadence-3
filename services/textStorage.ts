export const TEXT_STORAGE_KEY = 'cadence-text';
export const TEXT_PERSIST_DELAY_MS = 400;

function resolveStorage(storage?: Storage): Storage | undefined {
  // Reading globalThis.localStorage itself can throw when site data is blocked.
  return storage ?? globalThis.localStorage;
}

/** Returns the stored lyrics, or null when nothing is stored. An empty string is a valid stored value. */
export function readStoredText(storage?: Storage): string | null {
  try {
    return resolveStorage(storage)?.getItem(TEXT_STORAGE_KEY) ?? null;
  } catch {
    return null;
  }
}

export function persistText(text: string, storage?: Storage): void {
  try {
    resolveStorage(storage)?.setItem(TEXT_STORAGE_KEY, text);
  } catch {
    // Ignore storage failures (blocked or full) and keep the in-memory text.
  }
}
