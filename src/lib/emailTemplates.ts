// Email template styles based on ReBooked branding
export const emailStyles = `
  body {
    font-family: Arial, sans-serif;
    background-color: #f2fbf6;
    padding: 20px;
    color: #1f4e3d;
    margin: 0;
  }
  .container {
    max-width: 500px;
    margin: auto;
    background-color: #ffffff;
    padding: 30px;
    border-radius: 10px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }
  h1, h2, h3 {
    color: #2d6e55;
    margin-top: 0;
  }
  .btn {
    display: inline-block;
    padding: 12px 20px;
    background-color: #2d6e55;
    color: white !important;
    text-decoration: none;
    border-radius: 5px;
    margin-top: 20px;
    font-weight: bold;
  }
  .btn:hover {
    background-color: #255c48;
  }
  .link {
    color: #2d6e55;
    text-decoration: none;
  }
  .link:hover {
    text-decoration: underline;
  }
  .footer {
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid #e5e5e5;
    font-size: 12px;
    color: #666;
    text-align: center;
  }
  .highlight-box {
    background-color: #f2fbf6;
    border: 1px solid #2d6e55;
    border-radius: 8px;
    padding: 15px;
    margin: 20px 0;
  }
  .feature-list {
    list-style: none;
    padding: 0;
    margin: 15px 0;
  }
  .feature-list li {
    padding: 8px 0;
    padding-left: 25px;
    position: relative;
  }
  .feature-list li::before {
    content: "✓";
    color: #2d6e55;
    font-weight: bold;
    position: absolute;
    left: 0;
  }
`;

export function generateWelcomeEmail(firstName?: string): string {
  const name = firstName || "there";
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to ReBooked Living</title>

  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f2fbf6;
      padding: 20px;
      color: #1f4e3d;
      margin: 0;
    }
    .container {
      max-width: 520px;
      margin: auto;
      background-color: #ffffff;
      padding: 32px;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.06);
    }
    h1, h2 {
      color: #2d6e55;
      margin-top: 0;
    }
    .btn {
      display: inline-block;
      padding: 14px 24px;
      background-color: #2d6e55;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 6px;
      font-weight: bold;
      margin-top: 20px;
    }
    .btn.secondary {
      background-color: #e6f4ee;
      color: #2d6e55 !important;
      margin-left: 10px;
    }
    .highlight-box {
      background-color: #f2fbf6;
      border-left: 4px solid #2d6e55;
      padding: 16px;
      margin: 24px 0;
      border-radius: 6px;
    }
    .upgrade-box {
      background-color: #fffaf0;
      border-left: 4px solid #f39c12;
      padding: 16px;
      margin: 24px 0;
      border-radius: 6px;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e5e5;
      font-size: 12px;
      color: #666;
      text-align: center;
    }
    .footer a {
      color: #2d6e55;
      text-decoration: none;
      font-weight: bold;
    }
  </style>
</head>

<body>
  <div class="container">
    <h1>Welcome to ReBooked Living 👋</h1>

    <p>Hi <strong>${name}</strong>,</p>

    <p>
      Welcome to <strong>ReBooked Living</strong> — your go-to platform for finding
      student accommodation across South Africa.
    </p>

    <div class="highlight-box">
      <h2>Here's what you can do right now</h2>
      <ul>
        <li>Browse student accommodations near your campus</li>
        <li>Filter by price, location & amenities</li>
        <li>Save listings you like</li>
        <li>Contact landlords directly</li>
      </ul>
    </div>

    <div class="upgrade-box">
      <h2>⚡ Want the full experience?</h2>
      <p>You're currently missing out on:</p>
      <ul>
        <li>❌ Full access to all accommodation photos</li>
        <li>❌ Real Google reviews & ratings</li>
        <li>❌ AI-powered search & comparisons</li>
        <li>❌ Interactive maps & travel times</li>
        <li>❌ Ad-free browsing</li>
      </ul>
      <p>
        Upgrade to <strong>ReBooked Pro</strong> and unlock everything instantly.
      </p>
    </div>

    <a href="https://living.rebookedsolutions.co.za/browse" class="btn">
      Start Browsing
    </a>
    <a href="https://living.rebookedsolutions.co.za/pricing" class="btn secondary">
      Upgrade to Pro
    </a>

    <div class="footer">
      <p>
        Need help? Contact us at
        <a href="mailto:info@rebookedsolutions.co.za">
          info@rebookedsolutions.co.za
        </a>
      </p>
      <p>
        © 2026 ReBooked Solutions<br />
        <a href="https://living.rebookedsolutions.co.za">
          living.rebookedsolutions.co.za
        </a>
      </p>
    </div>
  </div>
</body>
</html>`;
}

export function generatePurchaseConfirmationEmail(
  paymentType: "weekly" | "monthly",
  amount: number,
  expiresAt: Date,
  paymentReference: string
): string {
  const planName = paymentType === "weekly" ? "5-Day Pass" : "Monthly Pass (25 Days)";
  const formattedDate = expiresAt.toLocaleDateString('en-ZA', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${emailStyles}</style>
</head>
<body>
  <div class="container">
    <h1>🎉 Welcome to Pro!</h1>

    <p>Thank you for your purchase! Your ReBooked Pro access is now active.</p>

    <div class="highlight-box">
      <h3 style="margin-bottom: 15px;">Order Details</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #666;">Plan:</td>
          <td style="padding: 8px 0; text-align: right; font-weight: 600;">${planName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666;">Amount Paid:</td>
          <td style="padding: 8px 0; text-align: right; font-weight: 600;">R${amount}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666;">Valid Until:</td>
          <td style="padding: 8px 0; text-align: right; font-weight: 600;">${formattedDate}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666;">Reference:</td>
          <td style="padding: 8px 0; text-align: right; font-weight: 600; font-size: 11px;">${paymentReference}</td>
        </tr>
      </table>
    </div>

    <h3>What you can now access:</h3>
    <ul class="feature-list">
      <li><strong>All Photos</strong> – View every image of accommodations</li>
      <li><strong>Google Reviews</strong> – Read what others are saying</li>
      <li><strong>AI Search & Compare</strong> – Smart accommodation matching</li>
      <li><strong>Interactive Maps</strong> – See travel times & distances</li>
      <li><strong>No Ads</strong> – Enjoy an ad-free experience</li>
    </ul>

    <a href="https://living.rebookedsolutions.co.za/browse" class="btn">Start Browsing</a>

    <div class="footer">
      <p>Questions about your purchase? Contact us at info@rebookedsolutions.co.za</p>
      <p>© ${new Date().getFullYear()} ReBooked Solutions. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
}

export function generateExpiryWarningEmail(
  paymentType: "weekly" | "monthly",
  expiresAt: Date
): string {
  const planName = paymentType === "weekly" ? "5-Day Pass" : "Monthly Pass (25 Days)";
  const formattedDate = expiresAt.toLocaleDateString('en-ZA', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Pro Access Is About to End</title>

  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f2fbf6;
      padding: 20px;
      color: #1f4e3d;
      margin: 0;
    }
    .container {
      max-width: 520px;
      margin: auto;
      background-color: #ffffff;
      padding: 32px;
      border-radius: 12px;
    }
    h1 {
      color: #c0392b;
      margin-top: 0;
    }
    .btn {
      display: inline-block;
      padding: 14px 24px;
      background-color: #2d6e55;
      color: white !important;
      text-decoration: none;
      border-radius: 6px;
      font-weight: bold;
      margin-top: 20px;
    }
    .loss-box {
      background-color: #fff5f5;
      border-left: 4px solid #c0392b;
      padding: 16px;
      margin: 22px 0;
      border-radius: 6px;
    }
    .footer {
      margin-top: 35px;
      font-size: 12px;
      color: #666;
      text-align: center;
    }
  </style>
</head>

<body>
  <div class="container">
    <h1>⚠️ Your Pro access is expiring</h1>

    <p>
      Your <strong>${planName}</strong> will expire on
      <strong>${formattedDate}</strong>.
    </p>

    <div class="loss-box">
      <p><strong>If you don't renew, you'll lose:</strong></p>
      <ul>
        <li>❌ Access to full accommodation photos</li>
        <li>❌ Google reviews & ratings</li>
        <li>❌ AI search & smart comparisons</li>
        <li>❌ Map-based distance & travel insights</li>
        <li>❌ Ad-free browsing</li>
      </ul>
    </div>

    <p>
      Renewing now keeps <strong>all your benefits active</strong> —
      and any remaining time is <strong>carried over</strong>. No days wasted.
    </p>

    <a href="https://living.rebookedsolutions.co.za/pricing" class="btn">
      Renew & Keep Your Access
    </a>

    <div class="footer">
      <p>
        Payment issues?
        <a href="mailto:payments@rebookedsolutions.co.za">payments@rebookedsolutions.co.za</a>
      </p>
      <p>© 2026 ReBooked Solutions</p>
    </div>
  </div>
</body>
</html>`;
}
