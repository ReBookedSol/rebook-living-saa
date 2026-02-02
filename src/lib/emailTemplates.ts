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
  const name = firstName || "Student";
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
    <h1>Welcome to ReBooked Living! 🎉</h1>
    
    <p>Hi ${name},</p>
    
    <p>Thank you for joining ReBooked Living – South Africa's student accommodation platform. We're excited to help you find the perfect place to stay during your studies!</p>
    
    <div class="highlight-box">
      <h3 style="margin-bottom: 10px;">What you can do now:</h3>
      <ul class="feature-list">
        <li>Browse hundreds of student accommodations</li>
        <li>Filter by university, price, and amenities</li>
        <li>View photos, reviews, and ratings</li>
        <li>Save your favorite listings</li>
        <li>Contact landlords directly</li>
      </ul>
    </div>
    
    <p>Start exploring accommodations near your university today:</p>
    
    <a href="https://rebook-living-sa.lovable.app/browse" class="btn">Browse Accommodations</a>
    
    <p style="margin-top: 25px;">Need more features? <a href="https://rebook-living-sa.lovable.app/pricing" class="link">Upgrade to Pro</a> for unlimited photos, AI search, and more!</p>
    
    <div class="footer">
      <p>Questions? Reply to this email or contact us at info@rebookedsolutions.co.za</p>
      <p>© ${new Date().getFullYear()} ReBooked Solutions. All rights reserved.</p>
      <p><a href="https://rebook-living-sa.lovable.app" class="link">rebook-living-sa.lovable.app</a></p>
    </div>
  </div>
</body>
</html>
  `;
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
    
    <a href="https://rebook-living-sa.lovable.app/browse" class="btn">Start Browsing</a>
    
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
  const planName = paymentType === "weekly" ? "5-Day Pass" : "Monthly Pass";
  const formattedDate = expiresAt.toLocaleDateString('en-ZA', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
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
    <h1>⏰ Your Pro Access Expires Soon</h1>
    
    <p>Hi there,</p>
    
    <p>Your ReBooked <strong>${planName}</strong> will expire on <strong>${formattedDate}</strong>.</p>
    
    <div class="highlight-box">
      <p style="margin: 0;"><strong>Don't lose access!</strong> Renew now to continue enjoying:</p>
      <ul class="feature-list">
        <li>Unlimited accommodation photos</li>
        <li>All Google reviews</li>
        <li>AI-powered search</li>
        <li>Interactive maps with travel times</li>
        <li>Ad-free browsing</li>
      </ul>
    </div>
    
    <p>Your new access will be added to your remaining time – you won't lose a single day!</p>
    
    <a href="https://rebook-living-sa.lovable.app/pricing" class="btn">Renew Now</a>
    
    <div class="footer">
      <p>Questions? Contact us at info@rebookedsolutions.co.za</p>
      <p>© ${new Date().getFullYear()} ReBooked Solutions. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
}
