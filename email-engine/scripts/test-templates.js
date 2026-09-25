import { renderTemplate } from '../src/template-compiler.js';
import { generatePlaintextFallback } from '../src/plaintext-generator.js';
import { config } from '../src/config.js';
import { logger } from '../src/logger.js';

// Test data
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

async function testTemplates() {
  console.log('🧪 Testing Template Rendering...\n');
  
  // Test approval template
  try {
    const approvalHtml = renderTemplate('booking_confirmation', testData);
    console.log('✅ Approval template rendered successfully');
    console.log(`   HTML length: ${approvalHtml.length} characters`);
    
    const approvalText = generatePlaintextFallback(approvalHtml);
    console.log(`   Plaintext length: ${approvalText.length} characters`);
    console.log(`   Plaintext preview: ${approvalText.substring(0, 200)}...`);
  } catch (error) {
    console.error('❌ Approval template failed:', error.message);
  }
  
  console.log('');
  
  // Test confirmation template
  try {
    const confirmationHtml = renderTemplate('booking_approval', testData);
    console.log('✅ Confirmation template rendered successfully');
    console.log(`   HTML length: ${confirmationHtml.length} characters`);
    
    const confirmationText = generatePlaintextFallback(confirmationHtml);
    console.log(`   Plaintext length: ${confirmationText.length} characters`);
    console.log(`   Plaintext preview: ${confirmationText.substring(0, 200)}...`);
  } catch (error) {
    console.error('❌ Confirmation template failed:', error.message);
  }
  
  console.log('\n🎉 Template testing complete!');
}

testTemplates().catch(console.error);