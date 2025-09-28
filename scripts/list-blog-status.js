#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';

async function main() {
  const blogDir = path.resolve('src/content/blog');
  const imageDir = path.resolve('public/images/blog');
  const files = await fs.readdir(blogDir);
  const mdFiles = files.filter(f => f.endsWith('.md'));
  const posts = [];
  for (const file of mdFiles) {
    const slug = file.replace(/\.md$/, '');
    const content = await fs.readFile(path.join(blogDir, file), 'utf8');
    const hasHeroImage = /\bheroImage\s*:/i.test(content);
    let imageCount = 0;
    try {
      const imgs = await fs.readdir(path.join(imageDir, slug));
      imageCount = imgs.filter(n => /\.(jpe?g|png|webp)$/i.test(n)).length;
    } catch {}
    posts.push({ slug, hasHeroImage, imageCount });
  }
  const lines = posts.map(p => `${p.hasHeroImage ? '✅' : '❌'} ${p.slug} (${p.imageCount} images${p.hasHeroImage ? ', has hero' : ''})`);
  console.log('Blog posts image status:\n');
  console.log(lines.join('\n'));
  console.log(`\nTotal: ${posts.length} posts, ${posts.filter(p => p.hasHeroImage).length} with hero images`);
}

main().catch((e) => { console.error(e); process.exit(1); });

