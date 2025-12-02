
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const AGENT_PATH = path.join(ROOT, 'scripts/cli-image-agent.js');
const BLOG_DIR = path.join(ROOT, 'src/content/blog');

// Slugs from the plan (Batch 1: Missing Images)
const SLUGS = [
    'accesorios-cama-de-pilates-esenciales',
    'accesorios-cama-de-pilates',
    'accesorios-esenciales-reformer',
    'beneficios-pilates-en-cama',
    'calcetines-para-pilates-reformer',
    'cama-de-pilates-barata',
    'cama-de-pilates-guia-de-compra',
    'cama-de-pilates-para-principiantes',
    'cama-de-pilates-plegable',
    'cama-de-pilates-reformer',
    'cama-de-pilates-segunda-mano',
    'cama-de-pilates-venta-mexico',
    'cama-para-pilates',
    'cama-pilates',
    'certificacion-instructores-mexico',
    'comunidad-pilates-mexicana',
    'crecimiento-pilates-mexico',
    'dimensiones-cama-de-pilates',
    'diseno-estudios-pilates',
    'ejercicios-pilates-en-la-cama',
    'estudios-pilates-reformer',
    'financiacion-cama-de-pilates',
    'guia-completa-reformer',
    'historia-instructor-certificado',
    'liderazgo-emprendedores-pilates',
    'mantenimiento-reformer-pilates',
    'marketing-digital-estudios-pilates',
    'mejor-cama-de-pilates-para-casa',
    'mejor-cama-de-pilates-profesional',
    'mejor-reformer-espacios-pequenos',
    'mejores-marcas-cama-de-pilates',
    'modificaciones-pilates-lesiones',
    'networking-instructores-pilates',
    'para-que-sirve-pilates-en-cama',
    'pilates-para-deportistas-de-alto-rendimiento',
    'pilates-para-golf',
    'pilates-para-tenistas',
    'pilates-reformer-cdmx',
    'pilates-reformer-cerca-de-mi',
    'pilates-reformer-para-espalda',
    'pilates-rehabilitacion-cancer-mama',
    'precio-cama-de-pilates',
    'principios-alineacion-pilates',
    'prueba-automatizada-de-pipeline',
    'reformer-compacto',
    'reformer-vs-cadillac',
    'reformer-vs-mat-pilates',
    'reformer-vs-tower'
];

async function runBatch(slugs) {
    console.log(`🚀 Starting batch generation for ${slugs.length} blogs...`);

    // Process in chunks to avoid overwhelming the backend/rate limits
    const CHUNK_SIZE = 3;
    for (let i = 0; i < slugs.length; i += CHUNK_SIZE) {
        const chunk = slugs.slice(i, i + CHUNK_SIZE);
        console.log(`\n📦 Processing chunk ${i / CHUNK_SIZE + 1}: ${chunk.join(', ')}`);

        const input = {
            tool: 'enrich_specific_blogs',
            parameters: {
                slugs: chunk,
                force: false, // Don't regenerate if already exists (though our audit said they are missing)
                waitSeconds: 180 // Wait up to 3 mins per image
            }
        };

        try {
            await new Promise((resolve, reject) => {
                const child = spawn('node', [AGENT_PATH], {
                    env: {
                        ...process.env,
                        OUTPUT_DIR: BLOG_DIR, // Override config to point to src/content/blog
                        // Ensure we use the production URL or the one from .env
                        CONVEX_URL: process.env.VITE_CONVEX_URL || 'https://spotted-raven-102.convex.cloud'
                    },
                    stdio: ['pipe', 'inherit', 'inherit']
                });

                child.stdin.write(JSON.stringify(input));
                child.stdin.end();

                child.on('close', (code) => {
                    if (code === 0) resolve();
                    else reject(new Error(`Process exited with code ${code}`));
                });
            });
        } catch (err) {
            console.error(`❌ Error processing chunk: ${err.message}`);
        }
    }

    console.log('\n✅ Batch processing complete!');
}

// Run for all slugs
runBatch(SLUGS);
