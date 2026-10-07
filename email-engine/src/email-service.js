import { randomUUID } from 'crypto';
import { config } from './config.js';
import { logger, createChildLogger } from './logger.js';
import { renderTemplate } from './template-compiler.js';
import { generatePlaintextFallback, createMinimalPlaintext } from './plaintext-generator.js';
import { sendWithRetry, closeTransporter, verifyConnection } from './smtp-transport.js';
import { signMessage } from './dkim-signer.js';

const emailLogger = createChildLogger({ component: 'email-service' });

function generateMessageId() {
  const timestamp = Date.now();
  const random = randomUUID().split('-')[0];
  return `<${timestamp}.${random}@${config.dkim.domainName}>`;
}

function buildUnsubscribeHeaders(bookingId, email) {
  const unsubscribeUrl = `${config.frontend.unsubscribeBaseUrl}?booking=${bookingId}&email=${encodeURIComponent(email)}`;
  return {
    'List-Unsubscribe': `<${unsubscribeUrl}>, <mailto:unsubscribe@${config.dkim.domainName}?subject=unsubscribe-${bookingId}>`,
    'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    'List-Id': `${config.salon.name} <bookings.${config.dkim.domainName}>`
  };
}

/**
 * Normalize single-service OR multi-service payloads into ONE email model.
 * Accepts legacy { serviceName, bookingId } or new { services: [...], bookingIds: [...] }.
 */
function normalizeBookingData(data) {
  const services = Array.isArray(data.services) && data.services.length
    ? data.services.map((s, i) => ({
      index: i + 1,
      name: s.name || 'Spa Service',
      price: s.price || '₱0.00',
      duration: s.duration || 60,
    }))
    : [{
      index: 1,
      name: data.serviceName || 'Spa Service',
      price: data.totalPrice || '₱0.00',
      duration: data.totalDuration || 60,
    }];

  const bookingIds = Array.isArray(data.bookingIds) && data.bookingIds.length
    ? data.bookingIds
    : [data.bookingId];
  const pad = (id) => `#CB-${String(id).padStart(5, '0')}`;

  return {
    ...data,
    services,
    serviceCount: services.length,
    isMultiService: services.length > 1,
    serviceNames: services.map((s) => s.name).join(', '),
    bookingIds,
    bookingRefs: bookingIds.map(pad).join(', '),
    primaryBookingId: bookingIds[0],
  };
}

export async function sendApprovalEmail(data) {
  const normalized = normalizeBookingData(data);
  const {
    clientName,
    clientEmail,
    serviceName,
    appointmentDate,
    appointmentTime,
    therapistName,
    bookingId,
    totalPrice,
    salonAddress,
    notes
  } = normalized;

  if (!clientEmail) {
    throw new Error('Client email is required');
  }

  emailLogger.info({ bookingId: normalized.primaryBookingId, serviceCount: normalized.serviceCount, clientEmail, type: 'approval' }, 'Preparing approval email (one per booking group)');

  const html = renderTemplate('booking_approval', normalized);
  
  const text = generatePlaintextFallback(html) || createMinimalPlaintext(data, 'approval');
  
  const messageId = generateMessageId();
  const unsubscribeHeaders = buildUnsubscribeHeaders(normalized.primaryBookingId, clientEmail);
  const approvalSubject = normalized.isMultiService
    ? `Booking Received (${normalized.bookingRefs}) – ${normalized.serviceCount} services on ${appointmentDate}`
    : `Booking Received (${`#CB-${String(normalized.primaryBookingId).padStart(5, '0')}`}) – ${serviceName} on ${appointmentDate}`;

  const mailOptions = {
    from: {
      name: config.sender.fromName,
      address: config.sender.fromAddress
    },
    to: {
      name: clientName,
      address: clientEmail
    },
    replyTo: config.sender.replyTo,
    subject: approvalSubject,
    text,
    html,
    headers: {
      'Message-ID': messageId,
      'X-Priority': '3',
      'X-MSMail-Priority': 'Normal',
      'Importance': 'Normal',
      'X-Auto-Response-Suppress': 'OOF, AutoReply',
      ...unsubscribeHeaders
    },
    messageId,
    // Attach .ics calendar invite
    icalEvent: {
      filename: `booking-${normalized.primaryBookingId}.ics`,
      method: 'REQUEST',
      content: generateICalEvent({
        type: 'approval',
        bookingId: normalized.primaryBookingId,
        clientName,
        clientEmail,
        serviceName: normalized.serviceNames,
        appointmentDate,
        appointmentTime,
        therapistName,
        salonAddress
      })
    }
  };

  // Sign with DKIM
  signMessage(mailOptions);

  const result = await sendWithRetry(mailOptions);

  emailLogger.info({
    bookingId: normalized.primaryBookingId,
    clientEmail,
    messageId: result.messageId
  }, 'Approval email sent');

  return {
    success: true,
    messageId: result.messageId,
    bookingId: normalized.primaryBookingId,
    bookingIds: normalized.bookingIds,
    type: 'approval'
  };
}

export async function sendConfirmationEmail(data) {
  const normalized = normalizeBookingData(data);
  const {
    clientName,
    clientEmail,
    serviceName,
    appointmentDate,
    appointmentTime,
    therapistName,
    totalPrice,
    salonAddress
  } = normalized;

  if (!clientEmail) {
    throw new Error('Client email is required');
  }

  emailLogger.info({ bookingId: normalized.primaryBookingId, serviceCount: normalized.serviceCount, clientEmail, type: 'confirmation' }, 'Preparing confirmation email (one per booking group)');

  const html = renderTemplate('booking_confirmation', normalized);
  
  const text = generatePlaintextFallback(html) || createMinimalPlaintext(data, 'confirmation');
  
  const messageId = generateMessageId();
  const unsubscribeHeaders = buildUnsubscribeHeaders(normalized.primaryBookingId, clientEmail);
  const confirmSubject = normalized.isMultiService
    ? `Booking Approved (${normalized.bookingRefs}) – ${normalized.serviceCount} services – ${config.salon.name}`
    : `Booking Approved (${`#CB-${String(normalized.primaryBookingId).padStart(5, '0')}`}) – ${config.salon.name}`;

  const mailOptions = {
    from: {
      name: config.sender.fromName,
      address: config.sender.fromAddress
    },
    to: {
      name: clientName,
      address: clientEmail
    },
    replyTo: config.sender.replyTo,
    subject: confirmSubject,
    text,
    html,
    headers: {
      'Message-ID': messageId,
      'X-Priority': '3',
      'X-MSMail-Priority': 'Normal',
      'Importance': 'Normal',
      'X-Auto-Response-Suppress': 'OOF, AutoReply',
      ...unsubscribeHeaders
    },
    messageId,
    icalEvent: {
      filename: `booking-${normalized.primaryBookingId}.ics`,
      method: 'REQUEST',
      content: generateICalEvent({
        type: 'confirmation',
        bookingId: normalized.primaryBookingId,
        clientName,
        clientEmail,
        serviceName: normalized.serviceNames,
        appointmentDate,
        appointmentTime,
        therapistName,
        salonAddress
      })
    }
  };

  signMessage(mailOptions);

  const result = await sendWithRetry(mailOptions);

  emailLogger.info({
    bookingId: normalized.primaryBookingId,
    clientEmail,
    messageId: result.messageId
  }, 'Confirmation email sent');

  return {
    success: true,
    messageId: result.messageId,
    bookingId: normalized.primaryBookingId,
    bookingIds: normalized.bookingIds,
    type: 'confirmation'
  };
}

function generateICalEvent(data) {
  const { type, bookingId, clientName, clientEmail, serviceName, appointmentDate, appointmentTime, therapistName, salonAddress } = data;
  
  const dtStart = new Date(`${appointmentDate} ${appointmentTime}`);
  const dtEnd = new Date(dtStart.getTime() + 60 * 60 * 1000); // Default 1 hour duration
  
  const formatDate = (date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };
  
  const uid = `booking-${bookingId}@${config.dkim.domainName}`;
  const dtStamp = formatDate(new Date());
  const dtStartStr = formatDate(dtStart);
  const dtEndStr = formatDate(dtEnd);
  
  const description = type === 'approval' 
    ? `Your ${serviceName} booking request (${`#CB-${String(bookingId).padStart(5, '0')}`}) is pending review. We'll confirm within 30-60 minutes during business hours.`
    : `Your ${serviceName} session is confirmed with ${therapistName}. Please arrive 5 minutes early. Booking: ${`#CB-${String(bookingId).padStart(5, '0')}`}.`;
  
  const summary = type === 'approval'
    ? `Booking Request: ${serviceName} (Pending)`
    : `Confirmed: ${serviceName} with ${therapistName}`;
  
  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Cozy Blissful Spa & Salon//Booking System//EN
CALSCALE:GREGORIAN
METHOD:${type === 'approval' ? 'REQUEST' : 'REQUEST'}
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${dtStamp}
DTSTART:${dtStartStr}
DTEND:${dtEndStr}
SUMMARY:${summary}
DESCRIPTION:${description.replace(/\n/g, '\\n')}
LOCATION:${salonAddress}
ORGANIZER;CN=${config.salon.name}:mailto:${config.sender.fromAddress}
ATTENDEE;CN=${clientName};ROLE=REQ-PARTICIPANT;RSVP=TRUE:mailto:${clientEmail}
SEQUENCE:${type === 'approval' ? 0 : 1}
STATUS:${type === 'approval' ? 'TENTATIVE' : 'CONFIRMED'}
END:VEVENT
END:VCALENDAR`;
}

export async function sendTestEmail(toEmail) {
  const testData = {
    clientName: 'Test Client',
    clientEmail: toEmail,
    serviceName: 'Signature Deep Tissue Massage',
    appointmentDate: new Date(Date.now() + 86400000).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
    appointmentTime: '2:00 PM',
    therapistName: 'Maria Santos',
    bookingId: 12345,
    totalPrice: '₱2,500.00',
    salonAddress: config.salon.address,
    notes: 'Please focus on lower back'
  };
  
  await sendApprovalEmail(testData);
  await sendConfirmationEmail(testData);
  
  emailLogger.info({ to: toEmail }, 'Test emails sent');
  
  return { success: true, message: 'Test emails sent successfully' };
}

export async function healthCheck() {
  try {
    await verifyConnection();
    return { status: 'healthy', smtp: 'connected' };
  } catch (error) {
    return { status: 'unhealthy', smtp: 'disconnected', error: error.message };
  }
}

export async function shutdown() {
  emailLogger.info('Shutting down email service');
  await closeTransporter();
}