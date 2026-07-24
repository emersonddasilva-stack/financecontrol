import React from 'react';
import AppLayout from '@/components/AppLayout';
import DashboardHeader from './components/DashboardHeader';
import AlertBanner from './components/AlertBanner';
import MetricsBentoGrid from './components/MetricsBentoGrid';
import IncomeExpenseChart from './components/IncomeExpenseChart';
import ExpenseBreakdownChart from './components/ExpenseBreakdownChart';
import BudgetProgressPanel from './components/BudgetProgressPanel';
import RecentTransactionsFeed from './components/RecentTransactionsFeed';

export default function FinancialDashboardPage() {
  return (
    <AppLayout>
      <div className="px-6 lg:px-8 xl:px-10 py-6 max-w-screen-2xl mx-auto">
        <DashboardHeader />
        <AlertBanner />
        <MetricsBentoGrid />

        {/* Charts row */}
        <div className="mt-6 grid grid-cols-1 xl:grid-cols-3 gap-5">
          <div className="xl:col-span-2">
            <IncomeExpenseChart />
          </div>
          <div className="xl:col-span-1">
            <ExpenseBreakdownChart />
          </div>
        </div>

        {/* Bottom row */}
        <div className="mt-5 grid grid-cols-1 xl:grid-cols-3 gap-5 pb-8">
          <div className="xl:col-span-1">
            <BudgetProgressPanel />
          </div>
          <div className="xl:col-span-2">
            <RecentTransactionsFeed />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}