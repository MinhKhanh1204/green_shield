import { useCallback, useEffect, useState } from 'react';

export default function useDesignTheme() {
  const [themeMode, setThemeMode] = useState(() => {
    if (typeof window === 'undefined') return 'light';
    return localStorage.getItem('greenshield-theme') || document.documentElement.dataset.theme || 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('theme-transition');
    root.setAttribute('data-theme', themeMode);
    localStorage.setItem('greenshield-theme', themeMode);
    const timer = window.setTimeout(() => root.classList.remove('theme-transition'), 420);
    return () => window.clearTimeout(timer);
  }, [themeMode]);

  const toggleThemeMode = useCallback(() => {
    setThemeMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  return {
    themeMode,
    toggleThemeMode,
  };
}
