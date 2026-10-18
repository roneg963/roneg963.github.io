// Wording approved by Ron on 2026-10-18 with his corrections (RN-030 part C).
// Launch (RN-040): after the axe check, update the "full audit" sentence with what was checked and when.
export const accessibility = {
  he: {
    title: 'נגישות | רון נגרין',
    heading: 'נגישות',
    updated: 'עודכן לאחרונה: 2026-10-18',
    sections: [
      {
        heading: 'היעד',
        paragraphs: [
          'המטרה היא להנגיש את האתר לפי WCAG 2.2 ברמה AA. זו הצהרת יעד; אין כאן הצהרה על תאימות מלאה לתקן.',
        ],
      },
      {
        heading: 'מה מיושם באתר',
        paragraphs: [
          'התוכן מוצג כטקסט אמיתי ב-HTML, עם כותרות ואזורי ניווט, תוכן ראשי ופוטר. הקישורים זמינים לניווט במקלדת, עם מסגרת פוקוס גלויה.',
          'העיצוב נבנה מתוך כוונה לשמור על ניגודיות צבעים טובה בין הטקסט לרקע.',
          'כאשר מוגדרת במכשיר העדפה להפחתת תנועה (prefers-reduced-motion), אפקט הכניסה של העמוד ומעברי הלוחות מכובים, והתנועה בסצנות התלת-ממדיות נעצרת, גם זו שמתרחשת עם הזמן וגם זו שבתגובה לעכבר. תוכן הקובייה זמין גם כרשימת טקסט לקוראי מסך.',
        ],
      },
      {
        heading: 'מגבלות ידועות',
        paragraphs: [
          'סצנות התלת-ממד הן המחשה דקורטיבית; אין צורך להסתמך עליהן כדי לקרוא את התוכן. בטלפון מוצג ניווט מצומצם: קישור שפה וקישור ללינקדאין לצד סימן השם.',
          'בדיקת נגישות מלאה עדיין לא בוצעה.',
        ],
      },
      {
        heading: 'דיווח על קושי בנגישות',
        paragraphs: [
          'מי שנתקל בקושי יכול לפנות דרך <a href="https://www.linkedin.com/in/ron-negrin">הפרופיל בלינקדאין</a>. כדאי לציין את העמוד, מה ניסיתם לעשות ובאיזה מכשיר ודפדפן השתמשתם. הדיווח דרך לינקדאין דורש חשבון לינקדאין.',
        ],
      },
    ],
  },
  en: {
    title: 'Accessibility | Ron Negrin',
    heading: 'Accessibility',
    updated: 'Last updated: 2026-10-18',
    sections: [
      {
        heading: 'Goal',
        paragraphs: [
          'The goal is to make this site accessible according to WCAG 2.2 Level AA. This is a goal, not a claim of full conformance.',
        ],
      },
      {
        heading: 'What is implemented',
        paragraphs: [
          'Content is presented as real HTML text, with headings and navigation, main content and footer regions. Links support keyboard navigation with a visible focus outline.',
          'The design is built with the intention of keeping good colour contrast between text and background.',
          'When the device preference for reduced motion (prefers-reduced-motion) is enabled, the page entrance effect and panel transitions are turned off, and motion in the 3D scenes stops, both the motion over time and the motion in response to the mouse. The cube’s content is also available as a text list for screen readers.',
        ],
      },
      {
        heading: 'Known limitations',
        paragraphs: [
          'The 3D scenes are decorative illustrations; reading the content does not depend on them. On phones, navigation is limited to a language link and a LinkedIn link alongside the wordmark.',
          'A full accessibility audit has not yet been performed.',
        ],
      },
      {
        heading: 'Reporting an accessibility difficulty',
        paragraphs: [
          'Anyone who encounters a difficulty can get in touch through <a href="https://www.linkedin.com/in/ron-negrin">the LinkedIn profile</a>. Please describe the page, what you tried to do, and the device and browser you used. Reporting through LinkedIn requires a LinkedIn account.',
        ],
      },
    ],
  },
};
