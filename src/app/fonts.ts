import { Geist, Geist_Mono } from "next/font/google";

// Shared by the locale layout and the root 404 page, which each render their own <html>.
export const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
  display: "swap",
  preload: true,
});

export const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "latin-ext"],
  display: "swap",
  preload: true,
});

export const fontClassName = `${geistSans.variable} ${geistMono.variable} font-sans antialiased`;
