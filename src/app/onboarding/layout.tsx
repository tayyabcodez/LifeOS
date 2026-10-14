import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'LIFEOS · Onboarding',
  description: 'Rebalance your focus, energy, and goals with LIFEOS.',
};

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
