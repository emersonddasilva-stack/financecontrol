'use client';

import { createClient } from '@/lib/supabase/client';

export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly';
export type LaunchMode = 'auto' | 'ask';

export interface ScheduledTransaction {
  id: string;
  userId: string;
  categoryId: string | null;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  scheduledDate: string;
  recurrence: RecurrenceType;
  endDate: string | null;
  isActive: boolean;
  launchMode: LaunchMode;
  postponed: boolean;
  postponedUntil: string | null;
  createdAt: string;
  // Joined
  categoryName?: string;
  categoryEmoji?: string;
}

export interface MonthlyProjection {
  month: string; // 'YYYY-MM'
  label: string; // 'Jan 2026'
  income: number;
  expense: number;
  balance: number;
  runningBalance: number;
}

function isSchemaError(error: any): boolean {
  if (!error) return false;
  if (error.code && typeof error.code === 'string') {
    const cls = error.code.substring(0, 2);
    if (cls === '42' || cls === '08') return true;
  }
  if (error.message) {
    return /relation.*does not exist|column.*does not exist|function.*does not exist|syntax error|type.*does not exist/i.test(
      error.message
    );
  }
  return false;
}

function mapRow(r: any): ScheduledTransaction {
  return {
    id: r.id,
    userId: r.user_id,
    categoryId: r.category_id,
    type: r.transaction_type as 'income' | 'expense',
    amount: Number(r.amount),
    description: r.description,
    scheduledDate: r.scheduled_date,
    recurrence: r.recurrence as RecurrenceType,
    endDate: r.end_date,
    isActive: r.is_active,
    launchMode: (r.launch_mode as LaunchMode) || 'auto',
    postponed: r.postponed || false,
    postponedUntil: r.postponed_until || null,
    createdAt: r.created_at,
    categoryName: r.categories?.name || '',
    categoryEmoji: r.categories?.emoji || '',
  };
}

export const scheduledTransactionService = {
  async getAll(): Promise<ScheduledTransaction[]> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('scheduled_transactions')
      .select(`*, categories(name, emoji)`)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('scheduled_date', { ascending: true });

    if (error) {
      if (isSchemaError(error)) throw error;
      console.log('Scheduled transactions fetch error:', error.message);
      return [];
    }

    return (data || []).map(mapRow);
  },

  async create(tx: {
    type: 'income' | 'expense';
    amount: number;
    description: string;
    categoryId: string | null;
    scheduledDate: string;
    recurrence: RecurrenceType;
    endDate: string | null;
    launchMode: LaunchMode;
  }): Promise<ScheduledTransaction | null> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const insertPayload: any = {
      user_id: user.id,
      transaction_type: tx.type,
      amount: tx.amount,
      description: tx.description,
      category_id: tx.categoryId || null,
      scheduled_date: tx.scheduledDate,
      recurrence: tx.recurrence,
      end_date: tx.endDate || null,
      is_active: true,
      postponed: false,
      postponed_until: null,
    };

    // Only include launch_mode if column exists (graceful degradation)
    try {
      insertPayload.launch_mode = tx.launchMode;
    } catch {
      // column may not exist yet
    }

    const { data, error } = await supabase
      .from('scheduled_transactions')
      .insert(insertPayload)
      .select(`*, categories(name, emoji)`)
      .single();

    if (error) {
      if (isSchemaError(error)) throw error;
      console.log('Scheduled transaction create error:', error.message);
      return null;
    }

    return mapRow(data);
  },

  async delete(id: string): Promise<boolean> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('scheduled_transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      if (isSchemaError(error)) throw error;
      console.log('Scheduled transaction delete error:', error.message);
      return false;
    }
    return true;
  },

  async update(id: string, tx: {
    type: 'income' | 'expense';
    amount: number;
    description: string;
    categoryId: string | null;
    scheduledDate: string;
    recurrence: RecurrenceType;
    endDate: string | null;
    launchMode: LaunchMode;
  }): Promise<ScheduledTransaction | null> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const updatePayload: any = {
      transaction_type: tx.type,
      amount: tx.amount,
      description: tx.description,
      category_id: tx.categoryId || null,
      scheduled_date: tx.scheduledDate,
      recurrence: tx.recurrence,
      end_date: tx.endDate || null,
      launch_mode: tx.launchMode,
    };

    const { data, error } = await supabase
      .from('scheduled_transactions')
      .update(updatePayload)
      .eq('id', id)
      .eq('user_id', user.id)
      .select(`*, categories(name, emoji)`)
      .single();

    if (error) {
      if (isSchemaError(error)) throw error;
      console.log('Scheduled transaction update error:', error.message);
      return null;
    }

    return mapRow(data);
  },

  /** Postpone a transaction by 48 hours (only once) */
  async postpone(id: string): Promise<ScheduledTransaction | null> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const postponedUntil = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('scheduled_transactions')
      .update({
        postponed: true,
        postponed_until: postponedUntil,
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select(`*, categories(name, emoji)`)
      .single();

    if (error) {
      if (isSchemaError(error)) throw error;
      console.log('Scheduled transaction postpone error:', error.message);
      return null;
    }

    return mapRow(data);
  },

  /** Returns all occurrence dates for a scheduled transaction within a date range */
  getOccurrences(tx: ScheduledTransaction, fromDate: Date, toDate: Date): Date[] {
    const occurrences: Date[] = [];
    const start = new Date(tx.scheduledDate + 'T00:00:00');
    const end = tx.endDate ? new Date(tx.endDate + 'T00:00:00') : null;

    if (start > toDate) return [];

    if (tx.recurrence === 'none') {
      if (start >= fromDate && start <= toDate) {
        occurrences.push(new Date(start));
      }
      return occurrences;
    }

    let current = new Date(start);
    const maxIterations = 500;
    let iterations = 0;

    while (current <= toDate && iterations < maxIterations) {
      iterations++;
      if (end && current > end) break;
      if (current >= fromDate) {
        occurrences.push(new Date(current));
      }
      switch (tx.recurrence) {
        case 'daily':
          current.setDate(current.getDate() + 1);
          break;
        case 'weekly':
          current.setDate(current.getDate() + 7);
          break;
        case 'biweekly':
          current.setDate(current.getDate() + 14);
          break;
        case 'monthly':
          current.setMonth(current.getMonth() + 1);
          break;
        case 'yearly':
          current.setFullYear(current.getFullYear() + 1);
          break;
      }
    }

    return occurrences;
  },

  /** Builds 6-month monthly projection from scheduled transactions + current balance */
  buildProjections(
    transactions: ScheduledTransaction[],
    currentBalance: number,
    monthsAhead = 6
  ): MonthlyProjection[] {
    const projections: MonthlyProjection[] = [];
    const now = new Date();
    let runningBalance = currentBalance;

    for (let i = 0; i < monthsAhead; i++) {
      const year = now.getFullYear() + Math.floor((now.getMonth() + i) / 12);
      const month = (now.getMonth() + i) % 12;
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);

      let income = 0;
      let expense = 0;

      for (const tx of transactions) {
        const occurrences = scheduledTransactionService.getOccurrences(tx, firstDay, lastDay);
        const total = occurrences.length * tx.amount;
        if (tx.type === 'income') income += total;
        else expense += total;
      }

      runningBalance = runningBalance + income - expense;

      const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
      const monthLabel = firstDay.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });

      projections.push({
        month: monthKey,
        label: monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1),
        income,
        expense,
        balance: income - expense,
        runningBalance,
      });
    }

    return projections;
  },

  /** Returns scheduled expense transactions due within the next 24 hours */
  getUpcoming24h(transactions: ScheduledTransaction[]): ScheduledTransaction[] {
    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const result: ScheduledTransaction[] = [];

    for (const tx of transactions) {
      if (tx.type !== 'expense') continue;
      const occurrences = scheduledTransactionService.getOccurrences(tx, now, in24h);
      if (occurrences.length > 0) result.push(tx);
    }

    return result;
  },

  /** Returns true if any future scheduled transaction would make running balance negative */
  hasNegativeProjection(
    transactions: ScheduledTransaction[],
    currentBalance: number
  ): boolean {
    const projections = scheduledTransactionService.buildProjections(transactions, currentBalance, 12);
    return projections.some((p) => p.runningBalance < 0);
  },

  /** Returns transactions with launch_mode='ask' that are due (scheduled_date <= now and not postponed or postponed_until <= now) */
  getPendingConfirmation(transactions: ScheduledTransaction[]): ScheduledTransaction[] {
    const now = new Date();
    return transactions.filter((tx) => {
      if (tx.launchMode !== 'ask') return false;
      const scheduledAt = new Date(tx.scheduledDate + 'T00:00:00');
      if (scheduledAt > now) return false;
      // If postponed, check if postpone window has passed
      if (tx.postponed && tx.postponedUntil) {
        const postponedUntil = new Date(tx.postponedUntil);
        if (postponedUntil > now) return false; // still within postpone window
      }
      return true;
    });
  },
};
