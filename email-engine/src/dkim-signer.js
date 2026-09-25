import crypto from 'crypto';
import { config } from './config.js';
import { logger } from './logger.js';

function parsePrivateKey(privateKeyPem, passphrase = '') {
  try {
    if (passphrase) {
      return crypto.createPrivateKey({
        key: privateKeyPem,
        passphrase,
        format: 'pem'
      });
    }
    return crypto.createPrivateKey({
      key: privateKeyPem,
      format: 'pem'
    });
  } catch (error) {
    logger.error({ error: error.message }, 'Failed to parse DKIM private key');
    throw new Error(`Invalid DKIM private key: ${error.message}`);
  }
}

function canonicalizeHeader(headerLine) {
  return headerLine
    .replace(/\r\n/g, '\n')
    .replace(/\n/g, '\r\n')
    .replace(/\s+/g, ' ')
    .trim();
}

function canonicalizeBody(body) {
  return body
    .replace(/\r\n/g, '\n')
    .replace(/\n/g, '\r\n')
    .replace(/\r\n\s*$/g, '\r\n')
    .replace(/\n\s*$/g, '\n');
}

function generateDKIMSignature(message, options) {
  const {
    domainName,
    keySelector,
    privateKey,
    headerFields = ['from', 'to', 'subject', 'date', 'message-id', 'mime-version', 'content-type'],
    passphrase = ''
  } = options;
  
  const key = parsePrivateKey(privateKey, passphrase);
  
  const headers = headerFields.map(field => field.toLowerCase());
  const headerLines = [];
  
  for (const field of headers) {
    const value = message.headers.get(field);
    if (value) {
      headerLines.push(`${field}: ${canonicalizeHeader(value)}`);
    }
  }
  
  const headerString = headerLines.join('\r\n');
  const body = canonicalizeBody(message.text || message.html || '');
  const bodyHash = crypto.createHash('sha256').update(body).digest('base64');
  
  const timestamp = Math.floor(Date.now() / 1000);
  const expires = timestamp + 86400 * 30;
  
  const signatureHeaders = [
    `v=1`,
    `a=rsa-sha256`,
    `c=relaxed/relaxed`,
    `d=${domainName}`,
    `s=${keySelector}`,
    `t=${timestamp}`,
    `x=${expires}`,
    `bh=${bodyHash}`,
    `h=${headers.join(':')}`
  ].join('; ');
  
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(`${headerString}\r\n`);
  sign.end();
  
  const signature = sign.sign(key, 'base64');
  
  return `DKIM-Signature: ${signatureHeaders}; b=${signature}`;
}

export function signMessage(message, dkimConfig = config.dkim) {
  if (!dkimConfig.privateKey) {
    logger.warn('DKIM private key not configured, skipping DKIM signing');
    return message;
  }
  
  try {
    const dkimHeader = generateDKIMSignature(message, dkimConfig);
    message.headers.set('DKIM-Signature', dkimHeader.replace('DKIM-Signature: ', ''));
    logger.debug('Message signed with DKIM');
    return message;
  } catch (error) {
    logger.error({ error: error.message }, 'DKIM signing failed');
    throw error;
  }
}

export function generateDKIMRecord(domainName, keySelector, publicKey) {
  const cleanedKey = publicKey
    .replace(/-----BEGIN PUBLIC KEY-----/, '')
    .replace(/-----END PUBLIC KEY-----/, '')
    .replace(/\s/g, '');
  
  return `${keySelector}._domainkey.${domainName}. IN TXT "v=DKIM1; k=rsa; p=${cleanedKey}"`;
}

export function generateSPFRecord(domainName, includeHosts = [], ip4 = [], ip6 = [], mechanism = '~all') {
  const parts = ['v=spf1'];
  
  if (ip4.length > 0) {
    parts.push(...ip4.map(ip => `ip4:${ip}`));
  }
  
  if (ip6.length > 0) {
    parts.push(...ip6.map(ip => `ip6:${ip}`));
  }
  
  if (includeHosts.length > 0) {
    parts.push(...includeHosts.map(host => `include:${host}`));
  }
  
  parts.push(mechanism);
  
  return `${domainName}. IN TXT "${parts.join(' ')}"`;
}

export function generateDMARCRecord(domainName, policy = 'quarantine', rua = null, ruf = null, pct = 100) {
  const parts = [`v=DMARC1`, `p=${policy}`, `pct=${pct}`];
  
  if (rua) {
    parts.push(`rua=mailto:${rua}`);
  }
  
  if (ruf) {
    parts.push(`ruf=mailto:${ruf}`);
  }
  
  return `_dmarc.${domainName}. IN TXT "${parts.join('; ')}"`;
}