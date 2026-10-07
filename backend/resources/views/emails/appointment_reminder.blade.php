<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>Session Reminder – Cozy Blissful</title>
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
      .intro { font-size: 14px !important; }
      .countdown { font-size: 36px !important; }
      .stack-td { display: block !important; width: 100% !important; text-align: left !important; }
      .svc-name, .svc-price { display: block !important; width: 100% !important; text-align: left !important; }
      .svc-price { padding-top: 0 !important; padding-bottom: 10px !important; }
      .btn { display: block !important; width: 100% !important; box-sizing: border-box; padding: 15px 20px !important; text-align: center !important; }
      .footer-pad { padding: 22px 20px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f5f0e8;font-family:Arial,Helvetica,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;mso-hide:all;">
    Hey {{ $clientName }}, your {{ $serviceCount > 1 ? $serviceCount . ' services (' . $serviceNames . ')' : $serviceName }} {{ $serviceCount > 1 ? 'start' : 'starts' }} in {{ $hoursUntil }} hours — {{ $appointmentDate }} at {{ $appointmentTime }}. {{ $bookingRefs }}.&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </div>

  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f5f0e8;">
    <tr>
      <td class="email-wrapper" align="center" style="padding:28px 12px;">
        <!--[if mso]><table role="presentation" cellpadding="0" cellspacing="0" width="600" align="center"><tr><td><![endif]-->
        <table role="presentation" cellpadding="0" cellspacing="0" class="card" style="max-width:600px;width:100%;margin:0 auto;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e9e1d2;">
          <tr>
            <td style="background-color:#062c22;padding:0;">
              <div style="height:4px;background-color:#bfa15f;font-size:0;line-height:0;">&nbsp;</div>
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td class="header-pad" align="center" style="padding:30px 36px 24px;">
                    <p style="margin:0 0 2px;font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:0.01em;">Cozy Blissful</p>
                    <p style="margin:0;font-size:10px;font-weight:700;color:#d4b87a;letter-spacing:0.24em;">SALON &amp; SPA</p>
                    <p style="margin:16px 0 0;display:inline-block;background-color:#3d2f10;border:1px solid #bfa15f;border-radius:100px;padding:7px 18px;font-size:11px;font-weight:700;color:#fbbf24;letter-spacing:0.08em;">&#9200;&nbsp; SESSION IN {{ $hoursUntil }} HOURS</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td class="content-pad" style="padding:32px 36px 28px;background-color:#ffffff;">
              <h1 class="greeting" style="margin:0 0 10px;font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:700;color:#062c22;line-height:1.35;">Hey {{ $clientName }},<br />your session is coming up.</h1>
              <p class="intro" style="margin:0 0 22px;font-size:14px;color:#5b5b5b;line-height:1.7;">
                Just a friendly reminder — your
                @if($serviceCount > 1)
                  <strong style="color:#062c22;">{{ $serviceCount }} services in one visit</strong>
                @else
                  <strong style="color:#062c22;">{{ $serviceName }}</strong> session
                @endif
                starts in <strong style="color:#062c22;">{{ $hoursUntil }} hours</strong>. One visit, one reminder — everything below happens back-to-back.
              </p>

              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#062c22;border-radius:12px;margin-bottom:18px;">
                <tr>
                  <td align="center" style="padding:22px 20px;">
                    <p style="margin:0;font-size:11px;font-weight:700;color:#d4b87a;letter-spacing:0.15em;">TIME UNTIL YOUR SESSION</p>
                    <p class="countdown" style="margin:6px 0 2px;font-size:44px;font-weight:900;color:#ffffff;line-height:1;">{{ $hoursUntil }}</p>
                    <p style="margin:0;font-size:12px;font-weight:700;color:rgba(255,255,255,0.6);">HOURS TO GO &middot; {{ $appointmentDate }} at {{ $appointmentTime }}</p>
                  </td>
                </tr>
              </table>

              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border:1px solid #ece3d0;border-radius:12px;margin-bottom:18px;background-color:#ffffff;">
                <tr>
                  <td style="padding:14px 20px 2px;font-size:10px;font-weight:700;color:#a08c5b;letter-spacing:0.14em;">YOUR APPOINTMENT ({{ $bookingRefs }})</td>
                </tr>
                <tr>
                  <td style="padding:0 20px 14px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                      @foreach($services as $index => $svc)
                      <tr>
                        <td class="stack-td svc-name" style="padding:10px 0;border-top:1px solid #ece3d0;font-size:13px;color:#062c22;vertical-align:top;width:70%;"><strong>{{ $index + 1 }}. {{ $svc['name'] }}</strong><br /><span style="font-size:12px;color:#8a8a8a;">{{ $svc['duration'] }} min</span></td>
                        <td class="stack-td svc-price" style="padding:10px 0;border-top:1px solid #ece3d0;font-size:13px;font-weight:700;color:#062c22;text-align:right;vertical-align:top;">{{ $svc['price'] }}</td>
                      </tr>
                      @endforeach
                      <tr>
                        <td class="stack-td" style="padding:9px 0;border-top:1px solid #ece3d0;font-size:11px;font-weight:700;color:#8a8a8a;letter-spacing:0.06em;">THERAPIST</td>
                        <td class="stack-td" style="padding:9px 0;border-top:1px solid #ece3d0;font-size:13px;color:#333333;text-align:right;">{{ $therapistName }}</td>
                      </tr>
                      <tr>
                        <td class="stack-td" style="padding:9px 0;border-top:1px solid #ece3d0;font-size:11px;font-weight:700;color:#8a8a8a;letter-spacing:0.06em;">LOCATION</td>
                        <td class="stack-td" style="padding:9px 0;border-top:1px solid #ece3d0;font-size:13px;color:#333333;text-align:right;">{{ $salonAddress }}</td>
                      </tr>
                      <tr>
                        <td class="stack-td" style="padding:12px 0;border-top:2px solid #062c22;font-size:12px;font-weight:800;color:#062c22;">TOTAL</td>
                        <td class="stack-td" style="padding:12px 0;border-top:2px solid #062c22;font-size:15px;font-weight:800;color:#062c22;text-align:right;">{{ $totalPrice }}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:12px;">
                <tr>
                  <td align="center">
                    <!--[if mso]>
                    <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="{{ config('app.frontend_url', 'http://localhost:5174') }}/client/dashboard" style="height:48px;v-text-anchor:middle;width:320px;" arcsize="21%" fillcolor="#bfa15f" strokecolor="#bfa15f" strokeweight="1pt">
                      <v:textbox inset="0,0,0,0"><center style="color:#062c22;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;">View My Booking &#8594;</center></v:textbox>
                    </v:roundrect>
                    <![endif]-->
                    <!--[if !mso]><!-->
                    <a href="{{ config('app.frontend_url', 'http://localhost:5174') }}/client/dashboard" class="btn" target="_blank" rel="noopener" style="display:inline-block;background-color:#bfa15f;color:#062c22;font-size:14px;font-weight:800;padding:15px 40px;border-radius:10px;text-decoration:none;mso-hide:all;">View My Booking &#8594;</a>
                    <!--<![endif]-->
                  </td>
                </tr>
              </table>

              <p style="margin:6px 0 0;text-align:center;font-size:12px;color:#999999;line-height:1.7;">
                Need to reschedule? <a href="https://wa.me/639995435913" style="color:#0a3d30;font-weight:700;text-decoration:none;">Contact us on WhatsApp</a>
              </p>
            </td>
          </tr>

          <tr>
            <td class="footer-pad" align="center" style="background-color:#062c22;padding:24px 36px;">
              <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.55);line-height:1.8;">
                &copy; {{ date('Y') }} <span style="color:#d4b87a;">Cozy Blissful Spa</span> &middot; Open 9:00 AM – 9:00 PM, Daily<br />
                <span style="color:rgba(255,255,255,0.35);">Show {{ $bookingRefs }} at reception.</span>
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
