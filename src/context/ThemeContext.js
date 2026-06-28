// Theme context — provides the active palette + a toggle, and remembers
// the choice across app restarts via AsyncStorage. Default: PAU Blue.
import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PALETTES } from '../palettes';

const ThemeContext = createContext(null);
const STORAGE_KEY = 'fyp-theme';

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('blue');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((v) => { if (v === 'classic' || v === 'blue') setTheme(v); })
      .catch(() => {});
  }, []);

  const choose = (t) => {
    setTheme(t);
    AsyncStorage.setItem(STORAGE_KEY, t).catch(() => {});
  };
  const toggleTheme = () => choose(theme === 'blue' ? 'classic' : 'blue');

  const pal = PALETTES[theme] || PALETTES.blue;
  const value = { theme, toggleTheme, setTheme: choose, colors: pal.colors, showLogo: pal.showLogo };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
