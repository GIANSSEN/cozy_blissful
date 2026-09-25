import { htmlToText } from 'html-to-text';
import { config } from './config.js';
import { logger } from './logger.js';

export function generatePlaintextFallback(html, options = {}) {
  if (!config.templates.autoGeneratePlaintext) {
    return null;
  }
  
  const defaultOptions = {
    wordwrap: 78,
    selectors: [
      { selector: 'a', options: { ignoreHref: false } },
      { selector: 'img', format: 'skip' },
      { selector: 'table', format: 'skip' },
      { selector: '.btn', format: 'inline' },
      { selector: '.btn-ghost', format: 'inline' },
      { selector: 'style', format: 'skip' },
      { selector: 'script', format: 'skip' },
      { selector: 'noscript', format: 'skip' },
      { selector: '[class*="vml"]', format: 'skip' },
      { selector: 'v\\:roundrect', format: 'skip' },
      { selector: 'v\\:shape', format: 'skip' },
      { selector: 'v\\:rect', format: 'skip' },
      { selector: 'v\\:textbox', format: 'skip' },
      { selector: 'center', format: 'skip' }
    ],
    formatters: {
      anchor: (elem, walk, builder, formatOptions) => {
        const href = elem.attribs.href;
        const text = walk(elem.children, builder, formatOptions);
        if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
          builder.add(`${text} [${href}]`);
        } else {
          builder.add(text);
        }
      }
    }
  };
  
  try {
    const text = htmlToText(html, { ...defaultOptions, ...options });
    
    const cleaned = text
      .replace(/\n{3,}/g, '\n\n')
      .replace(/[ \t]+$/gm, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&zwnj;/g, '')
      .trim();
    
    return cleaned;
  } catch (error) {
    logger.warn({ error: error.message }, 'Plaintext generation failed, returning empty');
    return '';
  }
}

export function createMinimalPlaintext(data, type) {
  const { clientName, serviceName, appointmentDate, appointmentTime, therapistName, bookingId, totalPrice, salonAddress } = data;
  const formattedId = `#CB-${String(bookingId).padStart(5, '0')}`;
  const frontendUrl = config.frontend.baseUrl;
  const unsubscribeUrl = `${config.frontend.unsubscribeBaseUrl}?booking=${bookingId}`;
  
  if (type === 'approval') {
    return `
${config.salon.name} - Booking Received
===================================

Hi ${clientName},

We received your ${serviceName} request for ${appointmentDate} at ${appointmentTime}.
Booking ${formattedId} is pending review.

Details:
- Service: ${serviceName}
- Date: ${appointmentDate}
- Time: ${appointmentTime}
- Location: ${salonAddress}
- Therapist: ${therapistName}
- Total: ${totalPrice}

What happens next:
We confirm most bookings within 30-60 minutes during operating hours (${config.salon.hours}).
No payment needed until your session.

View your bookings: ${frontendUrl}/client/dashboard
Priority re-book: ${frontendUrl}/client/book?rebook=1&service=${encodeURIComponent(serviceName)}

Need to reschedule? Message us on WhatsApp: ${config.salon.whatsapp}

---
${config.salon.name} | ${config.salon.address} | ${config.salon.hours}
Unsubscribe: ${unsubscribeUrl}
    `.trim();
  }
  
  if (type === 'confirmation') {
    return `
${config.salon.name} - Booking Confirmed
===================================

Hi ${clientName},

Your ${serviceName} session is confirmed.
Specialist ${therapistName} will see you at the time below.
Please arrive 5 minutes early.

Confirmed Details:
- Booking ID: ${formattedId}
- Service: ${serviceName}
- Date: ${appointmentDate}
- Time: ${appointmentTime}
- Price: ${totalPrice}
- Location: ${salonAddress}
- Therapist: ${therapistName}

Your Next 3 Steps:
1. Save your slot - tap "Add to Calendar" or keep the attached .ics invite
2. Arrive 5 minutes early - show booking ${formattedId} at reception
3. Lock in your glow - re-book your next session now while ${therapistName}'s calendar is open

Reminder: Wear comfortable clothing and drink water before your session.
We'll send a reminder 24 hours before.

View your appointment: ${frontendUrl}/client/dashboard
Priority re-book with ${therapistName}: ${frontendUrl}/client/book?rebook=1&service=${encodeURIComponent(serviceName)}&therapist=${encodeURIComponent(therapistName)}
Calendar invite: ${frontendUrl}/client/dashboard

Loyalty Perk: Book your next ${serviceName} within 14 days and mention code GLOWAGAIN at reception for a complimentary 10-minute head & shoulder add-on.

Need help? Message us on WhatsApp: ${config.salon.whatsapp}

---
${config.salon.name} | ${config.salon.address} | ${config.salon.hours}
Show booking ${formattedId} at reception.
Unsubscribe: ${unsubscribeUrl}
    `.trim();
  }
  
  return '';
}