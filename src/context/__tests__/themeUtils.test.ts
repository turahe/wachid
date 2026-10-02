import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getSystemTheme, getStoredTheme, getInitialTheme, setThemeInStorage, applyThemeToDOM } from '../themeUtils';

describe('Theme Utilities', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('getSystemTheme', () => {
    it('should detect dark theme preference', () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query) => ({
          matches: query === '(prefers-color-scheme: dark)',
        })),
      });

      expect(getSystemTheme()).toBe('dark');
    });

    it('should detect light theme preference', () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query) => ({
          matches: query !== '(prefers-color-scheme: dark)',
        })),
      });

      expect(getSystemTheme()).toBe('light');
    });
  });

  describe('getStoredTheme', () => {
    it('should return stored light theme', () => {
      localStorage.setItem('theme', 'light');
      expect(getStoredTheme()).toBe('light');
    });

    it('should return stored dark theme', () => {
      localStorage.setItem('theme', 'dark');
      expect(getStoredTheme()).toBe('dark');
    });

    it('should return null for invalid theme', () => {
      localStorage.setItem('theme', 'invalid');
      expect(getStoredTheme()).toBeNull();
    });

    it('should return null when no theme is stored', () => {
      expect(getStoredTheme()).toBeNull();
    });

    it('should handle localStorage errors gracefully', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('Storage error');
      });
      expect(getStoredTheme()).toBeNull();
    });
  });

describe('getInitialTheme', () => {
    it('should return stored theme if available', () => {
      localStorage.setItem('theme', 'light');
      expect(getInitialTheme()).toBe('light');
    });

    it('should return system preference if no stored theme', () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query) => ({
          matches: query === '(prefers-color-scheme: dark)',
        })),
      });

      expect(getInitialTheme()).toBe('dark');
    });

    it('should prioritize stored theme over system preference', () => {
      localStorage.setItem('theme', 'dark');
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query) => ({
          matches: query !== '(prefers-color-scheme: dark)',
        })),
      });

      expect(getInitialTheme()).toBe('dark');
    });
  });

  describe('setThemeInStorage', () => {
    it('should save theme to localStorage', () => {
      setThemeInStorage('light');
      expect(localStorage.getItem('theme')).toBe('light');
    });

    it('should handle localStorage errors gracefully', () => {
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('Storage error');
      });
      expect(() => setThemeInStorage('dark')).not.toThrow();
      setItemSpy.mockRestore();
    });
  });

  describe('applyThemeToDOM', () => {
    it('should set data-theme attribute', () => {
      const html = document.documentElement;
      applyThemeToDOM('dark');
      expect(html.getAttribute('data-theme')).toBe('dark');
    });

    it('should add dark class for dark theme', () => {
      const html = document.documentElement;
      html.classList.remove('dark');
      applyThemeToDOM('dark');
      expect(html.classList.contains('dark')).toBe(true);
    });

    it('should remove dark class for light theme', () => {
      const html = document.documentElement;
      html.classList.add('dark');
      applyThemeToDOM('light');
      expect(html.classList.contains('dark')).toBe(false);
    });

    it('should switch from dark to light correctly', () => {
      const html = document.documentElement;
      html.classList.add('dark');
      applyThemeToDOM('light');
      expect(html.getAttribute('data-theme')).toBe('light');
      expect(html.classList.contains('dark')).toBe(false);
    });
  });
});
