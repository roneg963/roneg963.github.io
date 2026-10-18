import { he } from './he';
import { en } from './en';

// Descriptions reuse the approved lead verbatim, with only HTML tags removed.
const plainText = (html: string) => html.replace(/<[^>]*>/g, '');
export const seo = {
  he: {
    description: plainText(he.hero.leadHtml),
    locale: 'he_IL',
    name: he.hero.portraitAlt,
  },
  en: {
    description: plainText(en.hero.leadHtml),
    locale: 'en_US',
    name: en.hero.portraitAlt,
  },
};

export const portraitUrl = 'https://roneg963.github.io/portrait.webp';
export const sameAs = [he.nav.linkedinHref];
