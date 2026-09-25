#!/usr/bin/env node

import { Command } from 'commander';
import { config } from './config.js';
import { logger } from './logger.js';
import { sendApprovalEmail, sendConfirmationEmail, sendTestEmail, healthCheck, shutdown } from './email-service.js';

const program = new Command();

program
  .name('cozy-email')
  .description('Cozy Blissful Spa & Salon - Production Email Engine')
  .version('1.0.0');

program
  .command('send-approval')
  .description('Send booking approval (pending review) email')
  .requiredOption('--email <email>', 'Client email address')
  .requiredOption('--name <name>', 'Client name')
  .requiredOption('--service <service>', 'Service name')
  .requiredOption('--date <date>', 'Appointment date (YYYY-MM-DD)')
  .requiredOption('--time <time>', 'Appointment time (HH:MM)')
  .option('--therapist <therapist>', 'Therapist name', 'Awaiting Assignment')
  .requiredOption('--booking-id <id>', 'Booking ID (numeric)')
  .requiredOption('--price <price>', 'Total price (e.g., 2500.00)')
  .option('--address <address>', 'Salon address')
  .option('--notes <notes>', 'Additional notes')
  .action(async (options) => {
    try {
      const data = {
        clientName: options.name,
        clientEmail: options.email,
        serviceName: options.service,
        appointmentDate: new Date(options.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        appointmentTime: options.time,
        therapistName: options.therapist,
        bookingId: parseInt(options.bookingId, 10),
        totalPrice: `₱${parseFloat(options.price).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        salonAddress: options.address || config.salon.address,
        notes: options.notes
      };
      
      const result = await sendApprovalEmail(data);
      console.log(JSON.stringify(result, null, 2));
    } catch (error) {
      logger.error({ error: error.message }, 'Failed to send approval email');
      process.exit(1);
    } finally {
      await shutdown();
    }
  });

program
  .command('send-confirmation')
  .description('Send booking confirmation email')
  .requiredOption('--email <email>', 'Client email address')
  .requiredOption('--name <name>', 'Client name')
  .requiredOption('--service <service>', 'Service name')
  .requiredOption('--date <date>', 'Appointment date (YYYY-MM-DD)')
  .requiredOption('--time <time>', 'Appointment time (HH:MM)')
  .requiredOption('--therapist <therapist>', 'Therapist name')
  .requiredOption('--booking-id <id>', 'Booking ID (numeric)')
  .requiredOption('--price <price>', 'Total price (e.g., 2500.00)')
  .option('--address <address>', 'Salon address')
  .action(async (options) => {
    try {
      const data = {
        clientName: options.name,
        clientEmail: options.email,
        serviceName: options.service,
        appointmentDate: new Date(options.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        appointmentTime: options.time,
        therapistName: options.therapist,
        bookingId: parseInt(options.bookingId, 10),
        totalPrice: `₱${parseFloat(options.price).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        salonAddress: options.address || config.salon.address
      };
      
      const result = await sendConfirmationEmail(data);
      console.log(JSON.stringify(result, null, 2));
    } catch (error) {
      logger.error({ error: error.message }, 'Failed to send confirmation email');
      process.exit(1);
    } finally {
      await shutdown();
    }
  });

program
  .command('send-test')
  .description('Send test emails (both approval and confirmation)')
  .requiredOption('--email <email>', 'Test email address')
  .action(async (options) => {
    try {
      const result = await sendTestEmail(options.email);
      console.log(JSON.stringify(result, null, 2));
    } catch (error) {
      logger.error({ error: error.message }, 'Failed to send test emails');
      process.exit(1);
    } finally {
      await shutdown();
    }
  });

program
  .command('health')
  .description('Check SMTP connection health')
  .action(async () => {
    try {
      const result = await healthCheck();
      console.log(JSON.stringify(result, null, 2));
      if (result.status !== 'healthy') {
        process.exit(1);
      }
    } catch (error) {
      logger.error({ error: error.message }, 'Health check failed');
      process.exit(1);
    } finally {
      await shutdown();
    }
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}