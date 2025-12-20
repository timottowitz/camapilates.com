import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api.js';
import { getAdminToken } from './lib/adminAuth.js';

const CONVEX_URL = 'https://spotted-raven-102.convex.cloud';

async function main() {
  const client = new ConvexHttpClient(CONVEX_URL);
  const token = await getAdminToken(client);

  console.log('\n🧪 TEST 1: Check if OpenAI API key is stored\n');

  try {
    // Try to get a setting to see if the table works
    const settings = await client.query(api.appSettings.list, { token });
    console.log('✅ app_settings table accessible');
    console.log(`   Found ${settings?.length || 0} settings`);

    const hasOpenAI = settings?.some(s => s.key === 'OPENAI_API_KEY');
    if (hasOpenAI) {
      console.log('✅ OPENAI_API_KEY is stored in database');
    } else {
      console.log('❌ OPENAI_API_KEY not found in database');
      console.log('   Available keys:', settings?.map(s => s.key).join(', '));
    }
  } catch (error) {
    console.log('❌ Error accessing settings:', error.message);
  }

  console.log('\n');
}

main().catch(console.error);
