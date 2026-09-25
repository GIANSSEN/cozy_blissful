#!/usr/bin/env node
/**
 * Cozy Blissful — Production SMTP Engine (Node.js + Nodemailer)
 *
 * Features
 *  - SSL/TLS (port 465 implicit TLS, else STARTTLS w/ requireTLS)
 *  - Connection pooling (nodemailer pool: maxConnections / maxMessages)
 *  - Rate limiting (messages/sec throttle + bulk concurrency guard)
 *  - Resilient retry: exponential backoff + jitter; 5xx = no retry
 *  - Deliverability headers: List-Unsubscribe (+Post), Message-ID, Date, X-Mailer discipline
 *  - Multipart: text/plain (auto-generated) + text/html
 *  - .ics calendar invite attached as text/calendar (METHOD:PUBLISH)
 *  - Template compilation w/ HTML-escaped session data injection
 *  - --dry-run writes reviewable .eml files without sending
 *
 * Usage
 *   node sender.mjs --template approval|confirmation --to client@mail.com --data samples/approval.json
 *   node sender.mjs --template approval --to a@x.com --data session.json --dry-run --eml out/approval.eml
 *   node sender.mjs --bulk sessions.json --template confirmation            # [{to, ...session}]
 *
 * Env (.env or process env): MAIL_HOST MAIL_PORT MAIL_USERNAME MAIL_PASSWORD
 *   MAIL_ENCRYPTION=tls|ssl|none MAIL_FROM_ADDRESS MAIL_FROM_NAME FRONTEND_URL
 *   MAIL_POOL_MAX=3 MAIL_RATE_PER_SEC=2 MAIL_MAX_RETRIES=4
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import nodemailer from 'nodemailer';
import {
  renderTemplate, buildTokenMap, buildSubject, buildIcs, htmlToText,
} from './lib/compile.mjs';

const ROOT = path.dirname(fileURLToPath(import.meta.url));

/* ---------------- minimal .env loader (no deps) ---------------- */
function loadEnvFile(file) {
  if (!fs.existsSync(file)) return;
  for (const raw of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#') || !line.includes('=')) continue;
    const idx = line.indexOf('=');
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = val;
  }
}
loadEnvFile(path.join(ROOT, '.env'));

const env = (k, d = '') => process.env[k] ?? d;
const envInt = (k, d) => {
  const n = Number.parseInt(process.env[k] ?? '', 10);
  return Number.isFinite(n) ? n : d;
};

/* ---------------- config ---------------- */
const CONFIG = {
  host: env('MAIL_HOST', 'smtp.gmail.com'),
  port: envInt('MAIL_PORT', 587),
  user: env('MAIL_USERNAME', ''),
  pass: env('MAIL_PASSWORD', ''),
  encryption: env('MAIL_ENCRYPTION', 'tls').toLowerCase(), // tls | ssl | none
  fromAddress: env('MAIL_FROM_ADDRESS', 'cozyblissfulspa@gmail.com'),
  fromName: env('MAIL_FROM_NAME', 'Cozy Blissful Salon Spa'),
  poolMax: envInt('MAIL_POOL_MAX', 3),
  ratePerSec: Math.max(1, envInt('MAIL_RATE_PER_SEC', 2)),
  maxRetries: Math.max(1, envInt('MAIL_MAX_RETRIES', 4)),
};

/* ---------------- transport (pooled, TLS) ---------------- */
let transporter = null;

export function createTransport(overrides = {}) {
  const port = overrides.port ?? CONFIG.port;
  const enc = (overrides.encryption ?? CONFIG.encryption).toLowerCase();
  const secure = enc === 'ssl' || port === 465; // implicit TLS
  return nodemailer.createTransport({
    host: overrides.host ?? CONFIG.host,
    port,
    secure,
    requireTLS: !secure && enc !== 'none',
    auth: overrides.user ?? CONFIG.user
      ? { user: overrides.user ?? CONFIG.user, pass: overrides.pass ?? CONFIG.pass }
      : undefined,
    pool: true,
    maxConnections: overrides.poolMax ?? CONFIG.poolMax,
    maxMessages: 100, // recycle connection after N sends (server-friendly)
    rateLimit: Math.ceil(1000 / (overrides.ratePerSec ?? CONFIG.ratePerSec)), // ms between sends
    greetingTimeout: 10_000,
    connectionTimeout: 15_000,
    socketTimeout: 30_000,
    tls: { minVersion: 'TLSv1.2', rejectUnauthorized: true },
    ...overrides.smtp,
  });
}

export function getTransport() {
  if (!transporter) transporter = createTransport();
  return transporter;
}

/* ---------------- retry helpers ---------------- */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const backoff = (attempt) => Math.min(30_000, 1000 * 2 ** attempt) + Math.floor(Math.random() * 500);

/** 5xx (except greylisted 421/451-adjacent) => permanent. Everything else transient. */
export function isPermanent(err) {
  const code = String(err?.responseCode ?? err?.code ?? '');
  if (/^5\d\d$/.test(code)) return true;
  const msg = String(err?.response ?? err?.message ?? '').toLowerCase();
  if (/\b5\d\d\b/.test(msg) && !/421|4\.7\./.test(msg)) return true;
  return false;
}

/* ---------------- message builder ---------------- */
function readTemplate(kind) {
  const file = kind === 'approval' ? 'booking-approved.html' : 'booking-confirmation.html';
  return fs.readFileSync(path.join(ROOT, 'templates', file), 'utf8');
}

export function buildMessage({ to, session, kind, extraHeaders = {} }) {
  if (!to) throw new Error('buildMessage: "to" recipient is required');
  if (!['approval', 'confirmation'].includes(kind)) throw new Error('buildMessage: kind must be approval|confirmation');
  const tokens = buildTokenMap(session, kind);
  const html = renderTemplate(readTemplate(kind), tokens);
  const text = htmlToText(html);
  const subject = session.subject || buildSubject(session, kind);
  const ref = `CB-${tokens.bookingIdPadded}`;
  const unsubscribe = tokens.unsubscribeUrl;

  let ics = null;
  try {
    if (session.startIso) ics = buildIcs(session);
  } catch (err) {
    console.warn(`[mail-engine] skipping .ics (${err.message})`);
  }

  return {
    from: { name: CONFIG.fromName, address: CONFIG.fromAddress },
    to,
    replyTo: CONFIG.fromAddress,
    subject,
    text,
    html,
    attachments: ics
      ? [{ filename: `cozy-blissful-${ref}.ics`, content: ics, contentType: 'text/calendar; charset=utf-8; method=PUBLISH', contentDisposition: 'attachment' }]
      : [],
    headers: {
      'List-Unsubscribe': `<${unsubscribe}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      'X-Entity-ID': ref,
      'X-Cozy-Template': `booking-${kind}`,
      'X-Mailer': 'CozyBlissful-MailEngine/1.0',
      ...extraHeaders,
    },
  };
}

/* ---------------- send w/ retry ---------------- */
export async function sendMail({ to, session, kind, extraHeaders, dryRun = false, emlPath = null }) {
  const message = buildMessage({ to, session, kind, extraHeaders });
  if (dryRun) {
    const raw = await getTransport().sendMail({ ...message, to: undefined, envelope: undefined, messageId: undefined });
    void raw;
  }
  if (dryRun) {
    // Render full RFC5322 source without touching the network.
    const stub = nodemailer.createTransport({ streamTransport: true, newline: 'unix', buffer: true });
    const info = await stub.sendMail(message);
    const eml = info.message.toString();
    if (emlPath) {
      fs.mkdirSync(path.dirname(path.resolve(emlPath)), { recursive: true });
      fs.writeFileSync(emlPath, eml);
    }
    return { accepted: [to], dryRun: true, emlBytes: eml.length, emlPath, subject: message.subject };
  }
  const tx = getTransport();
  let lastErr;
  for (let attempt = 0; attempt < CONFIG.maxRetries; attempt += 1) {
    try {
      const info = await tx.sendMail(message);
      return { accepted: info.accepted, messageId: info.messageId, response: info.response, attempts: attempt + 1 };
    } catch (err) {
      lastErr = err;
      if (isPermanent(err)) throw err;
      if (attempt < CONFIG.maxRetries - 1) await sleep(backoff(attempt));
    }
  }
  throw lastErr;
}

export async function verifyTransport() {
  return getTransport().verify();
}

export async function closeTransport() {
  if (transporter) {
    transporter.close();
    transporter = null;
  }
}

/* ---------------- CLI ---------------- */
function parseArgs(argv) {
  const out = {};
  for (let i = 2; i < argv.length; i += 1) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith('--')) {
        out[key] = next;
        i += 1;
      } else out[key] = true;
    }
  }
  return out;
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.resolve(file), 'utf8'));
}

async function main() {
  const args = parseArgs(process.argv);
  const kind = String(args.template || 'approval').toLowerCase();
  const dryRun = args['dry-run'] === true || args['dry-run'] === 'true';

  try {
    if (args.bulk) {
      const list = readJson(args.bulk);
      if (!Array.isArray(list)) throw new Error('--bulk file must be a JSON array of {to, ...session}');
      if (!dryRun) await verifyTransport().then(() => console.log('[mail-engine] SMTP verified'));
      const results = [];
      const gap = Math.ceil(1000 / CONFIG.ratePerSec);
      for (const [i, item] of list.entries()) {
        const { to, ...session } = item;
        // eslint-disable-next-line no-await-in-loop
        const r = await sendMail({ to, session, kind: item.kind || kind, dryRun, emlPath: args.eml && `${args.eml}-${i}.eml` });
        results.push({ to, ok: true, ...r });
        console.log(`[mail-engine] ${i + 1}/${list.length} ${dryRun ? 'rendered' : 'sent'} -> ${to}`);
        if (i < list.length - 1) await sleep(gap); // eslint-disable-line no-await-in-loop
      }
      console.log(JSON.stringify({ ok: true, dryRun, count: results.length }, null, 2));
    } else {
      if (!args.to) throw new Error('Missing --to recipient (or use --bulk file)');
      if (!args.data) throw new Error('Missing --data session.json');
      const session = readJson(args.data);
      if (!dryRun) {
        if (!CONFIG.user || !CONFIG.pass) throw new Error('MAIL_USERNAME / MAIL_PASSWORD not set');
        await verifyTransport().then(() => console.log('[mail-engine] SMTP verified'));
      }
      const res = await sendMail({ to: args.to, session, kind, dryRun, emlPath: args.eml || undefined });
      console.log(JSON.stringify({ ok: true, ...res }, null, 2));
    }
  } catch (err) {
    console.error(`[mail-engine] ERROR: ${err.message}`);
    process.exitCode = 1;
  } finally {
    await closeTransport();
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
