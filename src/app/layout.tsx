import type { Metadata } from "next";
import { Geist, Inter, Instrument_Serif } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LIFEOS",
  description: "Your life, in one clear view.",
  icons: {
    icon: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${inter.variable} ${instrumentSerif.variable} antialiased`}
    >
      <body className="min-h-full flex flex-col font-body bg-paper text-ink selection:bg-study-fill selection:text-study-deep">
        {children}
      </body>
    </html>
  );
}
