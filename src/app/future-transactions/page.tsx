'use client';

import React, { useState, useEffect, useCallback, useId } from 'react';
import AppLayout from '@/components/AppLayout';
import {
  CalendarDays,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  X,
  Clock,
  BarChart3,
  Wallet,
  Zap,
  Bell,
  CheckCircle,
  Timer,
  Pencil,
} from 'lucide-react';
import {
  scheduledTransactionService,
  ScheduledTransaction,
  MonthlyProjection,
  RecurrenceType,
  LaunchMode,
} from '@/lib/services/scheduledTransactionService';
import { categoryService, Category } from '@/lib/services/financeService';
import { transactionService } from '@/lib/services/financeService';
import { toast } from 'sonner';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const RECURRENCE_LABELS: Record<RecurrenceType, string> = {
  none: 'Sem recorrência',
  daily: 'Diário',
  weekly: 'Semanal',
  biweekly: 'Quinzenal',
  monthly: 'Mensal',
  yearly: 'Anual',
};

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

// ─── Confirm Launch Modal ─────────────────────────────────────────────────────

interface ConfirmLaunchModalProps {
  tx: ScheduledTransaction;
  onConfirm: () => void;
  onPostpone: () => void;
  onClose: () => void;
  postponing: boolean;
}

function ConfirmLaunchModal({ tx, onConfirm, onPostpone, onClose, postponing }: ConfirmLaunchModalProps) {
  const canPostpone = !tx.postponed;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-sm animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Bell size={17} className="text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Confirmar Lançamento</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5 space-y-4">
          {/* Transaction info */}
          <div className={`flex items-center gap-3 p-3 rounded-xl border ${
            tx.type === 'expense' ? 'bg-negative/5 border-negative/20' : 'bg-positive/5 border-positive/20'
          }`}>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0 ${
              tx.type === 'expense' ? 'bg-negative/10' : 'bg-positive/10'
            }`}>
              {tx.categoryEmoji || (tx.type === 'income' ? '💰' : '💸')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{tx.description}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Agendado para {formatDate(tx.scheduledDate)}
                {tx.categoryName && ` · ${tx.categoryName}`}
              </p>
            </div>
            <span className={`text-base font-bold tabular-nums flex-shrink-0 ${
              tx.type === 'income' ? 'text-positive' : 'text-negative'
            }`}>
              {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
            </span>
          </div>

          <p className="text-sm text-muted-foreground text-center leading-relaxed">
            Este lançamento está configurado para <strong className="text-foreground">confirmação manual</strong>. Deseja efetivá-lo agora?
          </p>

          {/* Postpone note */}
          {!canPostpone && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-warning/10 border border-warning/20 text-warning text-xs">
              <Timer size={13} className="flex-shrink-0" />
              <span>Este lançamento já foi adiado uma vez e não pode ser adiado novamente.</span>
            </div>
          )}
          {tx.postponed && tx.postponedUntil && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border text-muted-foreground text-xs">
              <Clock size={13} className="flex-shrink-0" />
              <span>
                Adiado até{' '}
                {new Date(tx.postponedUntil).toLocaleString('pt-BR', {
                  day: '2-digit', month: '2-digit', year: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-5 pb-5">
          {canPostpone && (
            <button
              onClick={onPostpone}
              disabled={postponing}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors disabled:opacity-60"
            >
              <Timer size={15} />
              {postponing ? 'Adiando...' : 'ADIAR'}
            </button>
          )}
          <button
            onClick={onConfirm}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <CheckCircle size={15} />
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Form Modal ───────────────────────────────────────────────────────────────

interface FormModalProps {
  categories: Category[];
  onClose: () => void;
  onSave: (tx: ScheduledTransaction) => void;
  initialData?: ScheduledTransaction | null;
}

function FormModal({ categories, onClose, onSave, initialData }: FormModalProps) {
  const formId = useId();
  const today = new Date().toISOString().split('T')[0];
  const isEditing = !!initialData;

  const [type, setType] = useState<'income' | 'expense'>(initialData?.type ?? 'expense');
  const [amount, setAmount] = useState(initialData ? String(initialData.amount) : '');
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [categoryId, setCategoryId] = useState(initialData?.categoryId ?? '');
  const [scheduledDate, setScheduledDate] = useState(initialData?.scheduledDate ?? today);
  const [recurrence, setRecurrence] = useState<RecurrenceType>(initialData?.recurrence ?? 'none');
  const [endDate, setEndDate] = useState(initialData?.endDate ?? '');
  const [launchMode, setLaunchMode] = useState<LaunchMode>(initialData?.launchMode ?? 'auto');
  const [saving, setSaving] = useState(false);

  const filteredCategories = categories.filter((c) => c.type === type);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(String(amount).replace(',', '.'));
    if (!numAmount || numAmount <= 0) {
      toast.error('Informe um valor válido.');
      return;
    }
    if (!description.trim()) {
      toast.error('Informe uma descrição.');
      return;
    }
    if (!scheduledDate) {
      toast.error('Selecione uma data.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        type,
        amount: numAmount,
        description: description.trim(),
        categoryId: categoryId || null,
        scheduledDate,
        recurrence,
        endDate: recurrence !== 'none' && endDate ? endDate : null,
        launchMode,
      };

      let result: ScheduledTransaction | null = null;
      if (isEditing && initialData) {
        result = await scheduledTransactionService.update(initialData.id, payload);
        if (result) {
          toast.success('Lançamento atualizado com sucesso!');
          onSave(result);
        } else {
          toast.error('Erro ao atualizar lançamento.');
        }
      } else {
        result = await scheduledTransactionService.create(payload);
        if (result) {
          toast.success('Lançamento agendado com sucesso!');
          onSave(result);
        } else {
          toast.error('Erro ao agendar lançamento.');
        }
      }
    } catch {
      toast.error(isEditing ? 'Erro ao atualizar lançamento.' : 'Erro ao agendar lançamento.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-card z-10">
          <div className="flex items-center gap-2">
            {isEditing ? <Pencil size={18} className="text-primary" /> : <CalendarDays size={18} className="text-primary" />}
            <h2 className="text-base font-semibold text-foreground">
              {isEditing ? 'Editar Lançamento Futuro' : 'Novo Lançamento Futuro'}
            </h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={18} />
          </button>
        </div>

        <form id={formId} onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Type toggle */}
          <div className="flex rounded-xl overflow-hidden border border-border">
            <button
              type="button"
              onClick={() => { setType('expense'); setCategoryId(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${
                type === 'expense' ? 'bg-negative text-white' : 'bg-card text-muted-foreground hover:text-foreground'
              }`}
            >
              <TrendingDown size={15} />
              Despesa
            </button>
            <button
              type="button"
              onClick={() => { setType('income'); setCategoryId(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${
                type === 'income' ? 'bg-positive text-white' : 'bg-card text-muted-foreground hover:text-foreground'
              }`}
            >
              <TrendingUp size={15} />
              Receita
            </button>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Descrição</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Aluguel, Salário..."
              className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Valor (R$)</label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0,00"
              className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Categoria</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">Sem categoria</option>
              {filteredCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.emoji} {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Data do lançamento</label>
            <input
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* Recurrence */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Recorrência</label>
            <select
              value={recurrence}
              onChange={(e) => setRecurrence(e.target.value as RecurrenceType)}
              className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {(Object.keys(RECURRENCE_LABELS) as RecurrenceType[]).map((r) => (
                <option key={r} value={r}>{RECURRENCE_LABELS[r]}</option>
              ))}
            </select>
          </div>

          {/* End date (only for recurring) */}
          {recurrence !== 'none' && (
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Data de encerramento <span className="text-muted-foreground/60">(opcional)</span>
              </label>
              <input
                type="date"
                value={endDate}
                min={scheduledDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          )}

          {/* Launch Mode */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2">Modo de Lançamento</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setLaunchMode('auto')}
                className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl border text-sm font-medium transition-all ${
                  launchMode === 'auto' ?'border-primary bg-primary/10 text-primary' :'border-border bg-card text-muted-foreground hover:text-foreground hover:border-border/80'
                }`}
              >
                <Zap size={16} className={launchMode === 'auto' ? 'text-primary' : 'text-muted-foreground'} />
                <span className="text-xs leading-tight text-center">Lançar Automaticamente</span>
              </button>
              <button
                type="button"
                onClick={() => setLaunchMode('ask')}
                className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl border text-sm font-medium transition-all ${
                  launchMode === 'ask' ?'border-primary bg-primary/10 text-primary' :'border-border bg-card text-muted-foreground hover:text-foreground hover:border-border/80'
                }`}
              >
                <Bell size={16} className={launchMode === 'ask' ? 'text-primary' : 'text-muted-foreground'} />
                <span className="text-xs leading-tight text-center">Perguntar Antes de Lançar</span>
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              {launchMode === 'auto' ?'O lançamento será efetivado automaticamente na data agendada, sem necessidade de confirmação.' :'Uma janela de confirmação será exibida na data agendada. Você poderá confirmar com OK ou adiar por 48h (apenas uma vez).'}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              {saving ? 'Salvando...' : isEditing ? 'Salvar Alterações' : 'Agendar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Transaction Row ──────────────────────────────────────────────────────────

interface TransactionRowProps {
  tx: ScheduledTransaction;
  onDelete: (id: string) => void;
  onConfirmLaunch: (tx: ScheduledTransaction) => void;
  onEdit: (tx: ScheduledTransaction) => void;
}

function TransactionRow({ tx, onDelete, onConfirmLaunch, onEdit }: TransactionRowProps) {
  const [confirming, setConfirming] = useState(false);

  const handleDelete = async () => {
    if (!confirming) { setConfirming(true); return; }
    const ok = await scheduledTransactionService.delete(tx.id);
    if (ok) {
      toast.success('Lançamento excluído.');
      onDelete(tx.id);
    } else {
      toast.error('Erro ao excluir lançamento.');
    }
    setConfirming(false);
  };

  const isAsk = tx.launchMode === 'ask';
  const isPostponed = tx.postponed && tx.postponedUntil;

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-card border border-border hover:border-border/80 transition-colors group">
      {/* Icon */}
      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-base ${
          tx.type === 'income' ? 'bg-positive/10' : 'bg-negative/10'
        }`}
      >
        {tx.categoryEmoji || (tx.type === 'income' ? '💰' : '💸')}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-foreground truncate">{tx.description}</p>
          {/* Launch mode badge */}
          {isAsk ? (
            <span className="flex items-center gap-1 text-xs text-primary bg-primary/10 px-1.5 py-0.5 rounded-full flex-shrink-0">
              <Bell size={9} />
              Confirmar
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full flex-shrink-0">
              <Zap size={9} />
              Auto
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className="text-xs text-muted-foreground">{formatDate(tx.scheduledDate)}</span>
          {tx.recurrence !== 'none' && (
            <span className="flex items-center gap-1 text-xs text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
              <RefreshCw size={10} />
              {RECURRENCE_LABELS[tx.recurrence]}
            </span>
          )}
          {tx.endDate && (
            <span className="text-xs text-muted-foreground">até {formatDate(tx.endDate)}</span>
          )}
          {tx.categoryName && (
            <span className="text-xs text-muted-foreground truncate">{tx.categoryName}</span>
          )}
          {isPostponed && (
            <span className="flex items-center gap-1 text-xs text-warning bg-warning/10 px-1.5 py-0.5 rounded-full">
              <Timer size={9} />
              Adiado
            </span>
          )}
        </div>
      </div>

      {/* Amount */}
      <span
        className={`text-sm font-semibold tabular-nums flex-shrink-0 ${
          tx.type === 'income' ? 'text-positive' : 'text-negative'
        }`}
      >
        {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
      </span>

      {/* Confirm launch button (for ask mode) */}
      {isAsk && (
        <button
          onClick={() => onConfirmLaunch(tx)}
          className="flex-shrink-0 p-1.5 rounded-lg text-primary bg-primary/10 hover:bg-primary/20 transition-colors"
          title="Confirmar lançamento"
        >
          <Bell size={14} />
        </button>
      )}

      {/* Edit */}
      <button
        onClick={() => onEdit(tx)}
        className="flex-shrink-0 p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors opacity-0 group-hover:opacity-100"
        title="Editar lançamento"
      >
        <Pencil size={14} />
      </button>

      {/* Delete */}
      <button
        onClick={handleDelete}
        className={`flex-shrink-0 p-1.5 rounded-lg transition-colors ${
          confirming
            ? 'bg-negative text-white' :'text-muted-foreground hover:text-negative hover:bg-negative/10 opacity-0 group-hover:opacity-100'
        }`}
        title={confirming ? 'Clique novamente para confirmar' : 'Excluir lançamento'}
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

// ─── Projection Chart ─────────────────────────────────────────────────────────

interface ProjectionChartProps {
  projections: MonthlyProjection[];
}

function ProjectionChart({ projections }: ProjectionChartProps) {
  const maxAbs = Math.max(...projections.map((p) => Math.abs(p.runningBalance)), 1);

  return (
    <div className="space-y-3">
      {projections.map((p) => {
        const isNegative = p.runningBalance < 0;
        const barWidth = Math.min(100, (Math.abs(p.runningBalance) / maxAbs) * 100);

        return (
          <div key={p.month} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-foreground capitalize">{p.label}</span>
              <div className="flex items-center gap-3">
                <span className="text-positive">+{formatCurrency(p.income)}</span>
                <span className="text-negative">-{formatCurrency(p.expense)}</span>
                <span className={`font-semibold tabular-nums ${isNegative ? 'text-negative' : 'text-positive'}`}>
                  {isNegative && <AlertTriangle size={11} className="inline mr-0.5" />}
                  {formatCurrency(p.runningBalance)}
                </span>
              </div>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isNegative ? 'bg-negative' : 'bg-positive'
                }`}
                style={{ width: `${barWidth}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function FutureTransactionsPage() {
  const [transactions, setTransactions] = useState<ScheduledTransaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [projections, setProjections] = useState<MonthlyProjection[]>([]);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTx, setEditingTx] = useState<ScheduledTransaction | null>(null);
  const [showProjections, setShowProjections] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [confirmTx, setConfirmTx] = useState<ScheduledTransaction | null>(null);
  const [postponing, setPostponing] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [txs, cats, summary] = await Promise.all([
        scheduledTransactionService.getAll(),
        categoryService.getAll(),
        transactionService.getMonthSummary(),
      ]);
      setTransactions(txs);
      setCategories(cats);
      const balance = summary.balance;
      setCurrentBalance(balance);
      setProjections(scheduledTransactionService.buildProjections(txs, balance, 6));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSave = (tx: ScheduledTransaction) => {
    setTransactions((prev) => {
      const exists = prev.some((t) => t.id === tx.id);
      const updated = exists
        ? prev.map((t) => (t.id === tx.id ? tx : t))
        : [...prev, tx];
      const sorted = updated.sort(
        (a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
      );
      setProjections(scheduledTransactionService.buildProjections(sorted, currentBalance, 6));
      return sorted;
    });
    setShowForm(false);
    setEditingTx(null);
  };

  const handleDelete = (id: string) => {
    const updated = transactions.filter((t) => t.id !== id);
    setTransactions(updated);
    setProjections(scheduledTransactionService.buildProjections(updated, currentBalance, 6));
  };

  const handleEdit = (tx: ScheduledTransaction) => {
    setEditingTx(tx);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingTx(null);
  };

  const handleConfirmLaunch = (tx: ScheduledTransaction) => {
    setConfirmTx(tx);
  };

  const handleConfirmOk = () => {
    if (!confirmTx) return;
    toast.success(`Lançamento "${confirmTx.description}" confirmado!`);
    setConfirmTx(null);
  };

  const handlePostpone = async () => {
    if (!confirmTx) return;
    setPostponing(true);
    try {
      const updated = await scheduledTransactionService.postpone(confirmTx.id);
      if (updated) {
        setTransactions((prev) =>
          prev.map((t) => (t.id === updated.id ? updated : t))
        );
        toast.success(
          `Lançamento "${confirmTx.description}" adiado por 48 horas.`,
          { description: 'Este lançamento não poderá ser adiado novamente.' }
        );
        setConfirmTx(null);
      } else {
        toast.error('Erro ao adiar lançamento.');
      }
    } catch {
      toast.error('Erro ao adiar lançamento.');
    } finally {
      setPostponing(false);
    }
  };

  const upcoming24h = scheduledTransactionService.getUpcoming24h(transactions);
  const hasNegativeProjection = scheduledTransactionService.hasNegativeProjection(transactions, currentBalance);
  const pendingConfirmation = scheduledTransactionService.getPendingConfirmation(transactions);

  const filtered = filterType === 'all' ? transactions : transactions.filter((t) => t.type === filterType);

  const totalScheduledIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + t.amount, 0);
  const totalScheduledExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0);

  return (
    <AppLayout>
      <div className="px-6 lg:px-8 xl:px-10 py-6 max-w-screen-xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <CalendarDays size={20} className="text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Lançamentos Futuros</h1>
              <p className="text-sm text-muted-foreground">
                {transactions.length} agendado{transactions.length !== 1 ? 's' : ''}
                {hasNegativeProjection && (
                  <span className="ml-2 inline-flex items-center gap-1 text-negative font-medium">
                    <AlertTriangle size={12} />
                    Projeção negativa detectada
                  </span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={() => { setEditingTx(null); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus size={16} />
            Novo Agendamento
          </button>
        </div>

        {/* Alert: pending confirmation (ask mode) */}
        {pendingConfirmation.length > 0 && (
          <div className="flex items-start gap-3 px-4 py-3 rounded-xl border border-primary/30 bg-primary/5 text-primary text-sm font-medium mb-4">
            <Bell size={16} className="flex-shrink-0 mt-0.5 animate-pulse" />
            <div className="flex-1">
              <span>
                {pendingConfirmation.length === 1
                  ? `Lançamento aguardando confirmação: ${pendingConfirmation[0].description}`
                  : `${pendingConfirmation.length} lançamentos aguardando confirmação`}
              </span>
              <div className="flex flex-wrap gap-2 mt-2">
                {pendingConfirmation.map((tx) => (
                  <button
                    key={tx.id}
                    onClick={() => handleConfirmLaunch(tx)}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary text-white text-xs font-medium hover:bg-primary/90 transition-colors"
                  >
                    <CheckCircle size={11} />
                    {tx.description} — {formatCurrency(tx.amount)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Alert: upcoming 24h */}
        {upcoming24h.length > 0 && (
          <div className="flex items-start gap-3 px-4 py-3 rounded-xl border border-warning/30 bg-warning-bg text-warning text-sm font-medium mb-5">
            <Clock size={16} className="flex-shrink-0 mt-0.5" />
            <span>
              {upcoming24h.length === 1
                ? `Despesa agendada nas próximas 24h: ${upcoming24h[0].description} — ${formatCurrency(upcoming24h[0].amount)}`
                : `${upcoming24h.length} despesas agendadas nas próximas 24h — total: ${formatCurrency(upcoming24h.reduce((s, t) => s + t.amount, 0))}`}
            </span>
          </div>
        )}

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Wallet size={15} className="text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-medium">Saldo Atual</span>
            </div>
            <p className={`text-xl font-bold tabular-nums ${currentBalance >= 0 ? 'text-positive' : 'text-negative'}`}>
              {formatCurrency(currentBalance)}
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={15} className="text-positive" />
              <span className="text-xs text-muted-foreground font-medium">Receitas Agendadas</span>
            </div>
            <p className="text-xl font-bold tabular-nums text-positive">+{formatCurrency(totalScheduledIncome)}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown size={15} className="text-negative" />
              <span className="text-xs text-muted-foreground font-medium">Despesas Agendadas</span>
            </div>
            <p className="text-xl font-bold tabular-nums text-negative">-{formatCurrency(totalScheduledExpense)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          {/* Left: Transactions list */}
          <div className="xl:col-span-3 space-y-4">
            {/* Filter */}
            <div className="flex items-center gap-2">
              {(['all', 'expense', 'income'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilterType(f)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    filterType === f
                      ? 'bg-primary text-white' :'bg-card border border-border text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {f === 'all' ? 'Todos' : f === 'expense' ? 'Despesas' : 'Receitas'}
                </button>
              ))}
              <span className="ml-auto text-xs text-muted-foreground">{filtered.length} item{filtered.length !== 1 ? 's' : ''}</span>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-card border border-border rounded-xl animate-pulse" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center bg-card border border-border rounded-2xl">
                <CalendarDays size={40} className="text-muted-foreground/30 mb-3" />
                <p className="text-sm font-medium text-muted-foreground">Nenhum lançamento agendado</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Clique em "Novo Agendamento" para começar</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filtered.map((tx) => (
                  <TransactionRow
                    key={tx.id}
                    tx={tx}
                    onDelete={handleDelete}
                    onConfirmLaunch={handleConfirmLaunch}
                    onEdit={handleEdit}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right: Projections */}
          <div className="xl:col-span-2">
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <button
                onClick={() => setShowProjections((v) => !v)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <BarChart3 size={16} className="text-primary" />
                  <span className="text-sm font-semibold text-foreground">Projeção de Saldo</span>
                  <span className="text-xs text-muted-foreground">(6 meses)</span>
                </div>
                {showProjections ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
              </button>

              {showProjections && (
                <div className="px-5 pb-5">
                  {projections.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">
                      Adicione lançamentos para ver a projeção.
                    </p>
                  ) : (
                    <ProjectionChart projections={projections} />
                  )}
                  {hasNegativeProjection && (
                    <div className="mt-4 flex items-start gap-2 px-3 py-2.5 rounded-lg bg-negative/10 border border-negative/20 text-negative text-xs">
                      <AlertTriangle size={13} className="flex-shrink-0 mt-0.5" />
                      <span>
                        Um ou mais meses projetados apresentam saldo negativo com os lançamentos agendados.
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showForm && (
        <FormModal
          categories={categories}
          onClose={handleCloseForm}
          onSave={handleSave}
          initialData={editingTx}
        />
      )}

      {confirmTx && (
        <ConfirmLaunchModal
          tx={confirmTx}
          onConfirm={handleConfirmOk}
          onPostpone={handlePostpone}
          onClose={() => setConfirmTx(null)}
          postponing={postponing}
        />
      )}
    </AppLayout>
  );
}
