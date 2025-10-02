import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api.js';

function resolveConvexUrl() {
  return process.env.CONVEX_URL
    || process.env.VITE_CONVEX_URL
    || 'https://spotted-raven-102.convex.cloud';
}
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/**
 * Store OpenAI API key in Convex database (encrypted)
 * This enables automatic image generation from within Convex actions
 */
async function main() {
  if (!OPENAI_API_KEY) {
    console.error('\n❌ OPENAI_API_KEY environment variable not set');
    console.error('   Run: export OPENAI_API_KEY="sk-proj-..."');
    process.exit(1);
  }

  console.log('\n🔐 Storing OpenAI API Key in Convex Database\n');

  const client = new ConvexHttpClient(resolveConvexUrl());

  try {
    // Save encrypted API key
    await client.mutation(api.appSettings.saveApiKey, {
      key: 'OPENAI_API_KEY',
      value: OPENAI_API_KEY,
    });

    console.log('✅ API key stored successfully (encrypted)');
    console.log('✅ Automatic image generation is now enabled!');
    console.log('\n💡 Test it with: node scripts/test-auto-generation.js\n');

  } catch (error) {
    console.error('\n❌ Failed to store API key:', error.message);
    process.exit(1);
  }
}

main();
