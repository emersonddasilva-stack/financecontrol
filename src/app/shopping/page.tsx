'use client';

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { useChat } from '../../lib/hooks/useChat';
import { Search, ExternalLink, ShoppingCart, Loader2, Tag } from 'lucide-react';
import toast from 'react-hot-toast';

interface ProductResult {
  marketplace: string;
  title: string;
  price: string;
  priceNumeric: number;
  url: string;
  imageUrl: string;
}

const MARKETPLACE_LOGOS: Record<string, { color: string; bg: string }> = {
  Amazon: { color: '#FF9900', bg: '#FFF3E0' },
  eBay: { color: '#E53238', bg: '#FFF0F0' },
  AliExpress: { color: '#FF6A00', bg: '#FFF3E0' },
  MercadoLivre: { color: '#FFE600', bg: '#FFFDE7' },
  Shopee: { color: '#EE4D2D', bg: '#FFF0EE' },
  Americanas: { color: '#E60014', bg: '#FFF0F0' },
  Magazine: { color: '#0086FF', bg: '#E3F2FD' },
  Casas: { color: '#FF6600', bg: '#FFF3E0' },
  Walmart: { color: '#0071CE', bg: '#E3F2FD' },
  Other: { color: '#6B7280', bg: '#F3F4F6' },
};

function getMarketplaceStyle(marketplace: string) {
  for (const key of Object.keys(MARKETPLACE_LOGOS)) {
    if (marketplace.toLowerCase().includes(key.toLowerCase())) {
      return MARKETPLACE_LOGOS[key];
    }
  }
  return MARKETPLACE_LOGOS.Other;
}

// Animated SVG logos for each marketplace
function MarketplaceLogo({ marketplace, size = 80 }: { marketplace: string; size?: number }) {
  const name = marketplace.toLowerCase();

  if (name.includes('amazon')) {
    return (
      <svg width={size * 1.8} height={size * 0.6} viewBox="0 0 200 65" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`
          @keyframes amzArrow { 0%,100%{transform:scaleX(1)} 50%{transform:scaleX(1.12)} }
          @keyframes amzSmile { 0%,100%{opacity:1} 50%{opacity:0.7} }
          .amz-arrow { animation: amzArrow 2s ease-in-out infinite; transform-origin: center; }
          .amz-smile { animation: amzSmile 2s ease-in-out infinite; }
        `}</style>
        <text x="10" y="44" fontFamily="Arial Black, Arial" fontWeight="900" fontSize="38" fill="#FF9900" letterSpacing="-1">amazon</text>
        <g className="amz-smile">
          <path d="M18 52 Q75 72 148 52" stroke="#FF9900" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
          <path d="M148 52 Q155 48 158 44" stroke="#FF9900" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
        </g>
        <g className="amz-arrow">
          <polygon points="155,40 163,44 155,48" fill="#FF9900"/>
        </g>
      </svg>
    );
  }

  if (name.includes('mercado')) {
    return (
      <svg width={size * 1.8} height={size * 0.9} viewBox="0 0 200 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`
          @keyframes mlBounce { 0%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} 70%{transform:translateY(-2px)} }
          @keyframes mlGlow { 0%,100%{opacity:1} 50%{opacity:0.75} }
          .ml-icon { animation: mlBounce 2.2s ease-in-out infinite; transform-origin: center; }
          .ml-text { animation: mlGlow 2.2s ease-in-out infinite; }
        `}</style>
        <g className="ml-icon">
          <circle cx="100" cy="22" r="18" fill="#FFE600"/>
          <path d="M88 22 Q94 14 100 22 Q106 14 112 22" stroke="#3483FA" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
          <circle cx="88" cy="22" r="2.5" fill="#3483FA"/>
          <circle cx="112" cy="22" r="2.5" fill="#3483FA"/>
        </g>
        <g className="ml-text">
          <text x="100" y="56" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="11" fill="#3483FA" textAnchor="middle">Mercado</text>
          <text x="100" y="70" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="11" fill="#FFE600" textAnchor="middle">Livre</text>
        </g>
      </svg>
    );
  }

  if (name.includes('shopee')) {
    return (
      <svg width={size * 1.4} height={size * 1.1} viewBox="0 0 140 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`
          @keyframes shopeeWiggle { 0%,100%{transform:rotate(0deg)} 25%{transform:rotate(-8deg)} 75%{transform:rotate(8deg)} }
          @keyframes shopeeGlow { 0%,100%{fill:#EE4D2D} 50%{fill:#FF6B4A} }
          .shopee-bag { animation: shopeeWiggle 2s ease-in-out infinite; transform-origin: 70px 55px; }
          .shopee-bg { animation: shopeeGlow 2s ease-in-out infinite; }
        `}</style>
        <g className="shopee-bag">
          <rect x="20" y="45" width="100" height="50" rx="10" className="shopee-bg" fill="#EE4D2D"/>
          <path d="M50 45 Q50 20 70 20 Q90 20 90 45" stroke="#EE4D2D" strokeWidth="5" fill="none" strokeLinecap="round"/>
          <circle cx="70" cy="45" r="4" fill="white"/>
          <text x="70" y="78" fontFamily="Arial, sans-serif" fontWeight="800" fontSize="16" fill="white" textAnchor="middle">shopee</text>
        </g>
      </svg>
    );
  }

  if (name.includes('aliexpress') || name.includes('ali')) {
    return (
      <svg width={size * 1.8} height={size * 0.65} viewBox="0 0 200 58" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`
          @keyframes aliPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.04)} }
          @keyframes aliFlash { 0%,100%{fill:#FF6A00} 50%{fill:#FF8C38} }
          .ali-text { animation: aliPulse 2s ease-in-out infinite; transform-origin: center; }
          .ali-a { animation: aliFlash 2s ease-in-out infinite; }
        `}</style>
        <g className="ali-text">
          <text x="8" y="42" fontFamily="Arial Black, Arial" fontWeight="900" fontSize="34" fill="#FF6A00" letterSpacing="-0.5">Ali</text>
          <text x="72" y="42" fontFamily="Arial Black, Arial" fontWeight="900" fontSize="34" fill="#CC0000" letterSpacing="-0.5">Express</text>
        </g>
        <rect x="8" y="46" width="184" height="3" rx="1.5" fill="#FF6A00" opacity="0.4"/>
      </svg>
    );
  }

  if (name.includes('ebay')) {
    return (
      <svg width={size * 1.6} height={size * 0.7} viewBox="0 0 180 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`
          @keyframes ebayBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
          .ebay-e { animation: ebayBounce 1.8s 0s ease-in-out infinite; }
          .ebay-b { animation: ebayBounce 1.8s 0.15s ease-in-out infinite; }
          .ebay-a { animation: ebayBounce 1.8s 0.3s ease-in-out infinite; }
          .ebay-y { animation: ebayBounce 1.8s 0.45s ease-in-out infinite; }
        `}</style>
        <text className="ebay-e" x="4" y="48" fontFamily="Arial Black" fontWeight="900" fontSize="52" fill="#E53238">e</text>
        <text className="ebay-b" x="42" y="48" fontFamily="Arial Black" fontWeight="900" fontSize="52" fill="#0064D2">b</text>
        <text className="ebay-a" x="84" y="48" fontFamily="Arial Black" fontWeight="900" fontSize="52" fill="#F5AF02">a</text>
        <text className="ebay-y" x="124" y="48" fontFamily="Arial Black" fontWeight="900" fontSize="52" fill="#86B817">y</text>
      </svg>
    );
  }

  if (name.includes('americanas')) {
    return (
      <svg width={size * 1.8} height={size * 0.75} viewBox="0 0 200 65" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`
          @keyframes ameriSlide { 0%{transform:translateX(-3px)} 100%{transform:translateX(3px)} }
          @keyframes ameriGlow { 0%,100%{opacity:1} 50%{opacity:0.8} }
          .ameri-bar { animation: ameriSlide 1.5s ease-in-out infinite alternate; }
          .ameri-text { animation: ameriGlow 2s ease-in-out infinite; }
        `}</style>
        <g className="ameri-bar">
          <rect x="0" y="0" width="200" height="22" rx="4" fill="#E60014"/>
          <rect x="0" y="24" width="200" height="22" rx="4" fill="#0033A0"/>
        </g>
        <g className="ameri-text">
          <text x="100" y="17" fontFamily="Arial, sans-serif" fontWeight="800" fontSize="13" fill="white" textAnchor="middle" letterSpacing="0.5">AMERICANAS</text>
          <text x="100" y="40" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="11" fill="white" textAnchor="middle" letterSpacing="0.3">marketplace</text>
        </g>
        <rect x="0" y="48" width="200" height="14" rx="3" fill="#E60014" opacity="0.15"/>
      </svg>
    );
  }

  if (name.includes('magazine') || name.includes('magalu')) {
    return (
      <svg width={size * 1.4} height={size * 1.1} viewBox="0 0 140 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`
          @keyframes luPop { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
          @keyframes luWave { 0%,100%{transform:rotate(0deg)} 30%{transform:rotate(15deg)} 60%{transform:rotate(-10deg)} }
          .lu-body { animation: luPop 2s ease-in-out infinite; transform-origin: 70px 50px; }
          .lu-arm { animation: luWave 2s ease-in-out infinite; transform-origin: 70px 50px; }
        `}</style>
        <g className="lu-body">
          <circle cx="70" cy="28" r="16" fill="#0086FF"/>
          <circle cx="70" cy="28" r="10" fill="white"/>
          <circle cx="70" cy="28" r="5" fill="#0086FF"/>
          <rect x="52" y="44" width="36" height="30" rx="8" fill="#0086FF"/>
          <rect x="58" y="74" width="8" height="16" rx="4" fill="#0086FF"/>
          <rect x="74" y="74" width="8" height="16" rx="4" fill="#0086FF"/>
        </g>
        <g className="lu-arm">
          <rect x="30" y="46" width="22" height="8" rx="4" fill="#0086FF"/>
          <rect x="88" y="46" width="22" height="8" rx="4" fill="#0086FF"/>
        </g>
        <text x="70" y="98" fontFamily="Arial, sans-serif" fontWeight="800" fontSize="9" fill="#0086FF" textAnchor="middle">Magazine Luiza</text>
      </svg>
    );
  }

  if (name.includes('casas') || name.includes('bahia')) {
    return (
      <svg width={size * 1.8} height={size * 0.8} viewBox="0 0 200 70" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`
          @keyframes casaRoof { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
          @keyframes casaGlow { 0%,100%{fill:#FF6600} 50%{fill:#FF8833} }
          .casa-house { animation: casaRoof 2s ease-in-out infinite; transform-origin: 28px 35px; }
          .casa-roof { animation: casaGlow 2s ease-in-out infinite; }
        `}</style>
        <g className="casa-house">
          <polygon points="28,8 8,28 48,28" className="casa-roof" fill="#FF6600"/>
          <rect x="14" y="28" width="28" height="22" rx="2" fill="#FF6600" opacity="0.85"/>
          <rect x="22" y="36" width="12" height="14" rx="2" fill="white"/>
        </g>
        <text x="58" y="30" fontFamily="Arial Black, Arial" fontWeight="900" fontSize="16" fill="#FF6600">Casas</text>
        <text x="58" y="52" fontFamily="Arial Black, Arial" fontWeight="900" fontSize="16" fill="#003087">Bahia</text>
        <rect x="58" y="56" width="130" height="3" rx="1.5" fill="#FF6600" opacity="0.35"/>
      </svg>
    );
  }

  // Fallback generic logo
  return (
    <svg width={size} height={size * 0.7} viewBox="0 0 80 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="4" width="72" height="48" rx="8" fill="#6B7280" opacity="0.15"/>
      <ShoppingCart size={28} color="#6B7280" />
    </svg>
  );
}

function parseProductsFromText(text: string, searchQuery: string): ProductResult[] {
  const results: ProductResult[] = [];
  const lines = text.split('\n');

  const priceRegex = /R\$\s?[\d.,]+|USD?\s?[\d.,]+|\$\s?[\d.,]+|€\s?[\d.,]+/gi;
  const urlRegex = /https?:\/\/[^\s\)]+/gi;

  const marketplaces = ['Amazon', 'eBay', 'AliExpress', 'MercadoLivre', 'Mercado Livre', 'Shopee', 'Americanas', 'Magazine Luiza', 'Casas Bahia', 'Walmart', 'Submarino', 'Kabum', 'Ponto Frio'];

  for (const line of lines) {
    if (!line.trim()) continue;

    const foundMarketplace = marketplaces.find(m =>
      line.toLowerCase().includes(m.toLowerCase())
    );
    if (!foundMarketplace) continue;

    const priceMatch = line.match(priceRegex);
    const urlMatch = line.match(urlRegex);

    if (!priceMatch) continue;

    const priceStr = priceMatch[0];
    const priceNumeric = parseFloat(
      priceStr.replace(/[R$USD€\s]/gi, '').replace(/\./g, '').replace(',', '.')
    );

    const title = line
      .replace(priceRegex, '')
      .replace(urlRegex, '')
      .replace(/[-–—*•#\[\]()]/g, ' ')
      .replace(new RegExp(foundMarketplace, 'gi'), '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 80) || searchQuery;

    const url = urlMatch?.[0] || buildMarketplaceUrl(foundMarketplace, searchQuery);

    results.push({
      marketplace: foundMarketplace === 'Mercado Livre' ? 'MercadoLivre' : foundMarketplace,
      title: title || searchQuery,
      price: priceStr,
      priceNumeric: isNaN(priceNumeric) ? 0 : priceNumeric,
      url,
      imageUrl: '',
    });
  }

  return results.sort((a, b) => a.priceNumeric - b.priceNumeric);
}

function buildMarketplaceUrl(marketplace: string, query: string): string {
  const encoded = encodeURIComponent(query);
  const map: Record<string, string> = {
    Amazon: `https://www.amazon.com.br/s?k=${encoded}`,
    eBay: `https://www.ebay.com/sch/i.html?_nkw=${encoded}`,
    AliExpress: `https://www.aliexpress.com/wholesale?SearchText=${encoded}`,
    MercadoLivre: `https://lista.mercadolivre.com.br/${encoded}`,
    'Mercado Livre': `https://lista.mercadolivre.com.br/${encoded}`,
    Shopee: `https://shopee.com.br/search?keyword=${encoded}`,
    Americanas: `https://www.americanas.com.br/busca/${encoded}`,
    'Magazine Luiza': `https://www.magazineluiza.com.br/busca/${encoded}`,
    'Casas Bahia': `https://www.casasbahia.com.br/busca/${encoded}`,
    Walmart: `https://www.walmart.com/search?q=${encoded}`,
  };
  return map[marketplace] || `https://www.google.com/search?q=${encoded}+${encodeURIComponent(marketplace)}`;
}

const SYSTEM_PROMPT = `You are a product price comparison assistant. When the user searches for a product, search the web and return results from major marketplaces: Amazon, eBay, AliExpress, MercadoLivre (Mercado Livre), Shopee, Americanas, Magazine Luiza, Casas Bahia.

For each result found, format EXACTLY like this on a new line:
[Marketplace Name] - [Product Title] - [Price in R$ or USD] - [Direct product URL]

Rules:
- Include ONLY lines that have a marketplace name, price, and URL
- Sort by price ascending
- Include at least 5-8 results from different marketplaces
- Use real prices from real listings found on the web
- Always include the direct product URL
- Prices in BRL (R$) preferred, USD acceptable
- Be concise, no extra commentary`;

export default function ShoppingPage() {
  const [query, setQuery] = useState('');
  const [searchedQuery, setSearchedQuery] = useState('');
  const [products, setProducts] = useState<ProductResult[]>([]);
  const [rawResponse, setRawResponse] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const { response, isLoading, error, sendMessage } = useChat(
    'PERPLEXITY',
    'perplexity/sonar-pro',
    false
  );

  useEffect(() => {
    if (error) toast.error(error.message);
  }, [error]);

  useEffect(() => {
    if (response && !isLoading) {
      setRawResponse(response);
      const parsed = parseProductsFromText(response, searchedQuery);
      setProducts(parsed);
    }
  }, [response, isLoading, searchedQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    const q = query.trim();
    setSearchedQuery(q);
    setProducts([]);
    setRawResponse('');
    setHasSearched(true);

    sendMessage(
      [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Search for the best prices for: "${q}". Find listings from Amazon, eBay, AliExpress, MercadoLivre, Shopee, Americanas, Magazine Luiza, Casas Bahia. Return each result on a new line with marketplace name, product title, price, and direct URL.`,
        },
      ],
      {
        temperature: 0.2,
        max_tokens: 2000,
        web_search_options: { search_context_size: 'high' },
      }
    );
  };

  const marketplaceLinks = [
    { name: 'Amazon', url: `https://www.amazon.com.br/s?k=${encodeURIComponent(searchedQuery || '')}` },
    { name: 'MercadoLivre', url: `https://lista.mercadolivre.com.br/${encodeURIComponent(searchedQuery || '')}` },
    { name: 'Shopee', url: `https://shopee.com.br/search?keyword=${encodeURIComponent(searchedQuery || '')}` },
    { name: 'AliExpress', url: `https://www.aliexpress.com/wholesale?SearchText=${encodeURIComponent(searchedQuery || '')}` },
    { name: 'eBay', url: `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(searchedQuery || '')}` },
    { name: 'Americanas', url: `https://www.americanas.com.br/busca/${encodeURIComponent(searchedQuery || '')}` },
    { name: 'Magazine Luiza', url: `https://www.magazineluiza.com.br/busca/${encodeURIComponent(searchedQuery || '')}` },
    { name: 'Casas Bahia', url: `https://www.casasbahia.com.br/busca/${encodeURIComponent(searchedQuery || '')}` },
  ];

  return (
    <AppLayout>
      <div className="flex flex-col gap-6 p-6 max-w-5xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <ShoppingCart size={22} className="text-accent" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Compras</h1>
            <p className="text-sm text-muted-foreground">
              Pesquise produtos e compare preços nos principais marketplaces
            </p>
          </div>
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ex: iPhone 15, Tênis Nike Air Max, Smart TV 55..."
              disabled={isLoading}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 text-sm disabled:opacity-60"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Buscando...
              </>
            ) : (
              <>
                <Search size={16} />
                Buscar
              </>
            )}
          </button>
        </form>

        {/* Loading state */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <Loader2 size={36} className="animate-spin text-accent" />
            <p className="text-muted-foreground text-sm">
              Buscando ofertas em Amazon, MercadoLivre, Shopee, AliExpress, eBay e mais...
            </p>
          </div>
        )}

        {/* Results */}
        {!isLoading && hasSearched && (
          <>
            {products.length > 0 ? (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-foreground">
                    {products.length} resultado{products.length !== 1 ? 's' : ''} para{' '}
                    <span className="text-accent">"{searchedQuery}"</span>
                    <span className="ml-2 text-xs text-muted-foreground font-normal">
                      ordenados por menor preço
                    </span>
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.map((product, idx) => {
                    const style = getMarketplaceStyle(product.marketplace);
                    return (
                      <a
                        key={idx}
                        href={product.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex flex-col rounded-xl border border-border bg-card hover:border-accent/40 hover:shadow-md transition-all duration-200 overflow-hidden"
                      >
                        {/* Animated marketplace logo area */}
                        <div
                          className="flex items-center justify-center h-36 overflow-hidden"
                          style={{ backgroundColor: style.bg }}
                        >
                          <MarketplaceLogo marketplace={product.marketplace} size={60} />
                        </div>

                        <div className="flex flex-col gap-2 p-4 flex-1">
                          {/* Marketplace name */}
                          <div className="flex items-center gap-1.5">
                            <span
                              className="text-xs font-semibold"
                              style={{ color: style.color }}
                            >
                              {product.marketplace}
                            </span>
                          </div>

                          {/* Title */}
                          <p className="text-sm text-foreground font-medium leading-snug line-clamp-2 flex-1">
                            {product.title}
                          </p>

                          {/* Price + link */}
                          <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/50">
                            <div className="flex items-center gap-1">
                              <Tag size={13} className="text-positive" />
                              <span className="text-base font-bold text-positive">
                                {product.price}
                              </span>
                            </div>
                            <span className="flex items-center gap-1 text-xs text-accent group-hover:underline">
                              Ver oferta
                              <ExternalLink size={12} />
                            </span>
                          </div>
                        </div>
                      </a>
                    );
                  })}
                </div>

                {/* Quick links to search directly */}
                <div className="mt-2 p-4 rounded-xl border border-border bg-card/50">
                  <p className="text-xs text-muted-foreground mb-3 font-medium">
                    Buscar diretamente nos marketplaces:
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {marketplaceLinks.map((m) => {
                      const style = getMarketplaceStyle(m.name);
                      return (
                        <a
                          key={m.name}
                          href={m.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center px-3 py-2 rounded-xl border border-border hover:border-accent/40 hover:shadow-sm transition-all duration-200 min-w-[90px]"
                          style={{ backgroundColor: style.bg }}
                          title={m.name}
                        >
                          <MarketplaceLogo marketplace={m.name} size={28} />
                        </a>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              /* No structured results — show raw response + direct links */
              <div className="flex flex-col gap-4">
                <div className="p-5 rounded-xl border border-border bg-card">
                  <p className="text-sm font-semibold text-foreground mb-3">
                    Resultados para "{searchedQuery}"
                  </p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {rawResponse || 'Nenhum resultado encontrado. Tente uma busca diferente.'}
                  </p>
                </div>

                {searchedQuery && (
                  <div className="p-4 rounded-xl border border-border bg-card/50">
                    <p className="text-xs text-muted-foreground mb-3 font-medium">
                      Buscar diretamente nos marketplaces:
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {marketplaceLinks.map((m) => {
                        const style = getMarketplaceStyle(m.name);
                        return (
                          <a
                            key={m.name}
                            href={m.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center px-3 py-2 rounded-xl border border-border hover:border-accent/40 hover:shadow-sm transition-all duration-200 min-w-[90px]"
                            style={{ backgroundColor: style.bg }}
                            title={m.name}
                          >
                            <MarketplaceLogo marketplace={m.name} size={28} />
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Empty state */}
        {!isLoading && !hasSearched && (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center">
              <ShoppingCart size={32} className="text-accent/60" />
            </div>
            <div>
              <p className="text-base font-semibold text-foreground">
                Encontre as melhores ofertas
              </p>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                Digite o nome de um produto e compare preços em Amazon, MercadoLivre, Shopee,
                AliExpress, eBay e outros marketplaces.
              </p>
            </div>

            {/* Marketplace logos preview */}
            <div className="flex flex-wrap justify-center gap-3 mt-4">
              {['Amazon', 'MercadoLivre', 'Shopee', 'AliExpress', 'eBay', 'Americanas', 'Magazine Luiza', 'Casas Bahia'].map((mp) => {
                const style = getMarketplaceStyle(mp);
                return (
                  <div
                    key={mp}
                    className="flex items-center justify-center px-3 py-2 rounded-xl border border-border min-w-[90px]"
                    style={{ backgroundColor: style.bg }}
                    title={mp}
                  >
                    <MarketplaceLogo marketplace={mp} size={28} />
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap justify-center gap-2 mt-2">
              {['iPhone 15', 'Tênis Nike', 'Smart TV 55"', 'Notebook Dell', 'AirPods Pro'].map(
                (suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setQuery(suggestion)}
                    className="px-3 py-1.5 rounded-full border border-border text-xs text-muted-foreground hover:border-accent/40 hover:text-accent transition-colors"
                  >
                    {suggestion}
                  </button>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
