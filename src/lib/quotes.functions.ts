import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// Yahoo Finance "spark" endpoint — one request for many symbols.
// Batching this way avoids per-symbol rate-limiting from edge IPs.

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36";

const symbolsSchema = z
  .object({ symbols: z.array(z.string().min(1).max(10)).min(1).max(30) })
  .strict();

export type StockQuote = {
  symbol: string;
  price: number;
  change: number; // percent
  marketCap?: number;
  currency?: string;
};

export const getStockQuotes = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => symbolsSchema.parse(data))
  .handler(async ({ data }): Promise<StockQuote[]> => {
    const symbolsCsv = data.symbols.map((s) => s.toUpperCase()).join(",");
    const url = `https://query1.finance.yahoo.com/v7/finance/spark?symbols=${encodeURIComponent(
      symbolsCsv,
    )}&range=1d&interval=5m`;
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": UA, Accept: "application/json" },
      });
      if (!res.ok) return [];
      const json: any = await res.json();
      const results: any[] = json?.spark?.result ?? [];
      const out: StockQuote[] = [];
      for (const r of results) {
        const meta = r?.response?.[0]?.meta;
        if (!meta) continue;
        const price = Number(meta.regularMarketPrice);
        const prev = Number(meta.chartPreviousClose ?? meta.previousClose ?? price);
        if (!isFinite(price)) continue;
        const change = prev > 0 ? ((price - prev) / prev) * 100 : 0;
        out.push({
          symbol: String(r.symbol).toUpperCase(),
          price,
          change,
          currency: meta.currency,
        });
      }
      return out;
    } catch {
      return [];
    }
  });

const chartSchema = z
  .object({
    symbol: z.string().min(1).max(10),
    range: z.enum(["1D", "1W", "1M", "3M", "1Y", "ALL"]),
  })
  .strict();

const RANGE_MAP: Record<string, { range: string; interval: string }> = {
  "1D": { range: "1d", interval: "5m" },
  "1W": { range: "5d", interval: "30m" },
  "1M": { range: "1mo", interval: "1d" },
  "3M": { range: "3mo", interval: "1d" },
  "1Y": { range: "1y", interval: "1wk" },
  ALL: { range: "max", interval: "1mo" },
};

export const getStockChart = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => chartSchema.parse(data))
  .handler(async ({ data }): Promise<number[]> => {
    const cfg = RANGE_MAP[data.range];
    const url = `https://query1.finance.yahoo.com/v7/finance/spark?symbols=${encodeURIComponent(
      data.symbol.toUpperCase(),
    )}&range=${cfg.range}&interval=${cfg.interval}`;
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": UA, Accept: "application/json" },
      });
      if (!res.ok) return [];
      const json: any = await res.json();
      const closes: (number | null)[] =
        json?.spark?.result?.[0]?.response?.[0]?.indicators?.quote?.[0]?.close ?? [];
      return closes.filter((n): n is number => typeof n === "number" && !isNaN(n));
    } catch {
      return [];
    }
  });
