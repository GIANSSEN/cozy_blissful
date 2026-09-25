import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Handlebars from 'handlebars';
import { config } from './config.js';
import { logger } from './logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const templateCache = new Map();

function loadTemplate(templateName) {
  const templatePath = path.resolve(config.templates.dir, `${templateName}.hbs`);
  
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template not found: ${templatePath}`);
  }
  
  const source = fs.readFileSync(templatePath, 'utf-8');
  return Handlebars.compile(source, {
    strict: true,
    noEscape: false,
    preventIndent: true
  });
}

export function getTemplate(templateName) {
  if (!templateCache.has(templateName)) {
    const compiled = loadTemplate(templateName);
    templateCache.set(templateName, compiled);
    logger.debug({ template: templateName }, 'Template loaded and compiled');
  }
  return templateCache.get(templateName);
}

export function clearTemplateCache() {
  templateCache.clear();
  logger.debug('Template cache cleared');
}

export function registerHelpers() {
  Handlebars.registerHelper('formatCurrency', function(amount, currency = '₱') {
    const num = parseFloat(amount);
    if (isNaN(num)) return amount;
    return `${currency}${num.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  });
  
  Handlebars.registerHelper('formatBookingId', function(id) {
    return `#CB-${String(id).padStart(5, '0')}`;
  });
  
  Handlebars.registerHelper('formatDate', function(date, format = 'full') {
    const d = new Date(date);
    if (format === 'full') {
      return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }
    if (format === 'short') {
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    return d.toLocaleDateString();
  });
  
  Handlebars.registerHelper('formatTime', function(date) {
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  });
  
  Handlebars.registerHelper('urlEncode', function(str) {
    return encodeURIComponent(str);
  });
  
  Handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
  });
  
  Handlebars.registerHelper('unlessEquals', function(arg1, arg2, options) {
    return (arg1 != arg2) ? options.fn(this) : options.inverse(this);
  });
  
  Handlebars.registerHelper('json', function(context) {
    return JSON.stringify(context, null, 2);
  });
  
  logger.debug('Handlebars helpers registered');
}

registerHelpers();

export function renderTemplate(templateName, data) {
  const template = getTemplate(templateName);
  
  const enrichedData = {
    ...data,
    config: {
      frontendUrl: config.frontend.baseUrl,
      unsubscribeBaseUrl: config.frontend.unsubscribeBaseUrl,
      salonName: config.salon.name,
      salonAddress: config.salon.address,
      salonPhone: config.salon.phone,
      salonWhatsApp: config.salon.whatsapp,
      salonHours: config.salon.hours,
      currentYear: new Date().getFullYear()
    }
  };
  
  try {
    return template(enrichedData);
  } catch (error) {
    logger.error({ error: error.message, template: templateName }, 'Template rendering failed');
    throw error;
  }
}