// src/styles/colors.jsx
// Hardware POS System – Unified Color System (60 / 30 / 10 Rule)

export const colors = {
  /* ======================================================
     BACKGROUND / BASE (60%)
  ====================================================== */
  background: {
    primary: "#F4F6F8", // Main app background
    secondary: "#FFFFFF", // Cards, modals, tables
    subtle: "#EEF1F4", // Alternate rows, separators
    disabled: "#E2E6EA",
  },

  /* ======================================================
     PRIMARY UI / STRUCTURE (30%)
  ====================================================== */
  primary: {
    DEFAULT: "#1F3A5F", // Header, sidebar, main UI
    hover: "#162B45", // Hover state
    active: "#0F1F33", // Active / pressed
    light: "#2E4C73", // Lighter variant
    subtle: "#DCE4EF",
    // Background tint
  },

  /* ======================================================
     ACCENT / ACTION (10%)
  ====================================================== */
  accent: {
    DEFAULT: "#F97316", // Primary action color
    hover: "#EA580C",
    active: "#C2410C",
    light: "#FDBA74",
    subtle: "#FFEDD5",
  },

  error: {
    DEFAULT: "#DC2626",
    hover: "#B91C1C",
    active: "#991B1B",
    light: "#DC2626",
    subtle: "#FEE2E2",
  },

  /* ======================================================
     BUTTONS
  ====================================================== */
  /* ======================================================
   BUTTONS (FIXED – follows 60 / 30 / 10)
====================================================== */
  button: {
    primary: {
      bg: "#1F3A5F", // primary.DEFAULT
      hover: "#162B45", // primary.hover
      active: "#0F1F33", // primary.active
      text: "#FFFFFF",
      disabled: "#8FA3BC", // muted primary
    },

    secondary: {
      bg: "#F97316", // accent.DEFAULT
      hover: "#EA580C", // accent.hover
      active: "#C2410C", // accent.active
      text: "#FFFFFF",
      disabled: "#FDBA74", // accent.light
    },

    ghost: {
      bg: "transparent",
      hover: "#FFEDD5", // accent.subtle
      active: "#FED7AA",
      text: "#F97316",
    },
  },

  /* ======================================================
     TEXT
  ====================================================== */
  text: {
    primary: "#0F172A", // Main content
    secondary: "#475569", // Sub text
    tertiary: "#64748B", // Muted
    inverse: "#FFFFFF", // On dark backgrounds
    disabled: "#94A3B8",
    link: "#1F3A5F",
    linkHover: "#162B45",
  },

  /* ======================================================
     STATUS (GLOBAL)
  ====================================================== */
  status: {
    success: {
      DEFAULT: "#16A34A",
      bg: "#DCFCE7",
      text: "#14532D",
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

  /* ======================================================
     BORDERS / RINGS
  ====================================================== */
  border: {
    DEFAULT: "#F97316",
    light: "#E2E8F0",
    dark: "#94A3B8",
    focus: "#F97316",
  },

  ring: {
    focus: "#F97316",
    subtle: "#CBD5E1",
  },

  /* ======================================================
     TABLE / POS ROW STATES
  ====================================================== */
  table: {
    header: "#E8EDF3",
    row: "#FFFFFF",
    rowAlt: "#F1F5F9",
    rowHover: "#FFEDD5",
    selected: "#FED7AA",
  },

  /* ======================================================
     ICONS
  ====================================================== */
  icon: {
    primary: "#1F3A5F",
    secondary: "#64748B",
    accent: "#F97316",
    success: "#16A34A",
    error: "#DC2626",
  },

  /* ======================================================
     OVERLAYS / MODALS
  ====================================================== */
  overlay: {
    dark: "rgba(15, 23, 42, 0.6)",
    light: "rgba(255, 255, 255, 0.6)",
  },
};

export default colors;
