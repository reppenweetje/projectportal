import sharp from "sharp";
import { readdir, unlink } from "node:fs/promises";
import path from "node:path";

const dir = "./public/images/hofman/renders";
const files = (await readdir(dir)).filter((f) => f.endsWith(".png"));

for (const f of files) {
  const src = path.join(dir, f);
  const dst = path.join(dir, f.replace(/\.png$/, ".jpg"));
  await sharp(src)
    .resize({ width: 2400, withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(dst);
  await unlink(src);
  console.log(`✓ ${f} → ${path.basename(dst)}`);
}
