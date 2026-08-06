import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ASSETS, findAsset, FALLBACK_PRICES, type AssetMeta } from "@/lib/market-data";
import { getStockQuotes, getStockChart, type StockQuote } from "@/lib/quotes.functions";

export type LiveAsset = AssetMeta & {
  price: number;
  change: number; // 24h percent
  marketCap?: number;
};

// ---------- Crypto (CoinGecko, no key, CORS-enabled) ----------

const cryptoIds = ASSETS.filter((a) => a.kind === "crypto")
  .map((a) => a.coingeckoId!)
  .join(",");

type CoinGeckoItem = {
  id: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  image: string;
};

async function fetchCryptoQuotes(): Promise<Record<string, LiveAsset>> {
  const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${cryptoIds}&price_change_percentage=24h`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to load crypto prices");
  const rows: CoinGeckoItem[] = await res.json();
  const map: Record<string, LiveAsset> = {};
  for (const r of rows) {
    const meta = ASSETS.find((a) => a.coingeckoId === r.id);
    if (!meta) continue;
    map[meta.symbol] = {
      ...meta,
      logo: r.image || meta.logo,
      price: Number(r.current_price ?? 0),
      change: Number(r.price_change_percentage_24h ?? 0),
      marketCap: Number(r.market_cap ?? 0) || undefined,
    };
  }
  return map;
}

export function useCryptoQuotes() {
  return useQuery({
    queryKey: ["crypto-quotes"],
    queryFn: fetchCryptoQuotes,
    staleTime: 60_000,
    refetchInterval: 60_000,
  });
}

// ---------- Stocks (Yahoo via server function) ----------

const stockSymbols = ASSETS.filter((a) => a.kind !== "crypto").map((a) => a.symbol);

export function useStockQuotes() {
  const fetchQuotes = useServerFn(getStockQuotes);
  return useQuery({
    queryKey: ["stock-quotes"],
    queryFn: async (): Promise<Record<string, LiveAsset>> => {
      const rows: StockQuote[] = await fetchQuotes({ data: { symbols: stockSymbols } });
      const map: Record<string, LiveAsset> = {};
      for (const r of rows) {
        const meta = findAsset(r.symbol);
        if (!meta) continue;
        map[r.symbol] = {
          ...meta,
          price: r.price,
          change: r.change,
          marketCap: r.marketCap,
        };
      }
      return map;
    },
    staleTime: 60_000,
    refetchInterval: 60_000,
  });
}

// ---------- Combined ----------

export function useAllQuotes() {
  const stocks = useStockQuotes();
  const crypto = useCryptoQuotes();
  const isLoading = stocks.isLoading || crypto.isLoading;
  const map: Record<string, LiveAsset> = {
    ...(stocks.data ?? {}),
    ...(crypto.data ?? {}),
  };
  // Fill any missing (still loading, or fetch failed) with fallback prices so
  // the UI never shows "—" or +0.00%.
  const assets: LiveAsset[] = ASSETS.map((a) => {
    const live = map[a.symbol];
    if (live && live.price > 0) return live;
    const fb = FALLBACK_PRICES[a.symbol];
    return { ...a, price: fb?.price ?? 0, change: fb?.change ?? 0 };
  });
  // Also backfill the map so useQuote sees fallback values.
  for (const a of assets) map[a.symbol] = a;
  return { assets, map, isLoading, error: stocks.error || crypto.error };
}

export function useQuote(symbol: string) {
  const { map, isLoading } = useAllQuotes();
  const upper = symbol.toUpperCase();
  return { asset: map[upper] ?? null, isLoading };
}

// ---------- Historical chart ----------

export function useAssetChart(symbol: string, range: "1D" | "1W" | "1M" | "3M" | "1Y" | "ALL") {
  const fetchChart = useServerFn(getStockChart);
  const meta = findAsset(symbol);
  return useQuery({
    queryKey: ["chart", symbol, range],
    enabled: !!meta,
    staleTime: 60_000,
    queryFn: async (): Promise<number[]> => {
      if (!meta) return [];
      if (meta.kind === "crypto") {
        const days = range === "1D" ? 1 : range === "1W" ? 7 : range === "1M" ? 30 : range === "3M" ? 90 : range === "1Y" ? 365 : "max";
        const url = `https://api.coingecko.com/api/v3/coins/${meta.coingeckoId}/market_chart?vs_currency=usd&days=${days}`;
        const res = await fetch(url);
        if (!res.ok) return [];
        const json = await res.json();
        return (json.prices ?? []).map((p: [number, number]) => p[1]);
      }
      return fetchChart({ data: { symbol, range } });
    },
  });
}
