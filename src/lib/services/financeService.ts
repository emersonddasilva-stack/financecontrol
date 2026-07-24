'use client';

import { createClient } from '@/lib/supabase/client';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Category {
  id: string;
  userId: string;
  name: string;
  type: 'income' | 'expense';
  emoji: string;
  color: string;
  budget: number | null;
  parentId: string | null;
  createdAt: string;
}

export interface Account {
  id: string;
  userId: string;
  name: string;
  institution: string;
  type: 'corrente' | 'credito' | 'poupanca' | 'digital' | 'investimento';
  initialBalance: number;
  currentBalance: number;
  isActive: boolean;
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  categoryId: string | null;
  accountId: string | null;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  date: string;
  paymentMethod: string;
  tags: string;
  notes: string;
  isRecurring: boolean;
  recurrenceFrequency: string | null;
  status: 'confirmed' | 'pending' | 'reconciled';
  createdAt: string;
  // Joined
  categoryName?: string;
  categoryEmoji?: string;
  accountName?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isSchemaError(error: any): boolean {
  if (!error) return false;
  if (error.code && typeof error.code === 'string') {
    const cls = error.code.substring(0, 2);
    if (cls === '42' || cls === '08') return true;
    if (cls === '23') return false;
  }
  if (error.message) {
    return /relation.*does not exist|column.*does not exist|function.*does not exist|syntax error|type.*does not exist/i.test(
      error.message
    );
  }
  return false;
}

// ─── Category Service ─────────────────────────────────────────────────────────

export const categoryService = {
  async getAll(): Promise<Category[]> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', user.id)
      .order('name', { ascending: true });

    if (error) {
      if (isSchemaError(error)) throw error;
      console.log('Categories fetch error:', error.message);
      return [];
    }

    return (data || []).map((r) => ({
      id: r.id,
      userId: r.user_id,
      name: r.name,
      type: r.transaction_type as 'income' | 'expense',
      emoji: r.emoji,
      color: r.color,
      budget: r.budget_amount,
      parentId: r.parent_id,
      createdAt: r.created_at,
    }));
  },

  async create(cat: Omit<Category, 'id' | 'userId' | 'createdAt'>): Promise<Category | null> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('categories')
      .insert({
        user_id: user.id,
        name: cat.name,
        transaction_type: cat.type,
        emoji: cat.emoji,
        color: cat.color,
        budget_amount: cat.budget,
        parent_id: cat.parentId || null,
      })
      .select()
      .single();

    if (error) {
      if (isSchemaError(error)) throw error;
      console.log('Category create error:', error.message);
      return null;
    }

    return {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      type: data.transaction_type,
      emoji: data.emoji,
      color: data.color,
      budget: data.budget_amount,
      parentId: data.parent_id,
      createdAt: data.created_at,
    };
  },

  async update(id: string, cat: Partial<Omit<Category, 'id' | 'userId' | 'createdAt'>>): Promise<boolean> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const payload: any = {};
    if (cat.name !== undefined) payload.name = cat.name;
    if (cat.type !== undefined) payload.transaction_type = cat.type;
    if (cat.emoji !== undefined) payload.emoji = cat.emoji;
    if (cat.color !== undefined) payload.color = cat.color;
    if (cat.budget !== undefined) payload.budget_amount = cat.budget;
    if (cat.parentId !== undefined) payload.parent_id = cat.parentId || null;

    const { error } = await supabase
      .from('categories')
      .update(payload)
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      if (isSchemaError(error)) throw error;
      console.log('Category update error:', error.message);
      return false;
    }
    return true;
  },

  async delete(id: string): Promise<boolean> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      if (isSchemaError(error)) throw error;
      console.log('Category delete error:', error.message);
      return false;
    }
    return true;
  },
};

// ─── Account Service ──────────────────────────────────────────────────────────

export const accountService = {
  async getAll(): Promise<Account[]> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', user.id)
      .order('name', { ascending: true });

    if (error) {
      if (isSchemaError(error)) throw error;
      console.log('Accounts fetch error:', error.message);
      return [];
    }

    return (data || []).map((r) => ({
      id: r.id,
      userId: r.user_id,
      name: r.name,
      institution: r.institution,
      type: r.account_type as Account['type'],
      initialBalance: r.initial_balance,
      currentBalance: r.current_balance,
      isActive: r.is_active,
      createdAt: r.created_at,
    }));
  },

  async create(acc: Omit<Account, 'id' | 'userId' | 'createdAt'>): Promise<Account | null> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('accounts')
      .insert({
        user_id: user.id,
        name: acc.name,
        institution: acc.institution,
        account_type: acc.type,
        initial_balance: acc.initialBalance,
        current_balance: acc.initialBalance,
        is_active: acc.isActive,
      })
      .select()
      .single();

    if (error) {
      if (isSchemaError(error)) throw error;
      console.log('Account create error:', error.message);
      return null;
    }

    return {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      institution: data.institution,
      type: data.account_type,
      initialBalance: data.initial_balance,
      currentBalance: data.current_balance,
      isActive: data.is_active,
      createdAt: data.created_at,
    };
  },

  async update(id: string, acc: Partial<Omit<Account, 'id' | 'userId' | 'createdAt'>>): Promise<boolean> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const payload: any = {};
    if (acc.name !== undefined) payload.name = acc.name;
    if (acc.institution !== undefined) payload.institution = acc.institution;
    if (acc.type !== undefined) payload.account_type = acc.type;
    if (acc.initialBalance !== undefined) payload.initial_balance = acc.initialBalance;
    if (acc.isActive !== undefined) payload.is_active = acc.isActive;

    const { error } = await supabase
      .from('accounts')
      .update(payload)
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      if (isSchemaError(error)) throw error;
      console.log('Account update error:', error.message);
      return false;
    }
    return true;
  },

  async delete(id: string): Promise<boolean> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('accounts')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      if (isSchemaError(error)) throw error;
      console.log('Account delete error:', error.message);
      return false;
    }
    return true;
  },
};

// ─── Transaction Service ──────────────────────────────────────────────────────

export const transactionService = {
  async getAll(limit = 50): Promise<Transaction[]> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        categories(name, emoji),
        accounts(name)
      `)
      .eq('user_id', user.id)
      .order('transaction_date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      if (isSchemaError(error)) throw error;
      console.log('Transactions fetch error:', error.message);
      return [];
    }

    return (data || []).map((r) => ({
      id: r.id,
      userId: r.user_id,
      categoryId: r.category_id,
      accountId: r.account_id,
      type: r.transaction_type as 'income' | 'expense',
      amount: r.amount,
      description: r.description,
      date: r.transaction_date,
      paymentMethod: r.payment_method,
      tags: r.tags || '',
      notes: r.notes || '',
      isRecurring: r.is_recurring,
      recurrenceFrequency: r.recurrence_frequency,
      status: r.transaction_status as Transaction['status'],
      createdAt: r.created_at,
      categoryName: r.categories?.name || '',
      categoryEmoji: r.categories?.emoji || '',
      accountName: r.accounts?.name || '',
    }));
  },

  async getToday(): Promise<Transaction[]> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('transactions')
      .select(`*, categories(name, emoji), accounts(name)`)
      .eq('user_id', user.id)
      .eq('transaction_date', today)
      .order('created_at', { ascending: false });

    if (error) {
      if (isSchemaError(error)) throw error;
      return [];
    }

    return (data || []).map((r) => ({
      id: r.id,
      userId: r.user_id,
      categoryId: r.category_id,
      accountId: r.account_id,
      type: r.transaction_type as 'income' | 'expense',
      amount: r.amount,
      description: r.description,
      date: r.transaction_date,
      paymentMethod: r.payment_method,
      tags: r.tags || '',
      notes: r.notes || '',
      isRecurring: r.is_recurring,
      recurrenceFrequency: r.recurrence_frequency,
      status: r.transaction_status as Transaction['status'],
      createdAt: r.created_at,
      categoryName: r.categories?.name || '',
      categoryEmoji: r.categories?.emoji || '',
      accountName: r.accounts?.name || '',
    }));
  },

  async create(tx: {
    type: 'income' | 'expense';
    amount: number;
    description: string;
    categoryId: string;
    accountId: string;
    date: string;
    paymentMethod: string;
    tags: string;
    notes: string;
    isRecurring: boolean;
    recurrenceFrequency: string;
  }): Promise<Transaction | null> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        transaction_type: tx.type,
        amount: tx.amount,
        description: tx.description,
        category_id: tx.categoryId || null,
        account_id: tx.accountId || null,
        transaction_date: tx.date,
        payment_method: tx.paymentMethod,
        tags: tx.tags,
        notes: tx.notes,
        is_recurring: tx.isRecurring,
        recurrence_frequency: tx.isRecurring ? tx.recurrenceFrequency : null,
        transaction_status: 'confirmed',
      })
      .select()
      .single();

    if (error) {
      if (isSchemaError(error)) throw error;
      console.log('Transaction create error:', error.message);
      return null;
    }

    return {
      id: data.id,
      userId: data.user_id,
      categoryId: data.category_id,
      accountId: data.account_id,
      type: data.transaction_type,
      amount: data.amount,
      description: data.description,
      date: data.transaction_date,
      paymentMethod: data.payment_method,
      tags: data.tags || '',
      notes: data.notes || '',
      isRecurring: data.is_recurring,
      recurrenceFrequency: data.recurrence_frequency,
      status: data.transaction_status,
      createdAt: data.created_at,
    };
  },

  async getMonthSummary(): Promise<{ totalIncome: number; totalExpense: number; balance: number }> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { totalIncome: 0, totalExpense: 0, balance: 0 };

    const now = new Date();
    const firstDay = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('transactions')
      .select('transaction_type, amount')
      .eq('user_id', user.id)
      .gte('transaction_date', firstDay)
      .lte('transaction_date', lastDay);

    if (error || !data) return { totalIncome: 0, totalExpense: 0, balance: 0 };

    const totalIncome = data.filter((r) => r.transaction_type === 'income').reduce((s, r) => s + Number(r.amount), 0);
    const totalExpense = data.filter((r) => r.transaction_type === 'expense').reduce((s, r) => s + Number(r.amount), 0);

    return { totalIncome, totalExpense, balance: totalIncome - totalExpense };
  },

  async getBudgetProgress(): Promise<Array<{ categoryId: string; name: string; color: string; budget: number; spent: number }>> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const now = new Date();
    const firstDay = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

    const { data: cats, error: catErr } = await supabase
      .from('categories')
      .select('id, name, color, budget_amount')
      .eq('user_id', user.id)
      .eq('transaction_type', 'expense')
      .not('budget_amount', 'is', null);

    if (catErr || !cats) return [];

    const { data: txns, error: txErr } = await supabase
      .from('transactions')
      .select('category_id, amount')
      .eq('user_id', user.id)
      .eq('transaction_type', 'expense')
      .gte('transaction_date', firstDay)
      .lte('transaction_date', lastDay);

    if (txErr) return [];

    return cats.map((cat) => {
      const spent = (txns || [])
        .filter((t) => t.category_id === cat.id)
        .reduce((s, t) => s + Number(t.amount), 0);
      return {
        categoryId: cat.id,
        name: cat.name,
        color: cat.color,
        budget: Number(cat.budget_amount),
        spent,
      };
    });
  },
};
