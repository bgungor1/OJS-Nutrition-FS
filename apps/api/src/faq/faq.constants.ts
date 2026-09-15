export const FAQ_CATEGORIES = ['genel', 'urunler', 'kargo'] as const;

export type FaqCategory = (typeof FAQ_CATEGORIES)[number];
