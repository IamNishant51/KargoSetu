/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1440px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // KargoSetu brand palette (lifted from logo)
        navy: {
          DEFAULT: "#0E2841",
          50: "#F0F5F9",
          100: "#E1EAF1",
          200: "#C3D5E3",
          300: "#92B0C7",
          400: "#5C84A6",
          500: "#3A6287",
          600: "#2B4D6B",
          700: "#1E3A52",
          800: "#15293B",
          900: "#0E2841",
          950: "#08182A",
        },
        saffron: {
          DEFAULT: "#F58A2A",
          50: "#FEF6EC",
          100: "#FDEBD5",
          200: "#FBD4A7",
          300: "#F8B66E",
          400: "#F49235",
          500: "#F58A2A",
          600: "#E76A12",
          700: "#BF4F0F",
          800: "#993F12",
          900: "#7D3514",
          950: "#451A07",
        },
        sea: {
          DEFAULT: "#1B6FB8",
          50: "#EFF6FC",
          100: "#DBEAF7",
          200: "#BFD8EE",
          300: "#92BFE0",
          400: "#5E9CCC",
          500: "#3C82B9",
          600: "#1B6FB8",
          700: "#155498",
          800: "#164778",
          900: "#163D62",
          950: "#0B2741",
        },
        leaf: {
          DEFAULT: "#138808",
          50: "#EDFBE6",
          100: "#D6F5C7",
          200: "#B0EA94",
          300: "#82DA5C",
          400: "#56C233",
          500: "#138808",
          600: "#0E7307",
          700: "#0D5C09",
          800: "#0E490B",
          900: "#0E3C0C",
          950: "#042004",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        display: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "shimmer": {
          "100%": { transform: "translateX(100%)" },
        },
        "pulse-dot": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.4s ease-out",
        "shimmer": "shimmer 2s infinite",
        "pulse-dot": "pulse-dot 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
