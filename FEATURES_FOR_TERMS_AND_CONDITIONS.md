# Rebooked Living - Complete Features Documentation for Terms & Conditions

**Document Purpose**: This document outlines all features and functionality available on the Rebooked Living platform for incorporation into Terms and Conditions to establish legal protection and user liability disclosures.

---

## 1. CORE PLATFORM FEATURES

### 1.1 Accommodation Listing Search and Browse
- **Description**: Users can search, filter, and browse student accommodation listings
- **Scope**: Includes search by location, university, price range, amenities, and other criteria
- **Data Source**: Listings stored in proprietary database (accommodations table)
- **Liability Note**: 
  - Rebooked Living does not verify the accuracy of listing information submitted by landlords
  - Users are responsible for independently verifying listing details before contacting landlords
  - Rebooked Living is not responsible for incomplete, inaccurate, or fraudulent listings

### 1.2 Listing Detail Pages
- **Description**: Comprehensive property information pages with photos, amenities, ratings, and contact information
- **Content Includes**: 
  - Property name, address, price, description
  - Amenities and features
  - Landlord/contact information (name, phone, email)
  - University distance and travel time information
  - Photo galleries (server-provided and third-party cached photos)
  - User-submitted reviews and ratings
- **Liability Note**: Rebooked Living does not warrant the completeness or accuracy of listing content and relies on user and third-party submissions

### 1.3 Interactive Maps and Location Services
- **Description**: Integration with Google Maps API to display property locations, calculate distances, and provide directions
- **Features Include**:
  - Satellite view (available to premium users)
  - Street View (available to premium users only)
  - Travel time calculations (driving and walking)
  - Distance to selected universities
- **Data Integration**: Real-time integration with Google Maps, Google Places, and Google Directions APIs
- **Liability Note**:
  - Location data is provided "as is" and may not be accurate
  - Users should independently verify locations before visiting properties
  - Rebooked Living is not liable for errors in Google Maps data or third-party mapping services
  - Street View may contain outdated or inaccurate imagery

### 1.4 Photo Gallery System
- **Description**: Multi-source photo gallery displaying property images
- **Sources**:
  - Landlord-uploaded photos (stored on Rebooked Living servers)
  - Google Places cached photos (displayed with attribution)
  - Photo retrieval limited by user subscription tier (free: 3 photos, paid: unlimited)
- **Liability Note**:
  - Rebooked Living does not verify photo authenticity or current accuracy
  - Photos may be outdated or not representative of current property condition
  - Users are advised to request current photos from landlords before viewing
  - Third-party photos are used under Google Places terms of service

---

## 2. USER ACCOUNT & AUTHENTICATION FEATURES

### 2.1 User Registration and Account Creation
- **Description**: Users can create accounts via email and password
- **Data Collected**: First name, last name, email address
- **Authentication Method**: Supabase Auth with email verification required
- **Password Requirements**: Minimum 6 characters
- **Liability Note**:
  - Users are responsible for keeping their passwords confidential
  - Users are responsible for all activity on their accounts
  - Account creation does not guarantee access to all platform features
  - Rebooked Living may suspend or terminate accounts for policy violations

### 2.2 User Profile Management
- **Description**: Users can manage profile information and account settings
- **Data Manageable**: 
  - First and last name
  - Contact phone number (optional)
  - University affiliation
  - Email address
  - Saved listings (favorites)
  - Recently viewed accommodations
  - Notification preferences
- **Liability Note**: Users are responsible for maintaining accurate profile information

### 2.3 Password Reset and Account Recovery
- **Description**: Users can reset forgotten passwords via email verification
- **Process**: Email-based verification with secure reset link
- **Liability Note**: 
  - Email-based recovery depends on user access to registered email account
  - Rebooked Living is not responsible for lost access due to email account compromise
  - Users must monitor email for account recovery links

### 2.4 Session Management
- **Description**: Automatic session tracking and authentication state management
- **Lifetime**: Sessions managed by Supabase Auth with standard expiry periods
- **Liability Note**: Users may be logged out at any time; Rebooked Living reserves the right to modify session policies

---

## 3. USER INTERACTION & ENGAGEMENT FEATURES

### 3.1 Messaging and Contact Inquiry System
- **Description**: Direct messaging system allowing users to contact property landlords/managers
- **Functionality**:
  - Submit inquiry form with name, email, and message
  - Messages stored in database (messages table)
  - Landlord contact via form submission (not direct messaging)
- **Data Forwarding**: Messages may be forwarded via webhook integrations to external services
- **Liability Note**:
  - Rebooked Living does not monitor, filter, or validate message content
  - Users are responsible for providing accurate contact information
  - Rebooked Living does not guarantee message delivery to landlords
  - Users should avoid sharing sensitive personal or financial information
  - Rebooked Living may terminate access for users sending harassment, spam, or illegal content
  - All messages are subject to data retention policies

### 3.2 User Reviews and Ratings System
- **Description**: Users can submit and view reviews of properties
- **Content Allowed**: Star ratings (1-5) and text reviews
- **Display**: 
  - User-submitted reviews (Rebooked Living database)
  - Google Places reviews (cached third-party data)
  - Limited to paid users (free users see limited reviews)
- **Moderation**: Admin team has moderation capabilities
- **Liability Note**:
  - Reviews express personal opinions and are not verified for accuracy
  - Rebooked Living does not endorse review content or validate reviewer claims
  - Users submit reviews "as is" and at their own risk
  - Rebooked Living may remove defamatory, abusive, spam, or illegal reviews at any time
  - Rebooked Living is not liable for false or misleading review content
  - Users assume full responsibility for review content they submit
  - Third-party (Google) reviews are not moderated by Rebooked Living

### 3.3 Favorite/Saved Listings
- **Description**: Users can save listings for future reference
- **Functionality**: Store and retrieve list of favorite accommodations
- **Data Persistence**: Saved indefinitely until user removes
- **Liability Note**: Favoriting does not reserve property or guarantee availability

### 3.4 Recently Viewed Tracking
- **Description**: Automatic tracking of listings recently viewed by user
- **Duration**: Tracked for analytics and user convenience
- **Visibility**: Visible only to the viewing user
- **Liability Note**: This is for user convenience only and does not indicate property interest or reservation

### 3.5 Listing Reporting System
- **Description**: Users can report problematic listings to moderators
- **Report Reasons**: Inaccurate information, scams, unavailable properties, inappropriate content, other
- **Details Collectible**: Reporter name, email (optional), reason, details
- **Response**: Reports reviewed by admin team; no guaranteed action or timeline
- **Liability Note**:
  - Reported listings are reviewed at Rebooked Living's discretion
  - Report submission does not guarantee removal of listing
  - False reports may result in account penalties
  - Reports are confidential; reporter identity not shared with listing owner

---

## 4. NOTIFICATION & COMMUNICATION FEATURES

### 4.1 In-App Notifications
- **Description**: System notifications sent to users about platform events
- **Triggers**: 
  - Subscription expirations
  - Message responses
  - System updates
  - Feature announcements
- **Management**: Users can read, mark, and manage notifications in-app
- **Delivery**: Delivered through in-app notification center (not guaranteed delivery)
- **Liability Note**: Rebooked Living does not guarantee timely delivery of notifications

### 4.2 Email Notifications
- **Description**: Optional email notifications for important account events
- **Content**:
  - Subscription expiration reminders
  - Account security alerts
  - Platform updates
- **Frequency**: Variable; users can adjust preferences
- **Liability Note**:
  - Email delivery depends on email provider reliability
  - Users should whitelist Rebooked Living email addresses
  - Rebooked Living not responsible for emails marked as spam or lost

### 4.3 Webhook Integrations
- **Description**: Backend integration forwarding certain data to external services
- **Data Forwarded**: 
  - Contact inquiry data (name, email, message)
  - Report submissions
  - User signup information (name, email, signup timestamp - NOT passwords)
- **External Services**: Data may be sent to third-party webhook platforms
- **Liability Note**:
  - Users agree to data forwarding when using platform
  - Third-party services' handling of data is governed by their privacy policies
  - Rebooked Living not liable for third-party data handling
  - Users should review third-party privacy policies before using platform

---

## 5. SUBSCRIPTION & PREMIUM FEATURES

### 5.1 Freemium Access Model
- **Free Tier Limitations**:
  - View up to 3 photos per listing
  - View 1 Google review per listing
  - Roadmap-only map view (no satellite)
  - No Street View access
  - Limited to 1 review per listing
  - Ads displayed on listings
- **Premium Tier (Paid Access)**:
  - Unlimited photos per listing
  - Unlimited reviews per listing
  - Satellite map view
  - Street View access
  - Travel time information (driving and walking)
  - Ad-free experience
  - Full Google Maps features
- **Liability Note**: Feature availability may change; paid users are not entitled to any refunds if features are modified or removed

### 5.2 Premium Subscription Management
- **Purchase Options**: One-time purchase or recurring subscription
- **Upgrade Path**: Users can upgrade to premium from pricing page
- **Subscription Status**: Visible in user profile
- **Auto-Renewal**: If applicable, enabled on premium subscriptions
- **Cancellation**: Users can cancel subscriptions within account settings
- **Liability Note**: 
  - Cancellation takes effect at end of current billing period
  - No refunds for partial months
  - Re-subscribing may be treated as a new purchase

### 5.3 Payment Processing
- **Payment Providers**: 
  - Paystack
  - BobPay
  - Offerwall (optional credit system)
- **Data Security**: Payment data handled by secure third-party providers
- **Transaction Recording**: All payments recorded in user_payments table
- **Receipt Issuance**: Available through payment provider interfaces
- **Liability Note**:
  - Payment information is processed by third-party providers
  - Rebooked Living does not store complete payment details
  - Users should review payment provider terms
  - Failed payments may delay service activation
  - Double payments should be reported to support for refund

### 5.4 Subscription Expiry and Automated Actions
- **Expiry Tracking**: System automatically tracks subscription expiry dates
- **Notifications**: Users notified before and at expiry
- **Feature Downgrade**: Premium features automatically disabled at expiry
- **Reactivation**: Users must re-purchase to restore premium features
- **Liability Note**:
  - Rebooked Living not liable for feature loss due to expired subscriptions
  - Users responsible for managing subscription renewal
  - Notifications may fail to deliver; users should check expiry dates directly

### 5.5 Offerwall Rewards System (Optional)
- **Description**: Optional third-party system allowing users to earn credits through completing offers
- **Provider**: Third-party offerwall platform
- **Credit System**: Completed offers credited to user account
- **Redemption**: Credits may be applied toward paid subscriptions
- **Liability Note**:
  - Offerwall operation governed by third-party provider
  - Rebooked Living not responsible for offer availability or credit awards
  - Credits may expire; terms set by offerwall provider
  - Completion dispute resolution through offerwall provider

---

## 6. ANALYTICS & ACTIVITY TRACKING

### 6.1 Listing Analytics (For Landlords)
- **Metrics Tracked**:
  - Page views per listing
  - Message inquiries
  - Favorite saves
  - Share/referral clicks
  - User search behavior (aggregated)
- **Dashboard**: Available to listing owners via landlord portal
- **Data Usage**: For landlord business intelligence
- **Retention**: Data retained per platform retention policies
- **Liability Note**: Analytics are estimates and may not reflect exact user behavior

### 6.2 User Activity Tracking
- **Data Tracked**:
  - Pages visited and session duration
  - Listings viewed
  - Features used
  - Aggregate behavior patterns
- **Purpose**: Platform improvement, fraud detection, content moderation
- **Privacy Controls**: Covered under privacy policy
- **Liability Note**: Activity tracking is continuous; users accept by using platform

### 6.3 Place Cache Analytics
- **Description**: Tracking of Google Places data retrieval and caching performance
- **Metrics**: Cache hits, misses, API calls
- **Purpose**: Optimize third-party API usage and costs
- **Visibility**: Admin-only dashboard
- **Liability Note**: Cache performance dependent on Google API reliability

---

## 7. THIRD-PARTY INTEGRATIONS & SERVICES

### 7.1 Google Maps and Google Places Integration
- **Services Used**:
  - Google Maps API (location display, directions)
  - Google Places API (property information, photos, reviews)
  - Google Directions API (travel time calculation)
  - Google Street View API (street-level imagery, premium users)
- **Data Source**: All Google-sourced data cached in platform database
- **Attribution**: Google attribution displayed where required
- **Liability Note**:
  - Google data provided "as is" with no warranty
  - Data may be inaccurate, outdated, or incomplete
  - Rebooked Living not responsible for Google API errors or outages
  - Users should verify location information independently
  - Use of Google services subject to Google Terms of Service

### 7.2 Google AdSense Integration
- **Description**: Advertising platform displaying targeted ads to free users
- **Ad Display**: Horizontal banner ads on listing detail pages
- **Frequency**: Multiple ad slots in content
- **Targeting**: Based on user location, search history, and Google profile
- **Opt-Out**: Premium users see no ads; free users cannot opt out
- **Data Sharing**: Google collects browsing data for ad targeting
- **Privacy Impact**: Google collects cookies and tracking data
- **Liability Note**:
  - Ad content not curated or verified by Rebooked Living
  - Ads may contain third-party promotions or misleading claims
  - Rebooked Living not liable for ad content accuracy
  - Clicking ads may redirect to unsafe or fraudulent sites
  - Users should use caution when interacting with ads
  - Google's privacy policy applies to ad targeting and cookie collection

### 7.3 Payment Provider Integrations
- **Paystack Integration**:
  - Payment initialization and processing
  - Webhook notifications for payment events
  - Subscription management (if applicable)
  - Fraud detection by provider
- **BobPay Integration**:
  - Alternative payment link generation
  - Payment verification and confirmation
  - Webhook callbacks for order status
  - Compliance checks by provider
- **Liability Note**:
  - Payment provider terms of service apply
  - Rebooked Living not liable for payment processing failures
  - Refund policies governed by payment provider
  - Payment disputes resolved through payment provider
  - Users must maintain valid payment method for recurring charges

### 7.4 Offerwall Platform Integration
- **Description**: Third-party rewards system for earning credits
- **Data Sharing**: User activity shared with offerwall provider
- **Completion Verification**: Provider verifies offer completion
- **Credit Processing**: Offerwall provider maintains reward records
- **Liability Note**:
  - Offerwall provider responsible for offer terms
  - Rebooked Living not liable for offer validity or completion disputes
  - Rewards governed by offerwall provider terms
  - Data sharing with provider covered by their privacy policy

### 7.5 Supabase Backend Services
- **Services**: Authentication, database, edge functions, file storage
- **Data Storage**: All user data, listings, and interactions
- **Infrastructure**: Cloud-based with automatic backups
- **Security**: Provided by Supabase security features
- **Liability Note**:
  - Backend service terms governed by Supabase Terms of Service
  - Data availability dependent on Supabase uptime
  - Rebooked Living not liable for Supabase outages or data loss (within Supabase liability limits)

### 7.6 Vercel Analytics (Optional)
- **Description**: Optional analytics platform for user behavior insights
- **Data Collected**: Page views, user interactions, performance metrics
- **Privacy**: Vercel's privacy policy applies
- **Liability Note**: Analytics data is for improvement only; not guaranteed accurate

---

## 8. AI AND AUTOMATED FEATURES

### 8.1 AI Accommodation Assistant
- **Description**: AI-powered tool providing property descriptions and explanations
- **Functionality**:
  - Explain property features
  - Compose property descriptions
  - Generate listing copy
- **Technology**: Powered by Lovable AI gateway (third-party)
- **Output**: AI-generated text not verified for accuracy
- **Liability Note**:
  - AI outputs are computer-generated and may be inaccurate, misleading, or fabricated
  - AI-generated descriptions are suggestions only and not official property information
  - Users should verify AI-generated content with landlords
  - Rebooked Living not liable for AI output errors or misleading content
  - AI may hallucinate or invent property features that don't exist
  - AI feature availability subject to removal or change without notice

### 8.2 AI Chat Assistant
- **Description**: Conversational AI answering user questions about platform and properties
- **Functionality**:
  - Answer platform questions
  - Explain features
  - Provide property information
  - Assist with navigation
- **Context**: May reference specific listings in conversations
- **Technology**: Powered by Lovable AI gateway
- **Liability Note**:
  - Chat responses are AI-generated and may contain errors
  - Chat is not a substitute for official support
  - Sensitive information should not be shared in chat
  - Chat history may be retained for improvement purposes
  - Rebooked Living not liable for inaccurate chat responses

### 8.3 Bursary Pack Generator
- **Description**: AI tool generating potential bursary and funding opportunities
- **Functionality**:
  - Research student funding options
  - Compile bursary lists
  - Generate formatted bursary information
  - Create downloadable packs
- **Data Source**: AI research from internet sources (not verified)
- **Accuracy**: Information may be outdated or incomplete
- **Liability Note**:
  - Bursary information is AI-generated and not verified for accuracy or current validity
  - Bursary details change frequently; AI may provide outdated information
  - Users should independently verify all bursary requirements and deadlines
  - Rebooked Living not liable for missed bursary deadlines or incorrect eligibility
  - Bursary availability changes continuously; availability cannot be guaranteed
  - Users should contact bursary providers directly for official information
  - Rebooked Living not liable for bursary rejection or disqualification
  - AI may fail to identify relevant bursaries or include irrelevant ones

### 8.4 AI Feature Access Controls
- **Restrictions**: 
  - AI features available to logged-in users
  - Some AI features limited to premium users
  - Usage may be rate-limited
  - Features may be disabled by administrators
- **Availability**: AI features may be disabled or removed at any time
- **Liability Note**: 
  - Rebooked Living reserves right to disable AI features
  - No refund provided if AI features become unavailable
  - AI feature updates may change output quality or format

---

## 9. LANDLORD AND PROPERTY MANAGEMENT FEATURES

### 9.1 Listing Submission System
- **Description**: Landlords can submit property listings to platform
- **Data Collectible**: Property details, photos, amenities, pricing, contact info
- **Approval Process**: Admin review before listing publication
- **Content Guidelines**: Must comply with platform policies
- **Liability Note**:
  - Landlords responsible for listing accuracy and legality
  - Rebooked Living may reject or remove listings violating policies
  - Listed properties must be legal and legitimate
  - Landlords responsible for property compliance with local regulations

### 9.2 Landlord Dashboard and Analytics
- **Description**: Property management interface for listing owners
- **Metrics Displayed**:
  - Views and impressions
  - Message inquiries
  - Favorite saves
  - Share/referral activity
  - Engagement trends
- **Functionality**: 
  - Edit listing information
  - Respond to inquiries
  - Manage photos
  - View historical analytics
- **Liability Note**: Analytics are estimates and may not be 100% accurate

### 9.3 Landlord Subscription and Payment
- **Description**: Paid upgrade options for listing visibility and features
- **Paid Options**:
  - Featured listing placement
  - Extended listing duration
  - Priority search results
  - Analytics access
- **Payment**: Processed through payment providers
- **Liability Note**:
  - Featured placement not guaranteed to increase inquiries
  - Listing may still be removed for policy violations regardless of paid status
  - Paid placements subject to availability and algorithm changes

### 9.4 Landlord Document Management
- **Description**: Upload and store property-related documents
- **Supported Documents**: Property ownership, insurance, certificates, permits
- **Storage**: Secured on Rebooked Living servers
- **Privacy**: Documents visible only to listing owner and authorized admins
- **Liability Note**: 
  - Landlords responsible for document authenticity
  - Rebooked Living not liable for lost documents
  - Document retention subject to data retention policies

---

## 10. ADMINISTRATIVE AND MODERATION FEATURES

### 10.1 Content Moderation
- **Description**: Admin team reviews and moderates user-generated content
- **Reviewed Content**:
  - User reviews
  - Listing descriptions
  - Messages and reports
  - User profiles
- **Actions Available**: Approve, reject, edit, hide, remove content
- **Timeline**: Reviews completed at admin discretion; no guaranteed timeframe
- **Liability Note**:
  - Moderation is best-effort only
  - Rebooked Living not liable for unmoderated or harmful content
  - Moderation decisions final and not subject to appeal (unless policy violation)
  - Removed content not recoverable

### 10.2 User Account Management
- **Admin Capabilities**:
  - Create, edit, suspend, or delete user accounts
  - Modify user roles and permissions
  - Issue warnings or bans
  - Reset user passwords
  - Access user data for investigation
- **Policy Enforcement**: Account actions taken for policy violations
- **Liability Note**:
  - Users can be suspended or banned at admin discretion
  - Suspension may be temporary or permanent
  - Users not entitled to refunds upon suspension
  - Admin decisions final

### 10.3 Listing Management
- **Admin Capabilities**:
  - Create, edit, delete listings
  - Add or remove photos
  - Feature or unfeature listings
  - Set pricing and availability
- **Moderation Actions**: Remove listings violating policies
- **Liability Note**: Listing removal may occur without notice if policy violation detected

### 10.4 Place Cache Management
- **Description**: Cache of Google Places data (photos and reviews)
- **Admin Controls**: 
  - Manual cache refresh
  - Cache purge/clearing
  - Attribution management
- **Data Freshness**: Cache may be outdated compared to live Google Places
- **Liability Note**: Cache may not reflect current Google Places data

### 10.5 Analytics and Reporting
- **Available Metrics**:
  - User and listing statistics
  - Revenue and payment analytics
  - AI feature usage
  - Cache performance metrics
- **Reports Generated**: Custom admin reports for business intelligence
- **Data Export**: Analytics may be exported for analysis
- **Liability Note**: Analytics are estimates and subject to margin of error

### 10.6 AI Settings and Controls
- **Admin Capabilities**:
  - Enable/disable AI features
  - View AI feature requests and usage
  - Monitor AI output quality
  - Set rate limits on AI usage
- **Adjustment Authority**: Admins may adjust AI settings without user notice
- **Liability Note**: AI feature availability controlled by admins and may change

---

## 11. DATA HANDLING AND PRIVACY

### 11.1 Personal Data Collection
- **User Data Collected**:
  - First name, last name
  - Email address
  - Phone number (optional)
  - University affiliation
  - Activity logs and session data
  - Search and browsing history
  - Favorite listings and saved searches
- **Listing Creator Data**:
  - Landlord name, phone, email
  - Property address and location
  - Business information
- **Third-Party Data**: Google Places data (photos, reviews, ratings)
- **Liability Note**: Personal data collection governed by Privacy Policy

### 11.2 Data Storage and Retention
- **Storage Location**: Supabase cloud servers
- **Retention Period**: Retained per Privacy Policy (indefinitely unless deleted)
- **User Deletion**: Users may request account deletion; data purged per policy
- **Backup**: Automatic backups maintained for recovery
- **Liability Note**: 
  - Data retention subject to legal holds
  - Backup recovery not guaranteed
  - Deleted accounts may take time to process

### 11.3 Data Security
- **Encryption**: Data encrypted in transit (HTTPS) and at rest (provider encryption)
- **Access Controls**: Row-level security restricts unauthorized access
- **Password Storage**: Hashed and salted by Supabase Auth
- **Authentication**: Multi-session support with automatic logout
- **Liability Note**:
  - Security provided on best-effort basis
  - No absolute guarantee of security
  - Users responsible for account password confidentiality
  - Rebooked Living not liable for unauthorized access if user shares credentials

### 11.4 Cookie and Tracking Technologies
- **Cookies Used**:
  - Authentication cookies (Supabase session)
  - Third-party cookies (Google Ads, analytics)
  - Preference cookies (optional, for UX)
- **Tracking Technologies**:
  - Google Analytics (optional)
  - Google Ads tracking
  - Session tracking
- **Opt-Out Options**:
  - Delete cookies via browser settings
  - Upgrade to premium (removes ad tracking)
  - Disable third-party cookies in browser
- **Liability Note**: Cookie consent governed by Privacy Policy and applicable regulations

### 11.5 Third-Party Data Access
- **Data Shared With**:
  - Google (via Maps, Places, AdSense APIs)
  - Payment providers (Paystack, BobPay)
  - Offerwall provider (if using rewards)
  - Webhook integrations (contact info, signup data)
  - Lovable AI (for AI feature usage)
- **Data Shared**: Varies by third-party; typically de-identified or aggregated
- **Liability Note**: Third-party data handling governed by their privacy policies; Rebooked Living not liable for third-party data practices

---

## 12. LIMITATION OF LIABILITY AND DISCLAIMERS

### 12.1 Platform "As Is" Disclaimer
- **Warranty Disclaimer**: 
  - Platform provided "as is" without warranties
  - No warranty of accuracy, completeness, or legality
  - No warranty of fitness for particular purpose
  - No warranty of uninterrupted service
- **Service Interruptions**: Platform may be unavailable for maintenance or emergencies
- **Liability Note**: Users use platform at their own risk

### 12.2 Third-Party Content Disclaimer
- **User-Generated Content**: 
  - Listings, reviews, messages are user-generated
  - Rebooked Living does not verify accuracy
  - Users liable for content they generate
  - Rebooked Living not liable for false or defamatory user content
- **Third-Party Data**: 
  - Google Places data used as-is
  - Photos may be outdated or inaccurate
  - Reviews not endorsed by Rebooked Living
- **Third-Party Services**: 
  - Payment processors, maps, ads are third-party
  - Third-party terms and policies apply
  - Rebooked Living not liable for third-party errors or outages

### 12.3 Landlord and Property Information Disclaimer
- **No Verification**: 
  - Rebooked Living does not verify landlord legitimacy
  - Rebooked Living does not verify property ownership
  - Rebooked Living does not inspect properties
  - Rebooked Living does not guarantee property legal compliance
- **User Responsibility**: 
  - Users responsible for verifying property details
  - Users should conduct independent inspections
  - Users should verify landlord credentials
  - Users should conduct background checks if desired
- **Liability Note**: Rebooked Living not liable for fraudulent listings, scams, or property issues

### 12.4 Financial and Payment Disclaimer
- **Payment Processing**: 
  - Rebooked Living does not process payments directly
  - Third-party payment providers handle all transactions
  - Payment terms governed by payment provider terms
- **Subscription Liability**: 
  - No refund for unused subscription portions
  - Canceled subscriptions take effect at period end
  - Rebooked Living not liable for payment processing failures
- **No Financial Guarantee**: Subscription purchase does not guarantee any return on investment or benefit

### 12.5 AI-Generated Content Disclaimer
- **No Accuracy Guarantee**: 
  - AI outputs are computer-generated
  - AI may be inaccurate, misleading, or completely false
  - AI may "hallucinate" or invent information
  - AI outputs not fact-checked or verified
- **Not Professional Advice**: 
  - AI outputs not professional advice
  - AI outputs not substitute for consulting professionals
  - Users should independently verify all AI information
- **Liability Note**: 
  - Rebooked Living not liable for AI errors or misleading content
  - Users liable for relying on unverified AI information
  - Consequences of acting on AI information user's responsibility

### 12.6 Location and Travel Time Disclaimer
- **Accuracy Not Guaranteed**: 
  - Distances and travel times are estimates
  - Travel times vary by time of day, traffic, route
  - Actual travel time may differ significantly from displayed times
- **Real-World Verification**: 
  - Users should independently verify travel times
  - Users should account for peak traffic hours
  - Users should use official navigation for actual travel
- **Liability Note**: Rebooked Living not liable for inaccurate travel information or late arrivals

### 12.7 Service Interruption Disclaimer
- **Availability**: 
  - Platform may be interrupted for maintenance
  - Platform may be unavailable due to third-party outages
  - Platform may be unavailable due to security incidents
  - No guarantee of continuous availability
- **Notification**: Users may or may not receive notice of interruptions
- **Liability Note**: 
  - Rebooked Living not liable for service interruptions
  - Users not entitled to refunds for downtime
  - Rebooked Living not liable for data loss during incidents

### 12.8 Fraud and Scam Disclaimer
- **Vigilance Required**: Users must exercise caution when contacting landlords
- **Common Scams**: 
  - Advance payment requests before property viewing
  - Requests for personal financial information
  - Offers that seem too good to be true
  - Pressure to make quick decisions
- **Verification**: Users responsible for verifying landlord legitimacy
- **Reporting**: Users should report suspected fraud immediately
- **Liability Note**: 
  - Rebooked Living not liable for scams perpetrated by users or landlords
  - Users responsible for financial decisions
  - Victims of scams should contact local authorities

### 12.9 No Endorsement of Listings or Landlords
- **Neutral Platform**: Rebooked Living does not endorse any listings or landlords
- **No Recommendation**: Listing prominence not endorsement
- **No Verification**: Featured listings not verified as legitimate
- **User Choice**: Users choose landlords at own discretion and risk
- **Liability Note**: Rebooked Living not liable for landlord practices or property conditions

---

## 13. USER RESPONSIBILITIES AND CONDUCT

### 13.1 Prohibited User Conduct
Users agree NOT to:
- Post fraudulent, illegal, or misleading listings
- Submit fake reviews or ratings
- Harass, threaten, or abuse other users
- Send spam or unsolicited communications
- Attempt to hack or reverse-engineer platform
- Scrape or bulk download platform data
- Violate local laws or regulations
- Post adult content, hate speech, or violence
- Impersonate other users
- Engage in financial fraud or scams
- Violate others' intellectual property rights
- Circumvent access controls or security measures
- Engage in discrimination or harassment
- Post personal information of others without consent
- Use platform for commercial purposes if unauthorized
- Any activity violating applicable laws

### 13.2 Account Responsibility
- Users responsible for account security
- Users responsible for all account activity
- Users responsible for maintaining password confidentiality
- Users responsible for verifying information accuracy
- Users responsible for payment obligations
- Users liable for violation of these terms

### 13.3 Appropriate Use of AI Features
- Users acknowledge AI outputs may be inaccurate
- Users responsible for verifying AI information independently
- Users should not rely solely on AI output
- Users should not share sensitive information with AI chat
- Users should not use AI to generate misleading content
- Users responsible for ensuring AI output compliance with laws
- Users liable for misuse of AI-generated content

### 13.4 Property Viewing Safety
- Users should meet landlords in public initially
- Users should bring a friend when viewing properties
- Users should trust their instincts about suspicious offers
- Users should verify property legally before leasing
- Users should never provide personal financial info before verification
- Users should trust gut feelings about legitimacy
- Users responsible for personal safety

---

## 14. INTELLECTUAL PROPERTY

### 14.1 Platform Content Ownership
- **Platform IP**: All platform code, design, text, graphics owned by Rebooked Living
- **User License**: Users granted limited license to use platform for personal purposes
- **Restrictions**: Users may not reproduce, distribute, or modify platform
- **Copyright**: All content copyrighted by Rebooked Living or licensors

### 14.2 User-Generated Content
- **User Ownership**: Users retain ownership of content they submit
- **Platform License**: Users grant Rebooked Living license to use content for platform operation
- **License Scope**: License includes hosting, display, analytics, and improvement
- **Perpetual License**: License continues even after account deletion
- **Commercial Use**: Rebooked Living may use content for non-commercial improvement purposes

### 14.3 Third-Party Content
- **Google Content**: Google-provided data used under Google Terms of Service
- **Attribution**: Google attribution provided where required
- **No Modification**: Users may not modify third-party content
- **Copyright**: Third-party content subject to third-party copyright

### 14.4 AI-Generated Content IP
- **Generated Content**: AI-generated content created by Lovable AI
- **Ownership**: Complex; users should review Lovable terms for generated content ownership
- **User Responsibility**: Users responsible for licensing compliance when using AI content
- **Commercial Use**: AI-generated content may have usage restrictions

---

## 15. TERMINATION AND ACCOUNT SUSPENSION

### 15.1 Voluntary Termination
- **User Termination**: Users may delete accounts at any time
- **Data Deletion**: Account data may be retained per policy
- **Refund Policy**: No refunds for prepaid features upon termination
- **Process**: Termination request processed per account deletion policy

### 15.2 Involuntary Termination
- **Policy Violations**: Rebooked Living may suspend accounts for policy violations
- **Grounds for Suspension**:
  - Fraudulent listings or reviews
  - Harassment or abuse
  - Illegal activity
  - Payment fraud
  - Repeated policy violations
  - Terms and Conditions violations
- **Notice**: Rebooked Living may or may not provide notice before suspension
- **Permanent Bans**: Severe violations may result in permanent account bans
- **No Appeal**: Suspension decisions are final

### 15.3 Data Following Termination
- **Retained Data**: Some data retained for legal, security, and analytics purposes
- **User Requests**: Users may request data deletion per GDPR/privacy laws
- **Listings**: Listings may remain visible for specified period after account deletion
- **Reviews**: User reviews may remain attributed to deleted account
- **Liability Note**: Rebooked Living not liable for data retained per policy

---

## 16. CHANGES TO TERMS AND PLATFORM

### 16.1 Policy Changes
- **Modification Right**: Rebooked Living may modify these terms at any time
- **Notice**: Changes may or may not be notified to users
- **Acceptance**: Continued use constitutes acceptance of changes
- **Effective**: Changes effective upon posting to platform

### 16.2 Feature Changes and Discontinuation
- **Feature Modification**: Rebooked Living may modify, update, or remove features
- **Pricing Changes**: Pricing may change; existing subscriptions honored until renewal
- **No Refund**: No refund provided for feature removal or changes
- **Service Discontinuation**: Entire service may be discontinued with notice
- **Liability Note**: Users not entitled to compensation for changes or discontinuation

### 16.3 Platform Improvements
- **Ongoing Development**: Rebooked Living continuously updates platform
- **User Impact**: Updates may impact user experience and data
- **Notification**: Updates may or may not be announced in advance
- **Compliance**: Updates may be required for compliance or security

---

## 17. DISPUTE RESOLUTION AND GOVERNING LAW

### 17.1 Governing Jurisdiction
- **Applicable Law**: [INSERT JURISDICTION]
- **Forum**: Disputes governed by laws of [INSERT JURISDICTION]
- **Venue**: Exclusive venue in courts of [INSERT JURISDICTION]

### 17.2 Dispute Resolution Process
- **Support Contact**: Users must contact support@rebookedliving.com for disputes
- **Good Faith Resolution**: Rebooked Living will attempt good faith resolution
- **Timeline**: Response provided within [INSERT DAYS] business days
- **Escalation**: Unresolved disputes may be escalated to management

### 17.3 Limitation of Liability
- **Cap on Liability**: Rebooked Living liability capped at amount paid by user in last 12 months
- **Excluded Damages**: Rebooked Living not liable for indirect, incidental, consequential, or punitive damages
- **No Liability For**: Data loss, business interruption, lost profits, lost opportunity, lost reputation
- **Exception**: Liability cap does not apply to gross negligence or intentional misconduct

---

## 18. INDEMNIFICATION

### 18.1 User Indemnification
Users agree to indemnify and hold Rebooked Living harmless from:
- Claims by other users related to user-generated content
- Claims of intellectual property infringement
- Claims of personal injury or property damage
- Claims of fraud or misrepresentation by user
- Claims related to user's use of platform
- Claims related to user's interactions with landlords
- Legal fees and court costs in defending such claims

### 18.2 Rebooked Living Indemnification
Rebooked Living agrees to indemnify and hold users harmless from:
- Claims of infringement on platform's own intellectual property
- Claims related to platform's operation and maintenance
- (Limited indemnification per terms)

---

## 19. APPLICABLE TO SPECIFIC USER TYPES

### 19.1 Free Tier Users
- **Limitation of Features**: Features limited as described in Section 5.1
- **Ad Acceptance**: Users accept display of Google AdSense ads
- **Data Usage**: Users accept data collection for analytics and ad targeting
- **Service Level**: No guaranteed service level for free accounts
- **Suspension Ease**: Free accounts subject to easier suspension for violations

### 19.2 Premium/Paid Users
- **Feature Guarantees**: Premium features available during subscription period
- **Ad-Free**: No ads displayed to premium users
- **Data Minimization**: Reduced ad tracking (analytics still collected)
- **Service Level**: Premium users may receive priority support (at Rebooked Living discretion)
- **Cancellation Right**: Premium users can cancel subscription for refund per policy
- **Refund Policy**: [INSERT SPECIFIC REFUND POLICY]

### 19.3 Landlord/Business Users
- **Listing Responsibility**: Landlords responsible for listing accuracy and legality
- **Landlord Suspension**: Listings may be removed for policy violations
- **Payment Obligations**: Landlords liable for payment obligations
- **Copyright**: Landlords responsible for photo copyright/licensing
- **Contact Liability**: Landlords liable for communications with users
- **Discrimination**: Landlords prohibited from discrimination in listings/communications

### 19.4 Admin Users
- **Admin Responsibility**: Admins responsible for careful use of admin powers
- **Data Access**: Admins have access to sensitive user data; confidentiality required
- **Impartiality**: Admins must make decisions based on platform policies
- **Abuse Prevention**: Admin powers misuse may result in termination and legal action
- **Liability**: Rebooked Living may be liable for admin abuse of power

---

## 20. ACKNOWLEDGMENT AND ACCEPTANCE

By using Rebooked Living, users acknowledge:
- Reading and understanding these Terms and Conditions
- Accepting all terms and conditions
- Accepting all liability disclaimers
- Agreeing to all restrictions and prohibitions
- Accepting risk of using third-party services
- Accepting limitation of liability
- Agreeing to indemnify Rebooked Living
- Accepting changes to terms without notice
- Accepting that platform may discontinue services
- Understanding Rebooked Living's lack of responsibility for third-party content
- Understanding fraud and scam risks
- Understanding AI outputs are unreliable
- Understanding user responsibility for account security
- Understanding and accepting all terms in this document

---

## 21. SEVERABILITY

If any provision of these Terms and Conditions is found invalid or unenforceable, that provision shall be severed, and remaining provisions shall remain in full force and effect.

---

## 22. ENTIRE AGREEMENT

These Terms and Conditions, together with the Privacy Policy, constitute the entire agreement between Rebooked Living and users. Any prior agreements or understandings are superseded.

---

**Document Version**: 1.0
**Last Updated**: [INSERT DATE]
**Prepared For**: Rebooked Living, Inc.
**Purpose**: Legal protection from user liability and third-party claims

---

## NOTES FOR LEGAL REVIEW

This document should be reviewed by legal counsel licensed in your jurisdiction(s) before use. Key areas for customization:

1. **Jurisdiction and Governing Law** (Section 17.1) - Insert applicable jurisdiction
2. **Refund Policy Details** (Section 19.2) - Insert specific refund terms
3. **Support Response Timeline** (Section 17.2) - Insert your standard response timeframe
4. **Contact Email** (Section 17.2) - Insert support email address
5. **Data Retention Period** - Specify how long data is retained
6. **Additional Terms** - Add any jurisdiction-specific disclaimers
7. **GDPR/CCPA Compliance** - Add compliance language if applicable in your jurisdiction
8. **Accessible Format** - Ensure terms are accessible to all users
9. **Notification Standards** - Define how users are notified of changes
10. **Payment Terms** - Specify exact refund and chargeback policies

---

**⚠️ DISCLAIMER: This document is for informational purposes. Consult with licensed legal counsel before using for actual Terms and Conditions.**
