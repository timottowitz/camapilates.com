
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const BLOG_DIR = path.join(process.cwd(), 'src/content/blog');

function auditBlogs() {
    const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.md'));
    const results = [];

    for (const file of files) {
        const content = fs.readFileSync(path.join(BLOG_DIR, file), 'utf-8');
        const { data, content: body } = matter(content);

        const hasHero = !!data.heroImage;
        const imageLinks = (body.match(/!\[.*?\]\(.*?\)/g) || []).length;
        const htmlImages = (body.match(/<img.*?src=.*?>/g) || []).length;
        const placeholders = (body.match(/<placeholder-image.*?\/>/g) || []).length;

        results.push({
            file,
            slug: file.replace('.md', ''),
            hasHero,
            imageCount: imageLinks + htmlImages,
            placeholders
        });
    }

    console.log(JSON.stringify(results, null, 2));
}

auditBlogs();
