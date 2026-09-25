import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadEnvFile(envPath) {
  if (!fs.existsSync(envPath)) return {};
  
  const content = fs.readFileSync(envPath, 'utf-8');
  const env = {};
  
  content.split('\n').forEach(line => {
    line = line.trim();
    if (!line || line.startsWith('#')) return;
    
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      let value = valueParts.join('=').trim();
      // Remove surrounding quotes
      if ((value.startsWith('"') && value.endsWith('"')) || 
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      env[key.trim()] = value;
    }
  });
  
  return env;
}

function parseValue(value) {
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (value === 'undefined') return undefined;
  if (value === 'null') return null;
  if (!isNaN(value) && value !== '') return Number(value);
  return value;
}

export function loadConfig(configPath = null) {
  const rootDir = path.resolve(__dirname, '..');
  const envPath = configPath || path.resolve(rootDir, '.env');
  
  const envVars = loadEnvFile(envPath);
  const processEnv = { ...process.env, ...envVars };
  
  const config = {
    smtp: {
      host: processEnv.SMTP_HOST || 'localhost',
      port: parseInt(processEnv.SMTP_PORT || '587', 10),
      secure: processEnv.SMTP_SECURE === 'true',
      auth: {
        user: processEnv.SMTP_USERNAME,
        pass: processEnv.SMTP_PASSWORD
      },
      pool: true,
      maxConnections: parseInt(processEnv.SMTP_POOL_MAX_CONNECTIONS || '5', 10),
      maxMessages: parseInt(processEnv.SMTP_POOL_MAX_MESSAGES || '100', 10),
      rateLimit: parseInt(processEnv.RATE_LIMIT_MESSAGES_PER_SECOND || '10', 10),
      rateDelta: 1000,
      connectionTimeout: 30000,
      greetingTimeout: 15000,
      socketTimeout: 30000,
      tls: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true
      }
    },
    
    sender: {
      fromAddress: processEnv.MAIL_FROM_ADDRESS || 'noreply@cozyblissful.com',
      fromName: processEnv.MAIL_FROM_NAME || 'Cozy Blissful Spa & Salon',
      replyTo: processEnv.MAIL_REPLY_TO || 'support@cozyblissful.com'
    },
    
    dkim: {
      domainName: processEnv.DKIM_DOMAIN || 'cozyblissful.com',
      keySelector: processEnv.DKIM_SELECTOR || 'default',
      privateKey: fs.existsSync(processEnv.DKIM_PRIVATE_KEY_PATH || '') 
        ? fs.readFileSync(processEnv.DKIM_PRIVATE_KEY_PATH, 'utf-8')
        : null,
      passphrase: processEnv.DKIM_KEY_PASSPHRASE || '',
      headerFields: ['from', 'to', 'subject', 'date', 'message-id', 'mime-version', 'content-type']
    },
    
    frontend: {
      baseUrl: processEnv.FRONTEND_URL || 'https://cozyblissful.com',
      unsubscribeBaseUrl: processEnv.UNSUBSCRIBE_BASE_URL || 'https://cozyblissful.com/unsubscribe'
    },
    
    salon: {
      name: processEnv.SALON_NAME || 'Cozy Blissful Spa & Salon',
      address: processEnv.SALON_ADDRESS || 'Cozy Blissful Spa & Wellness, Metro Manila',
      phone: processEnv.SALON_PHONE || '+63 999 543 5913',
      whatsapp: processEnv.SALON_WHATSAPP || 'https://wa.me/639995435913',
      hours: processEnv.SALON_HOURS || '9:00 AM – 9:00 PM, Daily'
    },
    
    retry: {
      attempts: parseInt(processEnv.RETRY_ATTEMPTS || '3', 10),
      minTimeout: parseInt(processEnv.RETRY_MIN_DELAY_MS || '1000', 10),
      maxTimeout: parseInt(processEnv.RETRY_MAX_DELAY_MS || '10000', 10),
      factor: parseFloat(processEnv.RETRY_FACTOR || '2'),
      randomize: true
    },
    
    logging: {
      level: processEnv.LOG_LEVEL || 'info',
      pretty: processEnv.LOG_PRETTY === 'true'
    },
    
    templates: {
      dir: processEnv.TEMPLATE_DIR || path.resolve(rootDir, 'templates'),
      autoGeneratePlaintext: processEnv.AUTO_GENERATE_PLAINTEXT !== 'false'
    },
    
    queue: {
      redisUrl: processEnv.QUEUE_REDIS_URL,
      name: processEnv.QUEUE_NAME || 'email-sending'
    }
  };
  
  return config;
}

export const config = loadConfig();