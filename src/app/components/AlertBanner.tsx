'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, TrendingDown, X, Info, Clock } from 'lucide-react';
import { scheduledTransactionService } from '@/lib/services/scheduledTransactionService';
import { transactionService } from '@/lib/services/financeService';
import Icon from '@/components/ui/AppIcon';


interface AlertItem {
  id: string;
  type: 'warning' | 'negative' | 'info';
  icon: React.ElementType;
  message: string;
}

const staticAlerts: AlertItem[] = [
  {
    id: 'alert-001',
    type: 'warning',
    icon: AlertTriangle,
    message: 'Alimentação atingiu 89% do orçamento mensal — R$ 534 dos R$ 600 utilizados.',
  },
  {
    id: 'alert-002',
    type: 'negative',
    icon: TrendingDown,
    message: 'Lazer ultrapassou o limite: R$ 412 gastos de R$ 350 orçados (+17,7%).',
  },
  {
    id: 'alert-003',
    type: 'info',
    icon: Info,
    message: 'Projeção de fechamento: saldo estimado de R$ 1.847 ao final de julho.',
  },
];

const alertStyle = {
  warning: 'bg-warning-bg border-warning/30 text-warning',
  negative: 'bg-negative-bg border-negative/30 text-negative',
  info: 'bg-info-bg border-info/30 text-info',
};

export default function AlertBanner() {
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [dynamicAlerts, setDynamicAlerts] = useState<AlertItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function loadScheduledAlerts() {
      try {
        const [txs, summary] = await Promise.all([
          scheduledTransactionService.getAll(),
          transactionService.getMonthSummary(),
        ]);
        if (cancelled) return;

        const upcoming = scheduledTransactionService.getUpcoming24h(txs);
        const alerts: AlertItem[] = [];

        if (upcoming.length > 0) {
          const total = upcoming.reduce((s, t) => s + t.amount, 0);
          const formatted = total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
          alerts.push({
            id: 'scheduled-24h',
            type: 'warning',
            icon: Clock,
            message:
              upcoming.length === 1
                ? `Despesa agendada nas próximas 24h: ${upcoming[0].description} — ${formatted}`
                : `${upcoming.length} despesas agendadas nas próximas 24h — total: ${formatted}`,
          });
        }

        const hasNeg = scheduledTransactionService.hasNegativeProjection(txs, summary.balance);
        if (hasNeg) {
          alerts.push({
            id: 'scheduled-negative',
            type: 'negative',
            icon: AlertTriangle,
            message:
              'Atenção: lançamentos futuros agendados resultarão em saldo negativo em um ou mais meses.',
          });
        }

        setDynamicAlerts(alerts);
      } catch {
        // silent
      }
    }
    loadScheduledAlerts();
    return () => { cancelled = true; };
  }, []);

  const allAlerts = [...dynamicAlerts, ...staticAlerts];
  const visible = allAlerts.filter((a) => !dismissed.includes(a.id));

  if (visible.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 mb-5">
      {visible.map((alert) => {
        const Icon = alert.icon;
        return (
          <div
            key={alert.id}
            className={`flex items-start gap-3 px-4 py-3 rounded-xl border text-sm font-medium fade-in ${alertStyle[alert.type]}`}
          >
            <Icon size={16} className="flex-shrink-0 mt-0.5" />
            <span className="flex-1">{alert.message}</span>
            <button
              onClick={() => setDismissed((d) => [...d, alert.id])}
              className="flex-shrink-0 hover:opacity-70 transition-opacity"
              aria-label="Dispensar alerta"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}