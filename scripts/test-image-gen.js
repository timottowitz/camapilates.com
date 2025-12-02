
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

async function runImageAgent(slug) {
    console.log(`🎨 Testing Image Agent on: ${slug}`);
    return new Promise((resolve, reject) => {
        const child = spawn('node', [path.join(ROOT, 'scripts', 'cli-image-agent.js')], {
            stdio: ['pipe', 'pipe', 'pipe']
        });

        let stdout = '';
        let stderr = '';

        child.stdout.on('data', d => stdout += d.toString());
        child.stderr.on('data', d => {
            stderr += d.toString();
            process.stderr.write(d); // Stream stderr to console to see progress
        });

        child.on('close', code => {
            if (code === 0) {
                try {
                    resolve(JSON.parse(stdout));
                } catch {
                    resolve({ success: true, raw: stdout });
                }
            } else {
                resolve({ success: false, error: stderr, code });
            }
        });

        const input = {
            tool: 'enrich_specific_blogs',
            parameters: {
                slugs: [slug],
                force: true, // Force regeneration to test the logic
                waitSeconds: 5 // Short wait for testing (likely won't finish generation in 5s but will queue it)
            }
        };

        child.stdin.write(JSON.stringify(input));
        child.stdin.end();
    });
}

async function main() {
    const slug = process.argv[2];
    if (!slug) {
        console.error('Please provide a slug');
        process.exit(1);
    }
    const res = await runImageAgent(slug);
    console.log('\n✅ Result:', JSON.stringify(res, null, 2));
}

main();
