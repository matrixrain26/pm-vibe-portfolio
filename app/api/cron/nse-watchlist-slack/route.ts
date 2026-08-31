import { NextResponse } from "next/server";
import { getWatchlist } from "@/lib/watchlist-store";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const DEFAULT_SLACK_CHANNEL = "U038M743PJA";
const DEFAULT_SLACK_DM_CHANNEL = "D039HKCH7UY";
type SlackApiResponse<T> = T & {
  ok: boolean;
  error?: string;
};

function todayInIndia() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());
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

async function alreadySent(token: string, date: string) {
  const channel = process.env.SLACK_DM_CHANNEL_ID ?? DEFAULT_SLACK_DM_CHANNEL;
  try {
    const history = await slackApi<{
      messages?: Array<{ text?: string }>;
    }>("conversations.history", token, { channel, limit: 20 });

    return Boolean(history.messages?.some((message) => message.text?.includes(`NSE Watchlist Summary - ${date}`)));
  } catch {
    return false;
  }
}

function summaryDate(text: string) {
  return text.match(/NSE Watchlist Summary - (\d{4}-\d{2}-\d{2})/)?.[1] ?? todayInIndia();
}

async function testSlackAuth(token: string) {
  return slackApi<{ team?: string; user?: string; bot_id?: string }>("auth.test", token, {});
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
  try {
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

    const url = new URL(request.url);
    const dryRun = url.searchParams.get("dryRun") === "1";
    const includeMessage = url.searchParams.get("includeMessage") === "1";
    const date = todayInIndia();
    const auth = dryRun ? await testSlackAuth(token) : null;
    console.log("nse-watchlist-cron:start", { date, dryRun });

    const watchlist = await getWatchlist();
    const params = new URLSearchParams({
      primer: watchlist.primer.join(","),
      stocks: watchlist.stocks.join(",")
    });
    const origin = url.origin;
    const summaryResponse = await fetch(`${origin}/api/nse-watchlist?${params.toString()}`);

    if (!summaryResponse.ok) {
      const body = await summaryResponse.text();
      throw new Error(`nse-watchlist failed ${summaryResponse.status}: ${body}`);
    }

    const summary = (await summaryResponse.json()) as { slackMessage?: string };
    if (!summary.slackMessage) throw new Error("nse-watchlist response did not include slackMessage");
    const marketDate = summaryDate(summary.slackMessage);

    if (dryRun) {
      return NextResponse.json({
        ok: true,
        dryRun,
        date,
        marketDate,
        source: watchlist.source,
        slackAuth: {
          team: auth?.team,
          user: auth?.user,
          bot_id: auth?.bot_id
        },
        summaryBytes: summary.slackMessage.length,
        ...(includeMessage ? { slackMessage: summary.slackMessage } : {})
      });
    }

    if (await alreadySent(token, marketDate)) {
      console.log("nse-watchlist-cron:skip-duplicate", { date, marketDate, source: watchlist.source });
      return NextResponse.json({ ok: true, skipped: "already_sent", date, marketDate });
    }

    await postSlackMessage(token, summary.slackMessage);
    console.log("nse-watchlist-cron:sent", { date, marketDate, source: watchlist.source });
    return NextResponse.json({ ok: true, date, marketDate, source: watchlist.source });
  } catch (error) {
    console.error("nse-watchlist-cron:error", error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
