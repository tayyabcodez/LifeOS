import React from 'react';
import { Metadata } from 'next';
import { Dashboard } from '@/components/dashboard/Dashboard';

export const metadata: Metadata = {
  title: 'LifeOS · Home',
  description: 'Your life, in one clear view.',
};

export default function AppPage() {
  return <Dashboard />;
}
