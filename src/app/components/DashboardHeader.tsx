'use client';

import React, { useState } from 'react';
import { Calendar, RefreshCw, Download } from 'lucide-react';

const months = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

export default function DashboardHeader() {
  const [selectedMonth, setSelectedMonth] = useState(6); // July (index 6)
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          Dashboard Financeiro
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Visão completa das suas finanças pessoais — atualizado às 16:29
        </p>
      </div>
      <div className="flex items-center gap-2">
        {/* Month selector */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card text-sm font-medium text-foreground">
          <Calendar size={15} className="text-muted-foreground" />
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e?.target?.value))}
            className="bg-transparent border-none outline-none text-sm font-medium text-foreground cursor-pointer"
            aria-label="Selecionar mês"
          >
            {months?.map((m, i) => (
              <option key={`month-${i + 1}`} value={i}>
                {m} 2026
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleRefresh}
          className="flex items-center justify-center w-9 h-9 rounded-lg border border-border bg-card text-muted-foreground hover:text-primary hover:border-primary/30 transition-all duration-150"
          title="Atualizar dados"
          aria-label="Atualizar dados"
        >
          <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
        </button>

        <button
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 active:scale-95 transition-all duration-150"
          aria-label="Exportar relatório"
        >
          <Download size={14} />
          <span className="hidden sm:inline">Exportar</span>
        </button>
      </div>
    </div>
  );
}