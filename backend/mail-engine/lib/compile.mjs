/**
 * Template compilation, plaintext fallback + .ics generation.
 * Zero dependencies — safe to reuse inside any Node service.
 */

const TOKEN_RE = /\{\{\s*([A-Za-z0-9_]+)\s*\}\}/g;

export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Tokens injected raw (already-escaped HTML fragments built by the engine). */
const RAW_TOKENS = new Set(['notesRow']);

/** Render {{token}} placeholders. Missing tokens render as '' (never leak braces). */
export function renderTemplate(html, data = {}) {
  return String(html).replace(TOKEN_RE, (_m, key) => {
    if (RAW_TOKENS.has(key)) return String(data[key] ?? '');
    return escapeHtml(data[key] ?? '');
  });
}

export function padBookingId(id) {
  const n = Number(id);
  if (!Number.isFinite(n)) return String(id ?? '00000');
  return String(Math.trunc(n)).padStart(5, '0');
}

export function buildUrls(data) {
  const frontend = (data.frontendUrl || process.env.FRONTEND_URL || 'http://localhost:5174').replace(/\/$/, '');
  const bookingId = data.bookingId ?? '';
  const service = encodeURIComponent(data.serviceName ?? '');
  const therapist = encodeURIComponent(data.therapistName ?? '');
  return {
    frontendUrl: frontend,
    dashboardUrl: `${frontend}/client/dashboard`,
    rebookUrl:
      data.rebookUrl ||
      `${frontend}/client/book?rebook=1&service=${service}&therapist=${therapist}`,
    addonUrl:
      data.addonUrl ||
      `${frontend}/client/book?addon=head-shoulder&booking=${encodeURIComponent(String(bookingId))}`,
    unsubscribeUrl:
      data.unsubscribeUrl || `${frontend}/unsubscribe?booking=${encodeURIComponent(String(bookingId))}`,
    whatsappUrl: data.whatsappUrl || 'https://wa.me/639995435913',
  };
}

/** Itemized NOTES row for the confirmation template (empty string when no notes). */
export function buildNotesRow(notes) {
  if (!notes || !String(notes).trim()) return '';
  const safe = escapeHtml(notes);
  return (
    '<tr>' +
    '<td class="detail-label" style="padding:9px 0;border-top:1px solid #ece3d0;font-size:11px;font-weight:700;color:#8a8a8a;letter-spacing:0.06em;vertical-align:top;">NOTES</td>' +
    `<td class="detail-value" style="padding:9px 0;border-top:1px solid #ece3d0;font-size:13px;color:#333333;text-align:right;vertical-align:top;">${safe}</td>` +
    '</tr>'
  );
}

export function buildPreheaders(data, kind) {
  const ref = `#CB-${padBookingId(data.bookingId)}`;
  if (kind === 'approval') {
    return (
      data.preheader ||
      `${data.clientName}, your ${data.serviceName} on ${data.appointmentDate} at ${data.appointmentTime} is confirmed. Booking ${ref}.`
    );
  }
  return (
    data.preheader ||
    `Hi ${data.clientName}, we received your ${data.serviceName} request for ${data.appointmentDate}. Booking ${ref} is pending review.`
  );
}

/** Normalize session payload into a full token map for either template. */
export function buildTokenMap(session, kind) {
  const urls = buildUrls(session);
  return {
    preheader: buildPreheaders(session, kind),
    clientName: session.clientName ?? 'Valued Client',
    serviceName: session.serviceName ?? 'Spa Service',
    appointmentDate: session.appointmentDate ?? '',
    appointmentTime: session.appointmentTime ?? '',
    therapistName: session.therapistName ?? (kind === 'approval' ? 'Our Specialist' : 'Awaiting Assignment'),
    bookingId: String(session.bookingId ?? ''),
    bookingIdPadded: padBookingId(session.bookingId),
    totalPrice: session.totalPrice ?? 'N/A',
    salonAddress: session.salonAddress ?? 'Cozy Blissful Spa & Wellness, Metro Manila',
    year: String(session.year ?? new Date().getFullYear()),
    notesRow: kind === 'confirmation' ? buildNotesRow(session.notes) : '',
    ...urls,
  };
}

/* ---------------- Plaintext fallback (deliverability requirement) ---------------- */

function decodeEntities(s) {
  return s
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&mdash;/g, '--')
    .replace(/&ndash;/g, '-')
    .replace(/&rsquo;|&#8217;/g, "'")
    .replace(/&lsquo;|&#8216;/g, "'")
    .replace(/&rdquo;|&#8221;/g, '"')
    .replace(/&ldquo;|&#8220;/g, '"')
    .replace(/&#8594;|&rarr;/g, '->')
    .replace(/&#10003;|&#9679;|&#9733;|&#10022;/g, '*')
    .replace(/&#8369;/g, 'P')
    .replace(/&[a-z]+;/gi, ' ');
}

/** Deterministic HTML -> text conversion tuned for these templates. */
export function htmlToText(html) {
  let s = String(html);
  s = s.replace(/<div[^>]*display:\s*none[\s\S]*?<\/div>/gi, ''); // preheader
  s = s.replace(/<style[\s\S]*?<\/style>/gi, '');
  s = s.replace(/<!--[\s\S]*?-->/g, '');
  s = s.replace(/<\/(h1|h2|p|tr|table|div|br)>/gi, '\n');
  s = s.replace(/<br[^>]*>/gi, '\n');
  s = s.replace(/<li[^>]*>/gi, '\n- ');
  s = s.replace(/<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, (_m, href, label) => {
    const text = label.replace(/<[^>]+>/g, '').trim();
    const clean = href.replace(/&amp;/g, '&');
    if (!text || text === clean) return clean;
    return `${text} (${clean})`;
  });
  s = s.replace(/<[^>]+>/g, '');
  s = decodeEntities(s);
  const lines = s.split('\n').map((l) => l.replace(/[ \t]+/g, ' ').trim());
  const out = [];
  let blank = false;
  for (const l of lines) {
    if (!l) {
      if (!blank) out.push('');
      blank = true;
    } else {
      out.push(l);
      blank = false;
    }
  }
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
}

/* ---------------- .ics calendar invite (RFC 5545) ---------------- */

function icsEscape(s) {
  return String(s ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

function foldLine(line) {
  // RFC 5545 §3.1: max 75 octets per content line.
  const out = [];
  let cur = line;
  while (Buffer.byteLength(cur, 'utf8') > 75) {
    let cut = 74;
    while (cut > 0 && Buffer.byteLength(cur.slice(0, cut), 'utf8') > 74) cut -= 1;
    out.push(cur.slice(0, cut));
    cur = ' ' + cur.slice(cut);
  }
  out.push(cur);
  return out.join('\r\n');
}

function toUtcStamp(date) {
  const p = (n) => String(n).padStart(2, '0');
  return (
    `${date.getUTCFullYear()}${p(date.getUTCMonth() + 1)}${p(date.getUTCDate())}` +
    `T${p(date.getUTCHours())}${p(date.getUTCMinutes())}${p(date.getUTCSeconds())}Z`
  );
}

/**
 * Build a VEVENT calendar invite.
 * @param {object} session — needs startIso (ISO w/ offset), durationMin, serviceName, salonAddress, bookingId, clientName, therapistName
 */
export function buildIcs(session) {
  const start = new Date(session.startIso);
  if (Number.isNaN(start.getTime())) throw new Error('buildIcs: session.startIso must be a valid ISO datetime');
  const durationMin = Number(session.durationMin ?? 60);
  const end = new Date(start.getTime() + durationMin * 60_000);
  const stamp = toUtcStamp(new Date());
  const uid = `CB-${padBookingId(session.bookingId)}-${start.getTime()}@cozyblissful.spa`;
  const summary = icsEscape(`${session.serviceName ?? 'Spa Service'} — Cozy Blissful (Booking #CB-${padBookingId(session.bookingId)})`);
  const description = icsEscape(
    [
      `Booking #CB-${padBookingId(session.bookingId)}`,
      `Client: ${session.clientName ?? ''}`,
      `Specialist: ${session.therapistName ?? ''}`,
      `Price: ${session.totalPrice ?? ''}`,
      'Please arrive 5 minutes early. Show your booking ID at reception.',
    ].join('\n'),
  );
  const lines = [
    'BEGIN:VCALENDAR',
    'PRODID:-//Cozy Blissful Spa//Booking Engine//EN',
    'VERSION:2.0',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${toUtcStamp(start)}`,
    `DTEND:${toUtcStamp(end)}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${icsEscape(session.salonAddress ?? 'Cozy Blissful Spa & Wellness, Metro Manila')}`,
    'STATUS:CONFIRMED',
    'TRANSP:OPAQUE',
    'BEGIN:VALARM',
    'TRIGGER:-PT24H',
    'ACTION:DISPLAY',
    'DESCRIPTION:Reminder: Cozy Blissful session tomorrow',
    'END:VALARM',
    'BEGIN:VALARM',
    'TRIGGER:-PT2H',
    'ACTION:DISPLAY',
    'DESCRIPTION:Reminder: Cozy Blissful session in 2 hours',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return lines.map(foldLine).join('\r\n') + '\r\n';
}

/* ---------------- Subjects ---------------- */

export function buildSubject(session, kind) {
  const ref = `#CB-${padBookingId(session.bookingId)}`;
  if (kind === 'approval') return `Booking Approved (${ref}) – Cozy Blissful Spa`;
  return `Booking Received (${ref}) – ${session.serviceName ?? 'Spa Service'} on ${session.appointmentDate ?? ''}`;
}
