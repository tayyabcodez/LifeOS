import React from 'react';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

export interface DeltaTagProps {
  delta: number;
  unit?: '%' | 'pts' | 'days' | '';
  className?: string;
  isTradeOff?: boolean; // If true, and delta is negative, it's a "trade-off" meaning we use the 'down' color. If positive it's 'up' color.
}

export function DeltaTag({ delta, unit = '', className = '', isTradeOff = false }: DeltaTagProps) {
  // If tradeoff is true, negative delta means it's a "tradeoff" (worse), positive means better.
  // Wait, if it's a trade-off, actually negative is often down (red) and positive is up (green).
  // Let's just say positive is up/green, negative is down/red.
  // If isTradeOff is true, maybe we just want to ensure negative is 'down'.
  const isUp = delta > 0;
  const isDown = delta < 0;

  const colorClass = isUp ? 'text-up' : isDown ? 'text-down' : 'text-ink-2';
  const Icon = isUp ? ArrowUp : isDown ? ArrowDown : Minus;
  const sign = isUp ? '+' : isDown ? '−' : ''; // using proper minus sign

  return (
    <span className={`inline-flex items-center gap-1 font-heading font-semibold text-sm tabular-nums tracking-tight ${colorClass} ${className}`}>
      <Icon size={14} strokeWidth={3} />
      {sign}{Math.abs(delta)}{unit}
    </span>
  );
}
