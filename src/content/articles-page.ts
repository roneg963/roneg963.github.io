import { he } from './he';
import { en } from './en';

// METHOD §4 template for future articles. No article content is published here.
export interface ArticleMeta {
  title: string;
  seoTitle: string;
  summary: string;
  lang: 'he' | 'en';
  domain: 'A' | 'B' | 'C';
  jurisdiction: string;
  sources: string[];
  author: string;
  lastChecked: string; // ISO date (YYYY-MM-DD).
  status: 'רעיון' | 'תקציר' | 'טיוטה' | 'נבדק' | 'מאושר' | 'פורסם' | 'לרענון';
}

// Reuse the approved home-page placeholders; these are not published articles.
export const articlesPage = {
  he: {
    title: `${he.articles.title} | רון נגרין`,
    heading: he.articles.title,
    intro: he.articles.sub,
    cards: he.articles.cards,
  },
  en: {
    title: `${en.articles.title} | Ron Negrin`,
    heading: en.articles.title,
    intro: en.articles.sub,
    cards: en.articles.cards,
  },
};
