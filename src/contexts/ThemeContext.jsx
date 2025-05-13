
import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

const getThemeConfig = (styles = []) => {
  // Primary style detection
  const isElegant = styles.includes('elegant') || styles.includes('formal');
  const isCasual = styles.includes('casual') || styles.includes('streetwear');
  const isSporty = styles.includes('sporty');
  const isBoho = styles.includes('boho') || styles.includes('artistic');

  // Theme configurations
  const themes = {
    elegant: {
      fontFamily: "'Playfair Display', 'Merriweather', 'Libre Baskerville', serif",
      colors: {
        primary: 'navy',
        secondary: 'burgundy',
        accent: 'gold',
        background: 'cream'
      },
      style: 'elegant'
    },
    sporty: {
      fontFamily: "'Montserrat', 'Oswald', 'Roboto Bold', sans-serif",
      colors: {
        primary: 'red',
        secondary: 'black',
        accent: 'neon',
        background: 'white'
      },
      style: 'sporty'
    },
    boho: {
      fontFamily: "'Quicksand', 'Dancing Script', 'Pacifico', sans-serif",
      colors: {
        primary: 'olive',
        secondary: 'coral',
        accent: 'terra-cotta',
        background: 'sand'
      },
      style: 'boho'
    },
    casual: {
      fontFamily: "'Nunito', 'Open Sans', 'Lato', sans-serif",
      colors: {
        primary: 'purple',
        secondary: 'indigo',
        accent: 'pink',
        background: 'white'
      },
      style: 'casual'
    }
  };

  // Determine primary theme
  if (isElegant) return themes.elegant;
  if (isSporty) return themes.sporty;
  if (isBoho) return themes.boho;
  return themes.casual; // Default theme
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState({
    fontFamily: 'sans-serif',
    colors: {
      primary: 'purple',
      secondary: 'indigo',
      accent: 'pink'
    },
    style: 'casual'
  });

  useEffect(() => {
    const userStyle = localStorage.getItem('userStyle');
    if (userStyle) {
      const { styles = [] } = JSON.parse(userStyle);
      const newTheme = getThemeConfig(styles);

      setTheme(newTheme);
      
      // Apply theme to CSS variables
      document.documentElement.style.setProperty('--font-family', newTheme.fontFamily);
      document.documentElement.style.setProperty('--color-primary', newTheme.colors.primary);
      document.documentElement.style.setProperty('--color-secondary', newTheme.colors.secondary);
      document.documentElement.style.setProperty('--color-accent', newTheme.colors.accent);
      
      // Remove all theme classes first
      document.documentElement.classList.remove('theme-elegant', 'theme-sporty', 'theme-boho', 'theme-casual');
      // Add new theme class
      document.documentElement.classList.add(`theme-${newTheme.style}`);
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
