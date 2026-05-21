import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import App from './App';
import { THEME_STORAGE_KEY } from './services/themeService';

describe('App theme integration', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
  });

  afterEach(() => {
    cleanup();
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
});
