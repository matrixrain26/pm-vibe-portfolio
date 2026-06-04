import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type StockInput = {
  name: string;
  symbol: string;
};

type WatchRow = {
  stock: string;
  symbol: string;
  date: string;
  open: number;
  close: number;
  gainPct: number;
  volPct: number;
  ema10: number;
  ema20: number;
  above10: boolean;
  above20: boolean;
  candle: string;
  verdict: string;
};

const DEFAULT_STOCKS: StockInput[] = [
  { name: "JioFin", symbol: "JIOFIN.NS" },
  { name: "GMR Airports", symbol: "GMRAIRPORT.NS" },
  { name: "Paytm", symbol: "PAYTM.NS" },
  { name: "Hyundai Motor", symbol: "HYUNDAI.NS" },
  { name: "IRFC", symbol: "IRFC.NS" },
  { name: "Bajaj Finance", symbol: "BAJFINANCE.NS" },
  { name: "Lodha Dev", symbol: "LODHA.NS" },
  { name: "Biocon", symbol: "BIOCON.NS" },
  { name: "Lupin", symbol: "LUPIN.NS" },
  { name: "Glenmark", symbol: "GLENMARK.NS" },
  { name: "Bajaj Auto", symbol: "BAJAJ-AUTO.NS" },
  { name: "Laurus Labs", symbol: "LAURUSLABS.NS" },
  { name: "Cholafin", symbol: "CHOLAFIN.NS" },
  { name: "RBL Bank", symbol: "RBLBANK.NS" },
  { name: "Bandhan Bank", symbol: "BANDHANBNK.NS" }
];

const DEFAULT_PRIMER: StockInput[] = [
  { name: "Nifty 50", symbol: "^NSEI" },
  { name: "Nifty Midcap 150", symbol: "NIFTYMIDCAP150.NS" },
  { name: "Nifty Smallcap 250", symbol: "NIFTYSMLCAP250.NS" },
  { name: "Brent", symbol: "BZ=F" },
  { name: "India VIX", symbol: "^INDIAVIX" }
];

const NAME_TO_STOCK: Record<string, StockInput> = {
  jiofin: { name: "JioFin", symbol: "JIOFIN.NS" },
  gmrairport: { name: "GMR Airports", symbol: "GMRAIRPORT.NS" },
  "gmr airports": { name: "GMR Airports", symbol: "GMRAIRPORT.NS" },
  paytm: { name: "Paytm", symbol: "PAYTM.NS" },
  hyndaimotors: { name: "Hyundai Motor", symbol: "HYUNDAI.NS" },
  "hyundai motor": { name: "Hyundai Motor", symbol: "HYUNDAI.NS" },
  irfc: { name: "IRFC", symbol: "IRFC.NS" },
  bajajfin: { name: "Bajaj Finance", symbol: "BAJFINANCE.NS" },
  "bajaj finance": { name: "Bajaj Finance", symbol: "BAJFINANCE.NS" },
  "lodha dev": { name: "Lodha Dev", symbol: "LODHA.NS" },
  "lodha developers": { name: "Lodha Dev", symbol: "LODHA.NS" },
  lodha: { name: "Lodha Dev", symbol: "LODHA.NS" },
  biocon: { name: "Biocon", symbol: "BIOCON.NS" },
  lupin: { name: "Lupin", symbol: "LUPIN.NS" },
  glenmark: { name: "Glenmark", symbol: "GLENMARK.NS" },
  "bajaj auto": { name: "Bajaj Auto", symbol: "BAJAJ-AUTO.NS" },
  "laurus labs": { name: "Laurus Labs", symbol: "LAURUSLABS.NS" },
  lauruslabs: { name: "Laurus Labs", symbol: "LAURUSLABS.NS" },
  cholafin: { name: "Cholafin", symbol: "CHOLAFIN.NS" },
  rblbank: { name: "RBL Bank", symbol: "RBLBANK.NS" },
  "rbl bank": { name: "RBL Bank", symbol: "RBLBANK.NS" },
  "bandhan bank": { name: "Bandhan Bank", symbol: "BANDHANBNK.NS" },
  bandhanbnk: { name: "Bandhan Bank", symbol: "BANDHANBNK.NS" },
  "tata motors passenger vehicle (tmpv)": { name: "TMPV", symbol: "TMPV.NS" },
  tmpv: { name: "TMPV", symbol: "TMPV.NS" },
  "360 one wam": { name: "360 ONE WAM", symbol: "360ONE.NS" },
  "360one": { name: "360 ONE WAM", symbol: "360ONE.NS" },
  "ab capital": { name: "AB Capital", symbol: "ABCAPITAL.NS" },
  abcapi: { name: "AB Capital", symbol: "ABCAPITAL.NS" },
  "united spirits": { name: "United Spirits", symbol: "UNITDSPR.NS" },
  unitedspirits: { name: "United Spirits", symbol: "UNITDSPR.NS" },
  motherson: { name: "Motherson", symbol: "MOTHERSON.NS" },
  delhivery: { name: "Delhivery", symbol: "DELHIVERY.NS" }
};

const NAME_TO_PRIMER: Record<string, StockInput> = {
  nifty50: { name: "Nifty 50", symbol: "^NSEI" },
  "nifty 50": { name: "Nifty 50", symbol: "^NSEI" },
  cnxmidcap: { name: "CNX Midcap", symbol: "^NSEMDCP50" },
  niftymidcap150: { name: "Nifty Midcap 150", symbol: "NIFTYMIDCAP150.NS" },
  "nifty midcap 150": { name: "Nifty Midcap 150", symbol: "NIFTYMIDCAP150.NS" },
  cnxsmallcap: { name: "CNX Smallcap", symbol: "^CNXSC" },
  niftysmallcap250: { name: "Nifty Smallcap 250", symbol: "NIFTYSMLCAP250.NS" },
  "nifty smallcap 250": { name: "Nifty Smallcap 250", symbol: "NIFTYSMLCAP250.NS" },
  brent: { name: "Brent", symbol: "BZ=F" },
  indiavix: { name: "India VIX", symbol: "^INDIAVIX" },
  "india vix": { name: "India VIX", symbol: "^INDIAVIX" }
};

function round(value: number, digits = 2) {
  return Number(value.toFixed(digits));
}

function ema(values: number[], period: number) {
  if (values.length < period) {
    throw new Error(`Need at least ${period} closes for EMA`);
  }

  const multiplier = 2 / (period + 1);
  let current = values.slice(0, period).reduce((sum, value) => sum + value, 0) / period;

  for (let index = period; index < values.length; index += 1) {
    current = values[index] * multiplier + current * (1 - multiplier);
  }

  return current;
}

function candleType(open: number, high: number, low: number, close: number) {
  const range = high - low;
  if (range <= 0) return "Flat";

  const body = Math.abs(close - open);
  const upper = high - Math.max(open, close);
  const lower = Math.min(open, close) - low;
  const bodyPct = body / range;

  if (bodyPct <= 0.1) return "Doji";
  if (lower >= 2 * body && upper <= 0.35 * body) return "Hammer";
  if (upper >= 2 * body && lower <= 0.35 * body) return "Inv hammer/shooting star";
  if (bodyPct >= 0.8 && close > open) return "Bull marubozu";
  if (bodyPct >= 0.8 && close < open) return "Bear marubozu";
  if (bodyPct <= 0.3) return "Spinning top";
  return close > open ? "Bullish" : "Bearish";
}

function verdict(close: number, ema10: number, ema20: number) {
  if (close > ema10 && close > ema20) return "Trend intact";
  if (close <= ema10 && close > ema20) return "Lost 10-EMA";
  if (close > ema10 && close <= ema20) return "Reclaiming";
  return "Below EMAs";
}

function formatPct(value: number) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

function emaStatus(row: WatchRow) {
  return `EMA ${row.above10 ? "10 OK" : "10 below"} / ${row.above20 ? "20 OK" : "20 below"}`;
}

function line(row: WatchRow, read: string) {
  return `- *${row.stock}* \`${row.close.toFixed(2)}\` \`${formatPct(row.gainPct)}\` | Vol \`${row.volPct}%\` | ${emaStatus(row)} | ${row.candle} | ${read}`;
}

function displayNameFromSymbol(symbol: string) {
  return symbol
    .replace(".NS", "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function toYahooSymbol(value: string) {
  const symbol = value.trim().toUpperCase();
  if (!symbol) return "";
  if (symbol.startsWith("^") || symbol.includes("=") || symbol.endsWith(".NS")) return symbol;
  return `${symbol}.NS`;
}

function symbolFromName(value: string) {
  return value
    .trim()
    .toUpperCase()
    .replace(/&/g, "AND")
    .replace(/[^A-Z0-9-]/g, "");
}

function parseMappedOrSymbol(raw: string, mapping: Record<string, StockInput>) {
  const trimmed = raw.trim();
  const mapped = mapping[trimmed.toLowerCase()];
  if (mapped) return mapped;

  const explicit = trimmed.match(/^(.+?)\s*(?:[:|=])\s*([A-Za-z0-9^&.\-=]+)$/);
  if (explicit) {
    return {
      name: explicit[1].trim(),
      symbol: toYahooSymbol(explicit[2])
    };
  }

  const symbol = toYahooSymbol(trimmed.includes(" ") ? symbolFromName(trimmed) : trimmed);
  return {
    name: trimmed.includes(".") || trimmed === trimmed.toUpperCase() ? displayNameFromSymbol(symbol) : trimmed,
    symbol
  };
}

function normalizeList(rawNames: string | null, rawSymbols: string | null, mapping: Record<string, StockInput>, fallback: StockInput[]) {
  if (rawSymbols) {
    const seen = new Set<string>();
    return rawSymbols
      .split(",")
      .map((raw) => raw.trim())
      .filter(Boolean)
      .map(toYahooSymbol)
      .filter((symbol) => {
        if (seen.has(symbol)) return false;
        seen.add(symbol);
        return true;
      })
      .map((symbol) => ({ name: displayNameFromSymbol(symbol), symbol }));
  }

  if (!rawNames) return fallback;

  const seen = new Set<string>();
  const stocks = rawNames
    .split(",")
    .map((raw) => raw.trim())
    .filter(Boolean)
    .map((name) => parseMappedOrSymbol(name, mapping))
    .filter((stock) => Boolean(stock.symbol))
    .filter((stock) => {
      if (seen.has(stock.symbol)) return false;
      seen.add(stock.symbol);
      return true;
    });

  return stocks.length ? stocks : fallback;
}

function normalizeRequest(request: Request) {
  const url = new URL(request.url);
  return {
    primer: normalizeList(url.searchParams.get("primer"), url.searchParams.get("primerSymbols"), NAME_TO_PRIMER, DEFAULT_PRIMER),
    stocks: normalizeList(url.searchParams.get("stocks") ?? url.searchParams.get("names"), url.searchParams.get("symbols"), NAME_TO_STOCK, DEFAULT_STOCKS)
  };
}

async function fetchRow(stock: StockInput): Promise<WatchRow> {
  const response = await fetch(
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(stock.symbol)}?range=6mo&interval=1d`,
    {
      cache: "no-store",
      headers: {
        "user-agent": "Mozilla/5.0 stock-watchlist-bot"
      }
    }
  );

  if (!response.ok) {
    throw new Error(`${stock.symbol}: Yahoo chart returned ${response.status}`);
  }

  const payload = await response.json();
  const result = payload.chart?.result?.[0];
  const quote = result?.indicators?.quote?.[0];

  if (!result || !quote) {
    throw new Error(`${stock.symbol}: missing chart data`);
  }

  const timestamps: number[] = result.timestamp ?? [];
  const opens: Array<number | null> = quote.open ?? [];
  const highs: Array<number | null> = quote.high ?? [];
  const lows: Array<number | null> = quote.low ?? [];
  const closes: Array<number | null> = quote.close ?? [];
  const volumes: Array<number | null> = quote.volume ?? [];

  const validIndexes = closes
    .map((close, index) =>
      close !== null && opens[index] !== null && highs[index] !== null && lows[index] !== null && volumes[index] !== null
        ? index
        : -1
    )
    .filter((index) => index >= 0);

  if (validIndexes.length < 21) {
    throw new Error(`${stock.symbol}: only ${validIndexes.length} valid daily bars`);
  }

  const lastIndex = validIndexes[validIndexes.length - 1];
  const previousIndex = validIndexes[validIndexes.length - 2];
  const closeSeries = validIndexes.map((index) => Number(closes[index]));
  const volumeSeries = validIndexes.map((index) => Number(volumes[index]));
  const avgVolume20 = volumeSeries.slice(-20).filter((volume) => volume > 0).reduce((sum, volume) => sum + volume, 0) /
    volumeSeries.slice(-20).filter((volume) => volume > 0).length;

  const open = Number(opens[lastIndex]);
  const high = Number(highs[lastIndex]);
  const low = Number(lows[lastIndex]);
  const close = Number(closes[lastIndex]);
  const previousClose = Number(closes[previousIndex]);
  const ema10 = ema(closeSeries, 10);
  const ema20 = ema(closeSeries, 20);
  const gainPct = ((close - previousClose) / previousClose) * 100;
  const volPct = avgVolume20 > 0 ? (Number(volumes[lastIndex]) / avgVolume20) * 100 : 0;
  const date = new Date((timestamps[lastIndex] + 19800) * 1000).toISOString().slice(0, 10);

  return {
    stock: stock.name,
    symbol: stock.symbol,
    date,
    open: round(open),
    close: round(close),
    gainPct: round(gainPct),
    volPct: round(volPct, 0),
    ema10: round(ema10),
    ema20: round(ema20),
    above10: close > ema10,
    above20: close > ema20,
    candle: candleType(open, high, low, close),
    verdict: verdict(close, ema10, ema20)
  };
}

function compactLine(row: WatchRow, read: string) {
  return line(row, read);
}

function marketHealth(primerRows: WatchRow[]) {
  const bySymbol = new Map(primerRows.map((row) => [row.symbol, row]));
  const nifty = bySymbol.get("^NSEI");
  const midcap = bySymbol.get("NIFTYMIDCAP150.NS");
  const smallcap = bySymbol.get("NIFTYSMLCAP250.NS");
  const brent = bySymbol.get("BZ=F");
  const vix = bySymbol.get("^INDIAVIX");
  let score = 0;
  const notes: string[] = [];

  for (const row of [nifty, midcap, smallcap]) {
    if (!row) continue;
    if (row.above10 && row.above20) score += 1;
    if (row.gainPct <= -1) score -= 1;
  }

  if (vix) {
    if (vix.close >= 20 || vix.gainPct >= 8) score -= 2;
    else if (vix.close <= 14 && vix.gainPct <= 0) score += 1;
    notes.push(`India VIX ${vix.close.toFixed(2)} (${formatPct(vix.gainPct)})`);
  }

  if (brent) {
    if (brent.gainPct >= 2) score -= 1;
    if (brent.gainPct <= -2) score += 1;
    notes.push(`Brent ${brent.close.toFixed(2)} (${formatPct(brent.gainPct)})`);
  }

  const breadthHealthy = [nifty, midcap, smallcap].filter(Boolean).every((row) => row?.above10 && row?.above20);
  if (breadthHealthy) notes.push("index breadth above 10/20 EMA");
  if ([midcap, smallcap].some((row) => row && (!row.above10 || !row.above20))) notes.push("broader market showing EMA stress");

  if (score >= 3) return `Healthy risk backdrop: indices are supportive, with ${notes.join("; ")}. Fresh risk can be considered selectively with normal position discipline.`;
  if (score >= 1) return `Constructive but selective: ${notes.join("; ")}. Risk is acceptable, but prefer leaders and avoid chasing extended moves.`;
  if (score >= -1) return `Mixed market: ${notes.join("; ")}. Keep position sizing measured and wait for clean setups.`;
  return `Cautious backdrop: ${notes.join("; ")}. Reduce aggression, protect capital, and demand stronger confirmation before new risk.`;
}

function buildStockSections(rows: WatchRow[], failures: string[]) {
  const belowBoth = rows.filter((row) => !row.above10 && !row.above20);
  const lost10 = rows.filter((row) => !row.above10 && row.above20);
  const heavy = rows.filter((row) => row.volPct >= 150);
  const strong = rows.filter((row) => row.gainPct >= 1);
  const weak = rows.filter((row) => row.gainPct <= -1);
  const notableCandles = rows.filter(
    (row) =>
      ["Doji", "Hammer", "Inv hammer/shooting star", "Bear marubozu"].includes(row.candle) &&
      (row.volPct >= 100 || row.verdict !== "Trend intact")
  );

  const watch = rows.filter((row) => row.verdict !== "Trend intact" || row.volPct >= 150 || row.gainPct <= -2);
  const positive = rows.filter((row) => row.verdict === "Trend intact" && row.gainPct > 0 && !watch.includes(row));
  const rest = rows.filter((row) => !watch.includes(row) && !positive.includes(row));

  const readFor = (row: WatchRow) => {
    if (row.verdict === "Below EMAs" && row.volPct >= 150) return "Heavy-volume breakdown";
    if (row.verdict === "Below EMAs") return "Below EMAs";
    if (row.verdict === "Lost 10-EMA") return "Lost 10-EMA";
    if (row.gainPct >= 1 && row.volPct >= 150) return "Strong volume follow-through";
    if (row.gainPct >= 1) return "Trend intact";
    if (row.gainPct <= -1) return "Trend intact but soft";
    return "Trend intact";
  };

  return [
    "*Key flags*",
    `- *Below both EMAs:* ${belowBoth.map((row) => row.stock).join(", ") || "None"}.`,
    `- *Lost 10-EMA:* ${lost10.map((row) => row.stock).join(", ") || "None"}.`,
    `- *Heavy volume >150%:* ${heavy.map((row) => `${row.stock} ${row.volPct}%`).join(", ") || "None"}.`,
    `- *Strong positive closes:* ${strong.map((row) => `${row.stock} ${formatPct(row.gainPct)}`).join(", ") || "None"}.`,
    `- *Weak negative closes:* ${weak.map((row) => `${row.stock} ${formatPct(row.gainPct)}`).join(", ") || "None"}.`,
    `- *Notable candles:* ${notableCandles.map((row) => `${row.stock} ${row.candle}`).join(", ") || "None"}.`,
    failures.length ? `- *Fetch issues:* ${failures.join("; ")}.` : "",
    "",
    "*Watch / caution*",
    ...(watch.length ? watch.map((row) => compactLine(row, readFor(row))) : ["- None"]),
    "",
    "*Positive / holding well*",
    ...(positive.length ? positive.map((row) => compactLine(row, readFor(row))) : ["- None"]),
    "",
    "*Rest of watchlist*",
    ...(rest.length ? rest.map((row) => compactLine(row, readFor(row))) : ["- None"])
  ];
}

function buildSlackMessage(primerRows: WatchRow[], stockRows: WatchRow[], failures: string[], primer: StockInput[]) {
  const date = stockRows[0]?.date ?? primerRows[0]?.date ?? new Date().toISOString().slice(0, 10);
  const primerSymbols = new Set(primer.map((item) => item.symbol));
  const primerFailures = failures.filter((failure) => [...primerSymbols].some((symbol) => failure.includes(symbol)));
  const stockFailures = failures.filter((failure) => !primerFailures.includes(failure));

  const sections = [
    `*NSE Watchlist Summary - ${date}*`,
    "_Mobile format. EMA view._",
    "",
    "*Primer - market health*",
    ...(primerRows.length ? primerRows.map((row) => compactLine(row, row.verdict)) : ["- No primer data available"]),
    primerFailures.length ? `- *Primer fetch issues:* ${primerFailures.join("; ")}.` : "",
    `*Scenario:* ${marketHealth(primerRows)}`,
    "",
    "*Stocks*",
    ...buildStockSections(stockRows, stockFailures),
    "",
    "*Read:* This is technical tracking from latest available daily OHLCV data. During market hours, price may reflect the current daily candle/latest traded value from the data source. Not financial advice."
  ];

  return sections.filter((section) => section !== "").join("\n");
}

export async function GET(request: Request) {
  const { primer, stocks } = normalizeRequest(request);
  const primerResults = await Promise.allSettled(primer.map((stock) => fetchRow(stock)));
  const stockResults = await Promise.allSettled(stocks.map((stock) => fetchRow(stock)));
  const results = [...primerResults, ...stockResults];
  const primerRows = primerResults
    .filter((result): result is PromiseFulfilledResult<WatchRow> => result.status === "fulfilled")
    .map((result) => result.value);
  const rows = results
    .filter((result): result is PromiseFulfilledResult<WatchRow> => result.status === "fulfilled")
    .map((result) => result.value);
  const stockRows = stockResults
    .filter((result): result is PromiseFulfilledResult<WatchRow> => result.status === "fulfilled")
    .map((result) => result.value);
  const failures = results
    .filter((result): result is PromiseRejectedResult => result.status === "rejected")
    .map((result) => result.reason instanceof Error ? result.reason.message : String(result.reason));

  if (!rows.length || !stockRows.length) {
    return NextResponse.json({ error: "No market data rows could be fetched", failures }, { status: 502 });
  }

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    primerRows,
    rows: stockRows,
    failures,
    slackMessage: buildSlackMessage(primerRows, stockRows, failures, primer)
  });
}
