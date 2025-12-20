// Test Instagram scraping with ScrapingBee
const SCRAPINGBEE_KEY = 'LUNFKKKETS3SZ1Z99TPPF5NDD98VFXNB3AXR140P33QCQHRIFTG73T1180CID9I7FESQ3QP7JD58MS0X';
const username = process.argv[2] || 'bia_pilates';

async function main() {
  const profileUrl = `https://www.instagram.com/${username}/`;
  const fetchUrl = `https://app.scrapingbee.com/api/v1/?api_key=${SCRAPINGBEE_KEY}&url=${encodeURIComponent(profileUrl)}&render_js=false&premium_proxy=true&country_code=us`;

  console.log(`Fetching: ${profileUrl}`);
  console.log(`Via ScrapingBee...`);

  const res = await fetch(fetchUrl, { redirect: 'follow' });

  if (!res.ok) {
    console.log(`Error: ${res.status}`);
    const text = await res.text();
    console.log(text.slice(0, 500));
    return;
  }

  const html = await res.text();
  console.log(`\nHTML length: ${html.length} chars`);

  // Extract og:image
  const ogImageMatch = html.match(/<meta[^>]+property=['"]og:image['"][^>]+content=['"]([^'"]+)['"][^>]*>/i);
  const ogImage = ogImageMatch?.[1];
  console.log(`\nog:image: ${ogImage || 'NOT FOUND'}`);

  // Extract og:title
  const ogTitleMatch = html.match(/<meta[^>]+property=['"]og:title['"][^>]+content=['"]([^'"]+)['"][^>]*>/i);
  const ogTitle = ogTitleMatch?.[1];
  console.log(`og:title: ${ogTitle || 'NOT FOUND'}`);

  // Extract og:description
  const ogDescMatch = html.match(/<meta[^>]+property=['"]og:description['"][^>]+content=['"]([^'"]+)['"][^>]*>/i);
  const ogDesc = ogDescMatch?.[1];
  console.log(`og:description: ${ogDesc?.slice(0, 100) || 'NOT FOUND'}...`);

  // If og:image found, try to fetch it
  if (ogImage) {
    console.log(`\nTrying to fetch profile image...`);
    const imageUrl = `https://app.scrapingbee.com/api/v1/?api_key=${SCRAPINGBEE_KEY}&url=${encodeURIComponent(ogImage)}&render_js=false`;
    const imgRes = await fetch(imageUrl, { redirect: 'follow' });
    console.log(`Image fetch status: ${imgRes.status}`);
    console.log(`Content-Type: ${imgRes.headers.get('content-type')}`);
    const imgBuf = await imgRes.arrayBuffer();
    console.log(`Image size: ${imgBuf.byteLength} bytes`);
  }
}

main().catch(console.error);
