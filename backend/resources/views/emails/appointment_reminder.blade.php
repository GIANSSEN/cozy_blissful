<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Session Reminder – Cozy Blissful</title>
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
    .reminder-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(251,191,36,0.15); border: 1px solid rgba(251,191,36,0.35); border-radius: 100px; padding: 8px 20px; margin-top: 20px; }
    .reminder-badge span { color: #fbbf24; font-size: 12px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; }
    .content { padding: 44px 40px; }
    h1 { font-size: 26px; font-weight: 800; color: #041e16; margin-bottom: 10px; line-height: 1.3; }
    h1 span { color: #bfa15f; }
    .intro { font-size: 14px; color: #666; line-height: 1.7; margin-bottom: 32px; }
    .timer-box { background: linear-gradient(135deg, #bfa15f, #d4b87a); border-radius: 14px; padding: 28px; margin-bottom: 28px; text-align: center; }
    .timer-box .label { font-size: 11px; font-weight: 700; color: rgba(4,30,22,0.6); letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 8px; }
    .timer-box .countdown { font-size: 48px; font-weight: 900; color: #041e16; line-height: 1; margin-bottom: 4px; }
    .timer-box .countdown-label { font-size: 13px; font-weight: 700; color: rgba(4,30,22,0.6); }
    .booking-card { background: linear-gradient(135deg, #041e16, #073328); border-radius: 14px; padding: 24px; margin-bottom: 28px; }
    .booking-card-label { color: rgba(255,255,255,0.35); font-size: 9px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 16px; }
    .booking-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.07); }
    .booking-row:last-child { border-bottom: none; padding-bottom: 0; }
    .booking-row .label { font-size: 11px; color: rgba(255,255,255,0.4); font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; }
    .booking-row .value { font-size: 13px; color: #ffffff; font-weight: 700; }
    .booking-row .value.gold { color: #e8cc8a; }
    .checklist { background: #faf9f7; border-radius: 12px; padding: 22px; margin-bottom: 28px; border: 1px solid rgba(191,161,95,0.12); }
    .checklist-title { font-size: 12px; font-weight: 700; color: #041e16; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 14px; }
    .checklist-item { display: flex; align-items: center; gap: 10px; font-size: 13px; color: #555; margin-bottom: 10px; }
    .checklist-item:last-child { margin-bottom: 0; }
    .check-icon { width: 20px; height: 20px; border-radius: 50%; background: linear-gradient(135deg, #0a3d30, #073328); color: #34d399; display: flex; align-items: center; justify-content: center; font-size: 11px; flex-shrink: 0; }
    .cta-button { display: block; text-align: center; background: linear-gradient(135deg, #bfa15f, #d4b87a, #c8a455); color: #041e16; font-size: 14px; font-weight: 800; padding: 16px 32px; border-radius: 12px; text-decoration: none; letter-spacing: 0.04em; margin-bottom: 24px; box-shadow: 0 4px 20px rgba(191,161,95,0.35); }
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
      <div class="reminder-badge">
        <span>⏰ &nbsp; Session Reminder</span>
      </div>
    </div>

    <!-- CONTENT -->
    <div class="content">
      <h1>Hey <span>{{ $clientName }}</span>,<br/>your session is coming up!</h1>
      <p class="intro">
        Just a friendly reminder that your <strong>{{ $serviceName }}</strong> session is scheduled in <strong>{{ $hoursUntil }} hours</strong>. Make sure you're comfortable and ready to relax!
      </p>

      <!-- Countdown -->
      <div class="timer-box">
        <div class="label">⏳ Time Until Your Session</div>
        <div class="countdown">{{ $hoursUntil }}</div>
        <div class="countdown-label">HOURS TO GO</div>
      </div>

      <!-- Booking Summary -->
      <div class="booking-card">
        <div class="booking-card-label">📋 Your Appointment</div>
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
      </div>

      <!-- Preparation Checklist -->
      <div class="checklist">
        <div class="checklist-title">✅ Before Your Session</div>
        <div class="checklist-item">
          <div class="check-icon">✓</div>
          <span>Prepare a clean, comfortable space or room for your session.</span>
        </div>
        <div class="checklist-item">
          <div class="check-icon">✓</div>
          <span>Wear loose, comfortable clothing for easy access.</span>
        </div>
        <div class="checklist-item">
          <div class="check-icon">✓</div>
          <span>Drink water before and after your treatment.</span>
        </div>
        <div class="checklist-item">
          <div class="check-icon">✓</div>
          <span>Inform your therapist of any allergies or medical conditions.</span>
        </div>
      </div>

      <a href="{{ config('app.frontend_url', 'http://localhost:5173') }}/client/dashboard" class="cta-button">
        📅 &nbsp; View My Booking Details
      </a>

      <div class="help-section">
        <p>Need to reschedule or cancel?</p>
        <a href="https://wa.me/639995435913">💬 &nbsp; Contact us on WhatsApp: +63 999 543 5913</a>
      </div>
    </div>

    <!-- FOOTER -->
    <div class="footer">
      <div class="footer-copy">
        &copy; {{ date('Y') }} <span>Cozy Blissful Spa</span>. All rights reserved.<br/>
        Open 6:00 AM – 11:00 PM &bull; 7 Days a Week
      </div>
    </div>
  </div>
</body>
</html>
