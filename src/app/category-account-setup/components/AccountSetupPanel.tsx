'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search, X, Wallet, CreditCard, PiggyBank, Smartphone, Loader2 } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import EmptyState from '@/components/ui/EmptyState';
import { toast } from 'sonner';
import { accountService, type Account } from '@/lib/services/financeService';

const typeConfig: Record<Account['type'], { label: string; icon: React.ReactNode; variant: 'primary' | 'info' | 'positive' | 'neutral' | 'warning' }> = {
  corrente: { label: 'Corrente', icon: <Wallet size={13} />, variant: 'primary' },
  credito: { label: 'Crédito', icon: <CreditCard size={13} />, variant: 'warning' },
  poupanca: { label: 'Poupança', icon: <PiggyBank size={13} />, variant: 'positive' },
  digital: { label: 'Digital', icon: <Smartphone size={13} />, variant: 'info' },
  investimento: { label: 'Investimento', icon: <Wallet size={13} />, variant: 'neutral' },
};

interface EditingAccount {
  id: string | null;
  name: string;
  institution: string;
  type: Account['type'];
  initialBalance: string;
  isActive: boolean;
}

const defaultEditing: EditingAccount = {
  id: null,
  name: '',
  institution: '',
  type: 'corrente',
  initialBalance: '',
  isActive: true,
};

export default function AccountSetupPanel() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<EditingAccount>(defaultEditing);
  const [deleteTarget, setDeleteTarget] = useState<Account | null>(null);
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadAccounts();
  }, []);

  async function loadAccounts() {
    setLoading(true);
    try {
      const data = await accountService.getAll();
      setAccounts(data);
    } catch (err: any) {
      toast.error('Erro ao carregar contas: ' + (err?.message || ''));
    } finally {
      setLoading(false);
    }
  }

  const filtered = accounts.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.institution.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditing(defaultEditing);
    setEditErrors({});
    setIsModalOpen(true);
  };

  const openEdit = (acc: Account) => {
    setEditing({
      id: acc.id,
      name: acc.name,
      institution: acc.institution,
      type: acc.type,
      initialBalance: String(acc.initialBalance),
      isActive: acc.isActive,
    });
    setEditErrors({});
    setIsModalOpen(true);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!editing.name.trim()) errs.name = 'Nome da conta é obrigatório';
    if (!editing.institution.trim()) errs.institution = 'Instituição é obrigatória';
    if (editing.initialBalance && isNaN(Number(editing.initialBalance))) {
      errs.initialBalance = 'Saldo inicial deve ser um número válido';
    }
    setEditErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      if (editing.id) {
        const ok = await accountService.update(editing.id, {
          name: editing.name,
          institution: editing.institution,
          type: editing.type,
          initialBalance: Number(editing.initialBalance) || 0,
          isActive: editing.isActive,
        });
        if (ok) {
          toast.success('Conta atualizada com sucesso!');
          await loadAccounts();
        } else {
          toast.error('Erro ao atualizar conta.');
        }
      } else {
        const newAcc = await accountService.create({
          name: editing.name,
          institution: editing.institution,
          type: editing.type,
          initialBalance: Number(editing.initialBalance) || 0,
          currentBalance: Number(editing.initialBalance) || 0,
          isActive: editing.isActive,
        });
        if (newAcc) {
          toast.success('Conta criada com sucesso!');
          await loadAccounts();
        } else {
          toast.error('Erro ao criar conta.');
        }
      }
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error('Erro: ' + (err?.message || 'Tente novamente.'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      const ok = await accountService.delete(deleteTarget.id);
      if (ok) {
        toast.success(`Conta "${deleteTarget.name}" excluída.`);
        await loadAccounts();
      } else {
        toast.error('Erro ao excluir conta.');
      }
    } catch (err: any) {
      toast.error('Erro: ' + (err?.message || 'Tente novamente.'));
    } finally {
      setSaving(false);
      setDeleteTarget(null);
    }
  };

  const totalBalance = accounts
    .filter((a) => a.isActive && a.type !== 'credito')
    .reduce((s, a) => s + a.currentBalance, 0);

  const totalCredit = accounts
    .filter((a) => a.isActive && a.type === 'credito')
    .reduce((s, a) => s + Math.abs(a.currentBalance), 0);

  return (
    <>
      <div className="bg-card border border-border rounded-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h3 className="text-base font-semibold text-foreground">Contas & Cartões</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{accounts.length} contas cadastradas</p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 active:scale-95 transition-all duration-150"
          >
            <Plus size={14} />
            Nova Conta
          </button>
        </div>

        {/* Summary strip */}
        <div className="grid grid-cols-2 divide-x divide-border border-b border-border">
          <div className="px-5 py-3">
            <p className="text-xs text-muted-foreground font-medium mb-0.5">Saldo Total (Ativos)</p>
            <p className="text-base font-bold tabular-nums text-positive">
              {totalBalance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          </div>
          <div className="px-5 py-3">
            <p className="text-xs text-muted-foreground font-medium mb-0.5">Fatura em Aberto</p>
            <p className="text-base font-bold tabular-nums text-negative">
              -{totalCredit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="px-5 py-3 border-b border-border">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar conta ou instituição..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-border bg-muted/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto scrollbar-thin flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={20} className="animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={Wallet}
              title="Nenhuma conta encontrada"
              description="Cadastre suas contas bancárias e cartões para registrar lançamentos e acompanhar saldos."
              action={{ label: 'Adicionar Conta', onClick: openCreate }}
            />
          ) : (
            <table className="w-full min-w-[480px]">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Conta</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tipo</th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Saldo Atual</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</th>
                  <th className="px-5 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((acc) => {
                  const cfg = typeConfig[acc.type];
                  const balancePositive = acc.currentBalance >= 0;
                  return (
                    <tr key={acc.id} className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors duration-100">
                      <td className="px-5 py-3">
                        <div>
                          <p className="text-sm font-semibold text-foreground">{acc.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{acc.institution}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={cfg.variant}>
                          <span className="flex items-center gap-1">
                            {cfg.icon}
                            {cfg.label}
                          </span>
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`text-sm font-bold tabular-nums ${balancePositive ? 'text-foreground' : 'text-negative'}`}>
                          {acc.currentBalance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={acc.isActive ? 'positive' : 'neutral'}>
                          {acc.isActive ? 'Ativa' : 'Inativa'}
                        </Badge>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEdit(acc)}
                            className="group relative flex items-center justify-center w-7 h-7 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all"
                            aria-label={`Editar conta ${acc.name}`}
                          >
                            <Pencil size={13} />
                            <span className="pointer-events-none absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 px-2 py-1 rounded-md bg-foreground text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10">
                              Editar
                            </span>
                          </button>
                          <button
                            onClick={() => setDeleteTarget(acc)}
                            className="group relative flex items-center justify-center w-7 h-7 rounded-lg text-muted-foreground hover:bg-negative/10 hover:text-negative transition-all"
                            aria-label={`Excluir conta ${acc.name}`}
                          >
                            <Trash2 size={13} />
                            <span className="pointer-events-none absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 px-2 py-1 rounded-md bg-foreground text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10">
                              Excluir
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editing.id ? 'Editar Conta' : 'Nova Conta'}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5" htmlFor="acc-name">
              Nome da Conta <span className="text-negative">*</span>
            </label>
            <input
              id="acc-name"
              type="text"
              value={editing.name}
              onChange={(e) => setEditing((p) => ({ ...p, name: e.target.value }))}
              placeholder="Ex: Conta Corrente Itaú"
              className={`w-full px-3 py-2 text-sm rounded-xl border bg-muted/40 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 transition-colors ${
                editErrors.name ? 'border-negative' : 'border-border'
              }`}
            />
            {editErrors.name && <p className="mt-1 text-xs text-negative">{editErrors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5" htmlFor="acc-institution">
              Instituição Financeira <span className="text-negative">*</span>
            </label>
            <input
              id="acc-institution"
              type="text"
              value={editing.institution}
              onChange={(e) => setEditing((p) => ({ ...p, institution: e.target.value }))}
              placeholder="Ex: Banco Itaú, Nubank, XP"
              className={`w-full px-3 py-2 text-sm rounded-xl border bg-muted/40 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 transition-colors ${
                editErrors.institution ? 'border-negative' : 'border-border'
              }`}
            />
            {editErrors.institution && <p className="mt-1 text-xs text-negative">{editErrors.institution}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">Tipo de Conta</label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(typeConfig) as Account['type'][]).map((t) => {
                const cfg = typeConfig[t];
                return (
                  <button
                    key={`acc-type-${t}`}
                    type="button"
                    onClick={() => setEditing((p) => ({ ...p, type: t }))}
                    className={`flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl text-xs font-semibold border transition-all active:scale-95 ${
                      editing.type === t
                        ? 'bg-primary/10 border-primary/40 text-primary' :'border-border text-muted-foreground hover:border-primary/20 hover:text-foreground'
                    }`}
                  >
                    {cfg.icon}
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5" htmlFor="acc-balance">
              Saldo Inicial (R$)
            </label>
            <p className="text-xs text-muted-foreground mb-2">
              Informe o saldo no momento do cadastro. Para cartão de crédito, deixe em 0.
            </p>
            <input
              id="acc-balance"
              type="number"
              step="0.01"
              value={editing.initialBalance}
              onChange={(e) => setEditing((p) => ({ ...p, initialBalance: e.target.value }))}
              placeholder="0,00"
              className={`w-full px-3 py-2 text-sm rounded-xl border bg-muted/40 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 tabular-nums transition-colors ${
                editErrors.initialBalance ? 'border-negative' : 'border-border'
              }`}
            />
            {editErrors.initialBalance && <p className="mt-1 text-xs text-negative">{editErrors.initialBalance}</p>}
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border">
            <div>
              <p className="text-sm font-semibold text-foreground">Conta Ativa</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Contas inativas não aparecem na seleção de lançamentos
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={editing.isActive}
              onClick={() => setEditing((p) => ({ ...p, isActive: !p.isActive }))}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                editing.isActive ? 'bg-primary' : 'bg-secondary'
              }`}
            >
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-200 ${
                  editing.isActive ? 'translate-x-4' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-semibold rounded-xl border border-border text-muted-foreground hover:text-foreground transition-all"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-xl bg-primary text-primary-foreground hover:opacity-90 active:scale-95 transition-all disabled:opacity-70"
            >
              {saving && <Loader2 size={13} className="animate-spin" />}
              {editing.id ? 'Salvar Alterações' : 'Adicionar Conta'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete confirm modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Excluir Conta"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-foreground">
            Tem certeza que deseja excluir a conta{' '}
            <strong>&quot;{deleteTarget?.name}&quot;</strong>? Todos os lançamentos vinculados a
            esta conta perderão a referência. Esta ação não pode ser desfeita.
          </p>
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={() => setDeleteTarget(null)}
              className="px-4 py-2 text-sm font-semibold rounded-xl border border-border text-muted-foreground hover:text-foreground transition-all"
            >
              <X size={14} className="inline mr-1" />
              Cancelar
            </button>
            <button
              onClick={handleDelete}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-negative text-white hover:opacity-90 active:scale-95 transition-all disabled:opacity-70"
            >
              {saving && <Loader2 size={13} className="animate-spin" />}
              <Trash2 size={14} />
              Excluir Conta
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}