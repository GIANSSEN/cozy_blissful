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

export async function sendApprovalEmail(data) {
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
  } = data;
  
  if (!clientEmail) {
    throw new Error('Client email is required');
  }
  
  emailLogger.info({ bookingId, clientEmail, type: 'approval' }, 'Preparing approval email');
  
  const html = renderTemplate('booking_approval', {
    clientName,
    serviceName,
    appointmentDate,
    appointmentTime,
    therapistName,
    bookingId,
    totalPrice,
    salonAddress,
    notes
  });
  
  const text = generatePlaintextFallback(html) || createMinimalPlaintext(data, 'approval');
  
  const messageId = generateMessageId();
  const unsubscribeHeaders = buildUnsubscribeHeaders(bookingId, clientEmail);
  
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
    subject: `Booking Received (${`#CB-${String(bookingId).padStart(5, '0')}`}) – ${serviceName} on ${appointmentDate}`,
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
      filename: `booking-${bookingId}.ics`,
      method: 'REQUEST',
      content: generateICalEvent({
        type: 'approval',
        bookingId,
        clientName,
        clientEmail,
        serviceName,
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
    bookingId, 
    clientEmail, 
    messageId: result.messageId 
  }, 'Approval email sent');
  
  return {
    success: true,
    messageId: result.messageId,
    bookingId,
    type: 'approval'
  };
}

export async function sendConfirmationEmail(data) {
  const {
    clientName,
    clientEmail,
    serviceName,
    appointmentDate,
    appointmentTime,
    therapistName,
    bookingId,
    totalPrice,
    salonAddress
  } = data;
  
  if (!clientEmail) {
    throw new Error('Client email is required');
  }
  
  emailLogger.info({ bookingId, clientEmail, type: 'confirmation' }, 'Preparing confirmation email');
  
  const html = renderTemplate('booking_confirmation', {
    clientName,
    serviceName,
    appointmentDate,
    appointmentTime,
    therapistName,
    bookingId,
    totalPrice,
    salonAddress
  });
  
  const text = generatePlaintextFallback(html) || createMinimalPlaintext(data, 'confirmation');
  
  const messageId = generateMessageId();
  const unsubscribeHeaders = buildUnsubscribeHeaders(bookingId, clientEmail);
  
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
    subject: `Booking Approved (${`#CB-${String(bookingId).padStart(5, '0')}`}) – ${config.salon.name}`,
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
      filename: `booking-${bookingId}.ics`,
      method: 'REQUEST',
      content: generateICalEvent({
        type: 'confirmation',
        bookingId,
        clientName,
        clientEmail,
        serviceName,
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
    bookingId, 
    clientEmail, 
    messageId: result.messageId 
  }, 'Confirmation email sent');
  
  return {
    success: true,
    messageId: result.messageId,
    bookingId,
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