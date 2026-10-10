import React from 'react';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Card } from '@/components/ui/Card';
import { DeltaTag } from '@/components/ui/DeltaTag';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';

export default function DevComponentsPage() {
  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto space-y-12">
      <header className="mb-12">
        <h1 className="font-display text-5xl mb-4">UI Components</h1>
        <p className="text-ink-2">Daylight & Night theme preview.</p>
      </header>

      <section className="space-y-6">
        <h2 className="font-heading text-2xl">Typography</h2>
        <div className="space-y-4 bg-surface p-6 rounded-[20px] border border-line">
          <p className="font-display text-5xl">Display Headline (Instrument Serif)</p>
          <p className="font-heading text-2xl font-semibold">Heading (Geist)</p>
          <p className="font-body text-base">Body Text (Inter) — The quick brown fox jumps over the lazy dog.</p>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="font-heading text-2xl">Buttons</h2>
        <div className="flex gap-4 p-6 bg-surface border border-line rounded-[20px]">
          <Button variant="primary">Primary Button</Button>
          <Button variant="secondary">Secondary Button</Button>
          <Button variant="ghost">Ghost Button</Button>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="font-heading text-2xl">Chips</h2>
        <div className="flex gap-4 flex-wrap p-6 bg-surface border border-line rounded-[20px]">
          <Chip>Default Chip</Chip>
          <Chip selected>Selected Chip</Chip>
          <Chip selected colorFillVar="var(--color-study-fill)">Study Chip</Chip>
          <Chip selected colorFillVar="var(--color-health-fill)">Health Chip</Chip>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="font-heading text-2xl">Cards & Metrics</h2>
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-6 space-y-4" hoverable>
            <h3 className="font-heading text-lg font-medium text-ink-2">Hoverable Card</h3>
            <div className="flex items-baseline gap-2">
              <span className="font-heading text-4xl"><AnimatedNumber value={84} /></span>
              <DeltaTag delta={14} unit="%" />
            </div>
            <ProgressBar value={84} colorVar="var(--color-focus-fill)" />
          </Card>
          
          <Card className="p-6 space-y-4">
            <h3 className="font-heading text-lg font-medium text-ink-2">Static Card</h3>
            <div className="flex items-baseline gap-2">
              <span className="font-heading text-4xl"><AnimatedNumber value={61} /></span>
              <DeltaTag delta={-4} unit="pts" />
            </div>
            <ProgressBar value={61} colorVar="var(--color-sleep-fill)" />
          </Card>
        </div>
      </section>

      {/* NIGHT MODE PREVIEW */}
      <section className="space-y-6 mt-16 pt-8 border-t border-line" data-theme="night">
        <div className="bg-paper text-ink p-8 -mx-8 rounded-3xl space-y-8">
          <header>
            <h2 className="font-display text-4xl mb-2">Night Theme (What If?)</h2>
            <p className="text-ink-2">Tokens inverted correctly.</p>
          </header>

          <div className="flex gap-4">
            <Button variant="primary">Simulate</Button>
            <Button variant="secondary">Cancel</Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Card className="p-6 space-y-4">
              <h3 className="font-heading text-lg font-medium text-ink-2">Focus simulated</h3>
              <div className="flex items-baseline gap-2">
                <span className="font-heading text-4xl"><AnimatedNumber value={93} /></span>
                <DeltaTag delta={9} unit="pts" />
              </div>
              <ProgressBar value={93} colorVar="var(--color-focus-fill)" />
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
