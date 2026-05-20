"use client";

import { ArrowLeft, RefreshCw, Save } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { StoredWatchlist, WatchlistConfig } from "@/lib/watchlist-store";

type Props = {
  initialWatchlist: StoredWatchlist;
};

function listToText(items: string[]) {
  return items.join("\n");
}

function textToList(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function WatchlistEditor({ initialWatchlist }: Props) {
  const [primer, setPrimer] = useState(listToText(initialWatchlist.primer));
  const [stocks, setStocks] = useState(listToText(initialWatchlist.stocks));
  const [source, setSource] = useState(initialWatchlist.source);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    setMessage("Saving...");
    const payload: WatchlistConfig = {
      primer: textToList(primer),
      stocks: textToList(stocks)
    };

    const response = await fetch("/api/admin/watchlist", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const result = await response.json().catch(() => ({ error: "Save failed." }));
    setSaving(false);

    if (!response.ok) {
      setMessage(result.error || "Save failed.");
      return;
    }

    setPrimer(listToText(result.watchlist.primer));
    setStocks(listToText(result.watchlist.stocks));
    setSource("blob");
    setMessage(result.mirrorMessage || "Saved. The 3:30 PM cron will use this list.");
  }

  async function reload() {
    setMessage("Refreshing...");
    const response = await fetch("/api/admin/watchlist", { cache: "no-store" });
    const result = await response.json().catch(() => ({ error: "Refresh failed." }));

    if (!response.ok) {
      setMessage(result.error || "Refresh failed.");
      return;
    }

    setPrimer(listToText(result.primer));
    setStocks(listToText(result.stocks));
    setSource(result.source);
    setMessage("Loaded latest saved watchlist.");
  }

  return (
    <main className="admin-page">
      <div className="admin-title-row">
        <div>
          <p className="eyebrow">Admin</p>
          <h1>NSE Watchlist</h1>
          <p>This saved list is what the Vercel 3:30 PM IST Slack cron reads.</p>
        </div>
        <Link className="button" href="/admin">
          <ArrowLeft size={17} /> Content
        </Link>
      </div>

      <section className="admin-card">
        <div className="watchlist-meta">
          <span>Source: {source}</span>
          <span>Primer: {textToList(primer).length}</span>
          <span>Stocks: {textToList(stocks).length}</span>
        </div>
        <div className="admin-grid">
          <div className="field full">
            <label>Primer, one per line</label>
            <textarea className="watchlist-textarea" value={primer} onChange={(event) => setPrimer(event.target.value)} />
          </div>
          <div className="field full">
            <label>Stocks, one per line</label>
            <textarea className="watchlist-textarea stocks" value={stocks} onChange={(event) => setStocks(event.target.value)} />
          </div>
        </div>
      </section>

      <div className="admin-actions">
        <button className="button" type="button" onClick={reload}>
          <RefreshCw size={17} /> Refresh
        </button>
        <button className="button primary" type="button" onClick={save} disabled={saving}>
          <Save size={17} /> {saving ? "Saving..." : "Save watchlist"}
        </button>
      </div>
      {message ? <p className="message">{message}</p> : null}
    </main>
  );
}
