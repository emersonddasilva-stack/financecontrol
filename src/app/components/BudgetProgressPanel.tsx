'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { transactionService } from '@/lib/services/financeService';

interface BudgetCategory {
  categoryId: string;
  name: string;
  color: string;
  budget: number;
  spent: number;
}

function getStatus(spent: number, budget: number) {
  const pct = (spent / budget) * 100;
  if (pct > 100) return 'exceeded';
  if (pct >= 80) return 'warning';
  return 'ok';
}

function StatusIcon({ status }: { status: string }) {
  if (status === 'exceeded') return <XCircle size={14} className="text-negative flex-shrink-0" />;
  if (status === 'warning') return <AlertTriangle size={14} className="text-warning flex-shrink-0" />;
  return <CheckCircle size={14} className="text-positive flex-shrink-0" />;
}

export default function BudgetProgressPanel() {
  const [budgets, setBudgets] = useState<BudgetCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await transactionService.getBudgetProgress();
        setBudgets(data);
      } catch (err) {
        console.error('Failed to load budget progress:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const now = new Date();
  const monthLabel = now.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <div className="bg-card border border-border rounded-2xl p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-foreground">Orçamento por Categoria</h3>
          <p className="text-xs text-muted-foreground mt-0.5 capitalize">{monthLabel}</p>
        </div>
        <Link
          href="/category-account-setup"
          className="text-xs font-semibold text-primary hover:underline"
        >
          Gerenciar
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center flex-1 py-8">
          <Loader2 size={20} className="animate-spin text-muted-foreground" />
        </div>
      ) : budgets.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xs text-muted-foreground text-center">
            Nenhuma categoria com orçamento definido.<br />
            <Link href="/category-account-setup" className="text-primary hover:underline">
              Configure orçamentos
            </Link>
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3.5 flex-1">
          {budgets.map((b) => {
            const pct = Math.min((b.spent / b.budget) * 100, 100);
            const status = getStatus(b.spent, b.budget);
            const barColor =
              status === 'exceeded' ? 'bg-negative' : status === 'warning' ? 'bg-warning' : 'bg-positive';

            return (
              <div key={b.categoryId}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <StatusIcon status={status} />
                    <span className="text-xs font-semibold text-foreground">{b.name}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs tabular-nums">
                    <span
                      className={`font-bold ${
                        status === 'exceeded' ? 'text-negative' : status === 'warning' ? 'text-warning' : 'text-foreground'
                      }`}
                    >
                      {b.spent.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                    <span className="text-muted-foreground">
                      / {b.budget.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                </div>
                <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 text-right">
                  {pct.toFixed(0)}% utilizado
                  {status === 'exceeded' && (
                    <span className="text-negative font-semibold ml-1">
                      (+{(b.spent - b.budget).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})
                    </span>
                  )}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}