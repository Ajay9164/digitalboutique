import { Cormorant_Garamond, Outfit, Syne } from "next/font/google";

export const fontSans = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const fontDisplay = Syne({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["500", "600", "700", "800"],
});

/** Wide-tracked serif for cinematic title cards. */
export const fontCinema = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cinema",
  display: "swap",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});
