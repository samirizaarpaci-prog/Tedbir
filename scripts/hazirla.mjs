// www klasörünü telefona hazırlar:
//   1) web/tedbir.html → www/index.html (tam sayfa, telefona uygun baş kısmıyla)
//   2) Yazı tipleri pakete gömülür (internetsiz de aynı görünsün)
//   3) Yerel bağlantılar (geri tuşu, arka plana geçince kaydetme) → www/native.js
import { promises as fs, existsSync } from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const WWW = path.join(ROOT, 'www');
const require = createRequire(path.join(ROOT, 'package.json'));
const log = (...a) => console.log('[hazırla]', ...a);

function pkgDir(name) {
  try { return path.dirname(require.resolve(name + '/package.json')); } catch { return null; }
}
async function copy(from, to) {
  await fs.mkdir(path.dirname(to), { recursive: true });
  await fs.copyFile(from, to);
}

// 1) Yazı tipleri: Young Serif, Onest, JetBrains Mono (SIL Open Font License). Yalnızca Türkçe için gereken latin + latin-ext.
const FONTS = [
  { pkg: '@fontsource/young-serif', weights: [400] },
  { pkg: '@fontsource/onest', weights: [400, 500, 600, 700] },
  { pkg: '@fontsource/jetbrains-mono', weights: [500, 600] },
];
async function fonts() {
  const out = path.join(WWW, 'fonts');
  await fs.mkdir(path.join(out, 'files'), { recursive: true });
  let css = '/* Pakete gömülü yazı tipleri (SIL Open Font License). scripts/hazirla.mjs üretir. */\n';
  let count = 0, missing = 0;
  for (const f of FONTS) {
    const dir = pkgDir(f.pkg);
    if (!dir) { log('UYARI:', f.pkg, 'bulunamadı'); missing++; continue; }
    for (const w of f.weights) {
      const src = path.join(dir, w + '.css');
      if (!existsSync(src)) { log('UYARI:', f.pkg, w, 'yok'); missing++; continue; }
      const text = await fs.readFile(src, 'utf8');
      for (const b of text.match(/@font-face\s*{[^}]*}/g) || []) {
        const m = b.match(/url\((?:'|")?\.\/files\/([^)'"]+?-(latin|latin-ext)-\d+-normal\.woff2)(?:'|")?\)/);
        if (!m) continue; // diğer alfabeler gerekmez
        await copy(path.join(dir, 'files', m[1]), path.join(out, 'files', m[1]));
        css += b.replace(/src:[^;]+;/, "src: url(./files/" + m[1] + ") format('woff2');") + '\n';
        count++;
      }
    }
  }
  await fs.writeFile(path.join(out, 'fonts.css'), css);
  log('yazı tipi yüzü:', count, missing ? '(eksik: ' + missing + ')' : '');
  return count > 0 && missing === 0;
}

// 2) Uygulama sayfası
async function page(localFonts) {
  let body = await fs.readFile(path.join(ROOT, 'web', 'tedbir.html'), 'utf8');
  const title = (body.match(/<title>[^<]*<\/title>/) || ['<title>Tedbir</title>'])[0];
  body = body.replace(title, '').replace(/<meta name="claude:viewport-fit-sides"[^>]*>\s*/, '');
  // Yazı tipleri pakete gömüldüyse internetten yükleme satırları çıkar; gömülemediyse internetten yüklenmeye devam eder.
  if (localFonts) body = body.replace(/<link rel="preconnect"[^>]*>\s*/g, '').replace(/<link rel="stylesheet" href="https:\/\/fonts\.googleapis\.com[^>]*>\s*/g, '');
  const head = [
    '<!doctype html>',
    '<html lang="tr">',
    '<head>',
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">',
    '<meta name="color-scheme" content="light dark">',
    title,
    localFonts ? '<link rel="stylesheet" href="fonts/fonts.css">' : '',
    '<style>:root{padding-top:var(--sat,env(safe-area-inset-top,0px));padding-bottom:var(--sab,env(safe-area-inset-bottom,0px))}body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style>',
    '<script>window.TEDBIR_APP=true;</script>',
    '</head>',
    '<body>',
  ].filter(Boolean).join('\n');
  const out = head + '\n' + body.trim() + '\n<script src="native.js"></script>\n</body>\n</html>\n';
  await fs.mkdir(WWW, { recursive: true });
  await fs.writeFile(path.join(WWW, 'index.html'), out);
  log('index.html yazıldı', Math.round(out.length / 1024) + ' KB');
}

// 3) Yerel bağlantılar
async function native() {
  let build;
  try { ({ build } = await import('esbuild')); } catch { log('UYARI: esbuild yok, native.js atlandı'); return; }
  await build({ entryPoints: [path.join(ROOT, 'native-entry.js')], bundle: true, format: 'iife', minify: true, target: 'es2019', outfile: path.join(WWW, 'native.js'), logLevel: 'warning' });
  log('native.js paketlendi');
}

await fs.rm(WWW, { recursive: true, force: true });
const localFonts = await fonts();
await page(localFonts);
await native();
