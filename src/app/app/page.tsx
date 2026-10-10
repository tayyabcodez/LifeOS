'use client';
import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function AppPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="font-display text-4xl mb-4">Home coming in Step 3</h1>
      <Link href="/">
        <Button variant="secondary">← Back to Landing</Button>
      </Link>
    </main>
  );
}
