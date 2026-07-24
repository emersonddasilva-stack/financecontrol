'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { Bell, AlertTriangle, TrendingDown, TrendingUp, CheckCircle, Info, X, Filter, Check, BellOff,  } from 'lucide-react';
import { scheduledTransactionService } from '@/lib/services/scheduledTransactionService';
import { transactionService } from '@/lib/services/financeService';

type NotificationType = 'alert' | 'warning' | 'success' | 'info';
type NotificationCategory = 'Todos' | 'Alertas' | 'Orçamento' | 'Transações' | 'Sistema';

interface Notification {
  id: number | string;
  type: NotificationType;
  category: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const staticNotifications: Notification[] = [
  {
    id: 1,
    type: 'alert',
    category: 'Orçamento',
    title: 'Limite de orçamento atingido',
    message: 'Você atingiu 95% do orçamento de Alimentação este mês (R$ 1.710 de R$ 1.800).',
    time: 'Há 10 minutos',
    read: false,
  },
  {
    id: 2,
    type: 'warning',
    category: 'Orçamento',
    title: 'Orçamento de Lazer próximo do limite',
    message: 'Você utilizou 82% do orçamento de Lazer. Restam apenas R$ 86,00.',
    time: 'Há 1 hora',
    read: false,
  },
  {
    id: 3,
    type: 'alert',
    category: 'Alertas',
    title: 'Despesa incomum detectada',
    message: 'Uma transação de R$ 1.200,00 em Eletrônicos foi registrada — acima da sua média habitual.',
    time: 'Há 3 horas',
    read: false,
  },
  {
    id: 4,
    type: 'success',
    category: 'Transações',
    title: 'Receita recebida',
    message: 'Salário de R$ 8.500,00 creditado com sucesso na conta Nubank.',
    time: 'Há 5 horas',
    read: false,
  },
  {
    id: 5,
    type: 'info',
    category: 'Sistema',
    title: 'Relatório mensal disponível',
    message: 'O relatório financeiro de novembro está pronto. Acesse a seção Relatórios para visualizar.',
    time: 'Ontem, 18:30',
    read: true,
  },
  {
    id: 6,
    type: 'success',
    category: 'Transações',
    title: 'Meta de poupança atingida',
    message: 'Parabéns! Você atingiu sua meta de poupança mensal de R$ 2.000,00.',
    time: 'Ontem, 14:15',
    read: true,
  },
  {
    id: 7,
    type: 'warning',
    category: 'Alertas',
    title: 'Conta com saldo baixo',
    message: 'A conta Bradesco está com saldo de R$ 320,00. Considere fazer uma transferência.',
    time: 'Há 2 dias',
    read: true,
  },
  {
    id: 8,
    type: 'info',
    category: 'Sistema',
    title: 'Backup automático realizado',
    message: 'Seus dados financeiros foram sincronizados e salvos com sucesso.',
    time: 'Há 3 dias',
    read: true,
  },
  {
    id: 9,
    type: 'alert',
    category: 'Orçamento',
    title: 'Orçamento de Transporte excedido',
    message: 'Você ultrapassou o orçamento de Transporte em R$ 145,00 este mês.',
    time: 'Há 4 dias',
    read: true,
  },
  {
    id: 10,
    type: 'success',
    category: 'Transações',
    title: 'Pagamento confirmado',
    message: 'Pagamento de fatura do cartão de crédito no valor de R$ 3.200,00 confirmado.',
    time: 'Há 5 dias',
    read: true,
  },
];

const CATEGORIES: NotificationCategory[] = ['Todos', 'Alertas', 'Orçamento', 'Transações', 'Sistema'];

const typeConfig: Record<NotificationType, { icon: React.ReactNode; bg: string; border: string; iconColor: string }> = {
  alert: {
    icon: <AlertTriangle size={18} />,
    bg: 'bg-negative/10',
    border: 'border-negative/20',
    iconColor: 'text-negative',
  },
  warning: {
    icon: <TrendingDown size={18} />,
    bg: 'bg-warning/10',
    border: 'border-warning/20',
    iconColor: 'text-warning',
  },
  success: {
    icon: <TrendingUp size={18} />,
    bg: 'bg-positive/10',
    border: 'border-positive/20',
    iconColor: 'text-positive',
  },
  info: {
    icon: <Info size={18} />,
    bg: 'bg-info/10',
    border: 'border-info/20',
    iconColor: 'text-info',
  },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(staticNotifications);
  const [activeCategory, setActiveCategory] = useState<NotificationCategory>('Todos');
  const [hasNegativeProjection, setHasNegativeProjection] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadScheduledAlerts() {
      try {
        const [txs, summary] = await Promise.all([
          scheduledTransactionService.getAll(),
          transactionService.getMonthSummary(),
        ]);
        if (cancelled) return;

        const upcoming = scheduledTransactionService.getUpcoming24h(txs);
        const hasNeg = scheduledTransactionService.hasNegativeProjection(txs, summary.balance);
        setHasNegativeProjection(hasNeg);

        const dynamicNotifs: Notification[] = [];

        if (upcoming.length > 0) {
          const total = upcoming.reduce((s, t) => s + t.amount, 0);
          const formatted = total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
          dynamicNotifs.push({
            id: 'sched-24h',
            type: 'warning',
            category: 'Alertas',
            title: 'Despesa agendada nas próximas 24h',
            message:
              upcoming.length === 1
                ? `${upcoming[0].description} — ${formatted} vence em breve.`
                : `${upcoming.length} despesas agendadas — total: ${formatted}`,
            time: 'Agora',
            read: false,
          });
        }

        if (hasNeg) {
          dynamicNotifs.push({
            id: 'sched-negative',
            type: 'alert',
            category: 'Alertas',
            title: 'Projeção de saldo negativo',
            message:
              'Lançamentos futuros agendados resultarão em saldo negativo em um ou mais meses. Revise seus agendamentos.',
            time: 'Agora',
            read: false,
          });
        }

        if (dynamicNotifs.length > 0) {
          setNotifications((prev) => {
            const existingIds = new Set(prev.map((n) => n.id));
            const newOnes = dynamicNotifs.filter((n) => !existingIds.has(n.id));
            return [...newOnes, ...prev];
          });
        }
      } catch {
        // silent
      }
    }
    loadScheduledAlerts();
    return () => { cancelled = true; };
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filtered =
    activeCategory === 'Todos'
      ? notifications
      : notifications.filter((n) => n.category === activeCategory);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markRead = (id: number | string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const dismiss = (id: number | string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <AppLayout>
      <div className="px-6 lg:px-8 xl:px-10 py-6 max-w-screen-xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Bell size={20} className="text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Notificações</h1>
              <p className="text-sm text-muted-foreground">
                {unreadCount > 0 ? `${unreadCount} não lida${unreadCount > 1 ? 's' : ''}` : 'Tudo em dia'}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              {unreadCount > 0 && (
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-negative text-white text-xs font-bold">
                  {unreadCount}
                </span>
              )}
              {hasNegativeProjection && (
                <span
                  title="Lançamentos futuros resultarão em saldo negativo"
                  className="flex items-center justify-center w-6 h-6 rounded-full bg-negative/20 text-negative animate-pulse"
                >
                  <AlertTriangle size={13} />
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <Check size={15} />
                Marcar todas como lidas
              </button>
            )}
            <button className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              <Filter size={15} />
              Filtrar
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Não lidas', value: notifications.filter((n) => !n.read).length, color: 'text-negative' },
            { label: 'Alertas', value: notifications.filter((n) => n.type === 'alert').length, color: 'text-negative' },
            { label: 'Avisos', value: notifications.filter((n) => n.type === 'warning').length, color: 'text-warning' },
            { label: 'Informações', value: notifications.filter((n) => n.type === 'info' || n.type === 'success').length, color: 'text-positive' },
          ].map((stat) => (
            <div key={stat.label} className="bg-card border border-border rounded-xl p-4 text-center">
              <p className={`text-2xl font-bold tabular-nums ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 scrollbar-thin">
          {CATEGORIES.map((cat) => {
            const count =
              cat === 'Todos'
                ? notifications.length
                : notifications.filter((n) => n.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeCategory === cat
                    ? 'bg-primary text-white' :'bg-card border border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                {cat}
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full ${
                    activeCategory === cat ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Notifications List */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
              <BellOff size={24} className="text-muted-foreground" />
            </div>
            <p className="text-base font-medium text-foreground">Nenhuma notificação</p>
            <p className="text-sm text-muted-foreground">Você está em dia com tudo!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2 pb-8">
            {/* Unread section */}
            {filtered.some((n) => !n.read) && (
              <>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground px-1 mt-2 mb-1">
                  Não lidas
                </p>
                {filtered
                  .filter((n) => !n.read)
                  .map((notification) => {
                    const config = typeConfig[notification.type];
                    return (
                      <div
                        key={notification.id}
                        className={`relative flex items-start gap-4 p-4 rounded-xl border bg-card ${config.border} shadow-sm`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${config.bg}`}>
                          <span className={config.iconColor}>{config.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-sm font-semibold text-foreground">{notification.title}</p>
                                <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs">
                                  {notification.category}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">
                                {notification.message}
                              </p>
                              <p className="text-xs text-muted-foreground/70 mt-1.5">{notification.time}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => markRead(notification.id)}
                            title="Marcar como lida"
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-positive hover:bg-positive/10 transition-colors"
                          >
                            <CheckCircle size={15} />
                          </button>
                          <button
                            onClick={() => dismiss(notification.id)}
                            title="Dispensar"
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-negative hover:bg-negative/10 transition-colors"
                          >
                            <X size={15} />
                          </button>
                        </div>
                        <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-negative" />
                      </div>
                    );
                  })}
              </>
            )}

            {/* Read section */}
            {filtered.some((n) => n.read) && (
              <>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground px-1 mt-4 mb-1">
                  Lidas
                </p>
                {filtered
                  .filter((n) => n.read)
                  .map((notification) => {
                    const config = typeConfig[notification.type];
                    return (
                      <div
                        key={notification.id}
                        className="relative flex items-start gap-4 p-4 rounded-xl border border-border bg-card opacity-70 hover:opacity-100 transition-opacity"
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${config.bg}`}>
                          <span className={config.iconColor}>{config.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-medium text-foreground">{notification.title}</p>
                            <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs">
                              {notification.category}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground/70 mt-1.5">{notification.time}</p>
                        </div>
                        <button
                          onClick={() => dismiss(notification.id)}
                          title="Dispensar"
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-negative hover:bg-negative/10 transition-colors flex-shrink-0"
                        >
                          <X size={15} />
                        </button>
                      </div>
                    );
                  })}
              </>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
