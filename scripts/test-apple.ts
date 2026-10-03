import { generateApplePass } from '../src/lib/apple';
import fs from 'fs';

(async () => {
  const buf = await generateApplePass('cmuha1hn00001rc0kq4dgmfsy');
  fs.writeFileSync('/tmp/test.pkpass', buf);
  console.log('PKPASS generado:', buf.length, 'bytes');
  process.exit(0);
})().catch((e) => { console.error('ERROR:', e.message); process.exit(1); });
