import React from 'react';
import MetricCard from './MetricCard';

// Grid plan: 6 cards → grid-cols-4
// Row 1: hero (projected balance, spans 2 cols) + net balance + savings rate = 4 cols
// Row 2: monthly income + monthly expenses + burn rate = 3 cards, each 1 col + last spans remaining
// Adjusted: Row 2: 4-col row with 3 cards, last card spans 2 cols to fill

export default function MetricsBentoGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
      {/* Hero: Projected Month-End Balance — spans 2 cols */}
      <div className="sm:col-span-2 lg:col-span-2 xl:col-span-2 2xl:col-span-2">
        <MetricCard
          id="metric-projected"
          label="Saldo Projetado (Fim do Mês)"
          value="R$ 1.847,00"
          trend="+12,3%"
          trendDirection="up"
          subtext="Baseado nos últimos 14 dias de julho"
          variant="hero"
          sparklineData={[1200, 1350, 1100, 1480, 1600, 1720, 1847]}
        />
      </div>

      {/* Net Balance */}
      <div className="sm:col-span-1 lg:col-span-1 xl:col-span-1 2xl:col-span-1">
        <MetricCard
          id="metric-net"
          label="Saldo Atual"
          value="R$ 3.241,55"
          trend="+R$ 318,40"
          trendDirection="up"
          subtext="vs. mês anterior"
          variant="positive"
        />
      </div>

      {/* Savings Rate */}
      <div className="sm:col-span-1 lg:col-span-1 xl:col-span-1 2xl:col-span-1">
        <MetricCard
          id="metric-savings"
          label="Taxa de Poupança"
          value="23,4%"
          trend="-1,8pp"
          trendDirection="down"
          subtext="Meta: 30% ao mês"
          variant="warning"
        />
      </div>

      {/* Monthly Income */}
      <div className="sm:col-span-1 lg:col-span-1 xl:col-span-1 2xl:col-span-1">
        <MetricCard
          id="metric-income"
          label="Receitas (Julho)"
          value="R$ 8.750,00"
          trend="+R$ 250,00"
          trendDirection="up"
          subtext="vs. junho"
          variant="positive"
        />
      </div>

      {/* Monthly Expenses */}
      <div className="sm:col-span-1 lg:col-span-1 xl:col-span-1 2xl:col-span-1">
        <MetricCard
          id="metric-expenses"
          label="Despesas (Julho)"
          value="R$ 6.708,45"
          trend="+R$ 423,10"
          trendDirection="down"
          subtext="vs. junho"
          variant="negative"
        />
      </div>

      {/* Burn Rate — spans 2 cols to fill row */}
      <div className="sm:col-span-2 lg:col-span-2 xl:col-span-2 2xl:col-span-2">
        <MetricCard
          id="metric-burnrate"
          label="Burn Rate Diário"
          value="R$ 478,46"
          trend="17 dias restantes"
          trendDirection="neutral"
          subtext="Projeção: R$ 8.132 no mês"
          variant="neutral"
          sparklineData={[310, 520, 280, 640, 410, 590, 478]}
        />
      </div>
    </div>
  );
}