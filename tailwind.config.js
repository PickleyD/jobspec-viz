const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./modules/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'success-light': "#3ddd78",
        'success-dark': "#1a9a49",
        'error-light': "#ef4444",
        'error-dark': "#bd1010",
        'secondary-light': "#f7b13c",
        'secondary-dark': "#c57f08"
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
      },
      backgroundImage: {
        'gradient-conic': 'conic-gradient(var(--tw-gradient-stops))',
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'noise': `url("/noise.svg")`,
        'split-handle': `url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAeCAYAAADkftS9AAAAIklEQVQoU2M4c+bMfxAGAgYYmwGrIIiDjrELjpo5aiZeMwF+yNnOs5KSvgAAAABJRU5ErkJggg==')`
      },
      fontFamily: {
        sans: ["Inter", ...defaultTheme.fontFamily.sans],
        hand: ["PatrickHand", "cursive"],
      },
      dropShadow: {
        glow: [
          "0 0px 20px rgba(255,255, 255, 0.35)",
          "0 0px 65px rgba(255, 255,255, 0.2)",
        ],
      }
    },
  },
  daisyui: {
    themes: [
      {
        mytheme: {
          // primary: "#ffaaaa",
          // secondary: "#aaeeff",
          // accent: "#ffeeaa",
          // Darkened 15%:
          primary: "#ff6a6a",
          secondary: "#6ae1ff",
          accent: "#ffe16a",
          neutral: "#000000",
          "neutral-content": "#cfcfcf",
          "base-100": "#000000",
          "base-200": "#0a0a0a",
          "base-300": "#1a1a1a",
          "base-content": "#cfcfcf",
          info: "#3ABFF8",
          success: "#22c55e",
          warning: "#FBBD23",
          error: "#eb1515",
        },
      },
    ],
  },
  plugins: [
    require('@headlessui/tailwindcss'),
    require("daisyui")
  ],
};
