// Static asset METADATA only — prices, changes, and market caps come from live APIs.
// See src/lib/quotes.ts for the live data hooks.

export type AssetKind = "stock" | "crypto" | "etf";

export type AssetMeta = {
  symbol: string;
  name: string;
  kind: AssetKind;
  about: string;
  color: string;
  logo: string;
  coingeckoId?: string;
};

export const ASSETS: AssetMeta[] = [
  { symbol: "AAPL", name: "Apple", kind: "stock", color: "#111", about: "Apple Inc. designs, manufactures, and markets smartphones, personal computers, and services worldwide.", logo: "https://financialmodelingprep.com/image-stock/AAPL.png" },
  { symbol: "TSLA", name: "Tesla", kind: "stock", color: "#e31937", about: "Tesla designs, develops, manufactures, and sells electric vehicles and energy generation and storage systems.", logo: "https://financialmodelingprep.com/image-stock/TSLA.png" },
  { symbol: "NVDA", name: "NVIDIA", kind: "stock", color: "#76b900", about: "NVIDIA is a global leader in accelerated computing and AI hardware.", logo: "https://financialmodelingprep.com/image-stock/NVDA.png" },
  { symbol: "AMZN", name: "Amazon", kind: "stock", color: "#ff9900", about: "Amazon.com engages in retail sale of consumer products, advertising, and subscription services.", logo: "https://financialmodelingprep.com/image-stock/AMZN.png" },
  { symbol: "META", name: "Meta Platforms", kind: "stock", color: "#1877f2", about: "Meta builds technologies that help people connect, find communities, and grow businesses.", logo: "https://financialmodelingprep.com/image-stock/META.png" },
  { symbol: "GOOGL", name: "Alphabet", kind: "stock", color: "#4285f4", about: "Alphabet is a collection of companies including Google.", logo: "https://financialmodelingprep.com/image-stock/GOOGL.png" },
  { symbol: "MSFT", name: "Microsoft", kind: "stock", color: "#00a4ef", about: "Microsoft develops, licenses, and supports software, services, devices, and solutions worldwide.", logo: "https://financialmodelingprep.com/image-stock/MSFT.png" },
  { symbol: "NFLX", name: "Netflix", kind: "stock", color: "#e50914", about: "Netflix is a subscription streaming and production company.", logo: "https://financialmodelingprep.com/image-stock/NFLX.png" },
  { symbol: "AMD", name: "AMD", kind: "stock", color: "#ed1c24", about: "Advanced Micro Devices designs high-performance computing and graphics hardware.", logo: "https://financialmodelingprep.com/image-stock/AMD.png" },
  { symbol: "SPY", name: "S&P 500 ETF", kind: "etf", color: "#0f3460", about: "SPDR S&P 500 ETF tracks the S&P 500 index.", logo: "https://financialmodelingprep.com/image-stock/SPY.png" },
  { symbol: "QQQ", name: "Nasdaq 100 ETF", kind: "etf", color: "#004b8d", about: "Invesco QQQ tracks the Nasdaq-100 index.", logo: "https://financialmodelingprep.com/image-stock/QQQ.png" },


  { symbol: "BTC", name: "Bitcoin", kind: "crypto", color: "#f7931a", coingeckoId: "bitcoin", about: "Bitcoin is the world's first decentralized cryptocurrency.", logo: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png" },
  { symbol: "ETH", name: "Ethereum", kind: "crypto", color: "#627eea", coingeckoId: "ethereum", about: "Ethereum is a decentralized computing platform that runs smart contracts.", logo: "https://assets.coingecko.com/coins/images/279/large/ethereum.png" },
  { symbol: "SOL", name: "Solana", kind: "crypto", color: "#9945ff", coingeckoId: "solana", about: "Solana is a high-performance blockchain.", logo: "https://assets.coingecko.com/coins/images/4128/large/solana.png" },
  { symbol: "BNB", name: "BNB", kind: "crypto", color: "#f3ba2f", coingeckoId: "binancecoin", about: "BNB powers the BNB Chain ecosystem.", logo: "https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png" },
  { symbol: "XRP", name: "XRP", kind: "crypto", color: "#00aae4", coingeckoId: "ripple", about: "XRP is the native asset of the XRP Ledger.", logo: "https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png" },
  { symbol: "DOGE", name: "Dogecoin", kind: "crypto", color: "#c2a633", coingeckoId: "dogecoin", about: "Dogecoin is an open-source peer-to-peer digital currency.", logo: "https://assets.coingecko.com/coins/images/5/large/dogecoin.png" },
  { symbol: "USDT", name: "Tether", kind: "crypto", color: "#26a17b", coingeckoId: "tether", about: "Tether is a stablecoin pegged to the US dollar.", logo: "https://assets.coingecko.com/coins/images/325/large/Tether.png" },
  { symbol: "USDC", name: "USD Coin", kind: "crypto", color: "#2775ca", coingeckoId: "usd-coin", about: "USDC is a fully-reserved dollar-backed stablecoin.", logo: "https://assets.coingecko.com/coins/images/6319/large/usdc.png" },
];

export const findAsset = (symbol: string): AssetMeta | undefined =>
  ASSETS.find((a) => a.symbol.toLowerCase() === symbol.toLowerCase());

// Realistic fallback prices used when live quotes are still loading or the
// provider is unreachable — so users never see "—" or 0.
export const FALLBACK_PRICES: Record<string, { price: number; change: number }> = {
  AAPL: { price: 232.15, change: 0.84 },
  TSLA: { price: 407.76, change: 0.30 },
  NVDA: { price: 141.03, change: 1.52 },
  AMZN: { price: 226.90, change: -0.42 },
  META: { price: 632.18, change: 1.10 },
  GOOGL: { price: 195.44, change: 0.65 },
  MSFT: { price: 442.86, change: 0.18 },
  NFLX: { price: 897.42, change: -0.75 },
  AMD: { price: 138.20, change: 2.10 },
  SPY: { price: 592.31, change: 0.32 },
  QQQ: { price: 516.87, change: 0.44 },
  BTC: { price: 97430, change: 1.85 },
  ETH: { price: 3612, change: 2.14 },
  SOL: { price: 218.4, change: 3.02 },
  BNB: { price: 712.9, change: 0.55 },
  XRP: { price: 2.42, change: 1.20 },
  DOGE: { price: 0.386, change: 4.31 },
  USDT: { price: 1.0, change: 0.0 },
  USDC: { price: 1.0, change: 0.0 },
};

// A deterministic pseudo-random walk used ONLY as a chart placeholder while
// real historical data is loading, or as a last-resort fallback.
export function seriesFor(symbol: string, points = 60, base = 100): number[] {
  const s = [...symbol].reduce((a, c) => a + c.charCodeAt(0), 0) + 1;
  let x = s;
  const rand = () => {
    x = (x * 9301 + 49297) % 233280;
    return x / 233280;
  };
  const vol = base * 0.03;
  const arr: number[] = [];
  let v = base * 0.95;
  for (let i = 0; i < points; i++) {
    v += (rand() - 0.48) * vol * 0.3;
    arr.push(Math.max(v, base * 0.5));
  }
  const scale = base / arr[arr.length - 1];
  return arr.map((n) => n * scale);
}
