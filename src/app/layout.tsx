import { getSettings } from "@/lib/settings";
import type { Metadata } from "next";
import "./globals.css";
import Layout from "@/components/Layout";


export const metadata: Metadata = {
  title: "RYTHM/ — Sneaker Store",
  description:
    "Browse and buy modern sneakers from an independent online store, with styles to help you find the perfect pair.",
  robots: { index: false },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  return (
    <html lang="en">
      <body>
        <Layout settings={settings}>{children}</Layout>
      </body>
    </html>
  );
}
