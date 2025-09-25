# Programmatic SEO Blog — Tickets

Status legend: [x] done · [ ] pending

EPIC-01 Frontmatter + Content Loader
- [x] FE-001 Add dependencies (gray-matter, remark-slug, rehype-autolink-headings)
- [x] FE-002 Implement frontmatter content loader (src/lib/content.ts)
- [x] FE-003 Dual-source compatibility (temporary)
- [x] FE-004 Wire Blog + BlogPost to loader (via utils/blogUtils.ts)

EPIC-02 Routing & Pages
- [x] FE-010 Add /blog/category/:category
- [x] FE-011 Add /blog/tag/:tag
- [x] FE-012 Integrate TOC + Share card in post page

EPIC-03 SEO Foundations
- [x] SEO-001 Map frontmatter into Helmet (title/description via existing pages)
- [x] SEO-002 Programmatic sitemap generator (scripts/generate-sitemap.cjs)
- [x] SEO-003 JSON-LD already present on post page

EPIC-04 Migration
- [x] OPS-001 Create content structure (src/content/blog)
- [x] CONTENT-BOOT-001 Migrate existing posts to frontmatter
- [x] CONTENT-BOOT-002 Remove legacy fallback (static list + public/blog fetch)

EPIC-05 Programmatic Content (Initial 50)
- [ ] CONTENT-001..050 Create the planned pages with frontmatter + content

EPIC-06 Legal & Quality Review
- [ ] REVIEW-001 Add reusable legal disclaimer block and content checklist
- [ ] REVIEW-002 Editorial/legal pass on new company/legal pages

EPIC-07 Analytics & Monitoring
- [ ] OPS-010 Add analytics + 404 monitoring

Notes
- Content authoring now lives under `src/content/blog` with YAML frontmatter.
- The loader indexes frontmatter at build time; related posts use tags→category→recency.
- `npm run build` auto-generates `public/sitemap.xml`.

