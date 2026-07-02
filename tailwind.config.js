/** @type {import('tailwindcss').Config} */
const teluPrimary = "#d81717";
const teluBlack = "#000000";
const teluWhite = "#ffffff";

const accentPalette = {
  50: teluWhite,
  100: teluWhite,
  200: teluWhite,
  300: teluPrimary,
  400: teluPrimary,
  500: teluPrimary,
  600: teluPrimary,
  700: teluPrimary,
  800: teluBlack,
  900: teluBlack,
  950: teluBlack,
};

const neutralPalette = {
  50: teluWhite,
  100: teluWhite,
  200: teluPrimary,
  300: teluBlack,
  400: teluBlack,
  500: teluBlack,
  600: teluBlack,
  700: teluBlack,
  800: teluBlack,
  900: teluBlack,
  950: teluBlack,
};

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    colors: {
      inherit: "inherit",
      current: "currentColor",
      transparent: "transparent",
      black: teluBlack,
      white: teluWhite,
      primary: teluPrimary,
      red: accentPalette,
      blue: accentPalette,
      green: accentPalette,
      teal: accentPalette,
      amber: accentPalette,
      yellow: accentPalette,
      purple: accentPalette,
      pink: accentPalette,
      sky: accentPalette,
      rose: accentPalette,
      gray: neutralPalette,
    },
  },
  plugins: [],
};
