'use client';

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  TooltipProps,
} from 'recharts';

const expenseData = [
  { id: 'cat-moradia', name: 'Moradia', value: 2200, color: '#1e3a5f' },
  { id: 'cat-alimentacao', name: 'Alimentação', value: 534, color: '#f59e0b' },
  { id: 'cat-transporte', name: 'Transporte', value: 680, color: '#0284c7' },
  { id: 'cat-saude', name: 'Saúde', value: 390, color: '#16a34a' },
  { id: 'cat-lazer', name: 'Lazer', value: 412, color: '#dc2626' },
  { id: 'cat-educacao', name: 'Educação', value: 280, color: '#7c3aed' },
  { id: 'cat-outros', name: 'Outros', value: 212, color: '#94a3b8' },
];

const total = expenseData.reduce((s, d) => s + d.value, 0);

function CustomTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-card border border-border rounded-xl shadow-lg px-4 py-3">
      <div className="flex items-center gap-2 mb-1">
        <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
        <span className="text-sm font-semibold text-foreground">{d.name}</span>
      </div>
      <p className="text-sm tabular-nums text-foreground font-bold">
        {d.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
      </p>
      <p className="text-xs text-muted-foreground">{((d.value / total) * 100).toFixed(1)}% do total</p>
    </div>
  );
}

export default function ExpenseBreakdownChart() {
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <div className="bg-card border border-border rounded-2xl p-5 h-full flex flex-col">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-foreground">Despesas por Categoria</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Julho 2026</p>
      </div>

      <div className="flex-1 flex flex-col items-center">
        <div className="relative w-full h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={expenseData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={76}
                paddingAngle={2}
                onMouseEnter={(_, idx) => setActiveId(expenseData[idx].id)}
                onMouseLeave={() => setActiveId(null)}
              >
                {expenseData.map((entry) => (
                  <Cell
                    key={entry.id}
                    fill={entry.color}
                    opacity={activeId === null || activeId === entry.id ? 1 : 0.4}
                    stroke="none"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          {/* Center label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <p className="text-xs text-muted-foreground font-medium">Total</p>
            <p className="text-base font-bold text-foreground tabular-nums">R$ 4.708</p>
          </div>
        </div>

        {/* Legend */}
        <div className="w-full mt-3 space-y-1.5">
          {expenseData.map((d) => (
            <div
              key={d.id}
              className="flex items-center justify-between text-xs"
              onMouseEnter={() => setActiveId(d.id)}
              onMouseLeave={() => setActiveId(null)}
            >
              <div className="flex items-center gap-2">
                <span className="inline-block w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: d.color }} />
                <span className="text-muted-foreground">{d.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground tabular-nums">
                  {d.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
                <span className="text-muted-foreground w-10 text-right">
                  {((d.value / total) * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}