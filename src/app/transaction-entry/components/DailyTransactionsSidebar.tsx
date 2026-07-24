'use client';

import React, { useState, useEffect } from 'react';
import { ArrowUpCircle, ArrowDownCircle, TrendingDown, TrendingUp, PlusCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { transactionService, type Transaction } from '@/lib/services/financeService';

export default function DailyTransactionsSidebar() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await transactionService.getToday();
        setTransactions(data);
      } catch (err) {
        console.error('Failed to load today transactions:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const totalIncome = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const dailyBalance = totalIncome - totalExpense;

  return (
    <div className="flex flex-col gap-4">
      {/* Daily summary */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-3">Resumo de Hoje</h3>
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 size={18} className="animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <TrendingUp size={14} className="text-positive" />
                Receitas
              </div>
              <span className="text-sm font-bold text-positive tabular-nums">
                +{totalIncome.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <TrendingDown size={14} className="text-negative" />
                Despesas
              </div>
              <span className="text-sm font-bold text-negative tabular-nums">
                -{totalExpense.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>
            <div className="pt-2 border-t border-border flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground">Saldo do Dia</span>
              <span className={`text-base font-bold tabular-nums ${dailyBalance >= 0 ? 'text-positive' : 'text-negative'}`}>
                {dailyBalance >= 0 ? '+' : ''}
                {dailyBalance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Today's transactions */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Lançamentos de Hoje</h3>
          <span className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {transactions.length}
          </span>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={18} className="animate-spin text-muted-foreground" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="px-5 py-6 text-center">
            <p className="text-xs text-muted-foreground">Nenhum lançamento hoje ainda.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {transactions.map((t) => (
              <div key={t.id} className="flex items-center gap-3 px-5 py-3 hover:bg-muted/40 transition-colors">
                {t.type === 'income' ? (
                  <ArrowUpCircle size={16} className="text-positive flex-shrink-0" />
                ) : (
                  <ArrowDownCircle size={16} className="text-negative flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">{t.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.categoryEmoji ? `${t.categoryEmoji} ` : ''}{t.categoryName || 'Sem categoria'}
                  </p>
                </div>
                <span className={`text-xs font-bold tabular-nums flex-shrink-0 ${t.type === 'income' ? 'text-positive' : 'text-negative'}`}>
                  {t.type === 'income' ? '+' : '-'}
                  {t.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
            ))}
          </div>
        )}
        <div className="px-5 py-3 border-t border-border">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full py-2 text-xs font-semibold text-primary hover:bg-primary/5 rounded-lg transition-colors"
          >
            Ver todos no dashboard
          </Link>
        </div>
      </div>

      {/* Quick tip */}
      <div className="bg-info-bg border border-info/20 rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <PlusCircle size={16} className="text-info flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-info mb-1">Dica Rápida</p>
            <p className="text-xs text-info/80">
              Ative &quot;Lançamento Recorrente&quot; para despesas fixas como aluguel, assinaturas e mensalidades — elas serão criadas automaticamente todo mês.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}