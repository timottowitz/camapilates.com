import fs from 'fs';
import path from 'path';

const WHOP_API_KEY = 'apik_rKu6KhWJYxtaz_C6408634_C_37dee9ea7ba242beb2f2a311ae8b3ba48bc5664de188fd7710ef5085f9e8a4';
const PRODUCT_ID = 'prod_Iv5ZnKkugonCn';

async function uploadFileToWhop(filePath, filename) {
  console.log(`\n⬆️ Uploading ${filename} to Whop Files API...`);
  const fileBuffer = fs.readFileSync(filePath);
  
  // 1. Create file record
  const createRes = await fetch('https://api.whop.com/api/v1/files', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${WHOP_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      filename: filename,
      visibility: 'public'
    })
  });

  if (!createRes.ok) {
    const err = await createRes.text();
    throw new Error(`Failed to create Whop file: ${createRes.status} ${err}`);
  }

  const fileData = await createRes.json();
  console.log(`   File record created: ${fileData.id}`);

  // 2. PUT bytes to presigned S3 url
  const uploadRes = await fetch(fileData.upload_url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'image/png'
    },
    body: fileBuffer
  });

  if (!uploadRes.ok) {
    throw new Error(`S3 upload failed: ${uploadRes.status} ${uploadRes.statusText}`);
  }
  console.log(`   S3 upload successful (HTTP ${uploadRes.status})`);

  // 3. Poll for ready status
  let attempts = 0;
  let finalFile = null;
  while (attempts < 10) {
    await new Promise(r => setTimeout(r, 1000));
    const checkRes = await fetch(`https://api.whop.com/api/v1/files/${fileData.id}`, {
      headers: { 'Authorization': `Bearer ${WHOP_API_KEY}` }
    });
    finalFile = await checkRes.json();
    if (finalFile.upload_status === 'ready') {
      break;
    }
    attempts++;
  }

  console.log(`✅ ${filename} is READY on Whop!`);
  console.log(`   File ID: ${finalFile.id}`);
  console.log(`   Whop CDN URL: ${finalFile.url}`);
  return finalFile;
}

async function main() {
  console.log('🚀 Starting Whop Community Brand Upload...');

  const bannerPath = path.resolve('public/images/whop/whop-community-banner.png');
  const logoPath = path.resolve('public/images/whop/whop-community-logo.png');
  const avatarPath = path.resolve('public/images/whop/whop-community-avatar.png');

  const bannerFile = await uploadFileToWhop(bannerPath, 'whop-community-banner.png');
  const logoFile = await uploadFileToWhop(logoPath, 'whop-community-logo.png');
  const avatarFile = await uploadFileToWhop(avatarPath, 'whop-community-avatar.png');

  // Update Product Gallery on Whop
  console.log('\n🔄 Updating Whop Product prod_Iv5ZnKkugonCn gallery and metadata...');
  const patchRes = await fetch(`https://api.whop.com/api/v1/products/${PRODUCT_ID}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${WHOP_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: 'Reformer Pilates Español — Mexico Reformer Community',
      headline: 'Reformer Pilates Español · Formación Clínica en Cada Movimiento',
      description: 'Campus virtual oficial de Reformer Pilates en Español con Gabi y Laura Munive. Certificación y práctica clínica intensiva en Reformer con cama profesional individual exclusiva por alumna (sin turnos compartidos). Sedes en Querétaro y Monterrey.',
      gallery_images: [
        { id: bannerFile.id },
        { id: logoFile.id },
        { id: avatarFile.id }
      ]
    })
  });

  if (!patchRes.ok) {
    const err = await patchRes.text();
    throw new Error(`Failed to patch product: ${patchRes.status} ${err}`);
  }

  const updatedProduct = await patchRes.json();
  console.log('🎉 Whop product successfully updated!');
  console.log(`   Product Title: ${updatedProduct.title}`);
  console.log(`   Headline: ${updatedProduct.headline}`);
  console.log(`   Gallery Images count: ${updatedProduct.gallery_images?.length}`);
  updatedProduct.gallery_images?.forEach((img, i) => {
    console.log(`     [${i + 1}] ID: ${img.id} -> ${img.url}`);
  });

  // Save the URLs to a config json for easy access
  const assetRecord = {
    updatedAt: new Date().toISOString(),
    productId: PRODUCT_ID,
    banner: {
      id: bannerFile.id,
      url: bannerFile.url
    },
    logo: {
      id: logoFile.id,
      url: logoFile.url
    },
    avatar: {
      id: avatarFile.id,
      url: avatarFile.url
    }
  };

  fs.writeFileSync('src/content/whop-assets.json', JSON.stringify(assetRecord, null, 2));
  console.log('\n💾 Saved Whop assets to src/content/whop-assets.json');
}

main().catch(console.error);
