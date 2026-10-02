import { useContext } from 'react';
import { ThemeContext } from './ThemeContext';

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

// Helper hook for color mapping
export function useThemeColor() {
  const { theme } = useTheme();

  const colors = {
    bg: theme === 'dark' ? '#050505' : '#F8F8F8',
    surface: theme === 'dark' ? '#0B0B0B' : '#F0F0F0',
    elevated: theme === 'dark' ? '#111111' : '#E8E8E8',
    text: theme === 'dark' ? '#F5F5F5' : '#1A1A1A',
    textSecondary: theme === 'dark' ? '#8A8A8A' : '#5A5A5A',
    muted: theme === 'dark' ? '#4A4A4A' : '#A0A0A0',
    border: theme === 'dark' ? '#202020' : '#D8D8D8',
    system: theme === 'dark' ? '#00C8E8' : '#00A8D8',
    warning: '#F59E0B',
    error: '#EF4444',
    success: '#22C55E',
    ai: '#8B5CF6',
  };

  return colors;
}
