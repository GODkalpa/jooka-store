const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
require('dotenv').config({ path: '.env.local' });
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function createIco(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // 1 = ICO
  header.writeUInt16LE(images.length, 4); // Number of images

  let offset = 6 + images.length * 16;
  const dirEntries = [];

  for (const img of images) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(img.width >= 256 ? 0 : img.width, 0);
    entry.writeUInt8(img.height >= 256 ? 0 : img.height, 1);
    entry.writeUInt8(0, 2); // Color palette
    entry.writeUInt8(0, 3); // Reserved
    entry.writeUInt16LE(1, 4); // Color planes
    entry.writeUInt16LE(32, 6); // Bits per pixel
    entry.writeUInt32LE(img.buffer.length, 8); // Size
    entry.writeUInt32LE(offset, 12); // Offset
    dirEntries.push(entry);
    offset += img.buffer.length;
  }

  return Buffer.concat([header, ...dirEntries, ...images.map(img => img.buffer)]);
}

async function main() {
  const svgPath = path.join(__dirname, '..', 'public', 'Jooka.svg');
  if (!fs.existsSync(svgPath)) {
    throw new Error('Jooka.svg not found at ' + svgPath);
  }

  console.log('Reading SVG source from', svgPath);
  const svgBuffer = fs.readFileSync(svgPath);

  // Generate PNG sizes
  const sizes = [
    { name: 'favicon-16x16.png', size: 16, publicDir: true },
    { name: 'favicon-32x32.png', size: 32, publicDir: true },
    { name: 'favicon-48x48.png', size: 48, publicDir: true },
    { name: 'apple-touch-icon.png', size: 180, publicDir: true, appDir: 'apple-icon.png' },
    { name: 'android-chrome-192x192.png', size: 192, publicDir: true },
    { name: 'android-chrome-512x512.png', size: 512, publicDir: true },
    { name: 'icon.png', size: 512, publicDir: true, appDir: 'icon.png' },
  ];

  const generatedBuffers = {};
  const icoSizes = [16, 32, 48];
  const icoImages = [];

  for (const item of sizes) {
    const buf = await sharp(svgBuffer)
      .resize(item.size, item.size, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toBuffer();

    generatedBuffers[item.name] = buf;
    const destPath = path.join(__dirname, '..', 'public', item.name);
    fs.writeFileSync(destPath, buf);
    console.log(`Generated: public/${item.name} (${item.size}x${item.size})`);

    if (item.appDir) {
      const appDestPath = path.join(__dirname, '..', 'app', item.appDir);
      fs.writeFileSync(appDestPath, buf);
      console.log(`Generated: app/${item.appDir}`);
    }

    if (icoSizes.includes(item.size)) {
      icoImages.push({ width: item.size, height: item.size, buffer: buf });
    }
  }

  // Create favicon.ico
  const icoBuffer = createIco(icoImages);
  fs.writeFileSync(path.join(__dirname, '..', 'public', 'favicon.ico'), icoBuffer);
  fs.writeFileSync(path.join(__dirname, '..', 'app', 'favicon.ico'), icoBuffer);
  console.log('Generated: public/favicon.ico & app/favicon.ico');

  // Copy/ensure favicon.svg in public
  fs.writeFileSync(path.join(__dirname, '..', 'public', 'favicon.svg'), svgBuffer);
  console.log('Generated: public/favicon.svg');

  // Create webmanifest
  const manifest = {
    name: 'JOOKA | Premium Streetwear Nepal',
    short_name: 'JOOKA',
    description: 'Nepal premier online destination for luxury streetwear, outerwear, and modern capsule collections.',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#000000',
    icons: [
      {
        src: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };

  fs.writeFileSync(
    path.join(__dirname, '..', 'public', 'site.webmanifest'),
    JSON.stringify(manifest, null, 2)
  );
  fs.writeFileSync(
    path.join(__dirname, '..', 'public', 'manifest.json'),
    JSON.stringify(manifest, null, 2)
  );
  console.log('Generated: public/site.webmanifest & public/manifest.json');

  // Upload to Cloudinary
  console.log('\n--- Uploading to Cloudinary (folder: jooka/branding/favicons) ---');
  const uploadResults = {};

  const filesToUpload = [
    { localPath: path.join(__dirname, '..', 'public', 'Jooka.svg'), publicId: 'jooka-logo-icon-svg', resourceType: 'image' },
    { localPath: path.join(__dirname, '..', 'public', 'favicon.ico'), publicId: 'favicon-ico', resourceType: 'raw' },
    { localPath: path.join(__dirname, '..', 'public', 'favicon-32x32.png'), publicId: 'favicon-32x32', resourceType: 'image' },
    { localPath: path.join(__dirname, '..', 'public', 'favicon-16x16.png'), publicId: 'favicon-16x16', resourceType: 'image' },
    { localPath: path.join(__dirname, '..', 'public', 'apple-touch-icon.png'), publicId: 'apple-touch-icon', resourceType: 'image' },
    { localPath: path.join(__dirname, '..', 'public', 'android-chrome-192x192.png'), publicId: 'android-chrome-192x192', resourceType: 'image' },
    { localPath: path.join(__dirname, '..', 'public', 'android-chrome-512x512.png'), publicId: 'android-chrome-512x512', resourceType: 'image' },
  ];

  for (const file of filesToUpload) {
    try {
      const res = await cloudinary.uploader.upload(file.localPath, {
        folder: 'jooka/branding/favicons',
        public_id: file.publicId,
        overwrite: true,
        resource_type: file.resourceType,
      });
      uploadResults[file.publicId] = res.secure_url;
      console.log(`✓ Uploaded ${file.publicId}: ${res.secure_url}`);
    } catch (err) {
      console.error(`✗ Failed uploading ${file.publicId}:`, err.message);
    }
  }

  // Save summary JSON
  fs.writeFileSync(
    path.join(__dirname, '..', 'public', 'favicon-cloudinary-urls.json'),
    JSON.stringify(uploadResults, null, 2)
  );
  console.log('\nSaved Cloudinary URLs summary to public/favicon-cloudinary-urls.json');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
