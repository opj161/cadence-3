import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { THEME_STORAGE_KEY } from './services/themeService';
import { TEXT_PERSIST_DELAY_MS, TEXT_STORAGE_KEY } from './services/textStorage';

describe('App theme integration', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    localStorage.clear();
    document.documentElement.className = '';
  });

  it('does not mount CodeMirror in light mode while the app is dark', async () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'dark');

    const { container } = render(<App />);

    await waitFor(() => {
      expect(document.documentElement).toHaveClass('dark');
    });

    expect(container.querySelector('.cm-theme-light')).not.toBeInTheDocument();
  });

  it('does not add independent vertical padding to the syllable gutter', async () => {
    render(<App />);

    await waitFor(() => {
      expect(document.head.textContent).toContain('.cm-gutters');
    });

    expect(document.head.textContent).not.toMatch(/\.cm-gutters\s*\{[^}]*padding-top:/);
    expect(document.head.textContent).not.toMatch(/\.cm-gutters\s*\{[^}]*padding-bottom:/);
  });

  it('persists theme changes when the user toggles the theme', async () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'dark');

    render(<App />);
    fireEvent.click(document.querySelector('button[title="Toggle theme"]') as HTMLButtonElement);

    await waitFor(() => {
      expect(document.documentElement).not.toHaveClass('dark');
    });

    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
  });

  it('keeps header formatting intact when syllable markers are toggled off and back on', async () => {
    const { container } = render(<App />);
    const toggle = container.querySelector('button[title="Toggle syllable markers"]') as HTMLButtonElement;

    await waitFor(() => {
      expect(container.querySelector('.cm-section-header')).toBeInTheDocument();
      expect(container.querySelectorAll('.cm-syllable-marker').length).toBeGreaterThan(0);
    });

    fireEvent.click(toggle);

    await waitFor(() => {
      expect(container.querySelector('.cm-section-header')).toBeInTheDocument();
      expect(container.querySelectorAll('.cm-syllable-marker')).toHaveLength(0);
    });

    fireEvent.click(toggle);

    await waitFor(() => {
      expect(container.querySelector('.cm-section-header')).toBeInTheDocument();
      expect(container.querySelectorAll('.cm-syllable-marker').length).toBeGreaterThan(0);
    });
  });

  it('clears the editor and resets stats', async () => {
    const { container } = render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/words/i)).toBeInTheDocument();
    });

    fireEvent.click(container.querySelector('button[title="Clear text"]') as HTMLButtonElement);

    await waitFor(() => {
      expect(container.querySelector('[title="Total Word Count"]')).toHaveTextContent(/^0\s*words$/i);
      expect(container.querySelector('[title="Total Syllable Count"]')).toHaveTextContent(/^0\s*syl$/i);
      expect(container.querySelector('[title="Average Syllables per Line"]')).toHaveTextContent(/^0\.0\s*avg$/i);
    });
  });

  it('switches the active language state between EN and DE', () => {
    render(<App />);

    const englishButton = screen.getByRole('button', { name: 'EN' });
    const germanButton = screen.getByRole('button', { name: 'DE' });

    expect(englishButton).toHaveAttribute('aria-pressed', 'false');
    expect(germanButton).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(englishButton);

    expect(englishButton).toHaveAttribute('aria-pressed', 'true');
    expect(germanButton).toHaveAttribute('aria-pressed', 'false');
  });

  it('updates font size controls within the supported bounds', () => {
    const { container } = render(<App />);

    const smallerButton = screen.getByRole('button', { name: /smaller text/i });
    const largerButton = screen.getByRole('button', { name: /larger text/i });
    const fontSizeIndicator = container.querySelector('span.w-6.text-center.font-mono.text-xs.text-gray-400');

    expect(fontSizeIndicator).toHaveTextContent('16');

    fireEvent.click(largerButton);
    expect(fontSizeIndicator).toHaveTextContent('18');

    for (let index = 0; index < 20; index += 1) {
      fireEvent.click(largerButton);
    }
    expect(fontSizeIndicator).toHaveTextContent('32');

    for (let index = 0; index < 20; index += 1) {
      fireEvent.click(smallerButton);
    }
    expect(fontSizeIndicator).toHaveTextContent('12');
  });

  it('exports the current lyrics as a txt download', () => {
    const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:lyrics');
    const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    const appendChildSpy = vi.spyOn(document.body, 'appendChild');
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /export txt/i }));

    expect(createObjectURLSpy).toHaveBeenCalledTimes(1);
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:lyrics');

    const exportedLink = appendChildSpy.mock.calls
      .map(([node]) => node)
      .find((node): node is HTMLAnchorElement => node instanceof HTMLAnchorElement);

    expect(exportedLink).toBeDefined();
    expect(exportedLink?.download).toBe('lyrics.txt');
    expect(exportedLink?.href).toBe('blob:lyrics');
  });
});

describe('App lyrics persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
    localStorage.clear();
  });

  const wordCount = (container: HTMLElement) => container.querySelector('[title="Total Word Count"]');

  it('restores stored lyrics on mount', () => {
    localStorage.setItem(TEXT_STORAGE_KEY, 'one two three four five');

    const { container } = render(<App />);

    expect(wordCount(container)).toHaveTextContent(/^5\s*words$/i);
  });

  it('falls back to the default text when nothing is stored', () => {
    const { container } = render(<App />);

    expect(wordCount(container)).not.toHaveTextContent(/^0\s*words$/i);
    expect(wordCount(container)).toHaveTextContent(/^\d+\s*words$/i);
    expect(localStorage.getItem(TEXT_STORAGE_KEY)).toBeNull();
  });

  it('keeps an empty stored string empty instead of restoring the default text', () => {
    localStorage.setItem(TEXT_STORAGE_KEY, '');

    const { container } = render(<App />);

    expect(wordCount(container)).toHaveTextContent(/^0\s*words$/i);
  });

  it('debounces writes and then stores the new text', () => {
    vi.useFakeTimers();
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /clear text/i }));
    act(() => {
      vi.advanceTimersByTime(TEXT_PERSIST_DELAY_MS - 50);
    });
    expect(setItemSpy.mock.calls.filter(([key]) => key === TEXT_STORAGE_KEY)).toHaveLength(0);

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(localStorage.getItem(TEXT_STORAGE_KEY)).toBe('');
  });

  it('flushes pending text when the page is hidden', () => {
    vi.useFakeTimers();
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /clear text/i }));
    expect(localStorage.getItem(TEXT_STORAGE_KEY)).toBeNull();

    window.dispatchEvent(new Event('pagehide'));
    expect(localStorage.getItem(TEXT_STORAGE_KEY)).toBe('');
  });

  it('does not crash when writing to storage throws', () => {
    vi.useFakeTimers();
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('quota exceeded', 'QuotaExceededError');
    });
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /clear text/i }));
    expect(() => {
      act(() => {
        vi.advanceTimersByTime(TEXT_PERSIST_DELAY_MS + 50);
      });
    }).not.toThrow();

    expect(screen.getByRole('button', { name: 'EN' })).toBeInTheDocument();
  });
});

describe('App document language', () => {
  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  it('keeps <html lang> in sync with the EN/DE toggle', () => {
    render(<App />);

    expect(document.documentElement.lang).toBe('de');

    fireEvent.click(screen.getByRole('button', { name: 'EN' }));
    expect(document.documentElement.lang).toBe('en');

    fireEvent.click(screen.getByRole('button', { name: 'DE' }));
    expect(document.documentElement.lang).toBe('de');
  });
});
