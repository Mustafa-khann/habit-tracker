#!/usr/bin/env node
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

async function ensureDir(p) {
  await mkdir(p, { recursive: true });
}

async function main() {
  const sharp = (await import('sharp')).default;
  const png2iconsModule = await import('png2icons');
  const png2icons = png2iconsModule.default || png2iconsModule;
  const root = process.cwd();
  const src = path.join(root, 'build', 'icon.svg');
  const out = path.join(root, 'build', 'icons');
  await ensureDir(out);
  const svg = await readFile(src);

  const sizes = [16, 24, 32, 48, 64, 128, 256, 512];
  await Promise.all(
    sizes.map(async (size) => {
      const buf = await sharp(svg).resize(size, size).png({ compressionLevel: 9 }).toBuffer();
      // electron-builder expects linux.icon dir to contain files named like "256x256.png"
      const file = path.join(out, `${size}x${size}.png`);
      await writeFile(file, buf);
    })
  );

  // Create a main icon.png used by electron-builder
  const mainPng = await (await import('sharp')).default(svg).resize(512, 512).png({ compressionLevel: 9 }).toBuffer();
  await writeFile(path.join(root, 'build', 'icon.png'), mainPng);

  // Create Windows .ico
  const icoBuf = png2icons.PNGBufferToICO(mainPng, png2icons.BICUBIC, 0, false);
  if (icoBuf && icoBuf.length > 0) {
    await writeFile(path.join(root, 'build', 'icon.ico'), icoBuf);
  }

  // Create macOS .icns
  const icnsBuf = png2icons.PNGBufferToICNS(mainPng, png2icons.BICUBIC, false, 0);
  if (icnsBuf && icnsBuf.length > 0) {
    await writeFile(path.join(root, 'build', 'icon.icns'), icnsBuf);
  }

  console.log('Icons generated: build/icons/*, build/icon.png, build/icon.ico, build/icon.icns');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

