'use client';

import React, { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/components/AppLayout';
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  DollarSign,
  Lightbulb,
  ArrowRightLeft,
  Globe,
  BarChart2,
  ShieldCheck,
  Zap,
  Bitcoin,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface StockIndex {
  name: string;
  symbol: string;
  value: number;
  change: number;
  changePct: number;
  country: string;
  flag: string;
}

interface ForexRate {
  code: string;
  name: string;
  flag: string;
  rate: number; // rate per 1 BRL
  usdRate: number; // rate per 1 USD
}

interface Recommendation {
  category: 'Renda Fixa' | 'Renda Variável' | 'Mercado de Risco';
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  items: { title: string; reason: string; rating: 'Compra' | 'Neutro' | 'Venda' }[];
}

interface DailyTip {
  title: string;
  body: string;
  source: string;
  tag: string;
}

// ─── Static seed data (refreshed on mount with simulated variance) ────────────

const BASE_INDICES: StockIndex[] = [
  { name: 'Ibovespa', symbol: 'IBOV', value: 128450, change: 1230, changePct: 0.97, country: 'Brasil', flag: '🇧🇷' },
  { name: 'S&P 500', symbol: 'SPX', value: 5432, change: -18, changePct: -0.33, country: 'EUA', flag: '🇺🇸' },
  { name: 'Nasdaq', symbol: 'COMP', value: 17890, change: 95, changePct: 0.53, country: 'EUA', flag: '🇺🇸' },
  { name: 'Dow Jones', symbol: 'DJI', value: 39210, change: -120, changePct: -0.31, country: 'EUA', flag: '🇺🇸' },
  { name: 'FTSE 100', symbol: 'UKX', value: 8145, change: 42, changePct: 0.52, country: 'Reino Unido', flag: '🇬🇧' },
  { name: 'DAX', symbol: 'DAX', value: 18320, change: 210, changePct: 1.16, country: 'Alemanha', flag: '🇩🇪' },
  { name: 'CAC 40', symbol: 'CAC', value: 7980, change: -35, changePct: -0.44, country: 'França', flag: '🇫🇷' },
  { name: 'Nikkei 225', symbol: 'NKY', value: 38750, change: 320, changePct: 0.83, country: 'Japão', flag: '🇯🇵' },
  { name: 'Hang Seng', symbol: 'HSI', value: 17640, change: -180, changePct: -1.01, country: 'Hong Kong', flag: '🇭🇰' },
  { name: 'Shanghai', symbol: 'SHCOMP', value: 3085, change: 22, changePct: 0.72, country: 'China', flag: '🇨🇳' },
  { name: 'ASX 200', symbol: 'AS51', value: 7920, change: 55, changePct: 0.70, country: 'Austrália', flag: '🇦🇺' },
  { name: 'TSX', symbol: 'GSPTSE', value: 22340, change: -90, changePct: -0.40, country: 'Canadá', flag: '🇨🇦' },
];

const BASE_FOREX: ForexRate[] = [
  { code: 'USD', name: 'Dólar Americano', flag: '🇺🇸', rate: 0.1842, usdRate: 1 },
  { code: 'EUR', name: 'Euro', flag: '🇪🇺', rate: 0.1698, usdRate: 0.9218 },
  { code: 'GBP', name: 'Libra Esterlina', flag: '🇬🇧', rate: 0.1455, usdRate: 0.7899 },
  { code: 'JPY', name: 'Iene Japonês', flag: '🇯🇵', rate: 27.42, usdRate: 148.85 },
  { code: 'CHF', name: 'Franco Suíço', flag: '🇨🇭', rate: 0.1631, usdRate: 0.8854 },
  { code: 'CAD', name: 'Dólar Canadense', flag: '🇨🇦', rate: 0.2512, usdRate: 1.3635 },
  { code: 'AUD', name: 'Dólar Australiano', flag: '🇦🇺', rate: 0.2798, usdRate: 1.5189 },
  { code: 'CNY', name: 'Yuan Chinês', flag: '🇨🇳', rate: 1.3340, usdRate: 7.2420 },
  { code: 'ARS', name: 'Peso Argentino', flag: '🇦🇷', rate: 183.20, usdRate: 994.50 },
  { code: 'MXN', name: 'Peso Mexicano', flag: '🇲🇽', rate: 3.1450, usdRate: 17.075 },
  { code: 'BTC', name: 'Bitcoin', flag: '₿', rate: 0.00000295, usdRate: 0.0000160 },
  { code: 'ETH', name: 'Ethereum', flag: 'Ξ', rate: 0.0000482, usdRate: 0.000262 },
];

const RECOMMENDATIONS: Recommendation[] = [
  {
    category: 'Renda Fixa',
    icon: <ShieldCheck size={18} />,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    items: [
      { title: 'Tesouro IPCA+ 2029', reason: 'Proteção contra inflação com taxa real acima de 6% a.a. Ideal para reserva de médio prazo.', rating: 'Compra' },
      { title: 'CDB 120% CDI (24 meses)', reason: 'Bancos médios oferecem prêmio relevante sobre o CDI com cobertura do FGC até R$ 250 mil.', rating: 'Compra' },
      { title: 'LCI/LCA Isentas', reason: 'Isenção de IR para pessoa física eleva o rendimento líquido acima de muitos CDBs tributados.', rating: 'Compra' },
      { title: 'Tesouro Selic 2027', reason: 'Liquidez diária e rentabilidade atrelada à Selic. Adequado para reserva de emergência.', rating: 'Neutro' },
    ],
  },
  {
    category: 'Renda Variável',
    icon: <BarChart2 size={18} />,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    items: [
      { title: 'PETR4 – Petrobras', reason: 'Dividend yield elevado e geração de caixa robusta. Risco político monitorado, mas fundamentos sólidos.', rating: 'Compra' },
      { title: 'VALE3 – Vale', reason: 'Desconto em relação ao valor intrínseco com demanda chinesa por minério se recuperando.', rating: 'Compra' },
      { title: 'FIIs de Logística', reason: 'Vacância em mínimas históricas e contratos longos garantem distribuição estável de dividendos.', rating: 'Compra' },
      { title: 'MGLU3 – Magazine Luiza', reason: 'Recuperação operacional em curso, mas endividamento ainda elevado exige cautela.', rating: 'Neutro' },
    ],
  },
  {
    category: 'Mercado de Risco',
    icon: <Zap size={18} />,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    items: [
      { title: 'Bitcoin (BTC)', reason: 'Ciclo de halving favorece valorização histórica. ETFs spot nos EUA aumentam liquidez institucional.', rating: 'Compra' },
      { title: 'Ethereum (ETH)', reason: 'Atualização de staking e crescimento de DeFi sustentam demanda. Relação risco/retorno atrativa.', rating: 'Compra' },
      { title: 'Small Caps Brasil', reason: 'Potencial de valorização expressivo com queda de juros, mas volatilidade exige horizonte longo.', rating: 'Neutro' },
      { title: 'Criptomoedas Altcoins', reason: 'Alta volatilidade e risco de liquidez. Recomendado apenas para perfil arrojado com até 5% do portfólio.', rating: 'Venda' },
    ],
  },
];

const DAILY_TIPS: DailyTip[] = [
  {
    title: 'Cenário favorável para compra de dólar hoje',
    body: 'O Fed sinalizou manutenção dos juros elevados por mais tempo, enquanto o Banco Central do Brasil indica cortes adicionais na Selic. O diferencial de juros favorece o dólar no curto prazo. Momento oportuno para hedge cambial.',
    source: 'Bloomberg / Reuters',
    tag: 'Câmbio',
  },
  {
    title: 'PETR4 próxima de suporte técnico relevante',
    body: 'O papel testa a média móvel de 200 dias após queda de 4% na semana. Analistas do Goldman Sachs e BTG Pactual mantêm recomendação de compra com preço-alvo de R$ 42. Volume acima da média sugere acumulação.',
    source: 'Goldman Sachs / BTG Pactual',
    tag: 'Ações',
  },
  {
    title: 'Bitcoin consolida acima de US$ 60k — próximo movimento?',
    body: 'Após o halving, o BTC historicamente atinge novas máximas em 6 a 12 meses. Fluxo de ETFs spot nos EUA registrou entrada líquida de US$ 1,2 bi na semana. Resistência em US$ 72k; suporte em US$ 58k.',
    source: 'CoinDesk / Glassnode',
    tag: 'Cripto',
  },
  {
    title: 'Tesouro IPCA+ oferece melhor relação risco/retorno em 5 anos',
    body: 'Com taxa real acima de 6,5% a.a., o Tesouro IPCA+ 2035 está no patamar mais atrativo desde 2019. Gestoras como Itaú Asset e XP recomendam alocação para investidores de médio e longo prazo.',
    source: 'Itaú Asset / XP Investimentos',
    tag: 'Renda Fixa',
  },
];

// ─── Helper ───────────────────────────────────────────────────────────────────

function jitter(value: number, pct = 0.003): number {
  return value * (1 + (Math.random() - 0.5) * pct);
}

function formatNumber(n: number, decimals = 2): string {
  if (n >= 1000) return n.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  if (n < 0.001) return n.toFixed(8);
  return n.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

const ratingColor: Record<string, string> = {
  Compra: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
  Neutro: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
  Venda: 'bg-red-500/20 text-red-300 border border-red-500/30',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionTitle({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-9 h-9 rounded-xl bg-primary/30 flex items-center justify-center text-accent flex-shrink-0">
        {icon}
      </div>
      <div>
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  );
}

function LiveDot() {
  return (
    <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
      </span>
      Ao vivo
    </span>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MarketsPage() {
  const [indices, setIndices] = useState<StockIndex[]>(BASE_INDICES);
  const [forex, setForex] = useState<ForexRate[]>(BASE_FOREX);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [tipIndex, setTipIndex] = useState(0);

  // Currency converter state
  const [amount, setAmount] = useState<string>('1000');
  const [baseCurrency, setBaseCurrency] = useState<'BRL' | string>('BRL');

  const refresh = useCallback(() => {
    setIndices((prev) =>
      prev.map((idx) => {
        const newVal = jitter(idx.value);
        const delta = newVal - idx.value;
        return { ...idx, value: newVal, change: delta, changePct: (delta / idx.value) * 100 };
      })
    );
    setForex((prev) =>
      prev.map((f) => ({ ...f, rate: jitter(f.rate), usdRate: jitter(f.usdRate) }))
    );
    setLastUpdate(new Date().toLocaleTimeString('pt-BR'));
  }, []);

  useEffect(() => {
    setLastUpdate(new Date().toLocaleTimeString('pt-BR'));
    const interval = setInterval(refresh, 15000);
    return () => clearInterval(interval);
  }, [refresh]);

  // Rotate tips every 8 seconds
  useEffect(() => {
    const t = setInterval(() => setTipIndex((i) => (i + 1) % DAILY_TIPS.length), 8000);
    return () => clearInterval(t);
  }, []);

  const numAmount = parseFloat(amount.replace(',', '.')) || 0;
  const tip = DAILY_TIPS[tipIndex];

  // Compute converted values
  const convertedValues = forex.map((f) => {
    let converted: number;
    if (baseCurrency === 'BRL') {
      converted = numAmount * f.rate;
    } else {
      const base = forex.find((x) => x.code === baseCurrency);
      if (!base) { converted = 0; }
      else {
        // convert to USD first, then to target
        const inUsd = numAmount / base.usdRate;
        converted = inUsd * f.usdRate;
      }
    }
    return { ...f, converted };
  });

  const currencyOptions = [
    { code: 'BRL', name: 'Real Brasileiro', flag: '🇧🇷' },
    ...forex.filter((f) => !['BTC', 'ETH'].includes(f.code)),
  ];

  return (
    <AppLayout>
      <div className="px-6 lg:px-8 xl:px-10 py-6 max-w-screen-2xl mx-auto space-y-8 pb-12">

        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Mercados &amp; Aplicações</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Índices, câmbio, recomendações e dicas do dia em tempo real</p>
          </div>
          <div className="flex items-center gap-3">
            <LiveDot />
            <span className="text-xs text-muted-foreground hidden sm:block">Atualizado: {lastUpdate}</span>
            <button
              onClick={refresh}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border border-border text-xs text-muted-foreground hover:text-foreground hover:border-accent/50 transition-all"
            >
              <RefreshCw size={13} />
              Atualizar
            </button>
          </div>
        </div>

        {/* ── Dica do Dia ─────────────────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent p-5">
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-400/5 rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 flex-shrink-0">
              <Lightbulb size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold uppercase tracking-widest text-amber-400">Dica do Dia</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs border border-amber-500/30">{tip.tag}</span>
              </div>
              <p className="text-sm font-semibold text-foreground mb-1">{tip.title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{tip.body}</p>
              <p className="text-xs text-amber-500/70 mt-2">Fonte: {tip.source}</p>
            </div>
            {/* Tip dots */}
            <div className="flex flex-col gap-1 pt-1 flex-shrink-0">
              {DAILY_TIPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setTipIndex(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${i === tipIndex ? 'bg-amber-400' : 'bg-amber-400/30'}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── Stock Indices ────────────────────────────────────────────────── */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <SectionTitle
            icon={<Globe size={18} />}
            title="Índices das Principais Bolsas"
            subtitle="Variação em relação ao fechamento anterior"
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {indices.map((idx) => {
              const positive = idx.changePct >= 0;
              return (
                <div
                  key={idx.symbol}
                  className="rounded-xl border border-border bg-background/50 p-3 hover:border-accent/40 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-lg">{idx.flag}</span>
                    <span className={`flex items-center gap-0.5 text-xs font-semibold ${positive ? 'text-emerald-400' : 'text-red-400'}`}>
                      {positive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                      {positive ? '+' : ''}{idx.changePct.toFixed(2)}%
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{idx.name}</p>
                  <p className="text-sm font-bold text-foreground mt-0.5">{formatNumber(idx.value)}</p>
                  <p className={`text-xs mt-0.5 ${positive ? 'text-emerald-400' : 'text-red-400'}`}>
                    {positive ? '+' : ''}{formatNumber(idx.change)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Forex + Converter ────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">

          {/* Forex Rates */}
          <div className="xl:col-span-3 bg-card border border-border rounded-2xl p-5">
            <SectionTitle
              icon={<DollarSign size={18} />}
              title="Cotação das Principais Moedas"
              subtitle="Valor em BRL (R$)"
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {forex.map((f) => {
                const brlValue = 1 / f.rate;
                return (
                  <div key={f.code} className="flex items-center gap-2.5 p-2.5 rounded-xl border border-border bg-background/50 hover:border-accent/40 transition-colors">
                    <span className="text-xl flex-shrink-0">{f.flag}</span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground">{f.code}</p>
                      <p className="text-xs text-muted-foreground truncate">{f.name}</p>
                      <p className="text-sm font-bold text-foreground">
                        {['BTC', 'ETH'].includes(f.code)
                          ? `R$ ${(brlValue).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                          : `R$ ${brlValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Currency Converter */}
          <div className="xl:col-span-2 bg-card border border-border rounded-2xl p-5 flex flex-col">
            <SectionTitle
              icon={<ArrowRightLeft size={18} />}
              title="Calculadora de Câmbio"
              subtitle="Converta para todas as moedas"
            />
            <div className="flex gap-2 mb-4">
              <div className="flex-1">
                <label className="text-xs text-muted-foreground mb-1 block">Valor</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0,00"
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:border-accent/60 transition-colors"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-muted-foreground mb-1 block">Moeda base</label>
                <select
                  value={baseCurrency}
                  onChange={(e) => setBaseCurrency(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:border-accent/60 transition-colors"
                >
                  {currencyOptions.map((c) => (
                    <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto space-y-1.5 max-h-80 scrollbar-thin pr-1">
              {convertedValues
                .filter((f) => f.code !== baseCurrency)
                .map((f) => (
                  <div key={f.code} className="flex items-center justify-between px-3 py-2 rounded-lg bg-background/60 border border-border/60 hover:border-accent/30 transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{f.flag}</span>
                      <div>
                        <p className="text-xs font-semibold text-foreground">{f.code}</p>
                        <p className="text-xs text-muted-foreground">{f.name}</p>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-foreground tabular-nums">
                      {f.converted < 0.001
                        ? f.converted.toFixed(8)
                        : f.converted.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* ── Investment Recommendations ───────────────────────────────────── */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-primary/30 flex items-center justify-center text-accent flex-shrink-0">
              <TrendingUp size={18} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">Recomendações de Aplicações</h2>
              <p className="text-xs text-muted-foreground">Melhores oportunidades do dia por categoria</p>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {RECOMMENDATIONS.map((rec) => (
              <div key={rec.category} className={`rounded-2xl border ${rec.borderColor} ${rec.bgColor} p-5`}>
                <div className={`flex items-center gap-2 mb-4 ${rec.color}`}>
                  {rec.icon}
                  <span className="text-sm font-semibold">{rec.category}</span>
                </div>
                <div className="space-y-3">
                  {rec.items.map((item) => (
                    <div key={item.title} className="bg-background/40 rounded-xl p-3 border border-white/5">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-xs font-semibold text-foreground leading-snug">{item.title}</p>
                        <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold ${ratingColor[item.rating]}`}>
                          {item.rating}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{item.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Crypto Spotlight ─────────────────────────────────────────────── */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <SectionTitle
            icon={<Bitcoin size={18} />}
            title="Criptomoedas em Destaque"
            subtitle="Cotação em USD e BRL"
          />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { name: 'Bitcoin', code: 'BTC', flag: '₿', usd: 62450, brl: 339000, pct: 2.14 },
              { name: 'Ethereum', code: 'ETH', flag: 'Ξ', usd: 3820, brl: 20740, pct: 1.87 },
              { name: 'BNB', code: 'BNB', flag: '🔶', usd: 412, brl: 2237, pct: -0.54 },
              { name: 'Solana', code: 'SOL', flag: '◎', usd: 178, brl: 966, pct: 3.21 },
            ].map((c) => {
              const positive = c.pct >= 0;
              return (
                <div key={c.code} className="rounded-xl border border-border bg-background/50 p-4 hover:border-accent/40 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{c.flag}</span>
                    <span className={`flex items-center gap-0.5 text-xs font-semibold ${positive ? 'text-emerald-400' : 'text-red-400'}`}>
                      {positive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                      {positive ? '+' : ''}{c.pct.toFixed(2)}%
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{c.name}</p>
                  <p className="text-sm font-bold text-foreground mt-0.5">US$ {c.usd.toLocaleString('pt-BR')}</p>
                  <p className="text-xs text-muted-foreground">R$ {c.brl.toLocaleString('pt-BR')}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-muted-foreground/50 text-center pb-2">
          As informações exibidas são de caráter educacional e não constituem recomendação de investimento. Consulte um assessor financeiro certificado antes de tomar decisões. Dados simulados com base em valores de mercado reais.
        </p>
      </div>
    </AppLayout>
  );
}
