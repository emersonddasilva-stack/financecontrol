import React from 'react';
import AppLayout from '@/components/AppLayout';
import CategorySetupPanel from './components/CategorySetupPanel';
import AccountSetupPanel from './components/AccountSetupPanel';

export default function CategoryAccountSetupPage() {
  return (
    <AppLayout>
      <div className="px-6 lg:px-8 xl:px-10 py-6 max-w-screen-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Categorias &amp; Contas
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Gerencie as categorias de lançamento e as contas bancárias vinculadas ao sistema
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-2 gap-6 pb-10">
          <CategorySetupPanel />
          <AccountSetupPanel />
        </div>
      </div>
    </AppLayout>
  );
}