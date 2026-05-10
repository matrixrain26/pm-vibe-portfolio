import { ArrowUpRight, Mail, Sparkles } from "lucide-react";
import { getSiteContent } from "@/lib/content-store";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const sectionIds = ["home", "about", "interests", "projects", "blog", "contact"] as const;

export default async function HomePage() {
  const content = await getSiteContent();
  const { profile } = content;
  const nav = sectionIds.map((id) => ({ id, label: content.navigation[id] }));

  return (
    <main className="site-shell">
      <header className="topbar">
        <a className="brand" href="#home" aria-label="Home">
          <span className="brand-mark">{profile.name.slice(0, 1)}</span>
          <span>{profile.name}</span>
        </a>
        <nav className="nav" aria-label="Primary navigation">
          {nav.map((item) => (
            <a key={item.id} href={`#${item.id}`}>
              {item.label}
            </a>
          ))}
          <a className="admin-link" href="/admin">
            {content.navigation.admin}
          </a>
        </nav>
      </header>

      <section className="hero" id="home">
        <div>
          <p className="eyebrow">{profile.role} / {profile.location}</p>
          <h1>{profile.name}</h1>
          <div className="hero-copy">
            <h3>{profile.headline}</h3>
            <p>{profile.intro}</p>
          </div>
          <div className="hero-actions">
            <a className="button primary" href="#projects">
              <Sparkles size={17} /> {content.hero.primaryCta}
            </a>
            <a className="button" href={`mailto:${profile.email}`}>
              <Mail size={17} /> {content.hero.secondaryCta}
            </a>
            <a className="button" href={profile.resumeUrl}>
              {content.hero.resumeCta} <ArrowUpRight size={17} />
            </a>
          </div>
        </div>
        <aside className="signal-panel" aria-label="Portfolio signal summary">
          <p className="eyebrow">{content.hero.signalEyebrow}</p>
          <h3>{content.hero.signalTitle}</h3>
          <p>{content.hero.signalBody}</p>
          <div className="signal-grid">
            {content.hero.metrics.map((metric) => (
              <div className="metric" key={`${metric.value}-${metric.label}`}>
                <strong>{metric.value}</strong>
                <span>{metric.label}</span>
              </div>
            ))}
          </div>
        </aside>
      </section>

      <section className="section two-col" id="about">
        <div>
          <p className="eyebrow">{content.about.eyebrow}</p>
          <h2>{content.about.title}</h2>
        </div>
        <div>
          <p>{content.about.pitch}</p>
          <div className="about-lines">
            {content.about.highlights.map((item) => (
              <div className="line-item" key={item}>
                <strong>{content.about.highlightLabel}</strong>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="interests">
        <div className="section-head">
          <div>
            <p className="eyebrow">{content.interestsIntro.eyebrow}</p>
            <h2>{content.interestsIntro.title}</h2>
          </div>
          <p>{content.interestsIntro.description}</p>
        </div>
        <div className="interest-list">
          {content.interests.map((interest, index) => (
            <div className="interest-item" key={interest}>
              <strong>{String(index + 1).padStart(2, "0")}</strong>
              <span>{interest}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="section" id="projects">
        <div className="section-head">
          <div>
            <p className="eyebrow">{content.projectsIntro.eyebrow}</p>
            <h2>{content.projectsIntro.title}</h2>
          </div>
          <p>{content.projectsIntro.description}</p>
        </div>
        <div className="project-grid">
          {content.projects.map((project) => (
            <article className="project-card" key={project.title}>
              <h3>{project.title}</h3>
              <p>{project.summary}</p>
              <div className="tag-row">
                {project.tags.map((tag) => (
                  <span className="tag" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>
              <p>{project.outcome}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section" id="blog">
        <div className="section-head">
          <div>
            <p className="eyebrow">{content.blogIntro.eyebrow}</p>
            <h2>{content.blogIntro.title}</h2>
          </div>
          <p>{content.blogIntro.description}</p>
        </div>
        <div className="blog-grid">
          {content.blog.map((post) => (
            <article className="blog-card" key={post.title}>
              <time dateTime={post.date}>{post.date}</time>
              <h3>{post.title}</h3>
              <p>{post.summary}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="contact-band" id="contact">
        <div>
          <p className="eyebrow">{content.contact.eyebrow}</p>
          <h2>{content.contact.title}</h2>
          <p>{content.contact.note}</p>
        </div>
        <div className="contact-links">
          <a href={`mailto:${profile.email}`}>{profile.email}</a>
          <a href={profile.linkedin}>LinkedIn</a>
          <a href={profile.resumeUrl}>{content.contact.availability}</a>
        </div>
      </section>
    </main>
  );
}
