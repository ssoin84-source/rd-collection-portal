import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#081726",
          900: "#0F2A4A",
          800: "#153A63",
          700: "#1E4C7D",
        },
        gold: {
          500: "#C9A227",
          400: "#D9B84A",
          100: "#F7EFD2",
        },
        ink: "#101828",
        paper: "#F7F8FA",
        success: "#1B8354",
        danger: "#C0392B",
      },
      fontFamily: {
        display: ["var(--font-sora)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "14px",
      },
    },
  },
  plugins: [],
};
export default config;
