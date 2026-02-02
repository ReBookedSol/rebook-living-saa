import Layout from "@/components/Layout";
import { Shield, Mail } from "lucide-react";

const Privacy = () => {
  const toc = [
    { id: 'introduction', label: '1. Introduction' },
    { id: 'info-we-collect', label: '2. Information We Collect' },
    { id: 'how-we-use', label: '3. How We Use Your Information' },
    { id: 'third-parties', label: '4. Sharing Data with Third Parties' },
    { id: 'international', label: '5. International Data Transfers' },
    { id: 'automated', label: '6. Automated Decision-Making' },
    { id: 'retention', label: '7. Data Retention & Security' },
    { id: 'rights', label: '8. Your Data Rights' },
    { id: 'cookies', label: '9. Cookies & Tracking' },
    { id: 'officer', label: '10. Information Officer Contact' },
    { id: 'regulator', label: '11. The Information Regulator' },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-8">
          <aside className="hidden md:block">
            <div className="sticky top-24 rounded-lg border bg-card p-4 shadow-sm max-h-[calc(100vh-120px)] overflow-y-auto">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/10 rounded">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Privacy</div>
                  <div className="font-semibold">Policy</div>
                </div>
              </div>

              <nav className="text-sm space-y-1">
                <ul className="space-y-1">
                  {toc.map((t) => (
                    <li key={t.id}>
                      <a href={`#${t.id}`} className="block rounded px-2 py-1.5 text-muted-foreground hover:bg-muted hover:text-primary transition-colors text-xs">{t.label}</a>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="border-t mt-4 pt-3 text-xs text-muted-foreground">
                <div>Last updated</div>
                <div className="font-medium">2 February 2026</div>
              </div>

            </div>
          </aside>

          <section>
            <div className="bg-white border rounded-lg shadow-sm p-6 md:p-8">
              <div className="flex items-start justify-between gap-6 mb-2">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold">Privacy Policy</h1>
                  <p className="text-sm text-muted-foreground mt-1">Last Updated: February 2, 2026</p>
                  <p className="text-sm text-muted-foreground">Responsible Party: ReBooked Solutions (Pty) Ltd</p>
                  <p className="text-sm text-muted-foreground">Platform: ReBooked Living</p>
                  <p className="text-sm text-muted-foreground">Jurisdiction: Republic of South Africa</p>
                </div>
                <div className="hidden sm:flex items-center gap-3 text-right text-sm">
                  <div>
                    <div className="text-muted-foreground mb-1">Legal Inquiries</div>
                    <a href="mailto:legal@rebookedsolutions.co.za" className="inline-flex items-center gap-1 text-primary hover:underline">
                      <Mail className="w-4 h-4" />
                      legal@rebookedsolutions.co.za
                    </a>
                  </div>
                </div>
              </div>

              <div className="mt-8 max-w-4xl text-sm md:text-base leading-relaxed space-y-6">

                <h2 className="text-xl font-bold text-foreground mt-8 mb-4" id="introduction">1. INTRODUCTION</h2>
                <p className="text-muted-foreground">
                  ReBooked Solutions (Pty) Ltd respects your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, and share your data when you use ReBooked Living, in accordance with the Protection of Personal Information Act (POPIA).
                </p>

                <h2 className="text-xl font-bold text-foreground mt-8 mb-4" id="info-we-collect">2. INFORMATION WE COLLECT</h2>
                <p className="text-muted-foreground mb-3">We collect "Personal Information" as defined in POPIA, which includes:</p>
                <div className="space-y-3 text-muted-foreground">
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Account Data</h3>
                    <p>Name, email address, phone number, and university affiliation.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Usage & Technical Data</h3>
                    <p>IP address, browser type, location data (for travel time calculations), and device identifiers.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">AI Interactions</h3>
                    <p>The text, prompts, and data you input into our AI Chat Assistants or Bursary Pack Generator.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Payment Information</h3>
                    <p>We do not store full credit card details. Payments are processed by third parties (Paystack, BobPay, Offerwall) who collect billing info directly.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Verification Data</h3>
                    <p>If you upload accreditation documents or student IDs, we collect the information contained therein.</p>
                  </div>
                </div>

                <h2 className="text-xl font-bold text-foreground mt-8 mb-4" id="how-we-use">3. HOW WE USE YOUR INFORMATION</h2>
                <p className="text-muted-foreground mb-3">We process your data for the following "Lawful Purposes":</p>
                <div className="space-y-3 text-muted-foreground">
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">To Provide the Service</h3>
                    <p>Managing your Pro subscription and enabling map features.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">AI Generation</h3>
                    <p>Passing your prompts to Gemini AI (Google) or OpenAI to generate bursary packs, summaries, and chat responses.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Communication</h3>
                    <p>Sending account updates, technical notices, and service-related emails.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Marketing</h3>
                    <p>Sending promotional content only if you have opted-in or are an existing customer (per Section 69 of POPIA).</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Advertisements</h3>
                    <p>Showing personalized ads to Free Tier users via Google AdSense.</p>
                  </div>
                </div>

                <h2 className="text-xl font-bold text-foreground mt-8 mb-4" id="third-parties">4. SHARING DATA WITH THIRD PARTIES</h2>
                <p className="text-muted-foreground mb-3">We share your data with selected third parties to keep the Site running:</p>
                <div className="space-y-3 text-muted-foreground">
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">AI Providers</h3>
                    <p>Your prompts/data are sent to Gemini (Google) and OpenAI. We explicitly do NOT share data with Lovable AI.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Infrastructure</h3>
                    <p>Google Maps and Google Cloud for hosting and mapping.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Payment Gateways</h3>
                    <p>Paystack, BobPay, and Offerwall to process your Pro subscription.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Offerwall Partners</h3>
                    <p>If you use the Offerwall, third-party advertisers may collect data regarding your task completion.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Legal Authorities</h3>
                    <p>If required by South African law or to protect our legal rights.</p>
                  </div>
                </div>

                <h2 className="text-xl font-bold text-foreground mt-8 mb-4" id="international">5. INTERNATIONAL DATA TRANSFERS (CROSS-BORDER)</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>By using the Site, you acknowledge that your personal information (specifically AI prompts and account data) may be transferred to and stored on servers located in the United States or Europe (where Google and OpenAI operate).</p>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">POPIA Compliance</h3>
                    <p>In terms of Section 72 of POPIA, we ensure these third parties are subject to laws or agreements that provide "adequate protection" substantially similar to South African law.</p>
                  </div>
                </div>

                <h2 className="text-xl font-bold text-foreground mt-8 mb-4" id="automated">6. AUTOMATED DECISION-MAKING</h2>
                <p className="text-muted-foreground">
                  In accordance with Section 71 of POPIA, please be aware that our AI tools (Bursary Pack Generator/Assistant) provide automated suggestions. These are not binding legal or financial decisions. You have the right to request a human review of any AI-generated output that significantly affects you by contacting our Information Officer.
                </p>

                <h2 className="text-xl font-bold text-foreground mt-8 mb-4" id="retention">7. DATA RETENTION & SECURITY</h2>
                <div className="space-y-3 text-muted-foreground">
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Retention</h3>
                    <p>We keep your information for as long as your account is active or as needed to provide you with services. If you delete your account, we may retain certain info for legal/audit purposes.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Security</h3>
                    <p>We implement industry-standard technical and organizational measures (encryption, firewalls) to protect your data. However, no internet transmission is 100% secure; you use the Site at your own risk.</p>
                  </div>
                </div>

                <h2 className="text-xl font-bold text-foreground mt-8 mb-4" id="rights">8. YOUR DATA RIGHTS (DATA SUBJECT RIGHTS)</h2>
                <p className="text-muted-foreground mb-3">Under POPIA, you have the right to:</p>
                <div className="space-y-3 text-muted-foreground">
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Access</h3>
                    <p>Request a copy of the personal information we hold about you.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Correction</h3>
                    <p>Request that we update or fix inaccurate information.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Deletion</h3>
                    <p>Request that we delete your data (the "Right to be Forgotten").</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Objection</h3>
                    <p>Object to the processing of your data for direct marketing.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Complaint</h3>
                    <p>Lodge a complaint with the South African Information Regulator if you feel we have misused your data.</p>
                  </div>
                </div>

                <h2 className="text-xl font-bold text-foreground mt-8 mb-4" id="cookies">9. COOKIES & TRACKING</h2>
                <p className="text-muted-foreground">
                  We use "cookies" to remember your login and track Site performance. Free Tier users will also be tracked by Google AdSense cookies for ad personalization. You can manage cookie settings in your browser, but some features (like Pro access) may not work without them.
                </p>

                <h2 className="text-xl font-bold text-foreground mt-8 mb-4" id="officer">10. INFORMATION OFFICER CONTACT</h2>
                <p className="text-muted-foreground mb-3">If you have any questions about this policy or wish to exercise your data rights, please contact our designated Information Officer:</p>
                <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm">
                  <p><strong>Attention:</strong> Information Officer</p>
                  <p><strong>Email:</strong> <a href="mailto:legal@rebookedsolutions.co.za" className="text-primary hover:underline">legal@rebookedsolutions.co.za</a></p>
                  <p><strong>Address:</strong> To be confirmed by ReBooked Solutions (Pty) Ltd</p>
                </div>

                <h2 className="text-xl font-bold text-foreground mt-8 mb-4" id="regulator">11. THE INFORMATION REGULATOR (SOUTH AFRICA)</h2>
                <p className="text-muted-foreground mb-3">Should you be unsatisfied with our response, you may contact the Information Regulator:</p>
                <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm">
                  <p><strong>Website:</strong> <a href="https://inforegulator.org.za/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://inforegulator.org.za/</a></p>
                  <p><strong>Email:</strong> <a href="mailto:enquiries@inforegulator.org.za" className="text-primary hover:underline">enquiries@inforegulator.org.za</a> / <a href="mailto:PAIAComplaints@inforegulator.org.za" className="text-primary hover:underline">PAIAComplaints@inforegulator.org.za</a></p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-8">
                  <p className="text-sm text-blue-900">
                    By using ReBooked Living, you consent to the collection and use of your data as described in this Privacy Policy.
                  </p>
                </div>

                <div className="border-t pt-4 mt-8 text-xs text-muted-foreground">
                  <p><strong>Last Updated:</strong> 2 February 2026</p>
                  <p className="mt-2"><strong>Contact Information:</strong></p>
                  <ul className="ml-4 mt-1 space-y-1">
                    <li>Legal/Privacy Officer: <a href="mailto:legal@rebookedsolutions.co.za" className="text-primary hover:underline">legal@rebookedsolutions.co.za</a></li>
                    <li>Support: <a href="mailto:support@rebookedsolutions.co.za" className="text-primary hover:underline">support@rebookedsolutions.co.za</a></li>
                  </ul>
                </div>

              </div>

            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default Privacy;
