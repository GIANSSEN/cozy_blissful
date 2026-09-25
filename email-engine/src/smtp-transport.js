import nodemailer from 'nodemailer';
import Bottleneck from 'bottleneck';
import retry from 'async-retry';
import { config } from './config.js';
import { logger, createChildLogger } from './logger.js';
import { signMessage } from './dkim-signer.js';

const transportLogger = createChildLogger({ component: 'smtp-transport' });

let transporter = null;
let limiter = null;

export function createTransporter(customConfig = {}) {
  const smtpConfig = {
    ...config.smtp,
    ...customConfig
  };
  
  transportLogger.info({
    host: smtpConfig.host,
    port: smtpConfig.port,
    secure: smtpConfig.secure,
    pool: smtpConfig.pool,
    maxConnections: smtpConfig.maxConnections
  }, 'Creating SMTP transporter');
  
  const transport = nodemailer.createTransport({
    host: smtpConfig.host,
    port: smtpConfig.port,
    secure: smtpConfig.secure,
    auth: smtpConfig.auth,
    pool: smtpConfig.pool,
    maxConnections: smtpConfig.maxConnections,
    maxMessages: smtpConfig.maxMessages,
    rateLimit: smtpConfig.rateLimit,
    rateDelta: smtpConfig.rateDelta,
    connectionTimeout: smtpConfig.connectionTimeout,
    greetingTimeout: smtpConfig.greetingTimeout,
    socketTimeout: smtpConfig.socketTimeout,
    tls: smtpConfig.tls,
    logger: transportLogger,
    debug: config.logging.level === 'debug'
  });
  
  transport.verify((error, success) => {
    if (error) {
      transportLogger.error({ error: error.message }, 'SMTP connection verification failed');
    } else {
      transportLogger.info('SMTP connection verified successfully');
    }
  });
  
  return transport;
}

export function createRateLimiter() {
  if (!limiter) {
    limiter = new Bottleneck({
      maxConcurrent: config.smtp.maxConnections,
      minTime: 1000 / config.smtp.rateLimit,
      reservoir: config.smtp.maxMessages,
      reservoirRefreshAmount: config.smtp.maxMessages,
      reservoirRefreshInterval: 60000,
      strategy: Bottleneck.strategy.LEAK
    });
    
    limiter.on('failed', (error, jobInfo) => {
      transportLogger.warn({ 
        error: error.message, 
        retries: jobInfo.retryCount 
      }, 'Rate limiter job failed');
    });
    
    limiter.on('depleted', () => {
      transportLogger.warn('Rate limiter reservoir depleted, waiting for refresh');
    });
  }
  
  return limiter;
}

export async function sendWithRetry(mailOptions, attempt = 1) {
  const transport = getTransporter();
  const rateLimiter = getRateLimiter();
  
  return rateLimiter.schedule(async () => {
    return retry(async (bail) => {
      try {
        transportLogger.debug({ 
          to: mailOptions.to, 
          subject: mailOptions.subject,
          attempt 
        }, 'Sending email');
        
        const result = await transport.sendMail(mailOptions);
        
        transportLogger.info({
          to: mailOptions.to,
          messageId: result.messageId,
          response: result.response
        }, 'Email sent successfully');
        
        return result;
      } catch (error) {
        transportLogger.error({
          error: error.message,
          code: error.code,
          command: error.command,
          attempt,
          maxAttempts: config.retry.attempts
        }, 'Email send failed');
        
        if (error.code === 'EAUTH' || error.code === 'ECONNECTION') {
          bail(error);
        }
        
        throw error;
      }
    }, {
      retries: config.retry.attempts - 1,
      minTimeout: config.retry.minTimeout,
      maxTimeout: config.retry.maxTimeout,
      factor: config.retry.factor,
      randomize: config.retry.randomize,
      onRetry: (error, attempt) => {
        transportLogger.warn({
          error: error.message,
          nextAttempt: attempt + 1
        }, 'Retrying email send');
      }
    });
  });
}

export function getTransporter() {
  if (!transporter) {
    transporter = createTransporter();
  }
  return transporter;
}

export function getRateLimiter() {
  if (!limiter) {
    limiter = createRateLimiter();
  }
  return limiter;
}

export function setTransporter(newTransporter) {
  if (transporter) {
    transporter.close();
  }
  transporter = newTransporter;
}

export async function closeTransporter() {
  if (transporter) {
    transportLogger.info('Closing SMTP transporter');
    transporter.close();
    transporter = null;
  }
  if (limiter) {
    limiter.disconnect();
    limiter = null;
  }
}

export async function verifyConnection() {
  const transport = getTransporter();
  return new Promise((resolve, reject) => {
    transport.verify((error, success) => {
      if (error) {
        transportLogger.error({ error: error.message }, 'SMTP verification failed');
        reject(error);
      } else {
        transportLogger.info('SMTP verification successful');
        resolve(success);
      }
    });
  });
}

export function getTransporterStatus() {
  if (!transporter) {
    return { status: 'not_initialized' };
  }
  
  return {
    status: 'active',
    pool: transporter.pool ? {
      available: transporter.pool.available,
      inUse: transporter.pool.inUse,
      pending: transporter.pool.pending
    } : 'not_pooled',
    rateLimiter: limiter ? {
      running: limiter.running(),
      queued: limiter.queued(),
      reservoir: limiter.reservoir
    } : 'not_initialized'
  };
}