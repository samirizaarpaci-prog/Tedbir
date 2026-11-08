// Uygulama simgesini ve açılış ekranını üretir (assets/*.png). Bir kez çalıştırılır, çıkan dosyalar depoya konur.
// Çalıştırmak için: npm install sharp && node tools/simgeler.mjs
// Simge: mor zemin üzerinde beyaz kaşe mührü ve "T" harfi (uygulamadaki muhasebe mührünün sade hali).
import sharp from 'sharp';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const OUT = path.join(ROOT, 'assets');
const MOR = '#4B3BB8', ACIK_MOR = '#A99CFF', KAGIT = '#F3F2F8', GECE = '#12111A';

// 108 birimlik çerçevede, ortası (54, 54) olan mühür. Uyarlanabilir simgenin güvenli alanı (yarıçap 33) içinde kalır.
const muhur = (renk) => `
  <circle cx="54" cy="54" r="26" fill="none" stroke="${renk}" stroke-width="3"/>
  <circle cx="54" cy="54" r="21" fill="none" stroke="${renk}" stroke-width="1.5"/>
  <path fill="${renk}" d="M43,41 h22 v6 h-2 v-3 h-6.5 v20 h3 v2 h-11 v-2 h3 v-20 h-6.5 v3 h-2 z"/>`;

const svg = (size, zemin, icerik, olcek = 1) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 108 108">
  ${zemin ? `<rect width="108" height="108" fill="${zemin}"/>` : ''}
  <g transform="translate(54 54) scale(${olcek}) translate(-54 -54)">${icerik}</g>
</svg>`;

const yaz = (ad, kod) => sharp(Buffer.from(kod)).png().toFile(path.join(OUT, ad)).then(() => console.log('yazıldı:', ad));

await yaz('icon-only.png', svg(1024, MOR, muhur('#FFFFFF'), 1.25));
await yaz('icon-foreground.png', svg(1024, null, muhur('#FFFFFF'), 1));
await yaz('icon-background.png', svg(1024, MOR, ''));
await yaz('splash.png', svg(2732, KAGIT, muhur(MOR), 0.3));
await yaz('splash-dark.png', svg(2732, GECE, muhur(ACIK_MOR), 0.3));
