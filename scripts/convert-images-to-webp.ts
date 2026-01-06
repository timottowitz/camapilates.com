/**
 * WebP Image Conversion Pipeline
 *
 * Converts all PNG/JPG images in the project to WebP format.
 * - Maintains original file structure
 * - Updates all code references (.tsx, .ts, .json, .md, .css)
 * - Backs up original images before deletion
 * - Reports size savings
 *
 * Usage: npx tsx scripts/convert-images-to-webp.ts [--dry-run] [--keep-originals]
 */

import sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

// Configuration
const CONFIG = {
  publicDir: './public',
  srcDir: './src',
  backupDir: './backup-images',
  webpQuality: 85,
  // Directories to scan for images
  imageDirs: [
    './public/images',
    './public/og',
    './public/lovable-uploads',
  ],
  // File extensions to convert
  imageExtensions: ['.png', '.jpg', '.jpeg', '.PNG', '.JPG', '.JPEG'],
  // Files to update references in
  codeExtensions: ['.tsx', '.ts', '.js', '.jsx', '.json', '.md', '.css', '.html'],
  // Directories to search for code references
  codeDirs: ['./src', './public'],
};

interface ConversionResult {
  originalPath: string;
  webpPath: string;
  originalSize: number;
  webpSize: number;
  savedBytes: number;
  savedPercent: number;
}

interface UpdateResult {
  file: string;
  replacements: number;
}

// Parse command line args
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const KEEP_ORIGINALS = args.includes('--keep-originals');

async function findAllImages(): Promise<string[]> {
  const images: string[] = [];

  for (const dir of CONFIG.imageDirs) {
    if (!fs.existsSync(dir)) continue;

    const files = await glob(`${dir}/**/*`, { nodir: true });
    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      if (CONFIG.imageExtensions.map(e => e.toLowerCase()).includes(ext)) {
        images.push(file);
      }
    }
  }

  return images;
}

async function convertToWebP(imagePath: string): Promise<ConversionResult | null> {
  const ext = path.extname(imagePath).toLowerCase();
  const webpPath = imagePath.replace(/\.(png|jpg|jpeg)$/i, '.webp');

  // Skip if already WebP
  if (ext === '.webp') return null;

  // Skip if WebP already exists
  if (fs.existsSync(webpPath)) {
    console.log(`  ⏭️  Skipping (WebP exists): ${imagePath}`);
    return null;
  }

  const originalSize = fs.statSync(imagePath).size;

  if (DRY_RUN) {
    console.log(`  🔍 Would convert: ${imagePath} → ${webpPath}`);
    return {
      originalPath: imagePath,
      webpPath,
      originalSize,
      webpSize: Math.round(originalSize * 0.3), // Estimate
      savedBytes: Math.round(originalSize * 0.7),
      savedPercent: 70,
    };
  }

  try {
    await sharp(imagePath)
      .webp({ quality: CONFIG.webpQuality })
      .toFile(webpPath);

    const webpSize = fs.statSync(webpPath).size;
    const savedBytes = originalSize - webpSize;
    const savedPercent = Math.round((savedBytes / originalSize) * 100);

    console.log(`  ✅ Converted: ${path.basename(imagePath)} → ${path.basename(webpPath)} (${savedPercent}% smaller)`);

    return {
      originalPath: imagePath,
      webpPath,
      originalSize,
      webpSize,
      savedBytes,
      savedPercent,
    };
  } catch (error) {
    console.error(`  ❌ Error converting ${imagePath}:`, error);
    return null;
  }
}

async function findCodeFiles(): Promise<string[]> {
  const files: string[] = [];

  for (const dir of CONFIG.codeDirs) {
    if (!fs.existsSync(dir)) continue;

    for (const ext of CONFIG.codeExtensions) {
      const pattern = `${dir}/**/*${ext}`;
      const matches = await glob(pattern, {
        nodir: true,
        ignore: ['**/node_modules/**', '**/dist/**', '**/backup-images/**']
      });
      files.push(...matches);
    }
  }

  return [...new Set(files)]; // Dedupe
}

async function updateCodeReferences(conversions: ConversionResult[]): Promise<UpdateResult[]> {
  const results: UpdateResult[] = [];
  const codeFiles = await findCodeFiles();

  // Build replacement map
  const replacements: Map<string, string> = new Map();
  for (const conv of conversions) {
    // Get relative paths for matching
    const oldRelative = conv.originalPath.replace(/^\.\/public/, '');
    const newRelative = conv.webpPath.replace(/^\.\/public/, '');

    // Add various path formats
    replacements.set(oldRelative, newRelative);
    replacements.set(conv.originalPath.replace('./', '/'), conv.webpPath.replace('./', '/'));

    // Handle paths without leading slash
    const oldBasename = path.basename(conv.originalPath);
    const newBasename = path.basename(conv.webpPath);
    replacements.set(oldBasename, newBasename);
  }

  console.log(`\n📝 Updating code references in ${codeFiles.length} files...`);

  for (const file of codeFiles) {
    let content = fs.readFileSync(file, 'utf-8');
    let replacementCount = 0;
    const originalContent = content;

    for (const [oldPath, newPath] of replacements) {
      // Create regex that matches the path with various quote styles
      const escapedOld = oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escapedOld, 'g');

      const matches = content.match(regex);
      if (matches) {
        replacementCount += matches.length;
        content = content.replace(regex, newPath);
      }
    }

    if (replacementCount > 0) {
      if (DRY_RUN) {
        console.log(`  🔍 Would update ${file}: ${replacementCount} references`);
      } else {
        fs.writeFileSync(file, content, 'utf-8');
        console.log(`  ✅ Updated ${file}: ${replacementCount} references`);
      }
      results.push({ file, replacements: replacementCount });
    }
  }

  return results;
}

async function backupOriginals(conversions: ConversionResult[]): Promise<void> {
  if (DRY_RUN || KEEP_ORIGINALS) return;

  console.log(`\n📦 Backing up original images...`);

  if (!fs.existsSync(CONFIG.backupDir)) {
    fs.mkdirSync(CONFIG.backupDir, { recursive: true });
  }

  for (const conv of conversions) {
    const relativePath = conv.originalPath.replace(/^\.\/public\//, '');
    const backupPath = path.join(CONFIG.backupDir, relativePath);
    const backupDir = path.dirname(backupPath);

    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    fs.copyFileSync(conv.originalPath, backupPath);
  }

  console.log(`  ✅ Backed up ${conversions.length} images to ${CONFIG.backupDir}/`);
}

async function deleteOriginals(conversions: ConversionResult[]): Promise<void> {
  if (DRY_RUN || KEEP_ORIGINALS) return;

  console.log(`\n🗑️  Removing original images...`);

  for (const conv of conversions) {
    fs.unlinkSync(conv.originalPath);
    console.log(`  ✅ Deleted: ${conv.originalPath}`);
  }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

async function main() {
  console.log('🖼️  WebP Image Conversion Pipeline\n');
  console.log(`Mode: ${DRY_RUN ? '🔍 DRY RUN (no changes)' : '⚡ LIVE'}`);
  console.log(`Keep originals: ${KEEP_ORIGINALS ? 'Yes' : 'No (will backup and delete)'}\n`);

  // Step 1: Find all images
  console.log('📁 Scanning for images...');
  const images = await findAllImages();
  console.log(`   Found ${images.length} PNG/JPG images\n`);

  if (images.length === 0) {
    console.log('No images to convert. Exiting.');
    return;
  }

  // Print inventory
  console.log('📋 IMAGE INVENTORY:');
  console.log('─'.repeat(80));

  const byDir: Map<string, string[]> = new Map();
  for (const img of images) {
    const dir = path.dirname(img);
    if (!byDir.has(dir)) byDir.set(dir, []);
    byDir.get(dir)!.push(img);
  }

  for (const [dir, files] of byDir) {
    console.log(`\n📂 ${dir} (${files.length} files)`);
    for (const f of files) {
      const size = fs.statSync(f).size;
      console.log(`   • ${path.basename(f)} (${formatBytes(size)})`);
    }
  }

  console.log('\n' + '─'.repeat(80));

  // Step 2: Convert images
  console.log('\n🔄 Converting images to WebP...');
  const conversions: ConversionResult[] = [];

  for (const imagePath of images) {
    const result = await convertToWebP(imagePath);
    if (result) conversions.push(result);
  }

  if (conversions.length === 0) {
    console.log('\nNo images were converted (all already WebP or errors).');
    return;
  }

  // Step 3: Update code references
  const updateResults = await updateCodeReferences(conversions);

  // Step 4: Backup and delete originals
  await backupOriginals(conversions);
  await deleteOriginals(conversions);

  // Summary
  console.log('\n' + '═'.repeat(80));
  console.log('📊 CONVERSION SUMMARY');
  console.log('═'.repeat(80));

  const totalOriginalSize = conversions.reduce((sum, c) => sum + c.originalSize, 0);
  const totalWebpSize = conversions.reduce((sum, c) => sum + c.webpSize, 0);
  const totalSaved = totalOriginalSize - totalWebpSize;
  const avgSavedPercent = Math.round((totalSaved / totalOriginalSize) * 100);

  console.log(`\n✅ Images converted: ${conversions.length}`);
  console.log(`📄 Code files updated: ${updateResults.length}`);
  console.log(`🔄 Total references updated: ${updateResults.reduce((sum, r) => sum + r.replacements, 0)}`);
  console.log(`\n💾 Size savings:`);
  console.log(`   Original total: ${formatBytes(totalOriginalSize)}`);
  console.log(`   WebP total:     ${formatBytes(totalWebpSize)}`);
  console.log(`   Saved:          ${formatBytes(totalSaved)} (${avgSavedPercent}% reduction)`);

  if (!DRY_RUN && !KEEP_ORIGINALS) {
    console.log(`\n📦 Originals backed up to: ${CONFIG.backupDir}/`);
  }

  console.log('\n✨ Done!');

  if (DRY_RUN) {
    console.log('\n⚠️  This was a dry run. Run without --dry-run to apply changes.');
  }
}

main().catch(console.error);
