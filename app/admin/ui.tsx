"use client";

import { LineChart, LogOut, Plus, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { SiteContent } from "@/lib/types";

type Props = {
  initialContent: SiteContent;
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

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function AdminEditor({ initialContent }: Props) {
  const [content, setContent] = useState(initialContent);
  const [message, setMessage] = useState("");

  async function save() {
    setMessage("Saving...");
    const response = await fetch("/api/admin/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(content)
    });
    if (response.ok) {
      setMessage("Saved. Your public site is updated.");
      return;
    }

    const result = await response.json().catch(() => ({ error: "Save failed." }));
    setMessage(result.error || "Save failed.");
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/";
  }

  return (
    <main className="admin-page">
      <p className="eyebrow">Admin</p>
      <h1>Content Studio</h1>
      <p>Edit every public section of the site. On Vercel, the same JSON content is stored in Vercel Blob.</p>
      <div className="admin-actions start">
        <Link className="button" href="/admin/watchlist">
          <LineChart size={17} /> NSE watchlist
        </Link>
      </div>

      <section className="admin-card">
        <h3>Navigation</h3>
        <div className="admin-grid">
          <Field label="Home label" value={content.navigation.home} onChange={(value) => setContent({ ...content, navigation: { ...content.navigation, home: value } })} />
          <Field label="About label" value={content.navigation.about} onChange={(value) => setContent({ ...content, navigation: { ...content.navigation, about: value } })} />
          <Field label="Interests label" value={content.navigation.interests} onChange={(value) => setContent({ ...content, navigation: { ...content.navigation, interests: value } })} />
          <Field label="Projects label" value={content.navigation.projects} onChange={(value) => setContent({ ...content, navigation: { ...content.navigation, projects: value } })} />
          <Field label="Blog label" value={content.navigation.blog} onChange={(value) => setContent({ ...content, navigation: { ...content.navigation, blog: value } })} />
          <Field label="Contact label" value={content.navigation.contact} onChange={(value) => setContent({ ...content, navigation: { ...content.navigation, contact: value } })} />
          <Field label="Admin label" value={content.navigation.admin} onChange={(value) => setContent({ ...content, navigation: { ...content.navigation, admin: value } })} />
        </div>
      </section>

      <section className="admin-card">
        <h3>Profile</h3>
        <div className="admin-grid">
          <Field label="Name" value={content.profile.name} onChange={(value) => setContent({ ...content, profile: { ...content.profile, name: value } })} />
          <Field label="Role" value={content.profile.role} onChange={(value) => setContent({ ...content, profile: { ...content.profile, role: value } })} />
          <Field label="Location" value={content.profile.location} onChange={(value) => setContent({ ...content, profile: { ...content.profile, location: value } })} />
          <Field label="Email" value={content.profile.email} onChange={(value) => setContent({ ...content, profile: { ...content.profile, email: value } })} />
          <Field label="LinkedIn" value={content.profile.linkedin} onChange={(value) => setContent({ ...content, profile: { ...content.profile, linkedin: value } })} />
          <Field label="Resume URL" value={content.profile.resumeUrl} onChange={(value) => setContent({ ...content, profile: { ...content.profile, resumeUrl: value } })} />
          <Field area full label="Headline" value={content.profile.headline} onChange={(value) => setContent({ ...content, profile: { ...content.profile, headline: value } })} />
          <Field area full label="Intro" value={content.profile.intro} onChange={(value) => setContent({ ...content, profile: { ...content.profile, intro: value } })} />
        </div>
      </section>

      <section className="admin-card">
        <h3>Home Panel And CTAs</h3>
        <div className="admin-grid">
          <Field label="Primary CTA" value={content.hero.primaryCta} onChange={(value) => setContent({ ...content, hero: { ...content.hero, primaryCta: value } })} />
          <Field label="Secondary CTA" value={content.hero.secondaryCta} onChange={(value) => setContent({ ...content, hero: { ...content.hero, secondaryCta: value } })} />
          <Field label="Resume CTA" value={content.hero.resumeCta} onChange={(value) => setContent({ ...content, hero: { ...content.hero, resumeCta: value } })} />
          <Field label="Panel eyebrow" value={content.hero.signalEyebrow} onChange={(value) => setContent({ ...content, hero: { ...content.hero, signalEyebrow: value } })} />
          <Field area full label="Panel title" value={content.hero.signalTitle} onChange={(value) => setContent({ ...content, hero: { ...content.hero, signalTitle: value } })} />
          <Field area full label="Panel body" value={content.hero.signalBody} onChange={(value) => setContent({ ...content, hero: { ...content.hero, signalBody: value } })} />
        </div>
        {content.hero.metrics.map((metric, index) => (
          <div className="editor-block" key={`${metric.value}-${index}`}>
            <div className="admin-grid">
              <Field label="Metric value" value={metric.value} onChange={(value) => updateMetric(index, { ...metric, value })} />
              <Field label="Metric label" value={metric.label} onChange={(value) => updateMetric(index, { ...metric, label: value })} />
            </div>
            <button className="button" type="button" onClick={() => setContent({ ...content, hero: { ...content.hero, metrics: content.hero.metrics.filter((_, itemIndex) => itemIndex !== index) } })}>
              <Trash2 size={17} /> Remove
            </button>
          </div>
        ))}
        <button
          className="button"
          type="button"
          onClick={() => setContent({ ...content, hero: { ...content.hero, metrics: [...content.hero.metrics, { value: "New", label: "Metric label" }] } })}
        >
          <Plus size={17} /> Add metric
        </button>
      </section>

      <section className="admin-card">
        <h3>About</h3>
        <div className="admin-grid">
          <Field label="Eyebrow" value={content.about.eyebrow} onChange={(value) => setContent({ ...content, about: { ...content.about, eyebrow: value } })} />
          <Field label="Title" value={content.about.title} onChange={(value) => setContent({ ...content, about: { ...content.about, title: value } })} />
          <Field label="Highlight label" value={content.about.highlightLabel} onChange={(value) => setContent({ ...content, about: { ...content.about, highlightLabel: value } })} />
          <Field area full label="Pitch" value={content.about.pitch} onChange={(value) => setContent({ ...content, about: { ...content.about, pitch: value } })} />
          <Field
            area
            full
            label="Highlights, one per line"
            value={listToText(content.about.highlights)}
            onChange={(value) => setContent({ ...content, about: { ...content.about, highlights: textToList(value) } })}
          />
        </div>
      </section>

      <section className="admin-card">
        <h3>Interests</h3>
        <div className="admin-grid">
          <Field label="Eyebrow" value={content.interestsIntro.eyebrow} onChange={(value) => setContent({ ...content, interestsIntro: { ...content.interestsIntro, eyebrow: value } })} />
          <Field label="Title" value={content.interestsIntro.title} onChange={(value) => setContent({ ...content, interestsIntro: { ...content.interestsIntro, title: value } })} />
          <Field area full label="Description" value={content.interestsIntro.description} onChange={(value) => setContent({ ...content, interestsIntro: { ...content.interestsIntro, description: value } })} />
        </div>
        <Field
          area
          full
          label="One per line"
          value={listToText(content.interests)}
          onChange={(value) => setContent({ ...content, interests: textToList(value) })}
        />
      </section>

      <section className="admin-card">
        <h3>Projects</h3>
        <div className="admin-grid">
          <Field label="Eyebrow" value={content.projectsIntro.eyebrow} onChange={(value) => setContent({ ...content, projectsIntro: { ...content.projectsIntro, eyebrow: value } })} />
          <Field label="Title" value={content.projectsIntro.title} onChange={(value) => setContent({ ...content, projectsIntro: { ...content.projectsIntro, title: value } })} />
          <Field area full label="Description" value={content.projectsIntro.description} onChange={(value) => setContent({ ...content, projectsIntro: { ...content.projectsIntro, description: value } })} />
        </div>
        {content.projects.map((project, index) => (
          <div className="editor-block" key={`${project.title}-${index}`}>
            <div className="admin-grid">
              <Field label="Title" value={project.title} onChange={(value) => updateProject(index, { ...project, title: value })} />
              <Field label="Tags, comma-separated" value={project.tags.join(", ")} onChange={(value) => updateProject(index, { ...project, tags: value.split(",").map((tag) => tag.trim()).filter(Boolean) })} />
              <Field area full label="Summary" value={project.summary} onChange={(value) => updateProject(index, { ...project, summary: value })} />
              <Field area full label="Outcome" value={project.outcome} onChange={(value) => updateProject(index, { ...project, outcome: value })} />
            </div>
            <button className="button" type="button" onClick={() => setContent({ ...content, projects: content.projects.filter((_, itemIndex) => itemIndex !== index) })}>
              <Trash2 size={17} /> Remove
            </button>
          </div>
        ))}
        <button
          className="button"
          type="button"
          onClick={() => setContent({ ...content, projects: [...content.projects, { title: "New Project", summary: "", outcome: "", tags: ["PM"] }] })}
        >
          <Plus size={17} /> Add project
        </button>
      </section>

      <section className="admin-card">
        <h3>Blog</h3>
        <div className="admin-grid">
          <Field label="Eyebrow" value={content.blogIntro.eyebrow} onChange={(value) => setContent({ ...content, blogIntro: { ...content.blogIntro, eyebrow: value } })} />
          <Field label="Title" value={content.blogIntro.title} onChange={(value) => setContent({ ...content, blogIntro: { ...content.blogIntro, title: value } })} />
          <Field area full label="Description" value={content.blogIntro.description} onChange={(value) => setContent({ ...content, blogIntro: { ...content.blogIntro, description: value } })} />
        </div>
        {content.blog.map((post, index) => (
          <div className="editor-block" key={`${post.title}-${index}`}>
            <div className="admin-grid">
              <Field label="Title" value={post.title} onChange={(value) => updatePost(index, { ...post, title: value })} />
              <Field label="Slug" value={post.slug} onChange={(value) => updatePost(index, { ...post, slug: slugify(value) })} />
              <Field label="Date" value={post.date} onChange={(value) => updatePost(index, { ...post, date: value })} />
              <Field area full label="Summary" value={post.summary} onChange={(value) => updatePost(index, { ...post, summary: value })} />
              <Field area full label="Full post body" value={post.body} onChange={(value) => updatePost(index, { ...post, body: value })} />
            </div>
            <button className="button" type="button" onClick={() => setContent({ ...content, blog: content.blog.filter((_, itemIndex) => itemIndex !== index) })}>
              <Trash2 size={17} /> Remove
            </button>
          </div>
        ))}
        <button
          className="button"
          type="button"
          onClick={() => setContent({ ...content, blog: [...content.blog, { slug: "new-post", title: "New Post", date: new Date().toISOString().slice(0, 10), summary: "", body: "" }] })}
        >
          <Plus size={17} /> Add post
        </button>
      </section>

      <section className="admin-card">
        <h3>Contact</h3>
        <div className="admin-grid">
          <Field label="Eyebrow" value={content.contact.eyebrow} onChange={(value) => setContent({ ...content, contact: { ...content.contact, eyebrow: value } })} />
          <Field label="Title" value={content.contact.title} onChange={(value) => setContent({ ...content, contact: { ...content.contact, title: value } })} />
          <Field area full label="Contact note" value={content.contact.note} onChange={(value) => setContent({ ...content, contact: { ...content.contact, note: value } })} />
          <Field label="Availability" value={content.contact.availability} onChange={(value) => setContent({ ...content, contact: { ...content.contact, availability: value } })} />
        </div>
      </section>

      <div className="admin-actions">
        <button className="button" type="button" onClick={logout}>
          <LogOut size={17} /> Log out
        </button>
        <button className="button primary" type="button" onClick={save}>
          <Save size={17} /> Save changes
        </button>
      </div>
      {message ? <p className="message">{message}</p> : null}
    </main>
  );

  function updateProject(index: number, project: SiteContent["projects"][number]) {
    setContent({
      ...content,
      projects: content.projects.map((item, itemIndex) => (itemIndex === index ? project : item))
    });
  }

  function updateMetric(index: number, metric: SiteContent["hero"]["metrics"][number]) {
    setContent({
      ...content,
      hero: {
        ...content.hero,
        metrics: content.hero.metrics.map((item, itemIndex) => (itemIndex === index ? metric : item))
      }
    });
  }

  function updatePost(index: number, post: SiteContent["blog"][number]) {
    setContent({
      ...content,
      blog: content.blog.map((item, itemIndex) => (itemIndex === index ? post : item))
    });
  }
}

function Field({
  area,
  full,
  label,
  onChange,
  value
}: {
  area?: boolean;
  full?: boolean;
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <div className={`field ${full ? "full" : ""}`}>
      <label>{label}</label>
      {area ? (
        <textarea value={value} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <input value={value} onChange={(event) => onChange(event.target.value)} />
      )}
    </div>
  );
}
