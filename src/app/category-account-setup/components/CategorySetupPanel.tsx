'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search, ChevronDown, ChevronUp, Check, X, Loader2 } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { toast } from 'sonner';
import EmptyState from '@/components/ui/EmptyState';
import { Tags } from 'lucide-react';
import { categoryService, type Category } from '@/lib/services/financeService';

const colorOptions = [
  '#1e3a5f', '#f59e0b', '#0284c7', '#16a34a', '#dc2626',
  '#7c3aed', '#be185d', '#64748b', '#0f766e', '#b45309',
];

interface EditingCategory {
  id: string | null;
  name: string;
  type: 'income' | 'expense';
  emoji: string;
  color: string;
  budget: string;
  parent: string;
}

const defaultEditing: EditingCategory = {
  id: null,
  name: '',
  type: 'expense',
  emoji: '📦',
  color: '#1e3a5f',
  budget: '',
  parent: '',
};

export default function CategorySetupPanel() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [sortField, setSortField] = useState<'name' | 'budget'>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<EditingCategory>(defaultEditing);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    setLoading(true);
    try {
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (err: any) {
      toast.error('Erro ao carregar categorias: ' + (err?.message || ''));
    } finally {
      setLoading(false);
    }
  }

  const filtered = categories
    .filter((c) => {
      const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === 'all' || c.type === typeFilter;
      return matchSearch && matchType;
    })
    .sort((a, b) => {
      const mult = sortDir === 'asc' ? 1 : -1;
      if (sortField === 'name') return mult * a.name.localeCompare(b.name);
      return mult * ((a.budget ?? 0) - (b.budget ?? 0));
    });

  const handleSort = (field: 'name' | 'budget') => {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortField(field); setSortDir('asc'); }
  };

  const openCreate = () => {
    setEditing(defaultEditing);
    setEditErrors({});
    setIsModalOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditing({
      id: cat.id,
      name: cat.name,
      type: cat.type,
      emoji: cat.emoji,
      color: cat.color,
      budget: cat.budget !== null ? String(cat.budget) : '',
      parent: cat.parentId ?? '',
    });
    setEditErrors({});
    setIsModalOpen(true);
  };

  const validateEditing = () => {
    const errs: Record<string, string> = {};
    if (!editing.name.trim()) errs.name = 'Nome é obrigatório';
    if (editing.type === 'expense' && editing.budget && isNaN(Number(editing.budget))) {
      errs.budget = 'Orçamento deve ser um número válido';
    }
    setEditErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validateEditing()) return;
    setSaving(true);
    try {
      if (editing.id) {
        const ok = await categoryService.update(editing.id, {
          name: editing.name,
          type: editing.type,
          emoji: editing.emoji,
          color: editing.color,
          budget: editing.budget ? Number(editing.budget) : null,
          parentId: editing.parent || null,
        });
        if (ok) {
          toast.success('Categoria atualizada com sucesso!');
          await loadCategories();
        } else {
          toast.error('Erro ao atualizar categoria.');
        }
      } else {
        const newCat = await categoryService.create({
          name: editing.name,
          type: editing.type,
          emoji: editing.emoji,
          color: editing.color,
          budget: editing.budget ? Number(editing.budget) : null,
          parentId: editing.parent || null,
        });
        if (newCat) {
          toast.success('Categoria criada com sucesso!');
          await loadCategories();
        } else {
          toast.error('Erro ao criar categoria.');
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
      const ok = await categoryService.delete(deleteTarget.id);
      if (ok) {
        toast.success(`Categoria "${deleteTarget.name}" excluída.`);
        await loadCategories();
      } else {
        toast.error('Erro ao excluir categoria.');
      }
    } catch (err: any) {
      toast.error('Erro: ' + (err?.message || 'Tente novamente.'));
    } finally {
      setSaving(false);
      setDeleteTarget(null);
    }
  };

  const SortIcon = ({ field }: { field: 'name' | 'budget' }) => {
    if (sortField !== field) return <ChevronDown size={12} className="opacity-30" />;
    return sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />;
  };

  return (
    <>
      <div className="bg-card border border-border rounded-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h3 className="text-base font-semibold text-foreground">Categorias</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{categories.length} categorias cadastradas</p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 active:scale-95 transition-all duration-150"
          >
            <Plus size={14} />
            Nova Categoria
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-border flex-wrap">
          <div className="relative flex-1 min-w-[160px]">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar categoria..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-border bg-muted/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
            />
          </div>
          <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
            {(['all', 'income', 'expense'] as const).map((f) => (
              <button
                key={`cat-filter-${f}`}
                onClick={() => setTypeFilter(f)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                  typeFilter === f ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {f === 'all' ? 'Todos' : f === 'income' ? 'Receitas' : 'Despesas'}
              </button>
            ))}
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
              icon={Tags}
              title="Nenhuma categoria encontrada"
              description="Crie categorias para classificar suas receitas e despesas no sistema."
              action={{ label: 'Criar Categoria', onClick: openCreate }}
            />
          ) : (
            <table className="w-full min-w-[480px]">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th
                    className="px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground cursor-pointer select-none"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center gap-1">
                      Categoria <SortIcon field="name" />
                    </div>
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Tipo
                  </th>
                  <th
                    className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground cursor-pointer select-none"
                    onClick={() => handleSort('budget')}
                  >
                    <div className="flex items-center gap-1">
                      Orçamento <SortIcon field="budget" />
                    </div>
                  </th>
                  <th className="px-5 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((cat) => (
                  <tr
                    key={cat.id}
                    className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors duration-100"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="flex items-center justify-center w-7 h-7 rounded-lg text-base flex-shrink-0"
                          style={{ backgroundColor: cat.color + '22' }}
                        >
                          {cat.emoji}
                        </span>
                        <span className="text-sm font-semibold text-foreground">{cat.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={cat.type === 'income' ? 'positive' : 'negative'}>
                        {cat.type === 'income' ? 'Receita' : 'Despesa'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs tabular-nums text-muted-foreground">
                      {cat.budget
                        ? cat.budget.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                        : <span className="text-muted-foreground/50">—</span>}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(cat)}
                          className="group relative flex items-center justify-center w-7 h-7 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all"
                          aria-label={`Editar categoria ${cat.name}`}
                        >
                          <Pencil size={13} />
                          <span className="pointer-events-none absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 px-2 py-1 rounded-md bg-foreground text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            Editar
                          </span>
                        </button>
                        <button
                          onClick={() => setDeleteTarget(cat)}
                          className="group relative flex items-center justify-center w-7 h-7 rounded-lg text-muted-foreground hover:bg-negative/10 hover:text-negative transition-all"
                          aria-label={`Excluir categoria ${cat.name}`}
                        >
                          <Trash2 size={13} />
                          <span className="pointer-events-none absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 px-2 py-1 rounded-md bg-foreground text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            Excluir
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editing.id ? 'Editar Categoria' : 'Nova Categoria'}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5" htmlFor="cat-name">
              Nome <span className="text-negative">*</span>
            </label>
            <input
              id="cat-name"
              type="text"
              value={editing.name}
              onChange={(e) => setEditing((p) => ({ ...p, name: e.target.value }))}
              placeholder="Ex: Alimentação"
              className={`w-full px-3 py-2 text-sm rounded-xl border bg-muted/40 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 ${
                editErrors.name ? 'border-negative' : 'border-border'
              }`}
            />
            {editErrors.name && <p className="mt-1 text-xs text-negative">{editErrors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">Tipo</label>
            <div className="grid grid-cols-2 gap-2">
              {(['expense', 'income'] as const).map((t) => (
                <button
                  key={`cat-type-${t}`}
                  type="button"
                  onClick={() => setEditing((p) => ({ ...p, type: t }))}
                  className={`py-2 rounded-xl text-sm font-semibold border transition-all ${
                    editing.type === t
                      ? t === 'expense' ? 'bg-negative/10 border-negative/40 text-negative' : 'bg-positive/10 border-positive/40 text-positive' :'border-border text-muted-foreground hover:border-foreground/20'
                  }`}
                >
                  {t === 'expense' ? '↓ Despesa' : '↑ Receita'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5" htmlFor="cat-emoji">
                Ícone (Emoji)
              </label>
              <input
                id="cat-emoji"
                type="text"
                value={editing.emoji}
                onChange={(e) => setEditing((p) => ({ ...p, emoji: e.target.value }))}
                maxLength={2}
                className="w-full px-3 py-2 text-sm rounded-xl border border-border bg-muted/40 text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 text-center text-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Cor</label>
              <div className="flex flex-wrap gap-1.5">
                {colorOptions.map((c) => (
                  <button
                    key={`color-${c}`}
                    type="button"
                    onClick={() => setEditing((p) => ({ ...p, color: c }))}
                    className="w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center"
                    style={{ backgroundColor: c, borderColor: editing.color === c ? '#0f172a' : 'transparent' }}
                    aria-label={`Selecionar cor ${c}`}
                  >
                    {editing.color === c && <Check size={10} className="text-white" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {editing.type === 'expense' && (
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5" htmlFor="cat-budget">
                Orçamento Mensal (R$)
              </label>
              <p className="text-xs text-muted-foreground mb-2">
                Deixe em branco para não definir limite de orçamento.
              </p>
              <input
                id="cat-budget"
                type="number"
                min="0"
                step="0.01"
                value={editing.budget}
                onChange={(e) => setEditing((p) => ({ ...p, budget: e.target.value }))}
                placeholder="0,00"
                className={`w-full px-3 py-2 text-sm rounded-xl border bg-muted/40 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 tabular-nums ${
                  editErrors.budget ? 'border-negative' : 'border-border'
                }`}
              />
              {editErrors.budget && <p className="mt-1 text-xs text-negative">{editErrors.budget}</p>}
            </div>
          )}

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
              {editing.id ? 'Salvar Alterações' : 'Criar Categoria'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete confirm modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Excluir Categoria"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-foreground">
            Tem certeza que deseja excluir a categoria{' '}
            <strong>&quot;{deleteTarget?.name}&quot;</strong>? Esta ação não pode ser desfeita.
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
              Excluir
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}