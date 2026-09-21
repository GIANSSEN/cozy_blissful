<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="x-apple-disable-message-reformatting" />
  <title>Reset Your Password – Cozy Blissful</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
  <style>
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
      .btn { display: block !important; width: 100% !important; box-sizing: border-box; padding: 15px 20px !important; }
      .footer-pad { padding: 22px 20px !important; }
      .fallback-url { font-size: 11px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f5f0e8;font-family:Arial,Helvetica,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
    Hi {{ $userName }}, reset your Cozy Blissful password. This link expires in 60 minutes.
  </div>

  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f5f0e8;">
    <tr>
      <td class="email-wrapper" align="center" style="padding:32px 12px;">
        <table role="presentation" cellpadding="0" cellspacing="0" class="card" style="max-width:600px;width:100%;margin:0 auto;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e9e1d2;">
          <!-- Header -->
          <tr>
            <td style="background-color:#062c22;padding:0;">
              <div style="height:4px;background-color:#bfa15f;font-size:0;line-height:0;">&nbsp;</div>
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td class="header-pad" align="center" style="padding:32px 36px 26px;">
                    <p style="margin:0 0 2px;font-family:Georgia,serif;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:0.01em;">Cozy Blissful</p>
                    <p style="margin:0;font-size:10px;font-weight:700;color:#d4b87a;letter-spacing:0.24em;">SALON &amp; SPA</p>
                    <p style="margin:16px 0 0;display:inline-block;background-color:rgba(191,161,95,0.14);border:1px solid rgba(191,161,95,0.45);border-radius:100px;padding:7px 18px;font-size:11px;font-weight:700;color:#e8cc8a;letter-spacing:0.08em;">PASSWORD RESET</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td class="content-pad" style="padding:34px 36px 30px;background-color:#ffffff;">
              <h1 class="greeting" style="margin:0 0 10px;font-family:Georgia,serif;font-size:24px;font-weight:700;color:#062c22;line-height:1.35;">Hi {{ $userName }},</h1>
              <p class="intro" style="margin:0 0 24px;font-size:14px;color:#5b5b5b;line-height:1.7;">
                We received a request to reset the password for <strong style="color:#062c22;">{{ $userEmail }}</strong>.
                Tap the button below to create a new password. This link expires in <strong style="color:#062c22;">60 minutes</strong>.
              </p>

              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:20px;">
                <tr>
                  <td align="center">
                    <a href="{{ $resetUrl }}" class="btn" target="_blank" rel="noopener noreferrer" style="display:inline-block;background-color:#bfa15f;color:#062c22;font-size:14px;font-weight:800;padding:15px 40px;border-radius:10px;text-decoration:none;letter-spacing:0.03em;">Reset My Password</a>
                  </td>
                </tr>
              </table>

              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#faf8f3;border:1px solid #ece3d0;border-radius:10px;margin-bottom:20px;">
                <tr>
                  <td style="padding:14px 18px;font-size:12.5px;color:#666666;line-height:1.65;">
                    <strong style="color:#062c22;">Didn't request this?</strong> Your account is safe — just ignore this email.<br />
                    <strong style="color:#062c22;">Button not working?</strong> Copy this link into your browser:
                    <br />
                    <a href="{{ $resetUrl }}" class="fallback-url" target="_blank" rel="noopener noreferrer" style="color:#0a3d30;font-weight:600;text-decoration:underline;word-break:break-all;font-size:12px;">{{ $resetUrl }}</a>
                  </td>
                </tr>
              </table>

              <p style="margin:0;text-align:center;font-size:12px;color:#999999;line-height:1.7;">
                Can't find this email? Check your Spam or Junk folder.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="footer-pad" align="center" style="background-color:#062c22;padding:24px 36px;">
              <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.55);line-height:1.8;">
                &copy; {{ date('Y') }} <span style="color:#d4b87a;">Cozy Blissful Spa</span> &middot; Open 9:00 AM – 9:00 PM, Daily<br />
                <span style="color:rgba(255,255,255,0.35);">This email was sent because a password reset was requested.</span>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
