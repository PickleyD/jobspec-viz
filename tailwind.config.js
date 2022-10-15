const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./modules/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
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
        blackonblack: [
          "0.3px 0.3px 0.3px -0.2px hsl(0deg 0% 10% / 0.9)",
          "0.4px 0.4px 0.4px -0.6px hsl(0deg 0% 10% / 0.8)",
          "1.1px 1.1px 1.2px -1.2px hsl(0deg 0% 10% / 0.7)",
          "2.9px 2.9px 3.1px -1.9px hsl(0deg 0% 10% / 0.6)",
          "6.5px 6.4px 6.8px -2.5px hsl(0deg 0% 10% / 0.5)"
        ],
        blacksoft: [
          "4px 4px 8px #0e0e0e",
          "-4px -4px 8px #202020"
        ],
        blacksofthover: [
          "4px 4px 8px #121212",
          "-4px -4px 8px #1c1c1c"
        ]
      },
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
          "base-100": "#171717",
          "base-300": "#000000",
          "base-content": "#FFFFFF",
          info: "#3ABFF8",
          success: "#36D399",
          warning: "#FBBD23",
          error: "#F87272",
        },
      },
    ],
  },
  plugins: [require("daisyui")],
};
