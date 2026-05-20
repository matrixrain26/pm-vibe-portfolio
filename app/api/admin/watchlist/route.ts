import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getWatchlist, saveWatchlist, watchlistToCanvasMarkdown } from "@/lib/watchlist-store";
import type { WatchlistConfig } from "@/lib/watchlist-store";

async function slackApi(method: string, body: Record<string, unknown>) {
  const token = process.env.SLACK_BOT_TOKEN;
  if (!token) throw new Error("SLACK_BOT_TOKEN is not configured.");

  const response = await fetch(`https://slack.com/api/${method}`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json; charset=utf-8"
    },
    body: JSON.stringify(body)
  });
  const payload = (await response.json()) as { ok: boolean; error?: string };
  if (!payload.ok) throw new Error(`${method}: ${payload.error ?? "unknown Slack API error"}`);
  return payload;
}

async function mirrorCanvas(watchlist: WatchlistConfig) {
  const canvasId = process.env.SLACK_CANVAS_ID;
  if (!canvasId || !process.env.SLACK_BOT_TOKEN) return "Slack Canvas mirror skipped; Slack env vars are not fully configured.";

  try {
    await slackApi("canvases.edit", {
      canvas_id: canvasId,
      changes: [
        {
          operation: "replace",
          document_content: {
            type: "markdown",
            markdown: watchlistToCanvasMarkdown(watchlist)
          }
        }
      ]
    });
    return "Slack Canvas mirror updated.";
  } catch (error) {
    return `Saved in Vercel, but Slack Canvas mirror did not update: ${error instanceof Error ? error.message : String(error)}`;
  }
}

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(await getWatchlist());
}

export async function PUT(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const watchlist = (await request.json()) as WatchlistConfig;
  try {
    const saved = await saveWatchlist(watchlist);
    const mirrorMessage = await mirrorCanvas(saved);
    return NextResponse.json({ ok: true, watchlist: saved, mirrorMessage });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save watchlist";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
