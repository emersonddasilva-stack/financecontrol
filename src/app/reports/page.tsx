'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

const monthlyData = [
  { month: 'Jan', receitas: 8500, despesas: 6200, saldo: 2300 },
  { month: 'Fev', receitas: 9200, despesas: 7100, saldo: 2100 },
  { month: 'Mar', receitas: 8800, despesas: 6800, saldo: 2000 },
  { month: 'Abr', receitas: 10500, despesas: 7500, saldo: 3000 },
  { month: 'Mai', receitas: 9800, despesas: 8200, saldo: 1600 },
  { month: 'Jun', receitas: 11200, despesas: 7900, saldo: 3300 },
  { month: 'Jul', receitas: 10800, despesas: 8600, saldo: 2200 },
  { month: 'Ago', receitas: 12000, despesas: 9100, saldo: 2900 },
  { month: 'Set', receitas: 11500, despesas: 8400, saldo: 3100 },
  { month: 'Out', receitas: 13200, despesas: 9800, saldo: 3400 },
  { month: 'Nov', receitas: 12800, despesas: 10200, saldo: 2600 },
  { month: 'Dez', receitas: 14500, despesas: 11000, saldo: 3500 },
];

const projectionData = [
  { month: 'Out', receitas: 13200, despesas: 9800, projetado: false },
  { month: 'Nov', receitas: 12800, despesas: 10200, projetado: false },
  { month: 'Dez', receitas: 14500, despesas: 11000, projetado: false },
  { month: 'Jan', receitasProj: 15200, despesasProj: 11500, projetado: true },
  { month: 'Fev', receitasProj: 15800, despesasProj: 11800, projetado: true },
  { month: 'Mar', receitasProj: 16500, despesasProj: 12200, projetado: true },
];

const categoryData = [
  { name: 'Moradia', value: 3200, color: '#1e3a5f' },
  { name: 'Alimentação', value: 1800, color: '#f59e0b' },
  { name: 'Transporte', value: 950, color: '#16a34a' },
  { name: 'Saúde', value: 620, color: '#0284c7' },
  { name: 'Lazer', value: 480, color: '#7c3aed' },
  { name: 'Outros', value: 350, color: '#dc2626' },
];

const topExpenses = [
  { description: 'Aluguel', category: 'Moradia', amount: 2800, date: '01/12/2024' },
  { description: 'Supermercado', category: 'Alimentação', amount: 1200, date: '15/12/2024' },
  { description: 'Plano de Saúde', category: 'Saúde', amount: 620, date: '05/12/2024' },
  { description: 'Combustível', category: 'Transporte', amount: 450, date: '20/12/2024' },
  { description: 'Academia', category: 'Saúde', amount: 120, date: '01/12/2024' },
];

const PERIOD_OPTIONS = ['Últimos 3 meses', 'Últimos 6 meses', 'Este ano', 'Ano anterior'];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const avgReceitas = Math.round(monthlyData.reduce((s, d) => s + d.receitas, 0) / monthlyData.length);
const avgDespesas = Math.round(monthlyData.reduce((s, d) => s + d.despesas, 0) / monthlyData.length);
const avgSaldo = avgReceitas - avgDespesas;
const totalReceitas = monthlyData.reduce((s, d) => s + d.receitas, 0);
const totalDespesas = monthlyData.reduce((s, d) => s + d.despesas, 0);

interface SummaryCardProps {
  title: string;
  value: string;
  subtitle: string;
  trend: 'up' | 'down' | 'neutral';
  trendValue: string;
  icon: React.ReactNode;
  color: string;
}

function SummaryCard({ title, value, subtitle, trend, trendValue, icon, color }: SummaryCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
          {icon}
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground tabular-nums">{value}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
      </div>
      <div className="flex items-center gap-1">
        {trend === 'up' ? (
          <ArrowUpRight size={14} className="text-positive" />
        ) : trend === 'down' ? (
          <ArrowDownRight size={14} className="text-negative" />
        ) : null}
        <span
          className={`text-xs font-medium ${
            trend === 'up' ? 'text-positive' : trend === 'down' ? 'text-negative' : 'text-muted-foreground'
          }`}
        >
          {trendValue}
        </span>
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('Este ano');

  return (
    <AppLayout>
      <div className="px-6 lg:px-8 xl:px-10 py-6 max-w-screen-2xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Relatórios</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Análise financeira detalhada com médias, projeções e tendências
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-1">
              {PERIOD_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setSelectedPeriod(opt)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    selectedPeriod === opt
                      ? 'bg-primary text-white' :'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
            <button className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              <Download size={15} />
              Exportar
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          <SummaryCard
            title="Total de Receitas"
            value={formatCurrency(totalReceitas)}
            subtitle="Acumulado no período"
            trend="up"
            trendValue="+12,4% vs ano anterior"
            icon={<TrendingUp size={18} className="text-positive" />}
            color="bg-positive/10"
          />
          <SummaryCard
            title="Total de Despesas"
            value={formatCurrency(totalDespesas)}
            subtitle="Acumulado no período"
            trend="down"
            trendValue="+8,1% vs ano anterior"
            icon={<TrendingDown size={18} className="text-negative" />}
            color="bg-negative/10"
          />
          <SummaryCard
            title="Média Mensal — Receitas"
            value={formatCurrency(avgReceitas)}
            subtitle="Por mês no período"
            trend="up"
            trendValue="+5,2% vs média anterior"
            icon={<DollarSign size={18} className="text-info" />}
            color="bg-info/10"
          />
          <SummaryCard
            title="Saldo Médio Mensal"
            value={formatCurrency(avgSaldo)}
            subtitle="Receitas − Despesas"
            trend="up"
            trendValue="+18,7% vs ano anterior"
            icon={<Calendar size={18} className="text-accent" />}
            color="bg-accent/10"
          />
        </div>

        {/* Main Charts Row */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-5">
          {/* Receitas vs Despesas */}
          <div className="xl:col-span-2 bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-foreground">Receitas vs Despesas</h2>
                <p className="text-xs text-muted-foreground">Evolução mensal no período</p>
              </div>
              <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                <Filter size={13} /> Filtrar
              </button>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={monthlyData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradReceitas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradDespesas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#dc2626" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="receitas" name="Receitas" stroke="#16a34a" strokeWidth={2} fill="url(#gradReceitas)" />
                <Area type="monotone" dataKey="despesas" name="Despesas" stroke="#dc2626" strokeWidth={2} fill="url(#gradDespesas)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Despesas por Categoria */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="mb-4">
              <h2 className="text-base font-semibold text-foreground">Despesas por Categoria</h2>
              <p className="text-xs text-muted-foreground">Distribuição no período</p>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ borderRadius: '8px', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 flex flex-col gap-1.5">
              {categoryData.map((cat) => (
                <div key={cat.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                    <span className="text-xs text-muted-foreground">{cat.name}</span>
                  </div>
                  <span className="text-xs font-semibold text-foreground tabular-nums">{formatCurrency(cat.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Saldo Mensal Bar + Projeções */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-5">
          {/* Saldo Mensal */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="mb-4">
              <h2 className="text-base font-semibold text-foreground">Saldo Mensal</h2>
              <p className="text-xs text-muted-foreground">Resultado líquido por mês</p>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `R$${(v / 1000).toFixed(1)}k`}
                />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: 12 }}
                />
                <Bar dataKey="saldo" name="Saldo" fill="#1e3a5f" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Projeções */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-foreground">Projeções</h2>
                <span className="px-2 py-0.5 rounded-full bg-accent/10 text-accent text-xs font-medium">Próximos 3 meses</span>
              </div>
              <p className="text-xs text-muted-foreground">Baseado na tendência dos últimos 3 meses</p>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={projectionData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="receitas" name="Receitas (real)" stroke="#16a34a" strokeWidth={2} dot={{ r: 4 }} connectNulls />
                <Line type="monotone" dataKey="despesas" name="Despesas (real)" stroke="#dc2626" strokeWidth={2} dot={{ r: 4 }} connectNulls />
                <Line type="monotone" dataKey="receitasProj" name="Receitas (proj.)" stroke="#16a34a" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 4 }} connectNulls />
                <Line type="monotone" dataKey="despesasProj" name="Despesas (proj.)" stroke="#dc2626" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 4 }} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Médias Mensais Table + Top Despesas */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 pb-8">
          {/* Médias Mensais */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="mb-4">
              <h2 className="text-base font-semibold text-foreground">Médias Mensais</h2>
              <p className="text-xs text-muted-foreground">Resumo estatístico do período</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Mês</th>
                    <th className="text-right py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Receitas</th>
                    <th className="text-right py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Despesas</th>
                    <th className="text-right py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Saldo</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyData.slice(-6).map((row) => (
                    <tr key={row.month} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="py-2.5 text-sm font-medium text-foreground">{row.month}</td>
                      <td className="py-2.5 text-right text-sm text-positive tabular-nums">{formatCurrency(row.receitas)}</td>
                      <td className="py-2.5 text-right text-sm text-negative tabular-nums">{formatCurrency(row.despesas)}</td>
                      <td className="py-2.5 text-right text-sm font-semibold text-foreground tabular-nums">{formatCurrency(row.saldo)}</td>
                    </tr>
                  ))}
                  <tr className="bg-muted/40">
                    <td className="py-2.5 text-xs font-bold text-muted-foreground uppercase">Média</td>
                    <td className="py-2.5 text-right text-xs font-bold text-positive tabular-nums">{formatCurrency(avgReceitas)}</td>
                    <td className="py-2.5 text-right text-xs font-bold text-negative tabular-nums">{formatCurrency(avgDespesas)}</td>
                    <td className="py-2.5 text-right text-xs font-bold text-foreground tabular-nums">{formatCurrency(avgSaldo)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Despesas */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="mb-4">
              <h2 className="text-base font-semibold text-foreground">Maiores Despesas</h2>
              <p className="text-xs text-muted-foreground">Top 5 lançamentos do período</p>
            </div>
            <div className="flex flex-col gap-2">
              {topExpenses.map((expense, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-negative/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-negative">{i + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{expense.description}</p>
                    <p className="text-xs text-muted-foreground">{expense.category} · {expense.date}</p>
                  </div>
                  <span className="text-sm font-bold text-negative tabular-nums flex-shrink-0">
                    {formatCurrency(expense.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
