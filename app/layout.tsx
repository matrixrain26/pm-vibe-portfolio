import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Product Manager Portfolio",
  description: "A product manager portfolio with editable projects, writing, and contact content."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
