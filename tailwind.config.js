/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  corePlugins: {
    preflight: false,
  },
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
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
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        brand: {
          plum: "#4A1830",
          rose: "#8B1D41",
          gold: "#caa64d",
          cream: "#FBF6F4",
        },
      },
      keyframes: {
        shimmer: {
          "100%": { transform: "translateX(100%)" }
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-up-delay": "fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.12s both",
        "float-slow": "float-slow 9s cubic-bezier(0.76, 0, 0.24, 1) infinite",
      },
      transitionTimingFunction: {
        "expo-lux": "cubic-bezier(0.76, 0, 0.24, 1)",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(255,255,255,0.12), 0 25px 80px rgba(155,74,108,0.28)",
        lux: "0 8px 40px rgba(61, 36, 50, 0.07), 0 2px 8px rgba(61, 36, 50, 0.04)",
        "lux-lg": "0 20px 60px rgba(61, 36, 50, 0.1), 0 4px 16px rgba(61, 36, 50, 0.05)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
};
