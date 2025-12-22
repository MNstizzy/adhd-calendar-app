import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type ThemeOption = 'light' | 'dark' | 'system' | 'sunset' | 'ocean';

interface Preferences {
  theme: ThemeOption;
  notificationsEnabled: boolean;
}

interface PreferencesContextType {
  preferences: Preferences;
  setPreferences: (preferences: Preferences) => void;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

const PREFERENCES_KEY = 'adhd_prefs_v1';

const applyTheme = (theme: ThemeOption) => {
  const root = document.documentElement;
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

  // remove all theme classes
  root.classList.remove('theme-light', 'theme-sunset', 'theme-ocean');

  if (theme === 'light') {
    root.classList.add('theme-light');
  } else if (theme === 'dark') {
    // default dark is the base :root; ensure light class removed
  } else if (theme === 'sunset') {
    root.classList.add('theme-sunset');
  } else if (theme === 'ocean') {
    root.classList.add('theme-ocean');
  } else if (theme === 'system') {
    if (!prefersDark) root.classList.add('theme-light');
  }
};

export const PreferencesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [preferences, setPreferencesState] = useState<Preferences>(() => {
    try {
      const raw = localStorage.getItem(PREFERENCES_KEY);
      if (raw) return JSON.parse(raw) as Preferences;
    } catch {}
    return { theme: 'dark', notificationsEnabled: true } as Preferences;
  });

  useEffect(() => {
    applyTheme(preferences.theme);
    try {
      localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
    } catch {}
  }, [preferences]);

  const setPreferences = (next: Preferences) => {
    setPreferencesState(next);
  };

  // react to system theme changes when user picks 'system'
  useEffect(() => {
    const mq = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
    const handle = () => {
      if (preferences.theme === 'system') applyTheme('system');
    };
    if (mq && mq.addEventListener) mq.addEventListener('change', handle);
    else if (mq && mq.addListener) mq.addListener(handle as any);
    return () => {
      if (mq && mq.removeEventListener) mq.removeEventListener('change', handle as any);
      else if (mq && mq.removeListener) mq.removeListener(handle as any);
    };
  }, [preferences.theme]);

  return (
    <PreferencesContext.Provider value={{ preferences, setPreferences }}>
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = (): PreferencesContextType => {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
};