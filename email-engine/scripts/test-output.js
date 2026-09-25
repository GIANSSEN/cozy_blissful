import { renderTemplate } from '../src/template-compiler.js';
import { generatePlaintextFallback } from '../src/plaintext-generator.js';
import fs from 'fs';

const testData = {
  clientName: 'Jane Doe',
  clientEmail: 'jane.doe@example.com',
  serviceName: 'Signature Deep Tissue Massage',
  appointmentDate: 'Friday, September 27, 2026',
  appointmentTime: '2:00 PM',
  therapistName: 'Maria Santos',
  bookingId: 12345,
  totalPrice: '₱2,500.00',
  salonAddress: 'Cozy Blissful Spa & Wellness, Metro Manila',
  notes: 'Please focus on lower back and shoulders'
};

const approvalHtml = renderTemplate('booking_confirmation', testData);
const confirmationHtml = renderTemplate('booking_approval', testData);

fs.writeFileSync('test-approval.html', approvalHtml);
fs.writeFileSync('test-confirmation.html', confirmationHtml);

console.log('HTML files written to test-approval.html and test-confirmation.html');