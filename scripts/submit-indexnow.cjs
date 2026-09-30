#!/usr/bin/env node
/**
 * Submit all URLs from public/sitemap.xml to Bing and IndexNow
 * Protocol: https://www.indexnow.org/documentation
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const KEY = 'eb4c4232a9014589b3f71c98de602da4';
const HOST = 'camadepilates.com';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const SITEMAP_PATH = path.resolve(__dirname, '../public/sitemap.xml');

function extractUrlsFromSitemap(xmlContent) {
  const matches = xmlContent.matchAll(/<loc>\s*(https?:\/\/[^<]+)\s*<\/loc>/gi);
  const urls = new Set();
  for (const m of matches) {
    const url = m[1].trim();
    if (url.includes(HOST)) {
      urls.add(url);
    }
  }
  return Array.from(urls);
}

function postJson(urlStr, data) {
  return new Promise((resolve) => {
    const u = new URL(urlStr);
    const postData = JSON.stringify(data);

    const req = https.request(
      {
        hostname: u.hostname,
        port: 443,
        path: u.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Content-Length': Buffer.byteLength(postData),
          'User-Agent': 'IndexNow-Submitter/1.0',
        },
        timeout: 10000,
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          resolve({
            endpoint: urlStr,
            statusCode: res.statusCode,
            statusMessage: res.statusMessage,
            body,
          });
        });
      }
    );

    req.on('error', (err) => {
      resolve({
        endpoint: urlStr,
        statusCode: 0,
        statusMessage: err.message,
        body: '',
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        endpoint: urlStr,
        statusCode: 408,
        statusMessage: 'Timeout',
        body: '',
      });
    });

    req.write(postData);
    req.end();
  });
}

async function main() {
  console.log('--- Bing & IndexNow URL Submitter ---');
  if (!fs.existsSync(SITEMAP_PATH)) {
    console.warn(`Sitemap not found at: ${SITEMAP_PATH}`);
    return;
  }

  const sitemapXml = fs.readFileSync(SITEMAP_PATH, 'utf8');
  const urls = extractUrlsFromSitemap(sitemapXml);

  if (urls.length === 0) {
    console.warn('No URLs found in sitemap.');
    return;
  }

  console.log(`Found ${urls.length} URLs in sitemap for ${HOST}`);

  const endpoints = [
    'https://api.indexnow.org/indexnow',
    'https://www.bing.com/indexnow',
    'https://yandex.com/indexnow',
  ];

  // Batch URLs in chunks of 100 to stay well within limits
  const CHUNK_SIZE = 100;
  const chunks = [];
  for (let i = 0; i < urls.length; i += CHUNK_SIZE) {
    chunks.push(urls.slice(i, i + CHUNK_SIZE));
  }

  for (const endpoint of endpoints) {
    console.log(`\nSubmitting to ${endpoint}...`);
    for (let c = 0; c < chunks.length; c++) {
      const chunkUrls = chunks[c];
      const payload = {
        host: HOST,
        key: KEY,
        keyLocation: KEY_LOCATION,
        urlList: chunkUrls,
      };

      try {
        const res = await postJson(endpoint, payload);
        if (res.statusCode === 200 || res.statusCode === 202) {
          console.log(`✓ [Chunk ${c + 1}/${chunks.length}] Status: ${res.statusCode} ${res.statusMessage} (${chunkUrls.length} URLs submitted)`);
        } else {
          console.log(`! [Chunk ${c + 1}/${chunks.length}] Status: ${res.statusCode} ${res.statusMessage}`);
          if (res.body) console.log(`  Details: ${res.body}`);
        }
      } catch (e) {
        console.warn(`! [Chunk ${c + 1}/${chunks.length}] Error:`, e.message);
      }
    }
  }

  console.log('--- Submission complete ---');
}

main().catch((err) => {
  console.error('IndexNow submission failed:', err);
  // Do not crash process
  process.exit(0);
});
