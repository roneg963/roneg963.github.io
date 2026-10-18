// Draft wording for Ron's approval (RN-030 part C). No conformance claim.
export const accessibility = {
  he: {
    title: 'נגישות | רון נגרין',
    heading: 'נגישות',
    sections: [
      {
        heading: 'היעד שלנו',
        paragraphs: [
          'אנחנו מכוונים להנגשת האתר לפי WCAG 2.2 ברמה AA. זו הצהרת יעד; אין כאן הצהרה על תאימות מלאה לתקן.',
        ],
      },
      {
        heading: 'מה מיושם באתר',
        paragraphs: [
          'התוכן מוצג כטקסט אמיתי ב-HTML, עם כותרות ואזורי ניווט, תוכן ראשי ופוטר. הקישורים זמינים לניווט במקלדת, עם מסגרת פוקוס גלויה.',
          'העיצוב משתמש בטקסט כהה על רקעים בהירים ובטקסט בהיר על רקעים כהים לשמירה על ניגודיות צבעים. בדיקת נגישות מלאה עדיין לא בוצעה.',
          'כאשר מוגדרת במכשיר העדפה להפחתת תנועה (prefers-reduced-motion), ההנפשות מכובות והסצנות התלת-ממדיות מוצגות בפריים קבוע. תוכן הקובייה זמין גם כרשימת טקסט לקוראי מסך.',
        ],
      },
      {
        heading: 'מגבלות ידועות',
        paragraphs: [
          'סצנות התלת-ממד הן המחשה דקורטיבית; אין צורך להסתמך עליהן כדי לקרוא את התוכן. בטלפון מוצג ניווט מצומצם: קישור שפה וקישור ללינקדאין לצד סימן השם.',
        ],
      },
      {
        heading: 'דיווח על קושי בנגישות',
        paragraphs: [
          'אם נתקלתם בקושי, אפשר לפנות דרך <a href="https://www.linkedin.com/in/ron-negrin">הפרופיל בלינקדאין</a>. כדאי לציין את העמוד, מה ניסיתם לעשות ובאיזה מכשיר ודפדפן השתמשתם.',
        ],
      },
    ],
  },
  en: {
    title: 'Accessibility | Ron Negrin',
    heading: 'Accessibility',
    sections: [
      {
        heading: 'Our goal',
        paragraphs: [
          'We aim to make this site accessible according to WCAG 2.2 Level AA. This is a goal, not a claim of full conformance.',
        ],
      },
      {
        heading: 'What is implemented',
        paragraphs: [
          'Content is presented as real HTML text, with headings and navigation, main content and footer regions. Links support keyboard navigation with a visible focus outline.',
          'The design uses dark text on light backgrounds and light text on dark backgrounds to support colour contrast. A full accessibility audit has not yet been performed.',
          'When the device preference for reduced motion (prefers-reduced-motion) is enabled, animations are disabled and the 3D scenes use a fixed frame. The cube’s content is also available as a text list for screen readers.',
        ],
      },
      {
        heading: 'Known limitations',
        paragraphs: [
          'The 3D scenes are decorative illustrations; reading the content does not depend on them. On phones, navigation is limited to a language link and a LinkedIn link alongside the wordmark.',
        ],
      },
      {
        heading: 'Reporting an accessibility difficulty',
        paragraphs: [
          'If you encounter a difficulty, please get in touch through <a href="https://www.linkedin.com/in/ron-negrin">the LinkedIn profile</a>. Please describe the page, what you tried to do, and the device and browser you used.',
        ],
      },
    ],
  },
};
