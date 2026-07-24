'use client';

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'sonner';
import { DollarSign, Calendar, FileText, CreditCard, RefreshCw, Loader2, CheckCircle, StickyNote, Hash } from 'lucide-react';
import Toggle from '@/components/ui/Toggle';
import { categoryService, accountService, transactionService, type Category, type Account } from '@/lib/services/financeService';

interface TransactionFormValues {
  type: 'income' | 'expense';
  amount: string;
  description: string;
  categoryId: string;
  accountId: string;
  date: string;
  paymentMethod: string;
  tags: string;
  notes: string;
  isRecurring: boolean;
  recurrenceFrequency: string;
}

const paymentMethods = ['PIX', 'TED', 'Boleto', 'Débito', 'Crédito', 'Dinheiro', 'Débito Automático'];

export default function TransactionFormPanel() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  useEffect(() => {
    async function loadData() {
      try {
        const [cats, accs] = await Promise.all([
          categoryService.getAll(),
          accountService.getAll(),
        ]);
        setCategories(cats);
        setAccounts(accs);
      } catch (err) {
        console.error('Failed to load form data:', err);
      } finally {
        setLoadingData(false);
      }
    }
    loadData();
  }, []);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<TransactionFormValues>({
    defaultValues: {
      type: 'expense',
      amount: '',
      description: '',
      categoryId: '',
      accountId: '',
      date: todayStr,
      paymentMethod: 'PIX',
      tags: '',
      notes: '',
      isRecurring: false,
      recurrenceFrequency: 'monthly',
    },
  });

  const transactionType = watch('type');
  const isRecurring = watch('isRecurring');
  const selectedCategory = watch('categoryId');

  const currentCategories = categories.filter((c) => c.type === transactionType);

  const onSubmit = async (data: TransactionFormValues) => {
    setIsSubmitting(true);
    try {
      const result = await transactionService.create({
        type: data.type,
        amount: parseFloat(data.amount),
        description: data.description,
        categoryId: data.categoryId,
        accountId: data.accountId,
        date: data.date,
        paymentMethod: data.paymentMethod,
        tags: data.tags,
        notes: data.notes,
        isRecurring: data.isRecurring,
        recurrenceFrequency: data.recurrenceFrequency,
      });

      if (result) {
        setSubmitSuccess(true);
        toast.success('Lançamento registrado com sucesso!', {
          description: `${data.description} — R$ ${parseFloat(data.amount).toFixed(2)}`,
        });
        setTimeout(() => {
          setSubmitSuccess(false);
          reset({
            type: data.type,
            date: todayStr,
            paymentMethod: 'PIX',
            isRecurring: false,
            recurrenceFrequency: 'monthly',
            amount: '',
            description: '',
            categoryId: '',
            accountId: '',
            tags: '',
            notes: '',
          });
        }, 2000);
      } else {
        toast.error('Erro ao registrar lançamento. Tente novamente.');
      }
    } catch (err: any) {
      toast.error('Erro ao registrar lançamento: ' + (err?.message || 'Tente novamente.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {/* Type selector */}
        <div className="grid grid-cols-2 border-b border-border">
          <button
            type="button"
            onClick={() => { setValue('type', 'expense'); setValue('categoryId', ''); }}
            className={`py-4 text-sm font-semibold transition-all duration-150 ${
              transactionType === 'expense' ?'bg-negative-bg text-negative border-b-2 border-negative' :'text-muted-foreground hover:bg-muted'
            }`}
          >
            ↓ Despesa
          </button>
          <button
            type="button"
            onClick={() => { setValue('type', 'income'); setValue('categoryId', ''); }}
            className={`py-4 text-sm font-semibold transition-all duration-150 ${
              transactionType === 'income' ?'bg-positive-bg text-positive border-b-2 border-positive' :'text-muted-foreground hover:bg-muted'
            }`}
          >
            ↑ Receita
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Amount */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5" htmlFor="amount">
              Valor (R$) <span className="text-negative">*</span>
            </label>
            <div className="relative">
              <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0,00"
                {...register('amount', {
                  required: 'Informe o valor do lançamento',
                  min: { value: 0.01, message: 'Valor deve ser maior que zero' },
                })}
                className={`w-full pl-9 pr-4 py-2.5 text-lg font-bold tabular-nums rounded-xl border bg-muted/40 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 transition-colors ${
                  errors.amount ? 'border-negative' : 'border-border focus:border-primary/40'
                }`}
              />
            </div>
            {errors.amount && <p className="mt-1 text-xs text-negative font-medium">{errors.amount.message}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5" htmlFor="description">
              Descrição <span className="text-negative">*</span>
            </label>
            <p className="text-xs text-muted-foreground mb-2">
              Descreva a transação de forma clara para facilitar buscas futuras.
            </p>
            <div className="relative">
              <FileText size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                id="description"
                type="text"
                placeholder="Ex: Supermercado Pão de Açúcar"
                {...register('description', {
                  required: 'Informe uma descrição para o lançamento',
                  minLength: { value: 3, message: 'Mínimo de 3 caracteres' },
                })}
                className={`w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border bg-muted/40 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 transition-colors ${
                  errors.description ? 'border-negative' : 'border-border focus:border-primary/40'
                }`}
              />
            </div>
            {errors.description && <p className="mt-1 text-xs text-negative font-medium">{errors.description.message}</p>}
          </div>

          {/* Category quick-select */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">
              Categoria <span className="text-negative">*</span>
            </label>
            <p className="text-xs text-muted-foreground mb-2">
              Selecione a categoria para classificar este lançamento no orçamento.
            </p>
            <input type="hidden" {...register('categoryId', { required: 'Selecione uma categoria' })} />
            {loadingData ? (
              <p className="text-xs text-muted-foreground">Carregando categorias...</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {currentCategories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setValue('categoryId', cat.id, { shouldValidate: true })}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-150 active:scale-95 ${
                      selectedCategory === cat.id
                        ? transactionType === 'expense' ?'bg-negative/10 border-negative/40 text-negative' :'bg-positive/10 border-positive/40 text-positive' :'bg-muted border-border text-muted-foreground hover:border-primary/30 hover:text-foreground'
                    }`}
                  >
                    <span>{cat.emoji}</span>
                    {cat.name}
                  </button>
                ))}
                {currentCategories.length === 0 && (
                  <p className="text-xs text-muted-foreground">Nenhuma categoria cadastrada. Crie em Categorias &amp; Contas.</p>
                )}
              </div>
            )}
            {errors.categoryId && <p className="mt-1 text-xs text-negative font-medium">{errors.categoryId.message}</p>}
          </div>

          {/* Date + Payment Method row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5" htmlFor="date">
                Data <span className="text-negative">*</span>
              </label>
              <div className="relative">
                <Calendar size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="date"
                  type="date"
                  {...register('date', { required: 'Selecione a data' })}
                  className={`w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border bg-muted/40 text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 transition-colors ${
                    errors.date ? 'border-negative' : 'border-border focus:border-primary/40'
                  }`}
                />
              </div>
              {errors.date && <p className="mt-1 text-xs text-negative font-medium">{errors.date.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5" htmlFor="paymentMethod">
                Forma de Pagamento
              </label>
              <div className="relative">
                <CreditCard size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <select
                  id="paymentMethod"
                  {...register('paymentMethod')}
                  className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-border bg-muted/40 text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 transition-colors appearance-none"
                >
                  {paymentMethods.map((m) => (
                    <option key={`pm-${m}`} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Account */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5" htmlFor="accountId">
              Conta / Cartão <span className="text-negative">*</span>
            </label>
            <p className="text-xs text-muted-foreground mb-2">
              Selecione de qual conta ou cartão saiu ou entrou o valor.
            </p>
            <input type="hidden" {...register('accountId', { required: 'Selecione uma conta' })} />
            {loadingData ? (
              <p className="text-xs text-muted-foreground">Carregando contas...</p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {accounts.filter((a) => a.isActive).map((acc) => (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => setValue('accountId', acc.id, { shouldValidate: true })}
                    className={`flex flex-col items-start px-3 py-2.5 rounded-xl text-left border transition-all duration-150 active:scale-95 ${
                      watch('accountId') === acc.id
                        ? 'bg-primary/10 border-primary/40 text-primary' :'bg-muted border-border text-muted-foreground hover:border-primary/30 hover:text-foreground'
                    }`}
                  >
                    <span className="text-xs font-semibold truncate w-full">{acc.name}</span>
                    <span className="text-xs opacity-70 mt-0.5">{acc.type}</span>
                  </button>
                ))}
                {accounts.filter((a) => a.isActive).length === 0 && (
                  <p className="text-xs text-muted-foreground col-span-2">Nenhuma conta ativa. Crie em Categorias &amp; Contas.</p>
                )}
              </div>
            )}
            {errors.accountId && <p className="mt-1 text-xs text-negative font-medium">{errors.accountId.message}</p>}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5" htmlFor="tags">
              Tags
            </label>
            <p className="text-xs text-muted-foreground mb-2">
              Separe as tags por vírgula. Ex: viagem, fixo, urgente
            </p>
            <div className="relative">
              <Hash size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                id="tags"
                type="text"
                placeholder="fixo, mensal, essencial"
                {...register('tags')}
                className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-border bg-muted/40 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 transition-colors"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5" htmlFor="notes">
              Observações
            </label>
            <div className="relative">
              <StickyNote size={15} className="absolute left-3 top-3 text-muted-foreground" />
              <textarea
                id="notes"
                rows={3}
                placeholder="Informações adicionais sobre este lançamento..."
                {...register('notes')}
                className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-border bg-muted/40 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 transition-colors resize-none"
              />
            </div>
          </div>

          {/* Recurrence toggle */}
          <div className="rounded-xl border border-border bg-muted/30 p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-semibold text-foreground">Lançamento Recorrente</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Repete automaticamente com a frequência definida
                </p>
              </div>
              <Controller
                control={control}
                name="isRecurring"
                render={({ field }) => (
                  <Toggle checked={field.value} onChange={field.onChange} />
                )}
              />
            </div>
            {isRecurring && (
              <div className="fade-in">
                <label className="block text-xs font-semibold text-foreground mb-1.5" htmlFor="recurrenceFrequency">
                  Frequência de Repetição
                </label>
                <div className="relative">
                  <RefreshCw size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <select
                    id="recurrenceFrequency"
                    {...register('recurrenceFrequency')}
                    className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 appearance-none"
                  >
                    <option value="daily">Diário</option>
                    <option value="weekly">Semanal</option>
                    <option value="biweekly">Quinzenal</option>
                    <option value="monthly">Mensal</option>
                    <option value="yearly">Anual</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sticky footer */}
        <div className="sticky bottom-0 bg-card border-t border-border px-6 py-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="px-4 py-2.5 text-sm font-semibold rounded-xl border border-border text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-all duration-150 active:scale-95"
          >
            Limpar
          </button>
          <button
            type="submit"
            disabled={isSubmitting || submitSuccess}
            className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold min-w-[160px] transition-all duration-150 active:scale-95 ${
              submitSuccess
                ? 'bg-positive text-white' :'bg-primary text-primary-foreground hover:opacity-90'
            } disabled:opacity-80 disabled:cursor-not-allowed`}
          >
            {isSubmitting ? (
              <><Loader2 size={15} className="animate-spin" />Salvando...</>
            ) : submitSuccess ? (
              <><CheckCircle size={15} />Salvo!</>
            ) : (
              'Registrar Lançamento'
            )}
          </button>
        </div>
      </div>
    </form>
  );
}