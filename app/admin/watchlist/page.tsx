import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { getWatchlist } from "@/lib/watchlist-store";
import WatchlistEditor from "./ui";

export default async function AdminWatchlistPage() {
  const authenticated = await isAuthenticated();

  if (!authenticated) {
    redirect("/admin/login");
  }

  const watchlist = await getWatchlist();
  return <WatchlistEditor initialWatchlist={watchlist} />;
}
