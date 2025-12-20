import { ConvexHttpClient } from "convex/browser";

async function main() {
  const client = new ConvexHttpClient("https://enchanted-owl-832.convex.cloud");

  // Get failed profiles
  const profiles = await client.query("instagram:listProfiles", {});
  const failed = profiles.filter(p => p.status === 'error');

  console.log(`Found ${failed.length} failed profiles to retry`);

  for (const profile of failed) {
    console.log(`Retrying: ${profile.username}`);
    try {
      const result = await client.mutation("instagram:ensurePreviewByInstagram", {
        instagram: profile.username
      });
      console.log(`  Result:`, result);
    } catch (err) {
      console.log(`  Error:`, err.message);
    }
    // Small delay between requests
    await new Promise(r => setTimeout(r, 500));
  }

  // Wait for refreshes to complete
  console.log('Waiting for refreshes to complete...');
  await new Promise(r => setTimeout(r, 10000));

  // Check status
  const updated = await client.query("instagram:listProfiles", {});
  console.log('\nUpdated status:');
  for (const p of updated) {
    console.log(`  ${p.username}: ${p.status}${p.error ? ' - ' + p.error : ''}`);
  }
}

main().catch(console.error);
