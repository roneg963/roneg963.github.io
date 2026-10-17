// All visible text of the home page (RN-020). Extracted verbatim from docs/design/reference/reference-v-e.html.
// Strings named *Html may contain inline markup (for example <span lang="en">…</span>) and are rendered with set:html.
// The English page (RN-030) provides the same shape in en.ts.

export const he = {
  lang: 'he',
  dir: 'rtl',
  locale: 'he-IL',
  meta: { title: 'רון נגרין | Ron Negrin' },

  nav: {
    ariaLabel: 'ניווט ראשי',
    about: 'אודות',
    domains: 'תחומים',
    projects: 'פרויקטים',
    articles: 'מאמרים',
    otherLanguage: 'English',
    otherLanguageHref: '/en/',
    otherLanguageLang: 'en',
    linkedin: 'לינקדאין',
    linkedinHref: 'https://www.linkedin.com/in/ron-negrin',
    homeAria: 'רון נגרין — לראש העמוד',
    wordmark: 'RON NEGRIN',
    tagline: 'משפטים · טכנולוגיה · עסקים',
  },

  hero: {
    eyebrow: 'סטודנט למשפטים · שנה אחרונה · הקריה האקדמית אונו',
    title: 'משפטים. טכנולוגיה. עסקים.',
    leadHtml:
      'רון נגרין — משפטן שבונה. מבניין מגורים בעסקת קומבינציה ועד מוצר <span lang="en">SaaS</span> שפועל ב־<span lang="en">Production</span>.',
    ctaAchievements: 'מה כבר עשיתי',
    ctaProjects: 'לפרויקטים',
    portraitAlt: 'רון נגרין',
  },

  about: {
    title: 'אודות',
    lead: 'סטודנט למשפטים בשנה האחרונה, עם ניסיון מעשי בנדל״ן ומוצר תוכנה שבניתי בעצמי.',
    p1: 'מאז 2022 אני עובד לצד יזם נדל״ן בפרויקט ״פארק הים״ — בניין מגורים בן 43 יחידות דיור בעסקת קומבינציה. אני מוביל את השכרת דירות היזם, ריכזתי את רישום הבית המשותף, ועובד מול שוכרים, מתווכים ועורכי דין.',
    p2Html:
      'במקביל ייסדתי את <span lang="en">SLA Guard</span>, מוצר <span lang="en">B2B SaaS</span> שפועל ב־<span lang="en">Production</span>. אני מפתח אותו עם צוות סוכני <span lang="en">AI</span>, בתהליך שבו סוכן אחד כותב, אחר בודק, ואני מאשר כל פעולה רגישה.',
    cta: 'למסלול המלא',
    stats: [
      { big: '93', labelHtml: 'ממוצע בתואר' },
      { big: '100', labelHtml: 'דיני קניין · דיני חברות' },
      { big: '43', labelHtml: 'יחידות דיור, ״פארק הים״' },
      { big: '2026', labelHtml: '<span lang="en">SLA Guard</span> ב־<span lang="en">Production</span>' },
    ],
  },

  achievements: {
    eyebrow: 'מה כבר עשיתי',
    title: 'קובייה אחת, הרבה חלקים.',
    canvasAria: 'קובייה הונגרית שמתפרקת לחלקים, ועל כל חלק דבר שרון עשה',
    // The visually-hidden list for screen readers and search engines (same 12 items as the cube).
    a11yList: [
      'ממוצע 93 בתואר',
      '100 בדיני קניין',
      '100 בדיני חברות',
      '94 בדיני מיסים',
      '43 יחידות דיור בפארק הים',
      'ריכוז רישום בית משותף',
      'SLA Guard ב־Production',
      'צוות סוכני AI עם ביקורת ואישור',
      'Second Brain',
      'הכשרת QA בהצטיינות',
      'משא ומתן בינלאומי B2B',
      'עסק עצמאי להפקת אירועים',
    ],
  },

  // Data read by the 3D script (src/scripts/scene.js): the 12 cube labels, the 4 group names and the hint line.
  cube: {
    items: [
      ['93', 'ממוצע בתואר'],
      ['100', 'דיני קניין'],
      ['100', 'דיני חברות'],
      ['43', 'יחידות דיור · פארק הים'],
      ['בית משותף', 'ריכוז הרישום עד להקמה'],
      ['94', 'דיני מיסים'],
      ['SLA Guard', 'מוצר SaaS ב־Production'],
      ['סוכני AI', 'צוות עם ביקורת ואישור'],
      ['Second Brain', 'מערכת ידע לסוכנים'],
      ['QA', 'הכשרה בהצטיינות'],
      ['B2B', 'משא ומתן בינלאומי'],
      ['עסק עצמאי', 'הפקה ושיווק אירועים'],
    ],
    groups: ['לימודים', 'נדל״ן', 'טכנולוגיה', 'עסקים'],
    hintStart: 'גללו — בכל פעם יקפצו שלושה חלקים מהקובייה.',
    hintEnd: 'שתים־עשרה חלקים, קובייה אחת.',
  },

  domains: {
    title: 'תחומי העיסוק',
    cards: [
      {
        num: '01',
        titleHtml: 'נדל״ן, חברות ועסקים',
        bodyHtml: 'עסקאות קומבינציה, חוזים מסחריים, ניהול פרויקטים ומשא ומתן — מהשטח, לא רק מהספרים.',
      },
      {
        num: '02',
        titleHtml: 'משפט, <span lang="en">SaaS</span> וטכנולוגיה',
        bodyHtml: 'חוזי <span lang="en">SaaS</span>, הסכמי <span lang="en">SLA</span>, פרטיות וסיכונים משפטיים במערכות תוכנה.',
      },
      {
        num: '03',
        titleHtml: '<span lang="en">AI</span>, סוכנים ואוטומציה',
        bodyHtml: 'פיתוח עם צוות סוכני <span lang="en">AI</span>, עם ביקורת עצמאית ואישור אנושי לכל פעולה רגישה.',
      },
    ],
  },

  projects: {
    title: 'פרויקטים נבחרים',
    sub: 'מה בניתי ומה הובלתי בפועל.',
    items: [
      {
        metaHtml: 'מייסד · אפריל 2026 – היום',
        titleHtml: '<span lang="en">SLA Guard</span>',
        bodyHtml:
          'מוצר <span lang="en">B2B SaaS</span> שמודד את זמן התגובה הראשונה ללקוחות ב־<span lang="en">Slack Connect</span>, מתריע לצוות לפני חריגה, מתעד חריגות ומאפשר לסגור טיפול ב־✅ — בלי מערכת <span lang="en">helpdesk</span> נפרדת.',
        cta: 'לפרטים',
        ctaHref: '#projects',
      },
      {
        metaHtml: 'עוזר יזם ומנהל פרויקט · 2022 – היום',
        titleHtml: 'פרויקט ״פארק הים״',
        bodyHtml:
          'בניין מגורים בן 43 יחידות דיור בעסקת קומבינציה. הובלת שלב האכלוס וההשכרה, ניתוח חוזי שכירות, וריכוז רישום הבית המשותף מול בעלי הדירות עד להקמתו.',
        cta: 'למסלול',
        ctaHref: '#path',
      },
      {
        metaHtml: 'פרויקט אישי · 2026',
        titleHtml: '<span lang="en">Second Brain</span>',
        bodyHtml:
          'מערכת ידע על <span lang="en">Markdown</span>, <span lang="en">Obsidian</span> ו־<span lang="en">Git</span> שמשמשת בסיס עבודה משותף לסוכני <span lang="en">AI</span>: הרשאות, בקרת גרסאות, וסוכן אחד שבודק את עבודתו של אחר.',
        cta: 'למאמרים',
        ctaHref: '#articles',
      },
    ],
    // Decorative panels next to each project (aria-hidden in the markup).
    panels: ['SLA Guard', '43', 'Second Brain'],
  },

  quote: {
    html: 'מהשטח, <span style="color: var(--gold);">לא רק מהספרים.</span>',
  },

  path: {
    title: 'המסלול שלי',
    cards: [
      { dateHtml: '2021 – 2027 (צפי)', titleHtml: 'תואר ראשון במשפטים', subHtml: 'הקריה האקדמית אונו · ממוצע 93' },
      { dateHtml: '2022 – היום', titleHtml: 'עוזר יזם נדל״ן ומנהל פרויקט', subHtml: 'פרויקט ״פארק הים״' },
      { dateHtml: '2024 – היום', titleHtml: 'מייסד — הפקה ושיווק אירועים', subHtml: 'ניהול עסקי, תפעולי ושיווקי' },
      { dateHtml: '2017 – 2020', titleHtml: 'מנהל פעילות עסקית (<span lang="en">B2B</span>)', subHtml: 'סקאיליין · משא ומתן בינלאומי' },
    ],
  },

  articles: {
    title: 'מאמרים',
    sub: 'המאמרים הראשונים בדרך — אחד מכל תחום.',
    cards: [
      { metaHtml: '01 · נדל״ן · בקרוב', titleHtml: 'סיכונים חוזיים בעסקת קומבינציה' },
      {
        metaHtml: '02 · משפט ו־<span lang="en">SaaS</span> · בקרוב',
        titleHtml: '<span lang="en">SLA</span> בחוזי <span lang="en">SaaS</span>: התחייבות מול מדידה',
      },
      {
        metaHtml: '03 · <span lang="en">AI</span> · בקרוב',
        titleHtml: 'צוות סוכני <span lang="en">AI</span> עם ביקורת ואישור אנושי',
      },
    ],
  },

  cta: {
    title: 'בואו נדבר.',
    sub: 'משרדים, שותפים ולקוחות — הדרך הכי מהירה אליי היא בלינקדאין.',
    button: 'לפרופיל בלינקדאין',
  },

  footer: {
    wordmark: 'RON NEGRIN',
    privacy: 'הודעת פרטיות',
    // The privacy and accessibility pages are written in RN-030 parts B and C. The reference pointed these links at "#top".
    privacyHref: '/privacy/',
    accessibility: 'נגישות',
    accessibilityHref: '/accessibility/',
    copyright: '© 2026 רון נגרין',
  },
};

export type Content = typeof he;
