// "npx cap add android" sonrası küçük ayarlar: sürüm numarası ve deneme APK'larının sabit imzası.
import { promises as fs, existsSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const APP = path.join(ROOT, 'android', 'app');
const log = (...a) => console.log('[android]', ...a);
const pkg = JSON.parse(await fs.readFile(path.join(ROOT, 'package.json'), 'utf8'));

// 1) Sürüm: her yeni derleme daha büyük bir versionCode alır (GitHub derleme sırası), böylece yeni sürüm eskisinin üstüne kurulur.
const run = parseInt(process.env.GITHUB_RUN_NUMBER || '1', 10);
const versionCode = 100 + run;
const versionName = pkg.version + '.' + run;
const gradle = path.join(APP, 'build.gradle');
let g = await fs.readFile(gradle, 'utf8');
g = g.replace(/versionCode\s+\d+/, 'versionCode ' + versionCode).replace(/versionName\s+"[^"]*"/, 'versionName "' + versionName + '"');

// 2) Deneme (debug) APK'ları depodaki sabit test anahtarıyla imzalanır: yeni sürüm eskisinin üstüne kurulur, kayıtlar silinmez.
//    (Bunu yazmazsak Gradle her derlemede yeni, rastgele bir anahtar üretir.)
const testKey = path.join(ROOT, 'keys', 'debug-test.p12');
if (existsSync(testKey) && !g.includes('debug-test.p12')) {
  const block = [
    '    signingConfigs {',
    '        debug {',
    "            storeFile file('" + path.relative(APP, testKey).split(path.sep).join('/') + "')",
    "            storeType 'pkcs12'",
    "            storePassword 'android'",
    "            keyAlias 'androiddebugkey'",
    "            keyPassword 'android'",
    '        }',
    '    }',
  ].join('\n');
  if (!/^android\s*\{/m.test(g)) throw new Error('build.gradle içinde "android {" bulunamadı');
  g = g.replace(/^android\s*\{/m, (s) => s + '\n' + block);
  log('deneme APK imzası: keys/debug-test.p12');
}
await fs.writeFile(gradle, g);
log('sürüm', versionName, '(' + versionCode + ')');
