/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        /* ===============================
           BASE / BACKGROUND
        =============================== */
        background: {
          primary: "#F4F6F8",
          secondary: "#FFFFFF",
          subtle: "#EEF1F4",
          disabled: "#E2E6EA",
        },

        /* ===============================
           STRUCTURE / UI (PRIMARY)
        =============================== */
        primary: {
          DEFAULT: "#1F3A5F",
          hover: "#162B45",
          active: "#0F1F33",
          light: "#2E4C73",
          subtle: "#DCE4EF",
        },

        /* ===============================
           ACCENT / ACTION
        =============================== */
        accent: {
          DEFAULT: "#F97316",
          hover: "#EA580C",
          active: "#C2410C",
          light: "#FDBA74",
          subtle: "#FFEDD5",
        },

        /* ===============================
           TEXT COLORS
        =============================== */
        text: {
          primary: "#0F172A",
          secondary: "#475569",
          tertiary: "#64748B",
          inverse: "#FFFFFF",
          disabled: "#94A3B8",
          link: "#1F3A5F",
          linkHover: "#162B45",
          error: "#DC2626",
          success: "#16A34A",
        },

        /* ===============================
           STATUS COLORS
        =============================== */
        success: {
          DEFAULT: "#16A34A",
          bg: "#DCFCE7",
          text: "#14532D",
        },
        error: {
          DEFAULT: "#DC2626",
          bg: "#FEE2E2",
          text: "#7F1D1D",
          "error-text": "#7F1D1D"
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
           BORDERS / RINGS
        =============================== */
        border: {
          light: "#E2E8F0",
          DEFAULT: "#CBD5E1",
          dark: "#94A3B8",
          focus: "#F97316",
        },
      },

      /* ===============================
         SHADOWS (POS SAFE)
      =============================== */
      boxShadow: {
        sm: "0 1px 2px rgba(0,0,0,0.05)",
        md: "0 4px 8px rgba(0,0,0,0.08)",
        lg: "0 8px 16px rgba(0,0,0,0.12)",
      },

      /* ===============================
         RING COLORS
      =============================== */
      ringColor: {
        focus: "#F97316",
        subtle: "#CBD5E1",
      },
    },
  },
  plugins: [],
};
