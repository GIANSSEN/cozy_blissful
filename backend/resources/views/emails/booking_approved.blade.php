<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>Booking Approved – Cozy Blissful</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
  <style>
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    body { margin: 0 !important; padding: 0 !important; width: 100% !important; }
    a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; }
    @media only screen and (max-width: 620px) {
      .email-wrapper { padding: 12px 8px !important; }
      .card { border-radius: 14px !important; }
      .header-pad { padding: 26px 20px 22px !important; }
      .content-pad { padding: 24px 20px 22px !important; }
      .greeting { font-size: 21px !important; line-height: 1.35 !important; }
      .intro, .body-copy { font-size: 14px !important; }
      .stack-td { display: block !important; width: 100% !important; text-align: left !important; }
      .detail-label { padding-bottom: 0 !important; border-bottom: none !important; }
      .detail-value { padding-top: 2px !important; text-align: left !important; }
      .svc-name, .svc-price { display: block !important; width: 100% !important; text-align: left !important; }
      .svc-price { padding-top: 0 !important; padding-bottom: 10px !important; }
      .step-num-cell { display: block !important; width: 100% !important; padding-bottom: 0 !important; }
      .step-text-cell { display: block !important; width: 100% !important; padding-top: 4px !important; }
      .btn { display: block !important; width: 100% !important; box-sizing: border-box; padding: 15px 20px !important; text-align: center !important; }
      .btn-ghost { display: block !important; width: 100% !important; box-sizing: border-box; text-align: center !important; }
      .footer-pad { padding: 22px 20px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f5f0e8;font-family:Arial,Helvetica,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;mso-hide:all;">
    {{ $clientName }}, your {{ $serviceCount > 1 ? $serviceCount . ' services (' . $serviceNames . ')' : $serviceName }} on {{ $appointmentDate }} at {{ $appointmentTime }} {{ $serviceCount > 1 ? 'are' : 'is' }} confirmed. {{ $bookingRefs }}.&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </div>

  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f5f0e8;">
    <tr>
      <td class="email-wrapper" align="center" style="padding:28px 12px;">
        <!--[if mso]><table role="presentation" cellpadding="0" cellspacing="0" width="600" align="center"><tr><td><![endif]-->
        <table role="presentation" cellpadding="0" cellspacing="0" class="card" style="max-width:600px;width:100%;margin:0 auto;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e9e1d2;">
          <!-- Header -->
          <tr>
            <td style="background-color:#062c22;padding:0;">
              <div style="height:4px;background-color:#bfa15f;font-size:0;line-height:0;">&nbsp;</div>
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td class="header-pad" align="center" style="padding:30px 36px 24px;">
                    <p style="margin:0 0 2px;font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:0.01em;">Cozy Blissful</p>
                    <p style="margin:0;font-size:10px;font-weight:700;color:#d4b87a;letter-spacing:0.24em;">SALON &amp; SPA</p>
                    <p style="margin:16px 0 0;display:inline-block;background-color:#134b3c;border:1px solid #2fbf71;border-radius:100px;padding:7px 18px;font-size:11px;font-weight:700;color:#34d399;letter-spacing:0.08em;">&#10003;&nbsp; BOOKING CONFIRMED</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td class="content-pad" style="padding:32px 36px 28px;background-color:#ffffff;">
              <h1 class="greeting" style="margin:0 0 10px;font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:700;color:#062c22;line-height:1.35;">You&rsquo;re all set, {{ $clientName }}.</h1>
              <p class="intro" style="margin:0 0 22px;font-size:14px;color:#5b5b5b;line-height:1.7;">
                @if($serviceCount > 1)
                  Your <strong style="color:#062c22;">{{ $serviceCount }} services in one visit</strong> {{ $serviceCount > 1 ? 'are' : 'is' }} confirmed.
                  Specialist <strong style="color:#062c22;">{{ $therapistName }}</strong> will see you at the time below. Please arrive 5 minutes early.
                @else
                  Your <strong style="color:#062c22;">{{ $serviceName }}</strong> session is confirmed.
                  Specialist <strong style="color:#062c22;">{{ $therapistName }}</strong> will see you at the time below. Please arrive 5 minutes early.
                @endif
              </p>

              <!-- Confirmed details -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#faf8f3;border:1px solid #ece3d0;border-radius:12px;margin-bottom:18px;">
                <tr>
                  <td style="padding:14px 20px 2px;font-size:10px;font-weight:700;color:#a08c5b;letter-spacing:0.14em;">CONFIRMED DETAILS</td>
                </tr>
                <tr>
                  <td style="padding:0 20px 16px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td class="stack-td detail-label" style="padding:9px 0;border-top:1px solid #ece3d0;font-size:11px;font-weight:700;color:#8a8a8a;letter-spacing:0.06em;width:38%;vertical-align:top;">BOOKING ID{{ $serviceCount > 1 ? 's' : '' }}</td>
                        <td class="stack-td detail-value" style="padding:9px 0;border-top:1px solid #ece3d0;font-size:13px;font-weight:700;color:#062c22;text-align:right;vertical-align:top;">{{ $bookingRefs }}</td>
                      </tr>
                      <tr>
                        <td class="stack-td detail-label" style="padding:9px 0;border-top:1px solid #ece3d0;font-size:11px;font-weight:700;color:#8a8a8a;letter-spacing:0.06em;vertical-align:top;">DATE</td>
                        <td class="stack-td detail-value" style="padding:9px 0;border-top:1px solid #ece3d0;font-size:13px;font-weight:700;color:#062c22;text-align:right;vertical-align:top;">{{ $appointmentDate }}</td>
                      </tr>
                      <tr>
                        <td class="stack-td detail-label" style="padding:9px 0;border-top:1px solid #ece3d0;font-size:11px;font-weight:700;color:#8a8a8a;letter-spacing:0.06em;vertical-align:top;">TIME</td>
                        <td class="stack-td detail-value" style="padding:9px 0;border-top:1px solid #ece3d0;font-size:13px;font-weight:700;color:#062c22;text-align:right;vertical-align:top;">{{ $appointmentTime }}</td>
                      </tr>
                      <tr>
                        <td class="stack-td detail-label" style="padding:9px 0;border-top:1px solid #ece3d0;font-size:11px;font-weight:700;color:#8a8a8a;letter-spacing:0.06em;vertical-align:top;">THERAPIST</td>
                        <td class="stack-td detail-value" style="padding:9px 0;border-top:1px solid #ece3d0;font-size:13px;color:#333333;text-align:right;vertical-align:top;">{{ $therapistName }}</td>
                      </tr>
                      <tr>
                        <td class="stack-td detail-label" style="padding:9px 0;border-top:1px solid #ece3d0;font-size:11px;font-weight:700;color:#8a8a8a;letter-spacing:0.06em;vertical-align:top;">LOCATION</td>
                        <td class="stack-td detail-value" style="padding:9px 0;border-top:1px solid #ece3d0;font-size:13px;color:#333333;text-align:right;vertical-align:top;">{{ $salonAddress }}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Services list -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border:1px solid #ece3d0;border-radius:12px;margin-bottom:18px;background-color:#ffffff;">
                <tr>
                  <td style="padding:14px 20px 2px;font-size:10px;font-weight:700;color:#a08c5b;letter-spacing:0.14em;">YOUR SERVICES ({{ $serviceCount }}) &middot; {{ $totalDuration }} MIN TOTAL</td>
                </tr>
                <tr>
                  <td style="padding:0 20px 14px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                      @foreach($services as $index => $svc)
                      <tr>
                        <td class="stack-td svc-name" style="padding:10px 0;border-top:1px solid #ece3d0;font-size:13px;color:#062c22;vertical-align:top;width:70%;">
                          <span style="display:inline-block;min-width:22px;height:22px;line-height:22px;text-align:center;background-color:#062c22;color:#d4b87a;font-size:11px;font-weight:800;border-radius:50%;margin-right:8px;">{{ $index + 1 }}</span><strong>{{ $svc['name'] }}</strong><br />
                          <span style="font-size:12px;color:#8a8a8a;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{{ $svc['duration'] }} min</span>
                        </td>
                        <td class="stack-td svc-price" style="padding:10px 0;border-top:1px solid #ece3d0;font-size:13px;font-weight:700;color:#062c22;text-align:right;vertical-align:top;">{{ $svc['price'] }}</td>
                      </tr>
                      @endforeach
                      <tr>
                        <td class="stack-td" style="padding:12px 0;border-top:2px solid #062c22;font-size:12px;font-weight:800;color:#062c22;letter-spacing:0.06em;vertical-align:top;">TOTAL</td>
                        <td class="stack-td" style="padding:12px 0;border-top:2px solid #062c22;font-size:15px;font-weight:800;color:#062c22;text-align:right;vertical-align:top;">{{ $totalPrice }}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Next steps -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#ffffff;border:1px solid #ece3d0;border-radius:12px;margin-bottom:18px;">
                <tr>
                  <td style="padding:16px 20px 6px;font-size:10px;font-weight:700;color:#a08c5b;letter-spacing:0.14em;">YOUR NEXT 3 STEPS</td>
                </tr>
                <tr>
                  <td style="padding:0 20px 16px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td class="step-num-cell" style="padding:8px 0;vertical-align:top;" width="36">
                          <div style="width:28px;height:28px;border-radius:50%;background-color:#062c22;color:#d4b87a;font-size:13px;font-weight:800;text-align:center;line-height:28px;">1</div>
                        </td>
                        <td class="step-text-cell" style="padding:8px 0 8px 4px;font-size:13px;color:#3d4a45;line-height:1.6;vertical-align:top;"><strong style="color:#062c22;">Save your slot</strong> — keep the attached calendar invite so you never miss it.</td>
                      </tr>
                      <tr>
                        <td class="step-num-cell" style="padding:8px 0;vertical-align:top;" width="36">
                          <div style="width:28px;height:28px;border-radius:50%;background-color:#062c22;color:#d4b87a;font-size:13px;font-weight:800;text-align:center;line-height:28px;">2</div>
                        </td>
                        <td class="step-text-cell" style="padding:8px 0 8px 4px;font-size:13px;color:#3d4a45;line-height:1.6;vertical-align:top;"><strong style="color:#062c22;">Arrive 5 minutes early</strong> — show <strong style="color:#062c22;">{{ $bookingRefs }}</strong> at reception.</td>
                      </tr>
                      <tr>
                        <td class="step-num-cell" style="padding:8px 0;vertical-align:top;" width="36">
                          <div style="width:28px;height:28px;border-radius:50%;background-color:#bfa15f;color:#062c22;font-size:13px;font-weight:800;text-align:center;line-height:28px;">3</div>
                        </td>
                        <td class="step-text-cell" style="padding:8px 0 8px 4px;font-size:13px;color:#3d4a45;line-height:1.6;vertical-align:top;"><strong style="color:#062c22;">Relax — everything is in one visit.</strong> All {{ $serviceCount }} {{ $serviceCount > 1 ? 'services run' : 'service runs' }} back-to-back ({{ $totalDuration }} min total).</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f0f7f3;border-left:4px solid #2fbf71;border-radius:0 10px 10px 0;margin-bottom:22px;">
                <tr>
                  <td style="padding:14px 18px;font-size:13px;color:#3d4a45;line-height:1.65;">
                    <strong style="color:#062c22;">Reminder:</strong> Wear comfortable clothing and drink water before your session. We&rsquo;ll send a reminder 24 hours before.
                  </td>
                </tr>
              </table>

              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:12px;">
                <tr>
                  <td align="center">
                    <!--[if mso]>
                    <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="{{ config('app.frontend_url', 'http://localhost:5174') }}/client/dashboard" style="height:48px;v-text-anchor:middle;width:320px;" arcsize="21%" fillcolor="#bfa15f" strokecolor="#bfa15f" strokeweight="1pt">
                      <v:textbox inset="0,0,0,0"><center style="color:#062c22;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;">View My Appointment &#8594;</center></v:textbox>
                    </v:roundrect>
                    <![endif]-->
                    <!--[if !mso]><!-->
                    <a href="{{ config('app.frontend_url', 'http://localhost:5174') }}/client/dashboard" class="btn" target="_blank" rel="noopener" style="display:inline-block;background-color:#bfa15f;color:#062c22;font-size:14px;font-weight:800;padding:15px 40px;border-radius:10px;text-decoration:none;letter-spacing:0.03em;mso-hide:all;">View My Appointment &#8594;</a>
                    <!--<![endif]-->
                  </td>
                </tr>
              </table>

              <p style="margin:6px 0 0;text-align:center;font-size:12px;color:#999999;line-height:1.7;">
                Need help? Message us on <a href="https://wa.me/639995435913" style="color:#0a3d30;font-weight:700;text-decoration:none;">WhatsApp +63 999 543 5913</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="footer-pad" align="center" style="background-color:#062c22;padding:24px 36px;">
              <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.55);line-height:1.8;">
                &copy; {{ date('Y') }} <span style="color:#d4b87a;">Cozy Blissful Spa</span> &middot; Open 9:00 AM – 9:00 PM, Daily<br />
                <span style="color:rgba(255,255,255,0.35);">Show {{ $bookingRefs }} at reception.</span><br />
                <span style="color:rgba(255,255,255,0.35);">You received this because you booked with Cozy Blissful. </span><a href="{{ config('app.frontend_url', 'http://localhost:5174') }}/unsubscribe?booking={{ $bookingId }}" target="_blank" rel="noopener" style="color:#d4b87a;text-decoration:underline;">Unsubscribe</a>
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
