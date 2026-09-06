export const HUMAN_SUPPORT_DIRECTORY_VERSION = '2026-09-06';

export const HUMAN_SUPPORT_SOURCES = Object.freeze({
  israelMinistryOfHealth: 'https://me.health.gov.il/mental-health/therapy-rehabilitation/crisis-support/first-aid/',
  israelImmediateDanger: 'https://me.health.gov.il/mental-health/information-and-updates/prevention-of-suicide/how-to-talk-to-a-suicidal-person/',
  eran: 'https://www.eran.org.il/',
  internationalDirectory: 'https://www.iasp.info/crisis-centres-helplines/',
});

const verification = Object.freeze({
  country: 'IL',
  lastVerifiedAt: '2026-09-06',
  verificationOwner: 'Mindful Path content safety review',
});

const entry = (resource) => Object.freeze({ ...verification, ...resource });

export const ISRAEL_HUMAN_SUPPORT_DIRECTORY = Object.freeze([
  entry({
    id: 'israel-police',
    urgency: 'immediate',
    name: { he: 'משטרת ישראל', en: 'Israel Police' },
    description: { he: 'כאשר קיימת סכנה מיידית לך או לאדם אחר.', en: 'When you or another person is in immediate danger.' },
    languages: ['he', 'en'],
    channels: Object.freeze([{ type: 'phone', label: '100', href: 'tel:100' }]),
    sourceUrl: HUMAN_SUPPORT_SOURCES.israelImmediateDanger,
  }),
  entry({
    id: 'magen-david-adom',
    urgency: 'immediate',
    name: { he: 'מגן דוד אדום', en: 'Magen David Adom' },
    description: { he: 'סיוע רפואי דחוף ופינוי לחדר מיון.', en: 'Urgent medical help and emergency transport.' },
    languages: ['he', 'en'],
    channels: Object.freeze([{ type: 'phone', label: '101', href: 'tel:101' }]),
    sourceUrl: HUMAN_SUPPORT_SOURCES.israelImmediateDanger,
  }),
  entry({
    id: 'eran',
    urgency: 'urgent_support',
    name: { he: 'ער״ן – עזרה ראשונה נפשית', en: 'ERAN – Emotional First Aid' },
    description: { he: 'תמיכה רגשית אנונימית, 24 שעות ביממה.', en: 'Anonymous emotional support, 24 hours a day.' },
    languages: ['he', 'en'],
    channels: Object.freeze([
      { type: 'phone', label: '1201', href: 'tel:1201' },
      { type: 'whatsapp', label: 'WhatsApp 052-8451201', href: 'https://wa.me/972528451201' },
    ]),
    sourceUrl: HUMAN_SUPPORT_SOURCES.eran,
  }),
  entry({
    id: 'natal',
    urgency: 'urgent_support',
    name: { he: 'נט״ל – סיוע על רקע טראומה ומלחמה', en: 'NATAL – Trauma and War Support' },
    description: { he: 'קו סיוע לנפגעי טראומה על רקע טרור ומלחמה.', en: 'Support for trauma related to terrorism and war.' },
    languages: ['he'],
    channels: Object.freeze([{ type: 'phone', label: '1-800-363-363', href: 'tel:1800363363' }]),
    sourceUrl: HUMAN_SUPPORT_SOURCES.israelMinistryOfHealth,
  }),
  entry({
    id: 'health-funds',
    urgency: 'non_emergency',
    name: { he: 'מוקדי התמיכה הנפשית של קופות החולים', en: 'Health fund mental-support lines' },
    description: {
      he: 'כללית *8703 · מכבי *3555 · מאוחדת *3833 · לאומית *507',
      en: 'Clalit *8703 · Maccabi *3555 · Meuhedet *3833 · Leumit *507',
    },
    languages: ['he'],
    channels: Object.freeze([{ type: 'web', label: 'מידע רשמי / Official information', href: HUMAN_SUPPORT_SOURCES.israelMinistryOfHealth }]),
    sourceUrl: HUMAN_SUPPORT_SOURCES.israelMinistryOfHealth,
  }),
  entry({
    id: 'international-directory',
    country: 'GLOBAL',
    urgency: 'non_emergency',
    name: { he: 'איתור קו סיוע במדינה אחרת', en: 'Find support in another country' },
    description: { he: 'ספריית קווי סיוע בינלאומית של IASP.', en: 'IASP international crisis-centre and helpline directory.' },
    languages: ['en'],
    channels: Object.freeze([{ type: 'web', label: 'IASP directory', href: HUMAN_SUPPORT_SOURCES.internationalDirectory }]),
    sourceUrl: HUMAN_SUPPORT_SOURCES.internationalDirectory,
  }),
]);

export function getHumanSupportResources(urgency) {
  return ISRAEL_HUMAN_SUPPORT_DIRECTORY.filter((resource) => resource.urgency === urgency);
}

