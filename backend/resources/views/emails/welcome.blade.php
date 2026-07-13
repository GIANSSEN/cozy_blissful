<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Welcome to Cozy Blissful</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #f0ede8; color: #2d2d2d; }
    .wrapper { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 40px rgba(0,0,0,0.10); }
    .header { background: linear-gradient(135deg, #041e16 0%, #073328 60%, #0a3d30 100%); padding: 48px 40px 36px; text-align: center; position: relative; }
    .header-line { height: 3px; background: linear-gradient(90deg, transparent, #bfa15f, #e8cc8a, #bfa15f, transparent); margin-bottom: 28px; }
    .logo-circle { width: 72px; height: 72px; border-radius: 50%; border: 3px solid rgba(191,161,95,0.6); margin: 0 auto 16px; overflow: hidden; box-shadow: 0 0 0 6px rgba(191,161,95,0.12); }
    .logo-circle img { width: 100%; height: 100%; object-fit: cover; }
    .brand-name { color: #ffffff; font-size: 22px; font-weight: 800; letter-spacing: 0.02em; }
    .brand-sub { color: #bfa15f; font-size: 10px; font-weight: 700; letter-spacing: 0.22em; text-transform: uppercase; margin-top: 4px; }
    .content { padding: 44px 40px; }
    .welcome-badge { display: inline-block; background: linear-gradient(135deg, rgba(10,61,48,0.08), rgba(191,161,95,0.08)); border: 1px solid rgba(191,161,95,0.25); border-radius: 100px; padding: 6px 18px; font-size: 11px; font-weight: 700; color: #0a3d30; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 24px; }
    h1 { font-size: 28px; font-weight: 800; color: #041e16; line-height: 1.25; margin-bottom: 16px; }
    h1 span { color: #bfa15f; }
    .intro { font-size: 15px; color: #555; line-height: 1.7; margin-bottom: 32px; }
    .features { background: #faf9f7; border-radius: 12px; padding: 28px; margin-bottom: 32px; border: 1px solid rgba(191,161,95,0.12); }
    .feature-item { display: flex; align-items: flex-start; gap: 14px; margin-bottom: 18px; }
    .feature-item:last-child { margin-bottom: 0; }
    .feature-icon { width: 36px; height: 36px; border-radius: 9px; background: linear-gradient(135deg, #0a3d30, #073328); display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
    .feature-text strong { display: block; font-size: 13px; font-weight: 700; color: #041e16; margin-bottom: 2px; }
    .feature-text span { font-size: 12px; color: #777; line-height: 1.5; }
    .cta-button { display: block; text-align: center; background: linear-gradient(135deg, #bfa15f, #d4b87a, #c8a455); color: #041e16; font-size: 14px; font-weight: 800; padding: 16px 32px; border-radius: 12px; text-decoration: none; letter-spacing: 0.04em; margin-bottom: 32px; box-shadow: 0 4px 20px rgba(191,161,95,0.35); }
    .divider { height: 1px; background: linear-gradient(90deg, transparent, rgba(191,161,95,0.2), transparent); margin: 32px 0; }
    .contact-row { text-align: center; }
    .contact-row p { font-size: 12px; color: #999; margin-bottom: 8px; }
    .contact-row a { color: #0a3d30; font-weight: 600; text-decoration: none; font-size: 12px; }
    .footer { background: #041e16; padding: 28px 40px; text-align: center; }
    .footer-social { margin-bottom: 16px; }
    .footer-social a { display: inline-block; margin: 0 6px; color: rgba(255,255,255,0.4); font-size: 11px; text-decoration: none; }
    .footer-copy { color: rgba(255,255,255,0.2); font-size: 11px; }
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
    </div>

    <!-- CONTENT -->
    <div class="content">
      <div class="welcome-badge">🌿 Welcome Aboard</div>
      <h1>Hello, <span>{{ $clientName }}</span>! <br/>You're all set.</h1>
      <p class="intro">
        Thank you for joining <strong>Cozy Blissful</strong> — your premium home service spa. We're thrilled to have you as part of our wellness community. Relaxation, beauty, and expert care are now just a booking away.
      </p>

      <div class="features">
        <div class="feature-item">
          <div class="feature-icon">💆</div>
          <div class="feature-text">
            <strong>30+ Spa Services</strong>
            <span>From Swedish Massage to Gel Nails — all delivered to your door.</span>
          </div>
        </div>
        <div class="feature-item">
          <div class="feature-icon">⭐</div>
          <div class="feature-text">
            <strong>Certified Therapists</strong>
            <span>Every specialist is vetted, trained, and background-checked.</span>
          </div>
        </div>
        <div class="feature-item">
          <div class="feature-icon">🗓️</div>
          <div class="feature-text">
            <strong>Book in Under 2 Minutes</strong>
            <span>Choose your service, pick a time — we'll handle the rest.</span>
          </div>
        </div>
      </div>

      <a href="{{ config('app.frontend_url', 'http://localhost:5173') }}/register" class="cta-button">
        ✨ &nbsp; Book Your First Session
      </a>

      <div class="divider"></div>

      <div class="contact-row">
        <p>Need help? We're always here for you.</p>
        <a href="https://wa.me/639995435913">📱 WhatsApp: +63 999 543 5913</a>
      </div>
    </div>

    <!-- FOOTER -->
    <div class="footer">
      <div class="footer-social">
        <a href="#">Facebook</a> &bull;
        <a href="#">Instagram</a> &bull;
        <a href="#">TikTok</a> &bull;
        <a href="https://wa.me/639995435913">WhatsApp</a>
      </div>
      <div class="footer-copy">
        &copy; {{ date('Y') }} <span>Cozy Blissful Spa</span>. All rights reserved.<br/>
        Open 6:00 AM – 11:00 PM &bull; 7 Days a Week
      </div>
    </div>
  </div>
</body>
</html>
