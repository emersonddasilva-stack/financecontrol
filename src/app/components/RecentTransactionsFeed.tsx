'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowUpCircle,
  ArrowDownCircle,
  Search,
  Filter,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import Badge from '@/components/ui/Badge';
import { transactionService, type Transaction } from '@/lib/services/financeService';

const statusMap: Record<string, { label: string; variant: 'positive' | 'neutral' | 'info' }> = {
  confirmed: { label: 'Confirmado', variant: 'positive' },
  pending: { label: 'Pendente', variant: 'neutral' },
  reconciled: { label: 'Conciliado', variant: 'info' },
};

export default function RecentTransactionsFeed() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');

  useEffect(() => {
    async function load() {
      try {
        const data = await transactionService.getAll(50);
        setTransactions(data);
      } catch (err) {
        console.error('Failed to load transactions:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = transactions.filter((t) => {
    const matchSearch =
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      (t.categoryName || '').toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || t.type === filter;
    return matchSearch && matchFilter;
  });

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="bg-card border border-border rounded-2xl h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-border">
        <div>
          <h3 className="text-base font-semibold text-foreground">Lançamentos Recentes</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {loading ? 'Carregando...' : `${transactions.length} transações`}
          </p>
        </div>
        <Link
          href="/transaction-entry"
          className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
        >
          Ver todos <ChevronRight size={12} />
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-border">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar lançamento..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-sm rounded-lg border border-border bg-muted/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
          />
        </div>
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          {(['all', 'income', 'expense'] as const).map((f) => (
            <button
              key={`filter-${f}`}
              onClick={() => setFilter(f)}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all duration-150 ${
                filter === f
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {f === 'all' ? 'Todos' : f === 'income' ? 'Receitas' : 'Despesas'}
            </button>
          ))}
        </div>
        <button
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-border text-muted-foreground hover:text-primary hover:border-primary/30 transition-all"
          aria-label="Filtros avançados"
        >
          <Filter size={13} />
          Filtros
        </button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-x-auto scrollbar-thin">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={20} className="animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <table className="w-full min-w-[720px]">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Data</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Descrição</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Categoria</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Conta</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</th>
                  <th className="px-5 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Valor</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => {
                  const s = statusMap[t.status] || statusMap.confirmed;
                  return (
                    <tr
                      key={t.id}
                      className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors duration-100 cursor-pointer"
                    >
                      <td className="px-5 py-3 text-xs text-muted-foreground whitespace-nowrap tabular-nums">
                        {formatDate(t.date)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {t.type === 'income' ? (
                            <ArrowUpCircle size={15} className="text-positive flex-shrink-0" />
                          ) : (
                            <ArrowDownCircle size={15} className="text-negative flex-shrink-0" />
                          )}
                          <span className="text-sm font-medium text-foreground truncate max-w-[180px]">
                            {t.description}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                        {t.categoryEmoji ? `${t.categoryEmoji} ` : ''}{t.categoryName || '—'}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap max-w-[140px] truncate">
                        {t.accountName || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={s.variant} size="sm">
                          {s.label}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span className={`text-sm font-bold tabular-nums ${t.type === 'income' ? 'text-positive' : 'text-negative'}`}>
                          {t.type === 'income' ? '+' : ''}
                          {Math.abs(t.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-sm text-muted-foreground">
                  {search ? `Nenhum lançamento encontrado para "${search}".` : 'Nenhum lançamento registrado ainda.'}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}