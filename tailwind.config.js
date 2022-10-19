const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./modules/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'spin-slow': 'spin 3s linear infinite',
      },
      backgroundImage: {
        'gradient-conic': 'conic-gradient(var(--tw-gradient-stops))',
      },
      fontFamily: {
        sans: ["Inter", ...defaultTheme.fontFamily.sans],
      },
      boxShadow: {
        widget: [
          "0.3px 0.3px 0.3px -0.2px hsl(254deg 100% 16% / 0.9)",
          "0.4px 0.4px 0.4px -0.6px hsl(254deg 100% 16% / 0.8)",
          "1.1px 1.1px 1.2px -1.2px hsl(254deg 100% 16% / 0.7)",
          "2.9px 2.9px 3.1px -1.9px hsl(254deg 100% 16% / 0.6)",
          "6.5px 6.4px 6.8px -2.5px hsl(254deg 100% 16% / 0.5)",
          "12.3px 12.1px 12.9px -3.1px hsl(254deg 100% 16% / 0.4)",
          "21.1px 20.7px 22.2px -3.7px hsl(254deg 100% 16% / 0.3)",
          "33.3px 32.7px 35px -4.4px hsl(254deg 100% 16% / 0.2)",
          "49.6px 48.7px 52.1px -5px hsl(254deg 100% 16% / 0.1)",
        ],
      }
    },
  },
  daisyui: {
    themes: [
      {
        mytheme: {
          primary: "#3406D1",
          secondary: "#f59e0b",
          accent: "#37CDBE",
          neutral: "#000000",
          "neutral-content": "#FFFFFF",
          "base-100": "#000000",
          "base-300": "#131313",
          "base-content": "#FFFFFF",
          info: "#3ABFF8",
          success: "#22c55e",
          warning: "#FBBD23",
          error: "#ef4444",
        },
      },
    ],
  },
  plugins: [
    require('@headlessui/tailwindcss'),
    require("daisyui")
  ],
};
