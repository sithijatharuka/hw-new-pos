// src/styles/colors.jsx
// Hardware POS System – Unified Color System (60 / 30 / 10)

export const colors = {
  /* ===============================
     BASE / BACKGROUND (60%)
  =============================== */
  background: {
    primary: "#F4F6F8", // Main app background
    secondary: "#FFFFFF", // Cards, modals, tables
    subtle: "#EEF1F4", // Alternate rows, separators
    disabled: "#E2E6EA", // Disabled surfaces
  },

  /* ===============================
     STRUCTURE / UI (30%)
  =============================== */
  primary: {
    DEFAULT: "#1F3A5F", // Header, sidebar, main UI
    hover: "#162B45", // Hover on primary UI
    active: "#0F1F33", // Active/pressed state
    light: "#2E4C73", // Lighter variant
    subtle: "#DCE4EF", // Background tint usage
  },

  /* ===============================
     ACCENT / ACTION (10%)
  =============================== */
  accent: {
    DEFAULT: "#F97316", // Main action color
    hover: "#EA580C", // Hover state
    active: "#C2410C", // Pressed state
    light: "#FDBA74", // Soft accent
    subtle: "#FFEDD5", // Background highlights
  },

  /* ===============================
     BUTTON COLORS
  =============================== */
  button: {
    primary: {
      bg: "#F97316",
      hover: "#EA580C",
      active: "#C2410C",
      text: "#FFFFFF",
      disabled: "#FDBA74",
    },
    secondary: {
      bg: "#1F3A5F",
      hover: "#162B45",
      active: "#0F1F33",
      text: "#FFFFFF",
      disabled: "#8FA3BC",
    },
    ghost: {
      bg: "transparent",
      hover: "#FFEDD5",
      active: "#FED7AA",
      text: "#F97316",
    },
  },

  /* ===============================
     TEXT COLORS
  =============================== */
  text: {
    primary: "#0F172A", // Main text
    secondary: "#475569", // Sub text
    tertiary: "#64748B", // Muted text
    inverse: "#FFFFFF", // Text on dark backgrounds
    disabled: "#94A3B8", // Disabled text
    link: "#1F3A5F",
    linkHover: "#162B45",
  },
  
  success: {
    DEFAULT: "#16A34A",
    bg: "#DCFCE7",
    text: "#14532D",
  },
  error: {
    DEFAULT: "#DC2626",
    bg: "#FEE2E2",
    text: "#7F1D1D",
  },
  warning: {
    DEFAULT: "#D97706",
    bg: "#FEF3C7",
    text: "#78350F",
  },
  pending: {
    DEFAULT: "#2563EB",
    bg: "#DBEAFE",
    text: "#1E3A8A",
  },

  /* ===============================
     STATUS COLORS (POS-CRITICAL)
  =============================== */
  status: {
    success: {
      DEFAULT: "#16A34A",
      bg: "#DCFCE7",
      text: "#14532D",
    },
    error: {
      DEFAULT: "#DC2626",
      bg: "#FEE2E2",
      text: "#7F1D1D",
    },
    warning: {
      DEFAULT: "#D97706",
      bg: "#FEF3C7",
      text: "#78350F",
    },
    pending: {
      DEFAULT: "#2563EB",
      bg: "#DBEAFE",
      text: "#1E3A8A",
    },
  },

  /* ===============================
     BORDERS / RINGS / DIVIDERS
  =============================== */
  border: {
    light: "#E2E8F0",
    DEFAULT: "#CBD5E1",
    dark: "#94A3B8",
    focus: "#F97316",
  },

  ring: {
    focus: "#F97316",
    subtle: "#CBD5E1",
  },

  /* ===============================
     TABLE / POS ROW STATES
  =============================== */
  table: {
    header: "#E8EDF3",
    row: "#FFFFFF",
    rowAlt: "#F1F5F9",
    rowHover: "#FFEDD5",
    selected: "#FED7AA",
  },

  /* ===============================
     ICONS
  =============================== */
  icon: {
    primary: "#1F3A5F",
    secondary: "#64748B",
    accent: "#F97316",
    success: "#16A34A",
    error: "#DC2626",
  },

  /* ===============================
     OVERLAYS / MODALS
  =============================== */
  overlay: {
    dark: "rgba(15, 23, 42, 0.6)",
    light: "rgba(255, 255, 255, 0.6)",
  },
};

export default colors;
