import { useEffect, useState } from 'react';
import { useTheme as useNextTheme } from 'next-themes';

export function useTheme() {
  const { theme, setTheme, resolvedTheme } = useNextTheme();
  const [mounted, setMounted] = useState(false);

  // After mounting, we can access the theme
  useEffect(() => {
    setMounted(true);
  }, []);

  return {
    theme,
    setTheme,
    resolvedTheme,
    isDark: mounted && resolvedTheme === 'dark',
    isLight: mounted && resolvedTheme === 'light',
    mounted,
    toggleTheme: () => {
      if (resolvedTheme === 'dark') {
        setTheme('light');
      } else {
        setTheme('dark');
      }
    }
  };
}

export default useTheme;
