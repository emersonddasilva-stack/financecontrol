'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import dynamic from 'next/dynamic';

const SparklineChart = dynamic(() => import('./SparklineChart'), { ssr: false });

type MetricVariant = 'hero' | 'positive' | 'negative' | 'warning' | 'neutral';

interface MetricCardProps {
  id: string;
  label: string;
  value: string;
  trend: string;
  trendDirection: 'up' | 'down' | 'neutral';
  subtext: string;
  variant: MetricVariant;
  sparklineData?: number[];
}

const variantStyles: Record<MetricVariant, string> = {
  hero: 'bg-primary text-primary-foreground',
  positive: 'bg-card border border-border',
  negative: 'bg-negative-bg border border-negative/20',
  warning: 'bg-warning-bg border border-warning/20',
  neutral: 'bg-card border border-border',
};

const valuStyles: Record<MetricVariant, string> = {
  hero: 'text-white',
  positive: 'text-foreground',
  negative: 'text-negative',
  warning: 'text-warning',
  neutral: 'text-foreground',
};

const labelStyles: Record<MetricVariant, string> = {
  hero: 'text-white/70',
  positive: 'text-muted-foreground',
  negative: 'text-negative/70',
  warning: 'text-warning/80',
  neutral: 'text-muted-foreground',
};

const trendColors = {
  up: { positive: 'text-positive', hero: 'text-green-300', other: 'text-positive' },
  down: { positive: 'text-negative', hero: 'text-red-300', other: 'text-negative' },
  neutral: { positive: 'text-muted-foreground', hero: 'text-white/60', other: 'text-muted-foreground' },
};

export default function MetricCard({
  id,
  label,
  value,
  trend,
  trendDirection,
  subtext,
  variant,
  sparklineData,
}: MetricCardProps) {
  const isHero = variant === 'hero';

  const getTrendColor = () => {
    if (isHero) return trendColors[trendDirection].hero;
    if (trendDirection === 'up') return trendColors.up.positive;
    if (trendDirection === 'down') return trendColors.down.positive;
    return trendColors.neutral.positive;
  };

  const TrendIcon =
    trendDirection === 'up' ? TrendingUp : trendDirection === 'down' ? TrendingDown : Minus;

  return (
    <div
      className={`rounded-2xl p-5 h-full flex flex-col justify-between ${variantStyles[variant]} ${isHero ? 'min-h-[140px]' : 'min-h-[120px]'}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${labelStyles[variant]}`}>
            {label}
          </p>
          <p
            className={`tabular-nums font-bold leading-none ${isHero ? 'text-hero-balance' : 'text-2xl'} ${valuStyles[variant]}`}
          >
            {value}
          </p>
        </div>
        {sparklineData && (
          <div className="flex-shrink-0 w-24 h-12">
            <SparklineChart
              data={sparklineData}
              color={isHero ? '#fbbf24' : variant === 'negative' ? 'var(--negative)' : 'var(--primary)'}
            />
          </div>
        )}
      </div>
      <div className="flex items-center gap-1.5 mt-3">
        <TrendIcon size={13} className={getTrendColor()} />
        <span className={`text-xs font-semibold ${getTrendColor()}`}>{trend}</span>
        <span className={`text-xs ml-1 ${labelStyles[variant]}`}>{subtext}</span>
      </div>
    </div>
  );
}