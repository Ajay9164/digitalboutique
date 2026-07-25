import { Outfit, Syne } from "next/font/google";

export const fontSans = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const fontDisplay = Syne({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});
