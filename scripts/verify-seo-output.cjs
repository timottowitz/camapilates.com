const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');

function read(relativePath) {
  const filePath = path.join(dist, relativePath);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing generated SEO file: dist/${relativePath}`);
  }
  return fs.readFileSync(filePath, 'utf8');
}

function requireText(content, expected, file) {
  if (!content.includes(expected)) {
    throw new Error(`dist/${file} is missing: ${expected}`);
  }
}

function rejectText(content, unexpected, file) {
  if (content.includes(unexpected)) {
    throw new Error(`dist/${file} still contains: ${unexpected}`);
  }
}

const home = read('index.html');
requireText(
  home,
  '<title>Cama de Pilates (Reformer) en México — Guías, Precios y Venta | CAMA Pilates</title>',
  'index.html',
);
requireText(home, '<link rel="canonical" href="https://camadepilates.com/">', 'index.html');
requireText(home, '<h1', 'index.html');
requireText(home, 'href="/shop/category/reformers"', 'index.html');

const certification = read('certificacion-pilates/monterrey.html');
requireText(
  certification,
  '<title>Certificación de Pilates Reformer en Monterrey | CAMA Pilates</title>',
  'certificacion-pilates/monterrey.html',
);
requireText(
  certification,
  '<link rel="canonical" href="https://camadepilates.com/certificacion-pilates/monterrey">',
  'certificacion-pilates/monterrey.html',
);
requireText(certification, 'Certificación de Pilates Reformer en Monterrey', 'certificacion-pilates/monterrey.html');
requireText(certification, 'href="/estudios-de-pilates/monterrey"', 'certificacion-pilates/monterrey.html');
requireText(certification, 'href="/reformer-para-estudio"', 'certificacion-pilates/monterrey.html');
rejectText(certification, 'Keywords:', 'certificacion-pilates/monterrey.html');

const monterreyDirectory = read('estudios-de-pilates/monterrey.html');
requireText(
  monterreyDirectory,
  '<title>Clases y Estudios de Pilates en Monterrey | CAMA Pilates</title>',
  'estudios-de-pilates/monterrey.html',
);
requireText(
  monterreyDirectory,
  '<link rel="canonical" href="https://camadepilates.com/estudios-de-pilates/monterrey">',
  'estudios-de-pilates/monterrey.html',
);
requireText(monterreyDirectory, 'Clases y estudios de Pilates en Monterrey', 'estudios-de-pilates/monterrey.html');
requireText(
  monterreyDirectory,
  'href="/certificacion-pilates/monterrey"',
  'estudios-de-pilates/monterrey.html',
);
requireText(
  monterreyDirectory,
  'href="/estudios-de-pilates/monterrey/atoms-studio-pilates-barre-yoga"',
  'estudios-de-pilates/monterrey.html',
);
requireText(monterreyDirectory, '"itemListElement":[{', 'estudios-de-pilates/monterrey.html');
rejectText(
  monterreyDirectory,
  'Consulta el directorio para comparar perfiles',
  'estudios-de-pilates/monterrey.html',
);

const studioEquipment = read('reformer-para-estudio.html');
requireText(
  studioEquipment,
  '<link rel="canonical" href="https://camadepilates.com/reformer-para-estudio">',
  'reformer-para-estudio.html',
);
requireText(studioEquipment, 'href="/shop/category/reformers"', 'reformer-para-estudio.html');

const redirects = read('_redirects');
for (const redirect of [
  '/products/ /shop 301',
  '/reformers/nuevas/ /shop/category/reformers 301',
  '/blog/precio-cama-de-pilates/ /cama-de-pilates/precio 301',
  '/blog/precio-cama-de-pilates-2025/ /cama-de-pilates/precio 301',
]) {
  requireText(redirects, redirect, '_redirects');
}

for (const obsolete of [
  'products.html',
  'reformers/nuevas.html',
  'blog/precio-cama-de-pilates.html',
  'blog/precio-cama-de-pilates-2025.html',
]) {
  if (fs.existsSync(path.join(dist, obsolete))) {
    throw new Error(`Obsolete generated page remains: dist/${obsolete}`);
  }
}

console.log('SEO output verification passed.');
