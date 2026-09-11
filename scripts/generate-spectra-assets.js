import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

async function makeIco(pngBuffers) {
  // pngBuffers: array of { width, height, buffer }
  const count = pngBuffers.length;
  const headerSize = 6;
  const entrySize = 16;
  let offset = headerSize + count * entrySize;

  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type 1 = icon
  header.writeUInt16LE(count, 4); // number of images

  const entries = [];
  for (const item of pngBuffers) {
    const entry = Buffer.alloc(entrySize);
    entry.writeUInt8(item.width >= 256 ? 0 : item.width, 0);
    entry.writeUInt8(item.height >= 256 ? 0 : item.height, 1);
    entry.writeUInt8(0, 2); // color palette count
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(item.buffer.length, 8); // size of image data
    entry.writeUInt32LE(offset, 12); // offset of image data
    entries.push(entry);
    offset += item.buffer.length;
  }

  return Buffer.concat([header, ...entries, ...pngBuffers.map((b) => b.buffer)]);
}

async function generate() {
  const root = process.cwd();
  const svgPath = path.join(root, "public", "spectra-logo.svg");
  const svgBuffer = fs.readFileSync(svgPath);

  console.log("Rendering 512x512 icon.png...");
  const icon512 = await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toBuffer();
  fs.writeFileSync(path.join(root, "public", "icon.png"), icon512);

  console.log("Generating multi-size ICO (16, 32, 48, 64, 128, 256)...");
  const sizes = [16, 32, 48, 64, 128, 256];
  const pngBuffers = [];
  for (const size of sizes) {
    const buf = await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toBuffer();
    pngBuffers.push({ width: size, height: size, buffer: buf });
  }

  const icoBuffer = await makeIco(pngBuffers);
  fs.writeFileSync(path.join(root, "public", "icon.ico"), icoBuffer);
  fs.writeFileSync(path.join(root, "app", "favicon.ico"), icoBuffer);

  console.log("Generating 1200x630 branding.png with Spectra aesthetic...");
  // Create an open-graph / branding card with dark background, glowing logo, and Spectra branding
  const logo280 = await sharp(svgBuffer)
    .resize(260, 260)
    .png()
    .toBuffer();

  const ogSvg = `
  <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="bg-glow" cx="50%" cy="40%" r="50%">
        <stop offset="0%" stop-color="#0e172e" stop-opacity="0.9"/>
        <stop offset="50%" stop-color="#080a14" stop-opacity="0.95"/>
        <stop offset="100%" stop-color="#07080d" stop-opacity="1"/>
      </radialGradient>
      <radialGradient id="cyan-glow" cx="35%" cy="45%" r="35%">
        <stop offset="0%" stop-color="#06b6d4" stop-opacity="0.25"/>
        <stop offset="100%" stop-color="#06b6d4" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="violet-glow" cx="65%" cy="45%" r="35%">
        <stop offset="0%" stop-color="#8b5cf6" stop-opacity="0.2"/>
        <stop offset="100%" stop-color="#8b5cf6" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="title-grad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#22d3ee"/>
        <stop offset="50%" stop-color="#a855f7"/>
        <stop offset="100%" stop-color="#38bdf8"/>
      </linearGradient>
    </defs>
    
    <rect width="1200" height="630" fill="#07080d"/>
    <rect width="1200" height="630" fill="url(#bg-glow)"/>
    <circle cx="420" cy="270" r="320" fill="url(#cyan-glow)"/>
    <circle cx="780" cy="270" r="320" fill="url(#violet-glow)"/>

    <text x="600" y="390" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="72" letter-spacing="-2" fill="url(#title-grad)">SPECTRA</text>
    <text x="600" y="445" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-weight="500" font-size="24" letter-spacing="0.5" fill="#94a3b8">Transmissão de Tela, Voz e Câmera em Alta Definição</text>
    
    <rect x="470" y="485" width="260" height="38" rx="19" fill="#06b6d4" fill-opacity="0.1" stroke="#06b6d4" stroke-opacity="0.4" stroke-width="1.5"/>
    <text x="600" y="510" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="14" letter-spacing="1.5" fill="#38bdf8">P2P WEBRTC MESH · 4K 120FPS</text>
  </svg>
  `;

  const ogBase = await sharp(Buffer.from(ogSvg)).png().toBuffer();

  const finalBranding = await sharp(ogBase)
    .composite([
      {
        input: logo280,
        top: 80,
        left: 470,
      },
    ])
    .png()
    .toBuffer();

  fs.writeFileSync(path.join(root, "public", "branding.png"), finalBranding);
  console.log("All Spectra assets generated successfully!");
}

generate().catch((err) => {
  console.error("Error generating assets:", err);
  process.exit(1);
});
