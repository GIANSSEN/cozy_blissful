<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="color-scheme" content="light dark" />
  <meta name="supported-color-schemes" content="light dark" />
  <title>Booking Received – Cozy Blissful</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
  <style>
    :root { color-scheme: light dark; supported-color-schemes: light dark; }
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; display: block; }
    body { margin: 0 !important; padding: 0 !important; width: 100% !important; }
    a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; }
    @media only screen and (max-width: 600px) {
      .email-wrapper { padding: 16px 8px !important; }
      .card { border-radius: 14px !important; }
      .header-pad { padding: 28px 20px 22px !important; }
      .content-pad { padding: 26px 20px 22px !important; }
      .greeting { font-size: 21px !important; }
      .intro { font-size: 14px !important; }
      .detail-label, .detail-value { display: block !important; width: 100% !important; text-align: left !important; }
      .detail-label { margin-bottom: 2px !important; }
      .detail-value { margin-bottom: 12px !important; padding-top: 0 !important; }
      .btn { display: block !important; width: 100% !important; box-sizing: border-box; padding: 15px 20px !important; }
      .btn-ghost { display: block !important; width: 100% !important; box-sizing: border-box; }
      .footer-pad { padding: 22px 20px !important; }
    }
    @media (prefers-color-scheme: dark) {
      .body-bg, .outer-bg { background-color: #1a1512 !important; }
      .card-bg, .content-pad { background-color: #22201c !important; }
      .greeting { color: #f5f0e8 !important; }
      .intro, .body-copy { color: #c9c2b4 !important; }
      .intro strong { color: #e8cc8a !important; }
      .details-box { background-color: #2a2721 !important; border-color: #4a4436 !important; }
      .detail-value { color: #f5f0e8 !important; }
      .detail-label { color: #a89a7c !important; }
      .callout-amber { background-color: #2e2a1e !important; }
      .callout-amber td, .callout-amber { color: #e3d3a8 !important; }
      .loyalty-box { background-color: #2e2a1e !important; border-color: #6b5c33 !important; }
      .addon-row td { color: #e8cc8a !important; }
    }
  </style>
</head>
<body class="body-bg" style="margin:0;padding:0;background-color:#f5f0e8;font-family:Arial,Helvetica,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;mso-hide:all;">
    Hi {{ $clientName }}, we received your {{ $serviceName }} request for {{ $appointmentDate }}. Booking #CB-{{ str_pad($bookingId, 5, '0', STR_PAD_LEFT) }} is pending review.&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </div>

  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" class="outer-bg" style="background-color:#f5f0e8;">
    <tr>
      <td class="email-wrapper" align="center" style="padding:32px 12px;">
        <!--[if mso]><table role="presentation" cellpadding="0" cellspacing="0" width="600" align="center"><tr><td><![endif]-->
        <table role="presentation" cellpadding="0" cellspacing="0" class="card card-bg" style="max-width:600px;width:100%;margin:0 auto;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e9e1d2;">
          <!-- Header -->
          <tr>
            <td style="background-color:#062c22;padding:0;">
              <div style="height:4px;background-color:#bfa15f;font-size:0;line-height:0;">&nbsp;</div>
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td class="header-pad" align="center" style="padding:32px 36px 26px;">
                    <p style="margin:0 0 2px;font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:0.01em;">Cozy Blissful</p>
                    <p style="margin:0;font-size:10px;font-weight:700;color:#d4b87a;letter-spacing:0.24em;">SALON &amp; SPA</p>
                    <p style="margin:16px 0 0;display:inline-block;background-color:#3d2f10;border:1px solid #bfa15f;border-radius:100px;padding:7px 18px;font-size:11px;font-weight:700;color:#fbbf24;letter-spacing:0.08em;">&#9679;&nbsp; PENDING REVIEW</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td class="content-pad" style="padding:34px 36px 30px;background-color:#ffffff;">
              <h1 class="greeting" style="margin:0 0 10px;font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:700;color:#062c22;line-height:1.35;">Hi {{ $clientName }},<br />we got your booking.</h1>
              <p class="intro" style="margin:0 0 24px;font-size:14px;color:#5b5b5b;line-height:1.7;">
                Thanks for choosing <strong style="color:#062c22;">Cozy Blissful</strong>. Your request is being reviewed.
                We'll email you again once it's confirmed. Here are your details:
              </p>

              <!-- Itemized summary block -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" class="details-box" style="background-color:#faf8f3;border:1px solid #ece3d0;border-radius:12px;margin-bottom:20px;">
                <tr>
                  <td style="padding:14px 20px 4px;font-size:10px;font-weight:700;color:#a08c5b;letter-spacing:0.14em;">BOOKING SUMMARY — ITEMIZED</td>
                </tr>
                <tr>
                  <td style="padding:0 20px 16px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td class="detail-label" style="padding:9px 0;border-top:1px solid #ece3d0;font-size:11px;font-weight:700;color:#8a8a8a;letter-spacing:0.06em;width:38%;vertical-align:top;">BOOKING ID</td>
                        <td class="detail-value" style="padding:9px 0;border-top:1px solid #ece3d0;font-size:13px;font-weight:700;color:#062c22;text-align:right;vertical-align:top;">#CB-{{ str_pad($bookingId, 5, '0', STR_PAD_LEFT) }}</td>
                      </tr>
                      <tr>
                        <td class="detail-label" style="padding:9px 0;border-top:1px solid #ece3d0;font-size:11px;font-weight:700;color:#8a8a8a;letter-spacing:0.06em;vertical-align:top;">SERVICE</td>
                        <td class="detail-value" style="padding:9px 0;border-top:1px solid #ece3d0;font-size:13px;font-weight:700;color:#062c22;text-align:right;vertical-align:top;">{{ $serviceName }}</td>
                      </tr>
                      <tr>
                        <td class="detail-label" style="padding:9px 0;border-top:1px solid #ece3d0;font-size:11px;font-weight:700;color:#8a8a8a;letter-spacing:0.06em;vertical-align:top;">DATE</td>
                        <td class="detail-value" style="padding:9px 0;border-top:1px solid #ece3d0;font-size:13px;font-weight:700;color:#062c22;text-align:right;vertical-align:top;">{{ $appointmentDate }}</td>
                      </tr>
                      <tr>
                        <td class="detail-label" style="padding:9px 0;border-top:1px solid #ece3d0;font-size:11px;font-weight:700;color:#8a8a8a;letter-spacing:0.06em;vertical-align:top;">TIME</td>
                        <td class="detail-value" style="padding:9px 0;border-top:1px solid #ece3d0;font-size:13px;font-weight:700;color:#062c22;text-align:right;vertical-align:top;">{{ $appointmentTime }}</td>
                      </tr>
                      <tr>
                        <td class="detail-label" style="padding:9px 0;border-top:1px solid #ece3d0;font-size:11px;font-weight:700;color:#8a8a8a;letter-spacing:0.06em;vertical-align:top;">LOCATION</td>
                        <td class="detail-value" style="padding:9px 0;border-top:1px solid #ece3d0;font-size:13px;color:#333333;text-align:right;vertical-align:top;">{{ $salonAddress }}</td>
                      </tr>
                      <tr>
                        <td class="detail-label" style="padding:9px 0;border-top:1px solid #ece3d0;font-size:11px;font-weight:700;color:#8a8a8a;letter-spacing:0.06em;vertical-align:top;">THERAPIST</td>
                        <td class="detail-value" style="padding:9px 0;border-top:1px solid #ece3d0;font-size:13px;color:#333333;text-align:right;vertical-align:top;">{{ $therapistName }}</td>
                      </tr>
                      @if($notes)
                      <tr>
                        <td class="detail-label" style="padding:9px 0;border-top:1px solid #ece3d0;font-size:11px;font-weight:700;color:#8a8a8a;letter-spacing:0.06em;vertical-align:top;">NOTES</td>
                        <td class="detail-value" style="padding:9px 0;border-top:1px solid #ece3d0;font-size:13px;color:#333333;text-align:right;vertical-align:top;">{{ $notes }}</td>
                      </tr>
                      @endif
                      {{-- Exclusive add-on offer (retention hook, itemized without clutter) --}}
                      <tr class="addon-row">
                        <td class="detail-label" style="padding:9px 0;border-top:1px dashed #d8c795;font-size:11px;font-weight:700;color:#8a6d2b;letter-spacing:0.06em;vertical-align:top;">&#10022; ADD-ON OFFER</td>
                        <td class="detail-value" style="padding:9px 0;border-top:1px dashed #d8c795;font-size:12px;color:#5b4d2a;text-align:right;vertical-align:top;">10-min Head &amp; Shoulder Ritual — <strong>₱199</strong> <span style="color:#999999;text-decoration:line-through;">₱350</span><br /><a href="{{ config('app.frontend_url', 'http://localhost:5174') }}/client/book?addon=head-shoulder&amp;booking={{ $bookingId }}" target="_blank" rel="noopener" style="color:#0a3d30;font-weight:700;text-decoration:underline;">Add to my booking &#8594;</a></td>
                      </tr>
                      <tr>
                        <td class="detail-label" style="padding:10px 0;border-top:2px solid #062c22;font-size:12px;font-weight:800;color:#062c22;letter-spacing:0.06em;vertical-align:top;">TOTAL DUE AT SALON</td>
                        <td class="detail-value" style="padding:10px 0;border-top:2px solid #062c22;font-size:15px;font-weight:800;color:#062c22;text-align:right;vertical-align:top;">{{ $totalPrice }}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" class="callout-amber" style="background-color:#fdf6e3;border-left:4px solid #bfa15f;border-radius:0 10px 10px 0;margin-bottom:24px;">
                <tr>
                  <td style="padding:14px 18px;font-size:13px;color:#5b4d2a;line-height:1.65;">
                    <strong style="color:#062c22;">What happens next?</strong> We confirm most bookings within 30–60 minutes during operating hours (9:00 AM – 9:00 PM). No payment needed until your session. Your calendar invite (.ics) is attached for convenience.
                  </td>
                </tr>
              </table>

              <!-- Primary CTA with Outlook VML fallback -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:12px;">
                <tr>
                  <td align="center">
                    <!--[if mso]>
                    <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="{{ config('app.frontend_url', 'http://localhost:5174') }}/client/dashboard" style="height:48px;v-text-anchor:middle;width:320px;" arcsize="21%" fillcolor="#bfa15f" strokecolor="#bfa15f" strokeweight="1pt">
                      <v:textbox inset="0,0,0,0"><center style="color:#062c22;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;">View My Bookings &#8594;</center></v:textbox>
                    </v:roundrect>
                    <![endif]-->
                    <!--[if !mso]><!-->
                    <a href="{{ config('app.frontend_url', 'http://localhost:5174') }}/client/dashboard" class="btn" target="_blank" rel="noopener" style="display:inline-block;background-color:#bfa15f;color:#062c22;font-size:14px;font-weight:800;padding:15px 40px;border-radius:10px;text-decoration:none;letter-spacing:0.03em;mso-hide:all;">View My Bookings &#8594;</a>
                    <!--<![endif]-->
                  </td>
                </tr>
              </table>

              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:20px;">
                <tr>
                  <td align="center" style="padding:4px 0;">
                    <a href="{{ config('app.frontend_url', 'http://localhost:5174') }}/client/book?rebook=1&amp;service={{ urlencode($serviceName) }}" class="btn-ghost" target="_blank" rel="noopener" style="display:inline-block;background-color:#ffffff;color:#0a3d30;font-size:13px;font-weight:700;padding:12px 28px;border-radius:10px;text-decoration:none;border:1px solid #bfa15f;letter-spacing:0.02em;">&#9733; Priority Re-book — skip the queue next time</a>
                  </td>
                </tr>
              </table>

              <!-- Loyalty retention hook -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" class="loyalty-box" style="background-color:#faf6ec;border:1px solid #e3d3a8;border-radius:12px;margin-bottom:20px;">
                <tr>
                  <td style="padding:16px 20px;font-size:13px;color:#5b4d2a;line-height:1.65;">
                    <span style="font-size:11px;font-weight:800;color:#8a6d2b;letter-spacing:0.12em;">LOYALTY CALLOUT</span><br />
                    Every completed session earns a stamp toward a <strong style="color:#062c22;">free 30-minute foot ritual</strong>. Track your stamps anytime from your dashboard after approval.
                  </td>
                </tr>
              </table>

              <p style="margin:0;text-align:center;font-size:12px;color:#999999;line-height:1.7;">
                Need to reschedule? Message us on <a href="https://wa.me/639995435913" style="color:#0a3d30;font-weight:700;text-decoration:none;">WhatsApp +63 999 543 5913</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="footer-pad" align="center" style="background-color:#062c22;padding:24px 36px;">
              <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.55);line-height:1.8;">
                &copy; {{ date('Y') }} <span style="color:#d4b87a;">Cozy Blissful Spa</span> &middot; Open 9:00 AM – 9:00 PM, Daily<br />
                <span style="color:rgba(255,255,255,0.35);">Please arrive 5 minutes early. Bring booking #CB-{{ str_pad($bookingId, 5, '0', STR_PAD_LEFT) }}.</span><br />
                <span style="color:rgba(255,255,255,0.35);">You received this because you requested a booking. </span><a href="{{ config('app.frontend_url', 'http://localhost:5174') }}/unsubscribe?booking={{ $bookingId }}" target="_blank" rel="noopener" style="color:#d4b87a;text-decoration:underline;">Unsubscribe</a>
              </p>
            </td>
          </tr>
        </table>
        <!--[if mso]></td></tr></table><![endif]-->
      </td>
    </tr>
  </table>
</body>
</html>
