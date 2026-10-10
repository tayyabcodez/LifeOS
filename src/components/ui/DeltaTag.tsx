import React from 'react';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

export interface DeltaTagProps {
  delta: number;
  unit?: '%' | 'pts' | 'days' | '';
  className?: string;
  isTradeOff?: boolean; // If true, and delta is negative, it's a "trade-off" meaning we use the 'down' color. If positive it's 'up' color.
}

export function DeltaTag({ delta, unit = '', className = '', isTradeOff = false }: DeltaTagProps) {
  // If delta > 0, usually improvement -> up color (green)
  // If delta < 0, decline/tradeoff -> down color (red)
  // If it's a tradeoff logic, positive means better, negative means worse.
  const isUp = delta > 0;
  const isDown = delta < 0;
  const isZero = delta === 0;

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
