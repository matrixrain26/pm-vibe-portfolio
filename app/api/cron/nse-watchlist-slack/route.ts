import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const DEFAULT_CANVAS_ID = "F0AFV8GC9H6";
const DEFAULT_SLACK_CHANNEL = "U038M743PJA";
const DEFAULT_SLACK_DM_CHANNEL = "D039HKCH7UY";
const DEFAULT_PRIMER = "nifty50,cnxsmallcap,cnxmidcap,brent,indiavix";
const DEFAULT_STOCKS = [
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
].join(",");

type SlackApiResponse<T> = T & {
  ok: boolean;
  error?: string;
};

type Watchlist = {
  primer: string[];
  stocks: string[];
  source: "canvas" | "env-fallback";
};

function todayInIndia() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());
}

function splitList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseCanvasMarkdown(markdown: string): Watchlist | null {
  const lines = markdown
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const primer: string[] = [];
  const stocks: string[] = [];
  let section: "primer" | "stocks" | null = null;

  for (const line of lines) {
    const normalized = line.replace(/^#+\s*/, "").replace(/\*/g, "").trim().toLowerCase();
    if (normalized === "primer") {
      section = "primer";
      continue;
    }
    if (normalized === "stocks") {
      section = "stocks";
      continue;
    }
    if (!section || normalized === "live tracking") continue;
    if (section === "primer") primer.push(line);
    if (section === "stocks") stocks.push(line);
  }

  const dedupe = (items: string[]) => [...new Set(items)];
  const dedupedPrimer = dedupe(primer);
  const dedupedStocks = dedupe(stocks);

  if (!dedupedPrimer.length || !dedupedStocks.length) return null;
  return { primer: dedupedPrimer, stocks: dedupedStocks, source: "canvas" };
}

async function slackApi<T>(method: string, token: string, body: Record<string, unknown>) {
  const response = await fetch(`https://slack.com/api/${method}`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json; charset=utf-8"
    },
    body: JSON.stringify(body)
  });
  const payload = (await response.json()) as SlackApiResponse<T>;
  if (!payload.ok) {
    throw new Error(`${method}: ${payload.error ?? "unknown Slack API error"}`);
  }
  return payload;
}

async function readCanvasMarkdown(token: string, canvasId: string) {
  const info = await slackApi<{
    file?: {
      preview?: string;
      plain_text?: string;
      editable?: boolean;
      url_private?: string;
      url_private_download?: string;
    };
  }>("files.info", token, { file: canvasId });

  const file = info.file;
  const inline = file?.plain_text ?? file?.preview;
  if (inline?.trim()) return inline;

  const url = file?.url_private_download ?? file?.url_private;
  if (!url) return null;

  const response = await fetch(url, {
    headers: { authorization: `Bearer ${token}` }
  });
  if (!response.ok) return null;

  const contentType = response.headers.get("content-type") ?? "";
  const body = await response.text();
  if (contentType.includes("text") || body.includes("**Primer**") || body.includes("Primer")) {
    return body;
  }

  return null;
}

async function loadWatchlist(): Promise<Watchlist> {
  const token = process.env.SLACK_BOT_TOKEN;
  const canvasId = process.env.SLACK_CANVAS_ID ?? DEFAULT_CANVAS_ID;

  if (token) {
    const markdown = await readCanvasMarkdown(token, canvasId);
    const parsed = markdown ? parseCanvasMarkdown(markdown) : null;
    if (parsed) return parsed;
  }

  return {
    primer: splitList(process.env.WATCHLIST_PRIMER ?? DEFAULT_PRIMER),
    stocks: splitList(process.env.WATCHLIST_STOCKS ?? DEFAULT_STOCKS),
    source: "env-fallback"
  };
}

async function alreadySent(token: string, date: string) {
  const channel = process.env.SLACK_DM_CHANNEL_ID ?? DEFAULT_SLACK_DM_CHANNEL;
  const history = await slackApi<{
    messages?: Array<{ text?: string }>;
  }>("conversations.history", token, { channel, limit: 20 });

  return Boolean(history.messages?.some((message) => message.text?.includes(`NSE Watchlist Summary - ${date}`)));
}

async function postSlackMessage(token: string, text: string) {
  const channel = process.env.SLACK_CHANNEL_ID ?? DEFAULT_SLACK_CHANNEL;
  await slackApi("chat.postMessage", token, {
    channel,
    text,
    mrkdwn: true,
    unfurl_links: false,
    unfurl_media: false
  });
}

export async function GET(request: Request) {
  const expectedSecret = process.env.CRON_SECRET;
  if (expectedSecret && request.headers.get("authorization") !== `Bearer ${expectedSecret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const token = process.env.SLACK_BOT_TOKEN;
  if (!token) {
    return NextResponse.json(
      { ok: false, error: "Missing SLACK_BOT_TOKEN; Vercel Cron cannot post to Slack yet." },
      { status: 500 }
    );
  }

  const date = todayInIndia();
  if (await alreadySent(token, date)) {
    return NextResponse.json({ ok: true, skipped: "already_sent", date });
  }

  const watchlist = await loadWatchlist();
  const params = new URLSearchParams({
    primer: watchlist.primer.join(","),
    stocks: watchlist.stocks.join(",")
  });
  const origin = new URL(request.url).origin;
  const summaryResponse = await fetch(`${origin}/api/nse-watchlist?${params.toString()}`);

  if (!summaryResponse.ok) {
    const body = await summaryResponse.text();
    throw new Error(`nse-watchlist failed ${summaryResponse.status}: ${body}`);
  }

  const summary = (await summaryResponse.json()) as { slackMessage?: string };
  if (!summary.slackMessage) throw new Error("nse-watchlist response did not include slackMessage");

  await postSlackMessage(token, summary.slackMessage);
  return NextResponse.json({ ok: true, date, source: watchlist.source });
}
