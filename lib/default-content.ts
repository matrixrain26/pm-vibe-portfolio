import type { SiteContent } from "./types";

export const defaultContent: SiteContent = {
  navigation: {
    home: "Home",
    about: "About",
    interests: "Interests",
    projects: "Projects",
    blog: "Blog",
    contact: "Contact",
    admin: "Admin"
  },
  profile: {
    name: "Your Name",
    role: "Product Manager",
    headline: "I shape useful products, validate bets quickly, and turn ambiguous ideas into shipped experiences.",
    intro:
      "A portfolio for product strategy, discovery, execution, and AI-assisted prototyping. Update this copy from the admin panel once your CV content is available.",
    location: "India",
    email: "hello@example.com",
    linkedin: "https://www.linkedin.com/",
    resumeUrl: "#"
  },
  hero: {
    primaryCta: "View Projects",
    secondaryCta: "Contact",
    resumeCta: "Resume",
    signalEyebrow: "Product signal",
    signalTitle: "Strategy with working prototypes.",
    signalBody:
      "Built to show how a PM can think, write, prioritize, and vibe-code enough of the experience to make better product calls.",
    metrics: [
      { value: "6", label: "prototype-ready project ideas" },
      { value: "3", label: "editable product essays" },
      { value: "AI", label: "as a product building partner" },
      { value: "PM", label: "discovery to launch narrative" }
    ]
  },
  about: {
    eyebrow: "About",
    title: "How I Work",
    pitch:
      "I work across customer insight, product strategy, execution rituals, analytics, and go-to-market alignment. My favorite products start with a sharp problem statement and end with a measurable user behavior change.",
    highlightLabel: "Signal",
    highlights: [
      "Turn customer and market signals into crisp opportunity maps, PRDs, and release plans.",
      "Partner with design, engineering, sales, and leadership to keep teams moving with clarity.",
      "Use AI tools to prototype product ideas fast enough to make better roadmap decisions."
    ]
  },
  interestsIntro: {
    eyebrow: "Interests",
    title: "What I’m Exploring",
    description: "Areas where product thinking, market context, and AI-assisted making overlap."
  },
  interests: [
    "AI-native workflows for product teams",
    "B2B SaaS discovery and activation",
    "Data-informed roadmap prioritization",
    "No-code and vibe-coded product experiments",
    "Founder-led product strategy"
  ],
  projectsIntro: {
    eyebrow: "Projects",
    title: "Vibe-Coded Product Proofs",
    description:
      "These are designed to demonstrate PM leverage: problem framing, fast prototyping, analytics thinking, and stakeholder-ready storytelling."
  },
  projects: [
    {
      title: "AI Interview Synthesizer",
      summary:
        "A lightweight tool that turns customer interview notes into themes, pain-point clusters, JTBD statements, and follow-up questions.",
      outcome: "Shows discovery rigor, AI prompting, synthesis quality, and how you convert qualitative signals into product decisions.",
      tags: ["Discovery", "LLMs", "Research Ops"]
    },
    {
      title: "Feature Prioritization Studio",
      summary:
        "A RICE/ICE prioritization workspace with stakeholder inputs, confidence notes, and automatic roadmap trade-off explanations.",
      outcome: "Demonstrates prioritization judgment, product communication, and analytics-ready decision making.",
      tags: ["Roadmaps", "Vibe Coding", "Strategy"]
    },
    {
      title: "Onboarding Funnel Doctor",
      summary:
        "A dashboard prototype that spots activation drop-offs and suggests experiments based on funnel data and user segments.",
      outcome: "Shows your ability to connect metrics, UX, and growth experiments in a product-manager-friendly way.",
      tags: ["Growth", "Analytics", "Experimentation"]
    },
    {
      title: "PRD Copilot",
      summary:
        "A structured PRD builder that converts a problem brief into user stories, acceptance criteria, risks, and launch checklist.",
      outcome: "Demonstrates execution hygiene, collaboration with engineering, and AI-assisted delivery practices.",
      tags: ["PRDs", "Execution", "AI Tools"]
    },
    {
      title: "Competitive Signal Tracker",
      summary:
        "A simple market-intelligence board that captures competitor releases, customer objections, and positioning opportunities.",
      outcome: "Shows commercial awareness, product marketing alignment, and structured market thinking.",
      tags: ["Market Intel", "Positioning", "SaaS"]
    },
    {
      title: "User Feedback Triage Desk",
      summary:
        "A support-to-roadmap intake system that classifies feedback, maps it to product areas, and recommends next actions.",
      outcome: "Demonstrates operational product sense and the ability to bridge customer-facing teams with product planning.",
      tags: ["Voice of Customer", "Ops", "Automation"]
    }
  ],
  blogIntro: {
    eyebrow: "Blog",
    title: "Product Notes",
    description: "Editable writing prompts you can replace with your own essays and case notes."
  },
  blog: [
    {
      title: "What product managers should prototype before asking engineering",
      date: "2026-05-10",
      summary:
        "A practical note on using vibe coding to reduce ambiguity, reveal hidden requirements, and improve team conversations."
    },
    {
      title: "A simple test for whether a feature deserves roadmap space",
      date: "2026-05-10",
      summary:
        "How to combine user pain, business leverage, confidence, and delivery cost into an honest prioritization conversation."
    },
    {
      title: "From customer quote to product bet",
      date: "2026-05-10",
      summary:
        "A PM workflow for turning messy research inputs into themes, assumptions, and measurable next bets."
    }
  ],
  contact: {
    eyebrow: "Contact",
    title: "Let’s Talk Product",
    note:
      "I am open to product conversations, advisory work, and roles where discovery, execution, and AI-enabled building matter.",
    availability: "Available for select conversations"
  }
};
