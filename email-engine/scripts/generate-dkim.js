#!/usr/bin/env node

import { generateKeyPairSync } from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const keysDir = path.resolve(__dirname, '..', 'keys');

if (!fs.existsSync(keysDir)) {
  fs.mkdirSync(keysDir, { recursive: true });
}

const { privateKey, publicKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem'
  }
});

const privateKeyPath = path.join(keysDir, 'dkim-private.key');
const publicKeyPath = path.join(keysDir, 'dkim-public.key');

fs.writeFileSync(privateKeyPath, privateKey, { mode: 0o600 });
fs.writeFileSync(publicKeyPath, publicKey);

console.log('DKIM keys generated successfully!');
console.log(`Private key: ${privateKeyPath} (chmod 600)`);
console.log(`Public key: ${publicKeyPath}`);
console.log('');
console.log('Add this TXT record to your DNS:');
console.log(`default._domainkey.yourdomain.com IN TXT "v=DKIM1; k=rsa; p=${publicKey.replace(/-----BEGIN PUBLIC KEY-----\n/, '').replace(/\n-----END PUBLIC KEY-----/, '').replace(/\n/g, '')}"`);
console.log('');
console.log('Update your .env with:');
console.log(`DKIM_PRIVATE_KEY_PATH=./keys/dkim-private.key`);
console.log(`DKIM_DOMAIN=yourdomain.com`);
console.log(`DKIM_SELECTOR=default`);