import React from 'react';
import AppLayout from '@/components/AppLayout';
import TransactionFormPanel from './components/TransactionFormPanel';
import DailyTransactionsSidebar from './components/DailyTransactionsSidebar';

export default function TransactionEntryPage() {
  return (
    <AppLayout>
      <div className="px-6 lg:px-8 xl:px-10 py-6 max-w-screen-2xl mx-auto">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Novo Lançamento</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Registre uma receita ou despesa com categorização completa
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 2xl:grid-cols-3 gap-6">
          {/* Main form */}
          <div className="xl:col-span-2 2xl:col-span-2">
            <TransactionFormPanel />
          </div>
          {/* Sidebar */}
          <div className="xl:col-span-1 2xl:col-span-1">
            <DailyTransactionsSidebar />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}