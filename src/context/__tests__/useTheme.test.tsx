import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ThemeProvider } from '../ThemeContext';
import { useTheme, useThemeColor } from '../useTheme';
import React from 'react';

describe('useTheme Hook', () => {
  beforeEach(() => {
    localStorage.clear();
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: query === '(prefers-color-scheme: dark)',
      })),
    });
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('should throw error when used outside ThemeProvider', () => {
    expect(() => {
      renderHook(() => useTheme());
    }).toThrow('useTheme must be used within ThemeProvider');
  });

  it('should return theme context within provider', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => 
      React.createElement(ThemeProvider, { children });
    
    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current).toHaveProperty('theme');
    expect(result.current).toHaveProperty('toggleTheme');
    expect(result.current).toHaveProperty('setTheme');
  });

  it('should toggle between light and dark themes', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => 
      React.createElement(ThemeProvider, { children });
    
    const { result } = renderHook(() => useTheme(), { wrapper });
    const initialTheme = result.current.theme;

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).not.toBe(initialTheme);
  });

  it('should set specific theme', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => 
      React.createElement(ThemeProvider, { children });
    
    const { result } = renderHook(() => useTheme(), { wrapper });

    act(() => {
      result.current.setTheme('light');
    });

    expect(result.current.theme).toBe('light');

    act(() => {
      result.current.setTheme('dark');
    });

    expect(result.current.theme).toBe('dark');
  });

  it('should persist theme to localStorage', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => 
      React.createElement(ThemeProvider, { children });
    
    const { result } = renderHook(() => useTheme(), { wrapper });

    act(() => {
      result.current.setTheme('light');
    });

    expect(localStorage.getItem('theme')).toBe('light');
  });
});

describe('useThemeColor Hook', () => {
  beforeEach(() => {
    localStorage.clear();
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: query === '(prefers-color-scheme: dark)',
      })),
    });
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('should throw error when used outside ThemeProvider', () => {
    expect(() => {
      renderHook(() => useThemeColor());
    }).toThrow('useTheme must be used within ThemeProvider');
  });

  it('should return dark theme colors by default', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => 
      React.createElement(ThemeProvider, { children });
    
    const { result } = renderHook(() => useThemeColor(), { wrapper });
    
    expect(result.current.bg).toBeDefined();
    expect(result.current.text).toBeDefined();
    expect(result.current.system).toBe('#00C8E8');
  });

  it('should return light theme colors when theme is light', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => 
      React.createElement(ThemeProvider, { children });
    
    const { result: themeResult } = renderHook(() => useTheme(), { wrapper });

    act(() => {
      themeResult.current.setTheme('light');
    });

    const { result: colorResult } = renderHook(() => useThemeColor(), { wrapper });

    expect(colorResult.current.bg).toBe('#F8F8F8');
    expect(colorResult.current.text).toBe('#1A1A1A');
  });

  it('should have all required color properties', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => 
      React.createElement(ThemeProvider, { children });
    
    const { result } = renderHook(() => useThemeColor(), { wrapper });
    
    expect(result.current).toHaveProperty('bg');
    expect(result.current).toHaveProperty('surface');
    expect(result.current).toHaveProperty('elevated');
    expect(result.current).toHaveProperty('text');
    expect(result.current).toHaveProperty('textSecondary');
    expect(result.current).toHaveProperty('muted');
    expect(result.current).toHaveProperty('border');
    expect(result.current).toHaveProperty('system');
    expect(result.current).toHaveProperty('warning');
    expect(result.current).toHaveProperty('error');
    expect(result.current).toHaveProperty('success');
    expect(result.current).toHaveProperty('ai');
  });
});
