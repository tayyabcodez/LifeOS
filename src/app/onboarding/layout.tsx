import type { Metadata } from 'next';
import { Instrument_Serif, Inter, Geist } from 'next/font/google';

const instrumentSerif = Instrument_Serif({
  weight: '400',
  style: ['normal', 'italic'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-instrument-serif',
});

const inter = Inter({
  weight: ['400', '500', '600'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const geist = Geist({
  weight: ['500', '600'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-geist',
});

export const metadata: Metadata = {
  title: 'LIFEOS · Onboarding',
  description: 'Rebalance your focus, energy, and goals with LIFEOS.',
};

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${instrumentSerif.variable} ${inter.variable} ${geist.variable}`}
      style={{ minHeight: '100%' }}
    >
      {children}
    </div>
  );
}
