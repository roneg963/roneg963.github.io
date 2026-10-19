// English counterpart of he.ts (RN-030 part A).
// Sources: the approved English LinkedIn profile and PRD §6 cube labels.
// Translated wording without a literal source is listed in tasks/RN-030.md for Ron's approval.

export const en = {
  lang: 'en',
  dir: 'ltr',
  locale: 'en',
  meta: { title: 'Ron Negrin' },

  nav: {
    ariaLabel: 'Main navigation',
    about: 'About',
    domains: 'Areas of work',
    projects: 'Projects',
    articles: 'Articles',
    otherLanguage: 'עברית',
    otherLanguageHref: '/',
    otherLanguageLang: 'he',
    linkedin: 'LinkedIn',
    linkedinHref: 'https://www.linkedin.com/in/ron-negrin',
    homeAria: 'Ron Negrin — back to top',
    wordmark: 'RON NEGRIN',
    tagline: 'Law · Technology · Business',
  },

  hero: {
    eyebrow: 'Final-Year LL.B. Student · Ono Academic College',
    title: 'Law. Technology. Business.',
    leadHtml:
      'Ron Negrin — a law student who builds. From a residential building developed under a combination (land-for-construction) deal to a SaaS product live in production.',
    ctaAchievements: 'What I have done',
    ctaProjects: 'View projects',
    portraitAlt: 'Ron Negrin',
  },

  about: {
    title: 'About',
    lead: 'Final-year law student with hands-on experience in real estate and a software product I built myself.',
    p1: "Since 2022 I've worked alongside a real estate developer on Park HaYam, a 43-unit residential building developed under a combination (land-for-construction) deal. I lead leasing of the developer's units, coordinated the condominium registration, and work with tenants, brokers and lawyers.",
    p2Html:
      'In parallel, I founded SLA Guard, a B2B SaaS product live in production. I build it with a team of AI agents under a process where one agent writes, another reviews, and I approve every sensitive action.',
    cta: 'View my full background',
    stats: [
      { big: '93', labelHtml: 'GPA' },
      { big: '100', labelHtml: 'Property Law · Corporate Law' },
      { big: '43', labelHtml: 'Residential units · Park HaYam' },
      { big: '2026', labelHtml: 'SLA Guard live in production' },
    ],
  },

  achievements: {
    eyebrow: 'What I have done',
    title: 'One cube, many pieces.',
    canvasAria: "A Rubik's cube that breaks into pieces, each showing something Ron has done",
    a11yList: [
      'GPA 93',
      'Property Law 100',
      'Corporate Law 100',
      'Tax Law 94',
      '43 residential units at Park HaYam',
      'Coordinated the condominium registration',
      'SLA Guard live in production',
      'AI-agent team with review and approval',
      'Second Brain',
      'QA training completed with distinction',
      'International B2B negotiations',
      'Own events production business',
    ],
  },

  cube: {
    items: [
      ['93', 'GPA'],
      ['100', 'Property Law'],
      ['100', 'Corporate Law'],
      ['43', 'Residential units · Park HaYam'],
      ['Condominium', 'Registration, through to completion'],
      ['94', 'Tax Law'],
      ['SLA Guard', 'B2B SaaS, live in production'],
      ['AI Agents', 'Team with review and approval'],
      ['Second Brain', 'Knowledge system for agents'],
      ['QA', 'Completed with distinction'],
      ['B2B', 'International negotiation'],
      ['Own business', 'Events production & marketing'],
    ],
    groups: ['Studies', 'Real Estate', 'Technology', 'Business'],
    hintStart: 'Scroll — three pieces pop out of the cube each time.',
    hintEnd: 'Twelve pieces, one cube.',
  },

  domains: {
    title: 'Areas of work',
    cards: [
      {
        num: '01',
        titleHtml: 'Real Estate, Corporate Law & Business',
        bodyHtml: 'Combination (land-for-construction) deals, commercial contracts, project management and negotiation — from the field, not only from the books.',
      },
      {
        num: '02',
        titleHtml: 'Law, SaaS & Technology',
        bodyHtml: 'SaaS contracts, service-level agreements, privacy and legal risks in software systems.',
      },
      {
        num: '03',
        titleHtml: 'AI, Agents & Automation',
        bodyHtml: 'Development with a team of AI agents, with independent review and human approval for every sensitive action.',
      },
    ],
  },

  projects: {
    title: 'Selected projects',
    sub: 'What I have built and led in practice.',
    items: [
      {
        metaHtml: 'Founder · Apr 2026 – Present',
        titleHtml: 'SLA Guard',
        bodyHtml:
          'A B2B SaaS product that tracks first-response time to customer messages in Slack Connect, alerts the team before an SLA breach, records missed targets, and lets the team close requests with ✅ — without a separate helpdesk.',
        cta: 'Learn more',
        ctaHref: '#projects',
      },
      {
        metaHtml: "Developer's Assistant & Residential Project Manager · 2022 – Present",
        titleHtml: 'Park HaYam Residential Project',
        bodyHtml:
          '43-unit residential building developed under a combination (land-for-construction) deal. Leading the occupancy and leasing stage, analyzing lease agreements, and coordinating the condominium registration with the apartment owners through to completion, when the condominium was established.',
        cta: 'View my background',
        ctaHref: '#path',
      },
      {
        metaHtml: 'Personal project · 2026',
        titleHtml: 'Second Brain',
        bodyHtml:
          'A knowledge system on Markdown, Obsidian and Git that serves as the shared working base for AI agents: permissions, version control, and workflows where one agent performs a task and another reviews it.',
        cta: 'View articles',
        ctaHref: '#articles',
      },
    ],
    panels: ['SLA Guard', '43', 'Second Brain'],
  },

  quote: {
    html: 'From the field, <span style="color: var(--gold);">not only from the books.</span>',
  },

  path: {
    title: 'My background',
    cards: [
      { dateHtml: 'Final-year law student', titleHtml: 'Bachelor of Laws – LL.B.', subHtml: 'Ono Academic College · GPA 93' },
      { dateHtml: '2022 – Present', titleHtml: "Developer's Assistant & Residential Project Manager", subHtml: 'Park HaYam Residential Project' },
      { dateHtml: '2024 – Present', titleHtml: 'Founder – Events Production & Marketing', subHtml: 'Business, operations and marketing management' },
      { dateHtml: '2017 – 2020', titleHtml: 'B2B Business Operations Manager', subHtml: 'Skyline · International negotiations' },
    ],
  },

  articles: {
    title: 'Articles',
    sub: 'The first articles are on the way — one from each area.',
    cards: [
      { metaHtml: '01 · Real Estate · Coming soon', titleHtml: 'Contractual risks in a combination (land-for-construction) deal' },
      {
        metaHtml: '02 · Law & SaaS · Coming soon',
        titleHtml: 'SLAs in SaaS contracts: commitment and measurement',
      },
      {
        metaHtml: '03 · AI · Coming soon',
        titleHtml: 'An AI-agent team with review and human approval',
      },
    ],
  },

  cta: {
    title: "Let's talk.",
    sub: 'Law firms, partners and clients — the quickest way to reach me is on LinkedIn.',
    button: 'View my LinkedIn profile',
  },

  footer: {
    wordmark: 'RON NEGRIN',
    privacy: 'Privacy notice',
    privacyHref: '/en/privacy/',
    accessibility: 'Accessibility',
    accessibilityHref: '/en/accessibility/',
    copyright: '© 2026 Ron Negrin',
  },
};
