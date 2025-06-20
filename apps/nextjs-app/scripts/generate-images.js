// apps/nextjs-app/scripts/generate-images.js
import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const assetsDir = path.resolve(__dirname, 'assets');
const outputDir = path.resolve(__dirname, '../public/images/projects');

function aspectString(w, h) {
  const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
  const d = gcd(w, h);
  return `${w / d}:${h / d}`;
}

const variants = [
  {
    suffix: 'thumb',
    width: 640,
    height: 360,
    fit: 'cover',
    allowUpscale: false,
  },
  {
    suffix: 'thumb-lg',
    width: 900,
    height: 600,
    fit: 'cover',
    allowUpscale: false,
  },
  {
    suffix: 'hero',
    width: 1800,
    height: 600,
    fit: 'cover',
    allowUpscale: true, // allow upscaling so we get exact 3:1 if desired
    background: { r: 255, g: 255, b: 255, alpha: 1 },
  },
  {
    suffix: 'screen-1',
    width: 1200,
    height: 900,
    fit: 'cover',
    allowUpscale: false,
  },
  {
    suffix: 'og',
    width: 1200,
    height: 630,
    fit: 'cover',
    allowUpscale: false,
  },
];

async function generateImages() {
  // Ensure output folder exists
  await fs.mkdir(outputDir, { recursive: true });

  // Read all files in assets folder
  const files = await fs.readdir(assetsDir);
  const sources = files.filter((f) =>
    /(.+)-source\.(png|jpe?g|webp)$/i.test(f)
  );
  if (!sources.length) {
    console.error(
      `❌ No "*-source.(png|jpg|jpeg|webp)" files found in ${assetsDir}`
    );
    process.exit(1);
  }

  for (const filename of sources) {
    const m = filename.match(/^(.+)-source\.(png|jpe?g|webp)$/i);
    if (!m) continue;
    const slug = m[1];
    const srcPath = path.join(assetsDir, filename);

    let meta;
    try {
      meta = await sharp(srcPath).metadata();
    } catch (err) {
      console.error(`❌ metadata failed for ${filename}`, err);
      continue;
    }
    const srcW = meta.width || 0;
    const srcH = meta.height || 0;
    console.log(
      `\n🔄 Processing "${slug}" from ${filename} (${srcW}×${srcH}, aspect ${aspectString(
        srcW,
        srcH
      )})`
    );

    for (const {
      suffix,
      width,
      height,
      fit,
      allowUpscale,
      background,
    } of variants) {
      const outName = `${slug}-${suffix}.webp`;
      const outPath = path.join(outputDir, outName);
      const upscaleNeeded = srcW < width || srcH < height;
      const withoutEnlargement = !allowUpscale;

      try {
        // Use const here because we don't reassign pipeline later
        const pipeline = sharp(srcPath).resize({
          width,
          height,
          fit,
          background,
          withoutEnlargement,
        });

        await pipeline.webp({ quality: 80 }).toFile(outPath);

        // After writing, get metadata to report actual dimensions
        const outMeta = await sharp(outPath).metadata();
        const outW = outMeta.width || 0;
        const outH = outMeta.height || 0;
        const outAsp = aspectString(outW, outH);
        const desiredAsp = aspectString(width, height);
        const approx = (outW / outH).toFixed(2);

        let msg = `  ✔️ ${outName} [desired ${desiredAsp}] → ${outW}×${outH} (actual ${outAsp}≈${approx}:1)`;
        if (upscaleNeeded && allowUpscale) msg += ', upscaled';
        if (outAsp !== desiredAsp) msg += ' ⚠️ ratio mismatch';
        console.log(msg);
      } catch (err) {
        console.error(`❌ ${outName} failed:`, err);
      }
    }
  }

  console.log('\n✅ All done!');
}

generateImages().catch((err) => {
  console.error('❌ Unexpected error:', err);
  process.exit(1);
});
