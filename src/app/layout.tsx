import { getSettings } from "@/lib/settings";
import type { Metadata } from "next";
import "./globals.css";
import Layout from "@/components/Layout";


export const metadata: Metadata = {
  title: "RYTHM/ — Toko Sepatu",
  description:
    "Jelajahi dan beli sepatu kekinian melalui toko online yang menarik, dengan pilihan gaya untuk membantu Anda menemukan pasangan yang tepat.",
  robots: { index: false },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  return (
    <html lang="id">
      <body>
        <Layout settings={settings}>{children}</Layout>
      </body>
    </html>
  );
}
