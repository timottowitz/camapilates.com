Asset Pipeline (Images)

- Single location for all image assets: public/images
- Always reference images as absolute paths beginning with /images (e.g., /images/hero-shop.webp) so they work in dev and in the prerendered build.

Mapping used in code
- Shop hero: /images/hero-shop.webp (ASSETS.shopHero)
- Shop header addon: /images/shop-addon.webp (ASSETS.shopHeaderAddon)
- Category icon images (round center):
  - Reformers: /images/reformers.webp (ASSETS.catReformers)
  - Accessories: /images/accessories.webp (ASSETS.catAccessories)
 - Featured Product section image: /images/featured-products.webp (ASSETS.featuredProducts)

Steps to update assets
1) Convert your source files to web formats (webp/jpg) and place here:
   public/images/
2) Rename as above (hero-shop.webp, shop-addon.webp, categories/reformers.jpg, categories/accessories.jpg)
3) Rebuild: npm run build

Provided local files (rename suggestions)
- a9259249-fb48-463d-a0b6-f3c8c3d4d7a8.webp → hero-shop.webp
- reformers.webp → /images/reformers.webp
- accessories.webp → /images/accessories.webp
- Generated Image September 26, 2025 - 9_05PM.png|.webp → shop-addon.webp
- Provided “Featured Products” image → featured-products.webp
- roxana-popovici-5JQxj-zc5ng-unsplash.webp, roxana-popovici-Zp4APUiwEsM-unsplash.webp → use for explore tiles or PDP galleries

Note on absolute OS paths
- Do NOT reference absolute local paths (e.g., /Users/.../images). Those will not work in production. Place files under public/images and reference with "/images/..." only.
