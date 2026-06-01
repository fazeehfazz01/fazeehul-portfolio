import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fazeehul Lisan | Graphic Designer",
  description:
    "A premium portfolio for Fazeehul Lisan, graphic designer specializing in branding, logo design, packaging, print, and social media design.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
