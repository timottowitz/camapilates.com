
// Bennett Legal Design Language System

export const designTokens = {
  // Color System
  colors: {
    primary: {
      navy: '#1a365d',
      gold: '#c99a2e',
      slate: '#4a5568',
    },
    neutral: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
    semantic: {
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
    }
  },

  // Typography Scale
  typography: {
    fontFamilies: {
      serif: ['Playfair Display', 'Georgia', 'serif'],
      sans: ['Inter', 'system-ui', 'sans-serif'],
    },
    fontSizes: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '3.75rem',
      '7xl': '4.5rem',
      '8xl': '6rem',
    },
    lineHeights: {
      tight: '1.25',
      snug: '1.375',
      normal: '1.5',
      relaxed: '1.625',
      loose: '2',
    }
  },

  // Spacing System
  spacing: {
    section: {
      sm: '4rem',
      md: '6rem',
      lg: '8rem',
      xl: '12rem',
    },
    component: {
      xs: '0.5rem',
      sm: '1rem',
      md: '1.5rem',
      lg: '2rem',
      xl: '3rem',
    }
  },

  // Layout System
  layout: {
    maxWidth: {
      content: '1200px',
      text: '65ch',
      hero: '1400px',
    },
    breakpoints: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    }
  },

  // Animation System
  animations: {
    duration: {
      fast: '200ms',
      normal: '300ms',
      slow: '500ms',
    },
    easing: {
      ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    }
  },

  // Elevation System
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  }
};

export const componentStyles = {
  // Button variants
  button: {
    primary: 'bg-bennett-navy hover:bg-bennett-navy/90 text-white',
    secondary: 'bg-bennett-gold hover:bg-bennett-gold/90 text-bennett-navy',
    outline: 'border-2 border-bennett-navy text-bennett-navy hover:bg-bennett-navy hover:text-white',
    ghost: 'text-bennett-navy hover:bg-bennett-navy/10',
  },
  
  // Card variants
  card: {
    default: 'bg-white border border-gray-200 shadow-lg',
    elevated: 'bg-white border-0 shadow-2xl shadow-gray-900/10',
    glass: 'bg-white/80 backdrop-blur-xl border border-white/20 shadow-xl',
    gradient: 'bg-gradient-to-br from-white to-gray-50 border-0 shadow-xl'
  }
};
