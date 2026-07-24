'use client';

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  TooltipProps,
} from 'recharts';

const monthlyData = [
  { month: 'Fev', receitas: 7800, despesas: 6200, saldo: 1600 },
  { month: 'Mar', receitas: 8200, despesas: 7100, saldo: 1100 },
  { month: 'Abr', receitas: 7500, despesas: 6850, saldo: 650 },
  { month: 'Mai', receitas: 8500, despesas: 6400, saldo: 2100 },
  { month: 'Jun', receitas: 8500, despesas: 6285, saldo: 2215 },
  { month: 'Jul', receitas: 8750, despesas: 6708, saldo: 2042 },
];

function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl shadow-lg px-4 py-3 min-w-[180px]">
      <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">{label}</p>
      {payload.map((entry) => (
        <div key={`tip-${entry.name}`} className="flex items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-1.5">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground capitalize">{entry.name}</span>
          </div>
          <span className="font-semibold text-foreground tabular-nums">
            {Number(entry.value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function IncomeExpenseChart() {
  const [view, setView] = useState<'both' | 'receitas' | 'despesas'>('both');

  return (
    <div className="bg-card border border-border rounded-2xl p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-foreground">Receitas vs Despesas</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Últimos 6 meses</p>
        </div>
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          {(['both', 'receitas', 'despesas'] as const).map((v) => (
            <button
              key={`chart-view-${v}`}
              onClick={() => setView(v)}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all duration-150 ${
                view === v
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {v === 'both' ? 'Ambos' : v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={monthlyData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="gradReceitas" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--positive)" stopOpacity={0.25} />
              <stop offset="95%" stopColor="var(--positive)" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="gradDespesas" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--negative)" stopOpacity={0.2} />
              <stop offset="95%" stopColor="var(--negative)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
            width={48}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(value) => (
              <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>
                {value.charAt(0).toUpperCase() + value.slice(1)}
              </span>
            )}
          />
          {(view === 'both' || view === 'receitas') && (
            <Area
              type="monotone"
              dataKey="receitas"
              stroke="var(--positive)"
              strokeWidth={2}
              fill="url(#gradReceitas)"
            />
          )}
          {(view === 'both' || view === 'despesas') && (
            <Area
              type="monotone"
              dataKey="despesas"
              stroke="var(--negative)"
              strokeWidth={2}
              fill="url(#gradDespesas)"
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}