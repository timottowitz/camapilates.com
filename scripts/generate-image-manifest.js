#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const DIST_DIR = path.join(__dirname, '..', 'dist');
const MANIFEST_FILE = path.join(__dirname, '..', 'src', 'image-manifest.json');

// Image extensions to process
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];

/**
 * Generate MD5 hash for a file
 */
function generateFileHash(filePath) {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('md5').update(content).digest('hex').substring(0, 8);
}

/**
 * Get all image files recursively
 */
function getImageFiles(dir, baseDir = dir) {
  const files = [];

  if (!fs.existsSync(dir)) {
    return files;
  }

  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...getImageFiles(fullPath, baseDir));
    } else if (IMAGE_EXTENSIONS.includes(path.extname(item).toLowerCase())) {
      const relativePath = path.relative(baseDir, fullPath);
      files.push({
        path: relativePath,
        fullPath: fullPath
      });
    }
  }

  return files;
}

/**
 * Generate image manifest with hashes
 */
function generateImageManifest() {
  console.log('🖼️  Generating image manifest...');

  const manifest = {};
  const imageFiles = getImageFiles(PUBLIC_DIR);

  for (const file of imageFiles) {
    try {
      const hash = generateFileHash(file.fullPath);
      const webPath = '/' + file.path.replace(/\\/g, '/');
      const hashedPath = webPath.replace(/(\.[^.]+)$/, `.${hash}$1`);

      manifest[webPath] = {
        original: webPath,
        hashed: hashedPath,
        hash: hash
      };

      console.log(`✓ ${webPath} -> ${hashedPath}`);
    } catch (error) {
      console.error(`✗ Error processing ${file.path}:`, error.message);
    }
  }

  // Write manifest
  const manifestDir = path.dirname(MANIFEST_FILE);
  if (!fs.existsSync(manifestDir)) {
    fs.mkdirSync(manifestDir, { recursive: true });
  }

  fs.writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2));
  console.log(`📝 Image manifest written to ${MANIFEST_FILE}`);
  console.log(`📊 Processed ${Object.keys(manifest).length} images`);

  return manifest;
}

/**
 * Copy images with hashed names to dist
 */
function copyHashedImages(manifest) {
  console.log('📁 Copying hashed images to dist...');

  for (const [originalPath, info] of Object.entries(manifest)) {
    try {
      const sourcePath = path.join(PUBLIC_DIR, originalPath.substring(1));
      const distOriginalPath = path.join(DIST_DIR, originalPath.substring(1));
      const distHashedPath = path.join(DIST_DIR, info.hashed.substring(1));

      // Ensure directories exist
      const distOriginalDir = path.dirname(distOriginalPath);
      const distHashedDir = path.dirname(distHashedPath);

      if (!fs.existsSync(distOriginalDir)) {
        fs.mkdirSync(distOriginalDir, { recursive: true });
      }
      if (!fs.existsSync(distHashedDir)) {
        fs.mkdirSync(distHashedDir, { recursive: true });
      }

      // Copy original
      fs.copyFileSync(sourcePath, distOriginalPath);

      // Copy hashed version
      fs.copyFileSync(sourcePath, distHashedPath);

      console.log(`✓ Copied: ${originalPath} -> ${info.hashed}`);
    } catch (error) {
      console.error(`✗ Error copying ${originalPath}:`, error.message);
    }
  }
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    const manifest = generateImageManifest();
    copyHashedImages(manifest);
    console.log('🎉 Image cache-busting setup complete!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

export { generateImageManifest, copyHashedImages };