import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "burnt-orange": {
          DEFAULT: "#BF5700",
          50: "#FFF5EB",
          100: "#FFE6D1",
          200: "#FFC9A3",
          300: "#FFAB75",
          400: "#FF8E47",
          500: "#FF7119",
          600: "#BF5700",
          700: "#8B3E00",
          800: "#5C2900",
          900: "#2D1400",
        },
      },
    },
  },
  plugins: [],
};

export default config;
