import { DEFAULT_APP_LOCALE, normalizeAppLocale } from '../i18n/appLocale.js';

export const SUBSCRIPTIONS_ENABLED = false;

const COPY = Object.freeze({
  en: {
    pending: 'Not available yet',
    description: 'Subscriptions are being prepared for secure web and app-store billing. No purchase can be made yet.',
    button: 'Subscriptions coming soon',
    modalTitle: 'Premium is being prepared',
    modalBody: 'Purchases remain unavailable until billing, restore-purchase, pricing and store-review requirements are fully verified.',
    close: 'Close'
  },
  he: {
    pending: 'עדיין לא זמין',
    description: 'מערכת המנויים נמצאת בהכנה לחיוב מאובטח באתר ובחנויות האפליקציות. עדיין לא ניתן לבצע רכישה.',
    button: 'המנויים ייפתחו בקרוב',
    modalTitle: 'Premium נמצא בהכנה',
    modalBody: 'הרכישות יישארו חסומות עד להשלמת אימות החיוב, שחזור הרכישות, המחירים ודרישות החנויות.',
    close: 'סגירה'
  },
  es: {
    pending: 'Aún no disponible',
    description: 'Las suscripciones se están preparando para pagos seguros en la web y en las tiendas. Todavía no se pueden realizar compras.',
    button: 'Suscripciones próximamente',
    modalTitle: 'Premium está en preparación',
    modalBody: 'Las compras seguirán desactivadas hasta verificar la facturación, la restauración de compras, los precios y los requisitos de las tiendas.',
    close: 'Cerrar'
  },
  fr: {
    pending: 'Pas encore disponible',
    description: 'Les abonnements sont en préparation pour un paiement sécurisé sur le web et dans les boutiques. Aucun achat n’est encore possible.',
    button: 'Abonnements bientôt disponibles',
    modalTitle: 'Premium est en préparation',
    modalBody: 'Les achats resteront désactivés jusqu’à la vérification de la facturation, de la restauration des achats, des prix et des exigences des boutiques.',
    close: 'Fermer'
  },
  de: {
    pending: 'Noch nicht verfügbar',
    description: 'Abonnements werden für sichere Zahlungen im Web und in den App-Stores vorbereitet. Käufe sind noch nicht möglich.',
    button: 'Abonnements folgen bald',
    modalTitle: 'Premium wird vorbereitet',
    modalBody: 'Käufe bleiben deaktiviert, bis Abrechnung, Kaufwiederherstellung, Preise und Store-Anforderungen vollständig geprüft sind.',
    close: 'Schließen'
  },
  it: {
    pending: 'Non ancora disponibile',
    description: 'Gli abbonamenti sono in preparazione per pagamenti sicuri sul web e negli store. Non è ancora possibile effettuare acquisti.',
    button: 'Abbonamenti in arrivo',
    modalTitle: 'Premium è in preparazione',
    modalBody: 'Gli acquisti resteranno disattivati finché fatturazione, ripristino degli acquisti, prezzi e requisiti degli store non saranno verificati.',
    close: 'Chiudi'
  },
  pt: {
    pending: 'Ainda não disponível',
    description: 'As assinaturas estão a ser preparadas para pagamentos seguros na web e nas lojas. Ainda não é possível efetuar compras.',
    button: 'Assinaturas disponíveis em breve',
    modalTitle: 'O Premium está em preparação',
    modalBody: 'As compras continuarão desativadas até à verificação da faturação, restauro de compras, preços e requisitos das lojas.',
    close: 'Fechar'
  }
});

export function getSubscriptionReadinessCopy(locale) {
  const normalized = normalizeAppLocale(locale, DEFAULT_APP_LOCALE);
  return COPY[normalized] || COPY.en;
}

export function isPremiumSubscription(subscription) {
  return subscription?.status === 'active' && subscription?.plan_type !== 'free';
}
