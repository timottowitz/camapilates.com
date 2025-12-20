import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api.js';
import { getAdminToken } from './lib/adminAuth.js';

function resolveConvexUrl() {
  return process.env.CONVEX_URL
    || process.env.VITE_CONVEX_URL
    || 'https://spotted-raven-102.convex.cloud';
}
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

/**
 * Store available API keys in Convex database (encrypted)
 * Supports OpenAI (prompt generation) and Gemini (image generation)
 */
async function main() {
  if (!OPENAI_API_KEY && !GEMINI_API_KEY) {
    console.error('\n❌ No API keys found to store');
    console.error('   Set OPENAI_API_KEY and/or GEMINI_API_KEY (or GOOGLE_API_KEY) before running this script.');
    process.exit(1);
  }

  console.log('\n🔐 Storing API keys in Convex Database\n');

  const client = new ConvexHttpClient(resolveConvexUrl());
  const token = await getAdminToken(client);

  try {
    if (OPENAI_API_KEY) {
      await client.mutation(api.appSettings.saveApiKey, {
        token,
        key: 'OPENAI_API_KEY',
        value: OPENAI_API_KEY,
      });
      console.log('✅ Stored OPENAI_API_KEY (encrypted)');
    }

    if (GEMINI_API_KEY) {
      await client.mutation(api.appSettings.saveApiKey, {
        token,
        key: 'GEMINI_API_KEY',
        value: GEMINI_API_KEY,
      });
      console.log('✅ Stored GEMINI_API_KEY (encrypted)');
    }

    console.log('\n💡 Keys stored successfully.\n');

  } catch (error) {
    console.error('\n❌ Failed to store API key:', error.message);
    process.exit(1);
  }
}

main();
