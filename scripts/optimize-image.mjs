import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, '..', 'public');
const input = path.join(publicDir, 'apexbuild-image.png');

const beforeSize = fs.statSync(input).size;
console.log(`Original PNG: ${(beforeSize / 1024).toFixed(1)} KB`);

// 1. Compress PNG in-place (lossless compression + strip metadata)
await sharp(input)
    .png({ compressionLevel: 9, effort: 10, palette: false })
    .toFile(path.join(publicDir, 'apexbuild-image-opt.png'));

const pngSize = fs.statSync(path.join(publicDir, 'apexbuild-image-opt.png')).size;
console.log(`Optimized PNG: ${(pngSize / 1024).toFixed(1)} KB`);

// 2. Also produce a WebP version (much smaller, widely supported)
await sharp(input)
    .webp({ quality: 85, effort: 6 })
    .toFile(path.join(publicDir, 'apexbuild-image.webp'));

const webpSize = fs.statSync(path.join(publicDir, 'apexbuild-image.webp')).size;
console.log(`WebP version: ${(webpSize / 1024).toFixed(1)} KB`);

// Replace the original PNG with the optimized one
fs.renameSync(path.join(publicDir, 'apexbuild-image-opt.png'), input);
console.log('\nDone! Original PNG replaced with the optimized version.');
console.log(`WebP saved as: /apexbuild-image.webp`);
