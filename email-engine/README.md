# Cozy Blissful Email Engine

Production-ready SMTP engine for Cozy Blissful Spa & Salon transactional emails.

## Features

- **Bulletproof HTML/CSS Templates** - Inline styles, Outlook VML fallbacks, dark mode support
- **DKIM Signing** - RSA-SHA256 signatures for DMARC alignment
- **Connection Pooling** - Configurable SMTP connection pool with Nodemailer
- **Rate Limiting** - Token bucket algorithm via Bottleneck
- **Retry Logic** - Exponential backoff with jitter via async-retry
- **Plaintext Fallback** - Auto-generated from HTML using html-to-text
- **Calendar Integration** - .ics attachments for booking confirmations
- **List-Unsubscribe** - RFC 8058 compliant headers
- **Template System** - Handlebars with custom helpers
- **Structured Logging** - Pino with pretty printing

## Quick Start

```bash
# Install dependencies
cd email-engine
npm install

# Copy and configure environment
cp .env.example .env
# Edit .env with your SMTP credentials and DKIM keys

# Generate DKIM keys (one-time setup)
npm run dkim:generate

# Send test email
npm run send:test -- --email your@email.com

# Send approval email
npm run send:approval -- --email client@example.com --name "Jane Doe" --service "Deep Tissue Massage" --date "2026-09-30" --time "14:00" --booking-id 12345 --price 2500

# Send confirmation email
npm run send:confirmation -- --email client@example.com --name "Jane Doe" --service "Deep Tissue Massage" --date "2026-09-30" --time "14:00" --therapist "Maria Santos" --booking-id 12345 --price 2500

# Health check
npm run health
```

## Configuration

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `SMTP_HOST` | SMTP server hostname | `smtp.sendgrid.net` |
| `SMTP_PORT` | SMTP port (587 for STARTTLS, 465 for SSL) | `587` |
| `SMTP_USERNAME` | SMTP username | `apikey` |
| `SMTP_PASSWORD` | SMTP password/API key | `SG.xxxxx` |
| `MAIL_FROM_ADDRESS` | Sender email address | `noreply@cozyblissful.com` |
| `DKIM_PRIVATE_KEY_PATH` | Path to DKIM private key | `./keys/dkim-private.key` |

### Optional Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `SMTP_SECURE` | `false` | Use SSL (port 465) vs STARTTLS (port 587) |
| `SMTP_POOL_MAX_CONNECTIONS` | `5` | Max concurrent SMTP connections |
| `RATE_LIMIT_MESSAGES_PER_SECOND` | `10` | Rate limit for sending |
| `RETRY_ATTEMPTS` | `3` | Number of retry attempts |
| `LOG_LEVEL` | `info` | Logging level (debug, info, warn, error) |

## DKIM Setup

### Generate Keys

```bash
# Generate 2048-bit RSA key pair
openssl genrsa -out keys/dkim-private.key 2048
openssl rsa -in keys/dkim-private.key -pubout -out keys/dkim-public.key
```

### DNS Records

Add these TXT records to your domain:

```dns
# DKIM Record
default._domainkey.cozyblissful.com IN TXT "v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA..."

# SPF Record
cozyblissful.com IN TXT "v=spf1 include:sendgrid.net ~all"

# DMARC Record
_dmarc.cozyblissful.com IN TXT "v=DMARC1; p=quarantine; rua=mailto:dmarc@cozyblissful.com; pct=100"
```

## Template System

### Templates Location

```
templates/
├── booking_confirmation.hbs  # Approval/pending review email
└── booking_approval.hbs      # Confirmation email
```

### Available Helpers

| Helper | Description |
|--------|-------------|
| `formatBookingId` | Formats ID as `#CB-00123` |
| `formatCurrency` | Formats amount as `₱2,500.00` |
| `formatDate` | Formats date (full/short) |
| `formatTime` | Formats time in 12-hour format |
| `urlEncode` | URL encodes string |
| `ifEquals` | Conditional equality check |
| `unlessEquals` | Conditional inequality check |

### Template Data

```javascript
{
  clientName: "Jane Doe",
  clientEmail: "jane@example.com",
  serviceName: "Signature Deep Tissue Massage",
  appointmentDate: "Monday, September 30, 2026",
  appointmentTime: "2:00 PM",
  therapistName: "Maria Santos",
  bookingId: 12345,
  totalPrice: "₱2,500.00",
  salonAddress: "Cozy Blissful Spa & Wellness, Metro Manila",
  notes: "Focus on lower back"  // Optional, only for approval
}
```

## Email Types

### Approval Email (Pending Review)

Sent when client submits booking request. Includes:
- Itemized booking summary
- Add-on offer (retention hook)
- Priority re-book CTA
- Loyalty program callout
- Calendar invite attached (.ics)

### Confirmation Email (Approved)

Sent when staff assigns therapist and confirms. Includes:
- Confirmed details with therapist name
- 3-step next actions (save slot, arrive early, re-book)
- Reminder callout
- Priority re-book with specific therapist
- Loyalty return perk (GLOWAGAIN code)
- Calendar invite attached (.ics)

## SMTP Providers Tested

- SendGrid
- Mailgun
- Amazon SES
- Postmark
- Resend
- Custom Postfix/Exim

## Deliverability Checklist

- [ ] SPF record published
- [ ] DKIM keys generated and DNS record added
- [ ] DMARC policy set to `quarantine` or `reject`
- [ ] Reverse DNS (PTR) configured for sending IP
- [ ] Sender domain authenticated with provider
- [ ] List-Unsubscribe headers working
- [ ] Plaintext fallback generated
- [ ] Tested in Litmus/Email on Acid

## Monitoring

The engine logs structured JSON. Key metrics to monitor:

```json
{
  "level": "info",
  "component": "email-service",
  "bookingId": 12345,
  "clientEmail": "client@example.com",
  "messageId": "<12345.abc@cozyblissful.com>",
  "type": "confirmation",
  "msg": "Confirmation email sent"
}
```

## Development

```bash
# Run with auto-reload (requires nodemon)
npm run dev

# Lint
npm run lint

# Format
npm run prettier
```

## Production Deployment

### PM2 Process Manager

```bash
npm install -g pm2
pm2 start src/cli.js --name "cozy-email" -- send-test --email admin@cozyblissful.com
pm2 save
pm2 startup
```

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
CMD ["node", "src/cli.js", "health"]
```

### Kubernetes

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: cozy-email-health
spec:
  schedule: "*/5 * * * *"
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: health-check
            image: cozy-blissful/email-engine:latest
            command: ["node", "src/cli.js", "health"]
          restartPolicy: OnFailure
```

## License

MIT