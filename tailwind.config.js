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
        'noise': `url("data:image/svg+xml,%3C!-- svg: first layer --%3E%3Csvg viewBox='0 0 250 250' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='4' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
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
          primary: "#232323",
          secondary: "#ffeeaa",
          accent: "#aaeeff",
          neutral: "#000000",
          "neutral-content": "#FFFFFF",
          "base-100": "#000000",
          "base-200": "#111111",
          "base-300": "#222222",
          "base-content": "#FFFFFF",
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
