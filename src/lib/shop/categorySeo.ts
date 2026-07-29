import categorySeo from '@/content/shop-category-seo.json';

export type ShopCategoryGuide = {
  href: string;
  label: string;
  description: string;
};

export type ShopCategoryFaq = {
  question: string;
  answer: string;
};

export type ShopCategorySeo = {
  category: string;
  navLabel: string;
  title: string;
  description: string;
  h1: string;
  intro: string;
  sections: Array<{
    heading: string;
    body: string;
  }>;
  guides: ShopCategoryGuide[];
  faq: ShopCategoryFaq[];
};

export const SHOP_CATEGORY_SEO = categorySeo as Record<string, ShopCategorySeo>;

export function getShopCategorySeo(slug: string): ShopCategorySeo | undefined {
  return SHOP_CATEGORY_SEO[slug];
}

export function getRelatedShopCategories(slug: string) {
  return Object.entries(SHOP_CATEGORY_SEO)
    .filter(([relatedSlug]) => relatedSlug !== slug)
    .map(([relatedSlug, seo]) => ({
      slug: relatedSlug,
      label: seo.navLabel,
      description: seo.intro,
    }));
}
