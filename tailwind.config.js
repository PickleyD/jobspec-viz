const { fontFamily } = require("tailwindcss/defaultTheme");

module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./modules/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
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
          DEFAULT: "hsl(var(--primary) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
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
        'success-light': "#3ddd78",
        'success-dark': "#1a9a49",
        'error-light': "#ef4444",
        'error-dark': "#bd1010",
        'secondary-light': "#f7b13c",
        'secondary-dark': "#c57f08"
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      backgroundImage: {
        'gradient-conic': 'conic-gradient(var(--tw-gradient-stops))',
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-radial-top': 'radial-gradient(circle 100px at center top, var(--tw-gradient-stops))',
        'gradient-radial-bottom': 'radial-gradient(circle 100px at center bottom, var(--tw-gradient-stops))',
        'gradient-copper': 'linear-gradient(#3a200f, #5d3318, #3a200f)',
        'noise': `url("/noise.svg")`,
        'split-handle': `url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAeCAYAAADkftS9AAAAIklEQVQoU2M4c+bMfxAGAgYYmwGrIIiDjrELjpo5aiZeMwF+yNnOs5KSvgAAAABJRU5ErkJggg==')`
      },
      borderRadius: {
        lg: `var(--radius)`,
        md: `calc(var(--radius) - 2px)`,
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["Inter", ...fontFamily.sans],
        hand: ["PatrickHand", "cursive"],
      },
      dropShadow: {
        glow: [
          "0 0px 20px rgba(255,255, 255, 0.35)",
          "0 0px 65px rgba(255, 255,255, 0.2)",
        ],
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
    },
  },
  daisyui: {
    themes: [
      // {
      //   mytheme: {
      //     // primary: "#ffaaaa",
      //     // secondary: "#aaeeff",
      //     // accent: "#ffeeaa",
      //     // Darkened 15%:
      //     primary: "#ff6a6a",
      //     secondary: "#6ae1ff",
      //     accent: "#ffe16a",
      //     neutral: "#3a200f",
      //     "neutral-content": "#d28453",
      //     "background": "#000000",
      //     "muted": "#0a0a0a",
      //     "muted": "#1a1a1a",
      //     "base-content": "#cfcfcf",
      //     info: "#3ABFF8",
      //     success: "#22c55e",
      //     warning: "#FBBD23",
      //     error: "#eb1515",
      //   },
      // },
    ],
  },
  plugins: [
    require('@headlessui/tailwindcss'),
    require("daisyui"), // TODO replace usages of daisyui and remove
    require("tailwindcss-animate")
  ],
};
