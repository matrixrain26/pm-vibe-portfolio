import { del, list, put } from "@vercel/blob";
import { promises as fs } from "fs";
import path from "path";
import { defaultContent } from "./default-content";
import type { SiteContent } from "./types";

const BLOB_NAME = "site-content.json";
const LOCAL_PATH = path.join(process.cwd(), "data", "site-content.local.json");

function hasBlobToken() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function mergeContent(content: Partial<SiteContent>): SiteContent {
  return {
    ...defaultContent,
    ...content,
    navigation: { ...defaultContent.navigation, ...content.navigation },
    profile: { ...defaultContent.profile, ...content.profile },
    hero: { ...defaultContent.hero, ...content.hero },
    about: { ...defaultContent.about, ...content.about },
    interestsIntro: { ...defaultContent.interestsIntro, ...content.interestsIntro },
    projectsIntro: { ...defaultContent.projectsIntro, ...content.projectsIntro },
    blogIntro: { ...defaultContent.blogIntro, ...content.blogIntro },
    contact: { ...defaultContent.contact, ...content.contact }
  };
}

export async function getSiteContent(): Promise<SiteContent> {
  if (hasBlobToken()) {
    const blobs = await list({ prefix: "site-content", limit: 100 });
    const blob =
      blobs.blobs.find((item) => item.pathname === BLOB_NAME) ||
      blobs.blobs.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime())[0];

    if (blob) {
      const contentUrl = new URL(blob.url);
      contentUrl.searchParams.set("v", String(blob.uploadedAt.getTime()));
      const response = await fetch(contentUrl, { cache: "no-store" });
      if (response.ok) {
        return mergeContent(await response.json());
      }
    }
  }

  try {
    const file = await fs.readFile(LOCAL_PATH, "utf8");
    return mergeContent(JSON.parse(file));
  } catch {
    return defaultContent;
  }
}

export async function saveSiteContent(content: SiteContent) {
  if (hasBlobToken()) {
    const existing = await list({ prefix: "site-content", limit: 100 });
    await Promise.all(existing.blobs.map((blob) => del(blob.url)));
    await put(BLOB_NAME, JSON.stringify(content, null, 2), {
      access: "public",
      addRandomSuffix: false,
      cacheControlMaxAge: 0,
      contentType: "application/json"
    });
    return;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("Vercel Blob is not configured. Add BLOB_READ_WRITE_TOKEN to enable live content edits.");
  }

  await fs.mkdir(path.dirname(LOCAL_PATH), { recursive: true });
  await fs.writeFile(LOCAL_PATH, JSON.stringify(content, null, 2));
}
