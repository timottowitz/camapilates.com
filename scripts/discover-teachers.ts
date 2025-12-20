#!/usr/bin/env -S npx tsx
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api';

const CONVEX_URL = process.env.VITE_CONVEX_URL || process.env.CONVEX_URL;

if (!CONVEX_URL) {
  console.error('❌ CONVEX_URL or VITE_CONVEX_URL environment variable required');
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

let cachedToken: string | null = null;
async function getAdminToken(): Promise<string> {
  if (cachedToken) return cachedToken;
  const direct = process.env.ADMIN_TOKEN || process.env.CAMA_ADMIN_TOKEN;
  if (direct) {
    cachedToken = direct;
    return direct;
  }
  const username = process.env.ADMIN_USER;
  const password = process.env.ADMIN_PASS;
  if (username && password) {
    const res: any = await client.mutation(api.admin.login, { username, password } as any);
    if (res?.ok && res?.token) {
      cachedToken = res.token;
      return res.token;
    }
  }
  throw new Error('Missing admin auth: set ADMIN_TOKEN (or CAMA_ADMIN_TOKEN) or ADMIN_USER + ADMIN_PASS');
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';

  switch (command) {
    case 'discover': {
      const citySlug = args[1] || 'cdmx';
      const limit = args[2] ? parseInt(args[2], 10) : undefined;
      const dryRun = args.includes('--dry-run');
      const token = await getAdminToken();

      console.log(`\n🔍 Discovering teachers in ${citySlug}...`);
      if (dryRun) console.log('   (dry run - no data will be saved)\n');

      const result = await client.action(api.teacherDiscovery.discoverTeachersInCity, {
        token,
        citySlug,
        limit,
        dryRun,
      });

      console.log('\n📊 Results:');
      console.log(`   Studios processed: ${result.processed}/${result.total}`);
      console.log(`   Teachers found: ${result.teachersFound}`);
      console.log(`   Links created: ${result.linksCreated}`);
      console.log(`   Errors: ${result.errors.length}`);
      console.log(`   Duration: ${Math.round(result.duration / 1000)}s`);

      if (result.errors.length > 0) {
        console.log('\n⚠️  Errors:');
        result.errors.forEach((e: { studioSlug: string; error: string }) => {
          console.log(`   - ${e.studioSlug}: ${e.error}`);
        });
      }
      break;
    }

    case 'validate': {
      const citySlug = args[1] || 'cdmx';
      const minScore = args[2] ? parseInt(args[2], 10) : 40;
      const token = await getAdminToken();

      console.log(`\n✅ Validating teachers in ${citySlug} (min score: ${minScore})...`);

      const result = await client.action(api.teacherDiscovery.validateAndPublishTeachers, {
        token,
        citySlug,
        minQualityScore: minScore,
      });

      console.log('\n📊 Tier Distribution:');
      console.log(`   Total: ${result.total}`);
      console.log(`   Tier 1 (indexed, verified): ${result.tier1}`);
      console.log(`   Tier 2 (indexed, claimable): ${result.tier2}`);
      console.log(`   Tier 3 (noindex): ${result.tier3}`);
      break;
    }

    case 'list': {
      const citySlug = args[1] || 'cdmx';
      const limit = args[2] ? parseInt(args[2], 10) : 20;
      const token = await getAdminToken();

      console.log(`\n📋 Teachers in ${citySlug}:\n`);

      const teachers = await client.query(api.teacherDiscovery.getDiscoveredTeachers, {
        token,
        citySlug,
        limit,
      });

      if (teachers.length === 0) {
        console.log('   No teachers found.');
      } else {
        teachers.forEach((t: any) => {
          const verified = t.isVerified ? '✓' : ' ';
          const specs = t.specializations?.value?.slice(0, 3).join(', ') || '';
          console.log(`   [${verified}] ${t.fullName.value} (score: ${t.dataQualityScore})`);
          if (specs) console.log(`       ${specs}`);
        });
        console.log(`\n   Total: ${teachers.length} teachers`);
      }
      break;
    }

    case 'discover-llm': {
      const citySlug = args[1] || 'cdmx';
      const limit = args[2] ? parseInt(args[2], 10) : undefined;
      const dryRun = args.includes('--dry-run');
      const token = await getAdminToken();

      console.log(`\n🤖 LLM-powered teacher discovery in ${citySlug}...`);
      if (dryRun) console.log('   (dry run - no data will be saved)\n');

      const result = await client.action(api.teacherDiscovery.discoverTeachersWithLLM, {
        token,
        citySlug,
        limit,
        dryRun,
      });

      console.log('\n📊 Results:');
      console.log(`   Studios processed: ${result.processed}/${result.total}`);
      console.log(`   Teachers found: ${result.teachersFound}`);
      console.log(`   Links created: ${result.linksCreated}`);
      console.log(`   Errors: ${result.errors.length}`);
      console.log(`   Duration: ${Math.round(result.duration / 1000)}s`);

      if (result.errors.length > 0) {
        console.log('\n⚠️  Errors:');
        result.errors.forEach((e: { studioSlug: string; error: string }) => {
          console.log(`   - ${e.studioSlug}: ${e.error}`);
        });
      }
      break;
    }

    case 'help':
    default:
      console.log(`
Teacher Discovery CLI

Usage:
  npx tsx scripts/discover-teachers.ts <command> [options]

Commands:
  discover <city> [limit] [--dry-run]      Discover teachers (regex-based)
  discover-llm <city> [limit] [--dry-run]  Discover teachers with GPT-4 extraction
  validate <city> [minScore]               Validate and tier teachers for publishing
  list <city> [limit]                      List discovered teachers

Examples:
  npx tsx scripts/discover-teachers.ts discover cdmx 5 --dry-run
  npx tsx scripts/discover-teachers.ts discover-llm cdmx 3
  npx tsx scripts/discover-teachers.ts validate cdmx 40
  npx tsx scripts/discover-teachers.ts list cdmx 10

Environment:
  CONVEX_URL or VITE_CONVEX_URL must be set
  OPENAI_API_KEY required for discover-llm command
`);
  }
}

main().catch(console.error);
