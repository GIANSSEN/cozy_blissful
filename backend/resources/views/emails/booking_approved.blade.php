<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Booking Approved – Cozy Blissful</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #f0ede8; color: #2d2d2d; }
    .wrapper { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 40px rgba(0,0,0,0.10); }
    .header { background: linear-gradient(135deg, #041e16 0%, #073328 60%, #0a3d30 100%); padding: 44px 40px 32px; text-align: center; }
    .header-line { height: 3px; background: linear-gradient(90deg, transparent, #bfa15f, #e8cc8a, #bfa15f, transparent); margin-bottom: 28px; }
    .logo-circle { width: 68px; height: 68px; border-radius: 50%; border: 3px solid rgba(191,161,95,0.6); margin: 0 auto 14px; overflow: hidden; box-shadow: 0 0 0 5px rgba(191,161,95,0.12); }
    .logo-circle img { width: 100%; height: 100%; object-fit: cover; }
    .brand-name { color: #ffffff; font-size: 20px; font-weight: 800; }
    .brand-sub { color: #bfa15f; font-size: 10px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; margin-top: 4px; }
    .approved-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(52,211,153,0.15); border: 1px solid rgba(52,211,153,0.4); border-radius: 100px; padding: 8px 20px; margin-top: 20px; }
    .approved-badge span { color: #34d399; font-size: 12px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; }
    .content { padding: 44px 40px; }
    .celebration { font-size: 52px; text-align: center; margin-bottom: 16px; line-height: 1; }
    h1 { font-size: 28px; font-weight: 800; color: #041e16; margin-bottom: 10px; line-height: 1.3; text-align: center; }
    h1 span { color: #bfa15f; }
    .intro { font-size: 14px; color: #666; line-height: 1.7; margin-bottom: 32px; text-align: center; }
    .booking-card { background: linear-gradient(135deg, #041e16, #073328); border-radius: 14px; padding: 28px; margin-bottom: 28px; position: relative; overflow: hidden; }
    .booking-card::after { content: '✓'; position: absolute; top: -10px; right: 20px; font-size: 100px; color: rgba(52,211,153,0.05); font-weight: 900; }
    .booking-card-label { color: rgba(255,255,255,0.35); font-size: 9px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 18px; }
    .booking-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.07); }
    .booking-row:last-child { border-bottom: none; padding-bottom: 0; }
    .booking-row .label { font-size: 11px; color: rgba(255,255,255,0.4); font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; }
    .booking-row .value { font-size: 13px; color: #ffffff; font-weight: 700; text-align: right; }
    .booking-row .value.gold { color: #e8cc8a; }
    .booking-row .value.green { color: #34d399; }
    .booking-id-tag { display: inline-block; background: rgba(191,161,95,0.15); border: 1px solid rgba(191,161,95,0.3); border-radius: 6px; padding: 4px 10px; font-size: 11px; color: #bfa15f; font-weight: 700; font-family: monospace; }
    .highlight-box { background: linear-gradient(135deg, rgba(10,61,48,0.06), rgba(191,161,95,0.06)); border: 1px solid rgba(191,161,95,0.2); border-radius: 12px; padding: 20px 24px; margin-bottom: 28px; }
    .highlight-box p { font-size: 13px; color: #555; line-height: 1.7; }
    .highlight-box strong { color: #041e16; }
    .cta-button { display: block; text-align: center; background: linear-gradient(135deg, #bfa15f, #d4b87a, #c8a455); color: #041e16; font-size: 14px; font-weight: 800; padding: 16px 32px; border-radius: 12px; text-decoration: none; letter-spacing: 0.04em; margin-bottom: 24px; box-shadow: 0 4px 20px rgba(191,161,95,0.35); }
    .divider { height: 1px; background: linear-gradient(90deg, transparent, rgba(191,161,95,0.2), transparent); margin: 24px 0; }
    .help-section { text-align: center; }
    .help-section p { font-size: 12px; color: #999; margin-bottom: 8px; }
    .help-section a { color: #0a3d30; font-weight: 700; text-decoration: none; font-size: 13px; }
    .footer { background: #041e16; padding: 28px 40px; text-align: center; }
    .footer-copy { color: rgba(255,255,255,0.2); font-size: 11px; line-height: 1.8; }
    .footer-copy span { color: #bfa15f; }
  </style>
</head>
<body>
  <div class="wrapper">
    <!-- HEADER -->
    <div class="header">
      <div class="header-line"></div>
      <div class="logo-circle">
        <img src="{{ config('app.url') }}/cb-logo.jpg" alt="Cozy Blissful" onerror="this.style.display='none'"/>
      </div>
      <div class="brand-name">Cozy Blissful</div>
      <div class="brand-sub">Home Service Spa &amp; Wellness</div>
      <div class="approved-badge">
        <span>✓ &nbsp; Booking Confirmed!</span>
      </div>
    </div>

    <!-- CONTENT -->
    <div class="content">
      <div class="celebration">🎉</div>
      <h1>You're all booked,<br/><span>{{ $clientName }}!</span></h1>
      <p class="intro">
        Great news! Your <strong>{{ $serviceName }}</strong> session has been officially confirmed by our team. Your therapist will arrive at the scheduled time. Get ready to relax!
      </p>

      <!-- Confirmed Booking Card -->
      <div class="booking-card">
        <div class="booking-card-label">📋 Confirmed Booking Details</div>
        <div class="booking-row">
          <span class="label">Booking ID</span>
          <span class="value"><span class="booking-id-tag">#CB-{{ str_pad($bookingId, 5, '0', STR_PAD_LEFT) }}</span></span>
        </div>
        <div class="booking-row">
          <span class="label">Service</span>
          <span class="value gold">{{ $serviceName }}</span>
        </div>
        <div class="booking-row">
          <span class="label">Date</span>
          <span class="value">{{ $appointmentDate }}</span>
        </div>
        <div class="booking-row">
          <span class="label">Time</span>
          <span class="value">{{ $appointmentTime }}</span>
        </div>
        <div class="booking-row">
          <span class="label">Therapist</span>
          <span class="value">{{ $therapistName }}</span>
        </div>
        <div class="booking-row">
          <span class="label">Status</span>
          <span class="value green">✓ Confirmed</span>
        </div>
      </div>

      <div class="highlight-box">
        <p>
          <strong>📍 Your therapist will come to you.</strong> Please make sure your address is accessible and a comfortable space is ready for your service. We'll send a reminder 24 hours before your session.
        </p>
      </div>

      <a href="{{ config('app.frontend_url', 'http://localhost:5173') }}/client/dashboard" class="cta-button">
        🌿 &nbsp; View My Appointment
      </a>

      <div class="divider"></div>

      <div class="help-section">
        <p>Need help or want to reschedule?</p>
        <a href="https://wa.me/639995435913">💬 &nbsp; WhatsApp: +63 999 543 5913</a>
      </div>
    </div>

    <!-- FOOTER -->
    <div class="footer">
      <div class="footer-copy">
        &copy; {{ date('Y') }} <span>Cozy Blissful Spa</span>. All rights reserved.<br/>
        Open 6:00 AM – 11:00 PM &bull; 7 Days a Week &bull; Metro Manila
      </div>
    </div>
  </div>
</body>
</html>
