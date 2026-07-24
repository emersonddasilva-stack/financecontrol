import React from 'react';

type BadgeVariant = 'positive' | 'negative' | 'warning' | 'info' | 'neutral' | 'primary';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md';
}

const variantMap: Record<BadgeVariant, string> = {
  positive: 'bg-positive-bg text-positive border border-positive/20',
  negative: 'bg-negative-bg text-negative border border-negative/20',
  warning: 'bg-warning-bg text-warning border border-warning/20',
  info: 'bg-info-bg text-info border border-info/20',
  neutral: 'bg-muted text-muted-foreground border border-border',
  primary: 'bg-primary/10 text-primary border border-primary/20',
};

export default function Badge({ variant = 'neutral', children, className = '', size = 'sm' }: BadgeProps) {
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm';
  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-full whitespace-nowrap ${sizeClass} ${variantMap[variant]} ${className}`}
    >
      {children}
    </span>
  );
}