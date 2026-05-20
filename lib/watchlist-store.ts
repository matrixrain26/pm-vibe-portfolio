import { del, list, put } from "@vercel/blob";
import { promises as fs } from "fs";
import path from "path";

export type WatchlistConfig = {
  primer: string[];
  stocks: string[];
  updatedAt?: string;
};

export type WatchlistSource = "blob" | "local" | "default";

export type StoredWatchlist = WatchlistConfig & {
  source: WatchlistSource;
};

const BLOB_NAME = "nse-watchlist.json";
const LOCAL_PATH = path.join(process.cwd(), "data", "nse-watchlist.local.json");

export const defaultWatchlist: WatchlistConfig = {
  primer: ["nifty50", "cnxsmallcap", "cnxmidcap", "brent", "indiavix"],
  stocks: [
    "Jiofin",
    "gmrairport",
    "paytm",
    "hyndaimotors",
    "irfc",
    "biocon",
    "glenmark",
    "rblbank",
    "bandhan bank",
    "tata motors passenger vehicle (tmpv)",
    "360 one wam",
    "AB Capital",
    "United Spirits",
    "Motherson",
    "Delhivery"
  ]
};

function hasBlobToken() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function cleanList(items: unknown) {
  if (!Array.isArray(items)) return [];
  const seen = new Set<string>();
  const cleaned: string[] = [];

  for (const item of items) {
    if (typeof item !== "string") continue;
    const value = item.trim();
    const key = value.toLowerCase();
    if (!value || seen.has(key)) continue;
    seen.add(key);
    cleaned.push(value);
  }

  return cleaned;
}

export function normalizeWatchlist(input: Partial<WatchlistConfig>): WatchlistConfig {
  const primer = cleanList(input.primer);
  const stocks = cleanList(input.stocks);

  return {
    primer: primer.length ? primer : defaultWatchlist.primer,
    stocks: stocks.length ? stocks : defaultWatchlist.stocks,
    updatedAt: input.updatedAt || new Date().toISOString()
  };
}

export function watchlistToCanvasMarkdown(watchlist: WatchlistConfig) {
  return [
    "# Live Tracking",
    "",
    "**Primer**",
    "",
    ...watchlist.primer.flatMap((item) => [item, ""]),
    "**Stocks**",
    "",
    ...watchlist.stocks.flatMap((item) => [item, ""])
  ].join("\n").trim();
}

export async function getWatchlist(): Promise<StoredWatchlist> {
  if (hasBlobToken()) {
    const blobs = await list({ prefix: "nse-watchlist", limit: 100 });
    const blob =
      blobs.blobs.find((item) => item.pathname === BLOB_NAME) ||
      blobs.blobs.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime())[0];

    if (blob) {
      const watchlistUrl = new URL(blob.url);
      watchlistUrl.searchParams.set("v", String(blob.uploadedAt.getTime()));
      const response = await fetch(watchlistUrl, { cache: "no-store" });
      if (response.ok) {
        return { ...normalizeWatchlist(await response.json()), source: "blob" };
      }
    }
  }

  try {
    const file = await fs.readFile(LOCAL_PATH, "utf8");
    return { ...normalizeWatchlist(JSON.parse(file)), source: "local" };
  } catch {
    return { ...defaultWatchlist, source: "default" };
  }
}

export async function saveWatchlist(input: WatchlistConfig): Promise<WatchlistConfig> {
  const watchlist = normalizeWatchlist({ ...input, updatedAt: new Date().toISOString() });

  if (hasBlobToken()) {
    const existing = await list({ prefix: "nse-watchlist", limit: 100 });
    await Promise.all(existing.blobs.map((blob) => del(blob.url)));
    await put(BLOB_NAME, JSON.stringify(watchlist, null, 2), {
      access: "public",
      addRandomSuffix: false,
      cacheControlMaxAge: 0,
      contentType: "application/json"
    });
    return watchlist;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("Vercel Blob is not configured. Add BLOB_READ_WRITE_TOKEN to enable watchlist edits.");
  }

  await fs.mkdir(path.dirname(LOCAL_PATH), { recursive: true });
  await fs.writeFile(LOCAL_PATH, JSON.stringify(watchlist, null, 2));
  return watchlist;
}
