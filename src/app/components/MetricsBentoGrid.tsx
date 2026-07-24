'use client';

import React, { useEffect, useState } from 'react';
import MetricCard from './MetricCard';
import { transactionService } from '@/lib/services/financeService';

interface DashboardMetrics {
  currentBalance: number;
  todayIncome: number;
  todayExpense: number;
  todayCount: number;
  monthIncome: number;
  monthExpense: number;
}

function fmt(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function MetricsBentoGrid() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);

  useEffect(() => {
    transactionService.getDashboardMetrics()
      .then(setMetrics)
      .catch((err) => console.error('Failed to load dashboard metrics:', err));
  }, []);

  const currentBalance = metrics?.currentBalance ?? 0;
  const todayIncome = metrics?.todayIncome ?? 0;
  const todayExpense = metrics?.todayExpense ?? 0;
  const todayCount = metrics?.todayCount ?? 0;
  const monthIncome = metrics?.monthIncome ?? 0;
  const monthExpense = metrics?.monthExpense ?? 0;
  const monthBalance = monthIncome - monthExpense;
  const savingsRate = monthIncome > 0 ? ((monthIncome - monthExpense) / monthIncome) * 100 : 0;
  const todayBalance = todayIncome - todayExpense;

  const loading = metrics === null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
      {/* Hero: Saldo Atual — spans 2 cols */}
      <div className="sm:col-span-2 lg:col-span-2 xl:col-span-2 2xl:col-span-2">
        <MetricCard
          id="metric-current-balance"
          label="Saldo Atual"
          value={loading ? '...' : fmt(currentBalance)}
          trend={loading ? '...' : `${monthBalance >= 0 ? '+' : ''}${fmt(monthBalance)}`}
          trendDirection={monthBalance >= 0 ? 'up' : 'down'}
          subtext="Saldo das contas menos lançamentos confirmados"
          variant="hero"
          sparklineData={undefined}
        />
      </div>

      {/* Lançamentos de Hoje */}
      <div className="sm:col-span-1 lg:col-span-1 xl:col-span-1 2xl:col-span-1">
        <MetricCard
          id="metric-today"
          label="Lançamentos de Hoje"
          value={loading ? '...' : `${todayCount} lançamento${todayCount !== 1 ? 's' : ''}`}
          trend={loading ? '...' : `${todayBalance >= 0 ? '+' : ''}${fmt(todayBalance)}`}
          trendDirection={todayBalance >= 0 ? 'up' : 'down'}
          subtext={loading ? '' : `Receitas: ${fmt(todayIncome)} · Despesas: ${fmt(todayExpense)}`}
          variant={todayBalance >= 0 ? 'positive' : 'negative'}
        />
      </div>

      {/* Taxa de Poupança */}
      <div className="sm:col-span-1 lg:col-span-1 xl:col-span-1 2xl:col-span-1">
        <MetricCard
          id="metric-savings"
          label="Taxa de Poupança"
          value={loading ? '...' : `${savingsRate.toFixed(1)}%`}
          trend={savingsRate >= 30 ? 'Meta atingida ✓' : `Meta: 30%`}
          trendDirection={savingsRate >= 30 ? 'up' : 'down'}
          subtext="Do mês atual"
          variant={savingsRate >= 30 ? 'positive' : 'warning'}
        />
      </div>

      {/* Receitas do Mês */}
      <div className="sm:col-span-1 lg:col-span-1 xl:col-span-1 2xl:col-span-1">
        <MetricCard
          id="metric-income"
          label="Receitas (Mês Atual)"
          value={loading ? '...' : fmt(monthIncome)}
          trend={monthIncome > 0 ? 'Confirmadas' : 'Sem receitas'}
          trendDirection="up"
          subtext="Lançamentos confirmados"
          variant="positive"
        />
      </div>

      {/* Despesas do Mês */}
      <div className="sm:col-span-1 lg:col-span-1 xl:col-span-1 2xl:col-span-1">
        <MetricCard
          id="metric-expenses"
          label="Despesas (Mês Atual)"
          value={loading ? '...' : fmt(monthExpense)}
          trend={monthExpense > 0 ? 'Confirmadas' : 'Sem despesas'}
          trendDirection="down"
          subtext="Lançamentos confirmados"
          variant="negative"
        />
      </div>

      {/* Saldo do Mês — spans 2 cols */}
      <div className="sm:col-span-2 lg:col-span-2 xl:col-span-2 2xl:col-span-2">
        <MetricCard
          id="metric-month-balance"
          label="Resultado do Mês"
          value={loading ? '...' : fmt(monthBalance)}
          trend={loading ? '...' : `${monthBalance >= 0 ? '+' : ''}${((monthIncome > 0 ? monthBalance / monthIncome : 0) * 100).toFixed(1)}% da receita`}
          trendDirection={monthBalance >= 0 ? 'up' : 'down'}
          subtext="Receitas menos despesas confirmadas"
          variant={monthBalance >= 0 ? 'neutral' : 'negative'}
        />
      </div>
    </div>
  );
}