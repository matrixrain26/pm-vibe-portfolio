export type Project = {
  title: string;
  summary: string;
  outcome: string;
  tags: string[];
};

export type BlogPost = {
  title: string;
  date: string;
  summary: string;
};

export type SiteContent = {
  navigation: {
    home: string;
    about: string;
    interests: string;
    projects: string;
    blog: string;
    contact: string;
    admin: string;
  };
  profile: {
    name: string;
    role: string;
    headline: string;
    intro: string;
    location: string;
    email: string;
    linkedin: string;
    resumeUrl: string;
  };
  hero: {
    primaryCta: string;
    secondaryCta: string;
    resumeCta: string;
    signalEyebrow: string;
    signalTitle: string;
    signalBody: string;
    metrics: Array<{
      value: string;
      label: string;
    }>;
  };
  about: {
    eyebrow: string;
    title: string;
    pitch: string;
    highlightLabel: string;
    highlights: string[];
  };
  interestsIntro: {
    eyebrow: string;
    title: string;
    description: string;
  };
  interests: string[];
  projectsIntro: {
    eyebrow: string;
    title: string;
    description: string;
  };
  projects: Project[];
  blogIntro: {
    eyebrow: string;
    title: string;
    description: string;
  };
  blog: BlogPost[];
  contact: {
    eyebrow: string;
    title: string;
    note: string;
    availability: string;
  };
};
