// Tema warna untuk aplikasi NutriMood
export const theme = {
  colors: {
    // Warna primer - nuansa hijau untuk kesehatan dan nutrisi
    primary: {
      50: "#e6f7ea",
      100: "#c3ebd0",
      200: "#9fdfb4",
      300: "#7cd398",
      400: "#58c77d",
      500: "#34bb61", // Warna utama
      600: "#2a9e52",
      700: "#218242",
      800: "#186533",
      900: "#0e4924",
    },

    // Warna sekunder - nuansa biru untuk ketenangan
    secondary: {
      50: "#e6f3ff",
      100: "#cce7ff",
      200: "#99cfff",
      300: "#66b7ff",
      400: "#339fff",
      500: "#0087ff", // Warna utama
      600: "#006cd9",
      700: "#0051b3",
      800: "#00368c",
      900: "#001b66",
    },

    // Aksen - nuansa oranye untuk energi/positif
    accent: {
      50: "#fff8e6",
      100: "#ffefc3",
      200: "#ffe69f",
      300: "#ffdc7c",
      400: "#ffd358",
      500: "#ffca35", // Warna utama
      600: "#d9a92a",
      700: "#b38920",
      800: "#8c6815",
      900: "#66480b",
    },

    // Warna untuk mood
    mood: {
      happy: "#ffca35", // Kuning cerah untuk mood senang
      neutral: "#0087ff", // Biru untuk mood netral
      sad: "#6366f1", // Ungu untuk mood sedih
    },

    // Warna netral
    neutral: {
      50: "#f8fafc",
      100: "#f1f5f9",
      200: "#e2e8f0",
      300: "#cbd5e1",
      400: "#94a3b8",
      500: "#64748b",
      600: "#475569",
      700: "#334155",
      800: "#1e293b",
      900: "#0f172a",
      950: "#020617",
    },

    // Warna untuk notifikasi dan pesan
    status: {
      success: "#22c55e",
      warning: "#f59e0b",
      error: "#ef4444",
      info: "#0ea5e9",
    },

    // Warna background dan teks
    background: {
      light: "#ffffff",
      dark: "#0f172a",
    },
    text: {
      light: "#0f172a",
      dark: "#f8fafc",
    },
  },

  // Bayangan untuk elevasi elemen
  shadows: {
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  },

  // Radius untuk sudut elemen
  borderRadius: {
    sm: "0.125rem",
    md: "0.375rem",
    lg: "0.5rem",
    xl: "0.75rem",
    "2xl": "1rem",
    "3xl": "1.5rem",
    full: "9999px",
  },

  // Ketebalan border
  borderWidth: {
    default: "1px",
    0: "0",
    2: "2px",
    4: "4px",
    8: "8px",
  },

  // Transisi dan animasi
  transition: {
    default: "all 0.2s ease-in-out",
    slow: "all 0.3s ease-in-out",
    fast: "all 0.1s ease-in-out",
  },

  // Font size dan tinggi baris
  typography: {
    fontFamily: {
      sans: "var(--font-geist-sans), system-ui, sans-serif",
      mono: "var(--font-geist-mono), monospace",
    },
    fontSize: {
      xs: "0.75rem",
      sm: "0.875rem",
      base: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
      "4xl": "2.25rem",
      "5xl": "3rem",
      "6xl": "3.75rem",
      "7xl": "4.5rem",
      "8xl": "6rem",
      "9xl": "8rem",
    },
    fontWeight: {
      thin: "100",
      extralight: "200",
      light: "300",
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
      extrabold: "800",
      black: "900",
    },
  },

  // Breakpoints untuk desain responsif
  breakpoints: {
    xs: "320px",
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
  },
};

// CSS variables custom untuk digunakan di seluruh aplikasi
export const cssVariables = `
  :root {
    /* Colors */
    --color-primary: ${theme.colors.primary[500]};
    --color-primary-dark: ${theme.colors.primary[700]};
    --color-primary-light: ${theme.colors.primary[300]};
    
    --color-secondary: ${theme.colors.secondary[500]};
    --color-secondary-dark: ${theme.colors.secondary[700]};
    --color-secondary-light: ${theme.colors.secondary[300]};
    
    --color-accent: ${theme.colors.accent[500]};
    --color-accent-dark: ${theme.colors.accent[700]};
    --color-accent-light: ${theme.colors.accent[300]};
    
    --color-mood-happy: ${theme.colors.mood.happy};
    --color-mood-neutral: ${theme.colors.mood.neutral};
    --color-mood-sad: ${theme.colors.mood.sad};
    
    --color-success: ${theme.colors.status.success};
    --color-warning: ${theme.colors.status.warning};
    --color-error: ${theme.colors.status.error};
    --color-info: ${theme.colors.status.info};
    
    /* Shadows */
    --shadow-sm: ${theme.shadows.sm};
    --shadow-md: ${theme.shadows.md};
    --shadow-lg: ${theme.shadows.lg};
    --shadow-xl: ${theme.shadows.xl};
    
    /* Border Radius */
    --radius-sm: ${theme.borderRadius.sm};
    --radius-md: ${theme.borderRadius.md};
    --radius-lg: ${theme.borderRadius.lg};
    --radius-xl: ${theme.borderRadius.xl};
    
    /* Transitions */
    --transition-default: ${theme.transition.default};
    --transition-slow: ${theme.transition.slow};
    --transition-fast: ${theme.transition.fast};
  }
`;

export default theme;
