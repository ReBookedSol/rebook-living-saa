import Layout from "@/components/Layout";
import { FileText, Mail } from "lucide-react";

const Terms = () => {
  const toc = [
    { id: 'binding', label: '1. Binding Agreement & Conduct' },
    { id: 'nature', label: '2. Nature of Service' },
    { id: 'subscriptions', label: '3. Subscription Tiers & Ads' },
    { id: 'payments', label: '4. Payments & No-Refund Policy' },
    { id: 'ai', label: '5. AI Technology' },
    { id: 'scam', label: '6. Anti-Scam Warning' },
    { id: 'thirdparty', label: '7. Third-Party Content' },
    { id: 'ugc', label: '8. User-Generated Content' },
    { id: 'prohibited', label: '9. Prohibited Acts' },
    { id: 'liability', label: '10. Limitation of Liability' },
    { id: 'indemnification', label: '11. Indemnification' },
    { id: 'privacy', label: '12. Privacy & POPIA' },
    { id: 'law', label: '13. Governing Law' },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-8">
          <aside className="hidden md:block">
            <div className="sticky top-24 rounded-lg border bg-card p-4 shadow-sm max-h-[calc(100vh-120px)] overflow-y-auto">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/10 rounded">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Legal</div>
                  <div className="font-semibold">Terms</div>
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
                  <h1 className="text-2xl md:text-3xl font-bold">Terms & Conditions</h1>
                  <p className="text-sm text-muted-foreground mt-1">Effective Date: February 2, 2026</p>
                  <p className="text-sm text-muted-foreground">Operated by: ReBooked Solutions (Pty) Ltd</p>
                  <p className="text-sm text-muted-foreground">Jurisdiction: Republic of South Africa</p>
                </div>
                <div className="hidden sm:flex items-center gap-3 text-right text-sm">
                  <div>
                    <div className="text-muted-foreground mb-1">Support</div>
                    <a href="mailto:support@rebookedsolutions.co.za" className="inline-flex items-center gap-1 text-primary hover:underline">
                      <Mail className="w-4 h-4" />
                      support@rebookedsolutions.co.za
                    </a>
                  </div>
                </div>
              </div>

              <div className="mt-8 max-w-4xl text-sm md:text-base leading-relaxed space-y-6">
                
                <h2 className="text-xl font-bold text-foreground mt-8 mb-4" id="binding">1. BINDING AGREEMENT & CONDUCT</h2>
                <div className="space-y-3 text-muted-foreground">
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">1.1 Acceptance</h3>
                    <p>By accessing ReBooked Living ("the Site"), you unconditionally agree to these Terms. If you do not agree, you must cease use immediately. Use of the Site constitutes "acceptance by conduct" under the Electronic Communications and Transactions Act (ECTA).</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">1.2 Eligibility</h3>
                    <p>You must be at least 18 years old or have parental/guardian consent to use this Site.</p>
                  </div>
                </div>

                <h2 className="text-xl font-bold text-foreground mt-8 mb-4" id="nature">2. NATURE OF SERVICE & ACCOMMODATION DATA</h2>
                <div className="space-y-3 text-muted-foreground">
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">2.1 Directory Service Only</h3>
                    <p>ReBooked Living is an information aggregator. We are NOT an accommodation provider, landlord, broker, or agent. We do not facilitate, manage, or guarantee lease agreements.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">2.2 Temporal Accreditation Disclaimer</h3>
                    <p>University accreditation documents (PDFs) and statuses are "snapshots in time." We do not guarantee that a property has maintained its status after the date of publication. Users MUST independently confirm accreditation with the relevant University Housing Office.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">2.3 No Physical Inspection</h3>
                    <p>The Company does not physically inspect properties. Photos and reviews are for reference only and may not reflect the current state of the property.</p>
                  </div>
                </div>

                <h2 className="text-xl font-bold text-foreground mt-8 mb-4" id="subscriptions">3. SUBSCRIPTION TIERS & ADVERTISEMENTS</h2>
                <div className="space-y-3 text-muted-foreground">
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">3.1 Free Tier</h3>
                    <p>Access is limited to 3 photos and 1 review per listing, roadmap views, and contains third-party advertisements via Google AdSense.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">3.2 Pro Tier (Premium)</h3>
                    <p>Access includes unlimited photos and reviews, Satellite/Street View mapping, travel time calculations, the ReBooked Travel Kit, and AI-powered assistance.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">3.3 Ad-Blocker Policy</h3>
                    <p>Users attempting to bypass Free-tier limits or block advertisements via technical workarounds may have their accounts and IP addresses permanently banned without notice.</p>
                  </div>
                </div>

                <h2 className="text-xl font-bold text-foreground mt-8 mb-4" id="payments">4. PAYMENTS & STRICT NO-REFUND POLICY</h2>
                <div className="space-y-3 text-muted-foreground">
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">4.1 Payment Gateways</h3>
                    <p>Payments are processed via Paystack, BobPay, or Offerwall. We are not liable for errors or outages on these platforms.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">4.2 STRICT NO-REFUNDS</h3>
                    <p>All sales are final. In terms of Section 42(2)(f) of the ECTA, as the service (Pro access) is digital and commences immediately upon payment, no refunds or credits will be issued for any reason.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">4.3 ECTA Cooling-Off Waiver</h3>
                    <p>By purchasing a Pro Subscription and immediately accessing digital content (AI tools or unlimited photos), you expressly agree to the immediate performance of the contract and acknowledge that you waive your 7-day cooling-off refund right under the ECTA.</p>
                  </div>
                </div>

                <h2 className="text-xl font-bold text-foreground mt-8 mb-4" id="ai">5. AI TECHNOLOGY (GEMINI AI & OPENAI)</h2>
                <div className="space-y-3 text-muted-foreground">
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">5.1 Technology Providers</h3>
                    <p>AI features are powered by Gemini AI (Google) and OpenAI. We explicitly do not use Lovable AI.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">5.2 AI Hallucinations</h3>
                    <p>AI can and will generate false information ("hallucinations"). AI responses (descriptions, chat, and bursary data) are for guidance only and do not constitute official property or financial info.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">5.3 Bursary Pack Generator</h3>
                    <p>All bursary data is unverified and compiled by AI. The Company is not liable for missed deadlines, incorrect eligibility, or rejected applications. Verification is 100% the user's responsibility.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">5.4 Automated Decision-Making (POPIA S71)</h3>
                    <p>AI tools provide suggestions only. If you believe an AI output has significantly impacted you, you have the right to request a human review by contacting <a href="mailto:legal@rebookedsolutions.co.za" className="text-primary hover:underline">legal@rebookedsolutions.co.za</a>.</p>
                  </div>
                </div>

                <h2 className="text-xl font-bold text-foreground mt-8 mb-4" id="scam">6. MANDATORY ANTI-SCAM WARNING</h2>
                <div className="space-y-3 text-muted-foreground">
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">6.1 Duty to Verify</h3>
                    <p>You are strictly prohibited from paying a deposit or rent for any property found on this Site without a physical inspection and verification of the landlord's South African identity.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">6.2 No Recovery</h3>
                    <p>The Company will not assist in recovering funds lost to third-party rental scams or "advance payment" fraud.</p>
                  </div>
                </div>

                <h2 className="text-xl font-bold text-foreground mt-8 mb-4" id="thirdparty">7. THIRD-PARTY CONTENT & COMMUTE SAFETY</h2>
                <div className="space-y-3 text-muted-foreground">
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">7.1 Offerwall Liability</h3>
                    <p>Tasks completed via "Offerwall" are at your own risk. The Company does not guarantee rewards and is not responsible for malware or data practices of Offerwall partners.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">7.2 Commute & Route Safety</h3>
                    <p>Travel times and walking routes (Google Maps) are mathematical estimations. We do not verify the safety, lighting, or crime statistics of any suggested route. Users travel at their own risk.</p>
                  </div>
                </div>

                <h2 className="text-xl font-bold text-foreground mt-8 mb-4" id="ugc">8. USER-GENERATED CONTENT & DEFAMATION</h2>
                <div className="space-y-3 text-muted-foreground">
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">8.1 Defamation Waiver</h3>
                    <p>Users posting reviews are solely responsible for their content. The Company acts as a "mere conduit" and does not endorse any review.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">8.2 Notice and Takedown</h3>
                    <p>We reserve the right to delete any review at our sole discretion. Takedown requests for defamatory content must be sent to <a href="mailto:legal@rebookedsolutions.co.za" className="text-primary hover:underline">legal@rebookedsolutions.co.za</a>.</p>
                  </div>
                </div>

                <h2 className="text-xl font-bold text-foreground mt-8 mb-4" id="prohibited">9. PROHIBITED ACTS & LIQUIDATED DAMAGES</h2>
                <div className="space-y-3 text-muted-foreground">
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">9.1 Anti-Scraping</h3>
                    <p>You may not use bots, crawlers, or scrapers to extract data from the Site.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">9.2 Liquidated Damages</h3>
                    <p>Any unauthorized scraping of our database will result in a penalty of R50,000 (Fifty Thousand Rand) per occurrence, payable to the Company immediately.</p>
                  </div>
                </div>

                <h2 className="text-xl font-bold text-foreground mt-8 mb-4" id="liability">10. COMPREHENSIVE LIMITATION OF LIABILITY</h2>
                <div className="space-y-3 text-muted-foreground">
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">10.1 The "Total Shield"</h3>
                    <p>ReBooked Solutions (Pty) Ltd shall not be liable for any direct, indirect, or consequential loss, including financial loss, fraud, physical injury, or emotional distress.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">10.2 Infrastructure Failure</h3>
                    <p>We are not liable for downtime caused by national load shedding, undersea cable breaks, or third-party API outages (Google/OpenAI/Gemini).</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">10.3 Administrative Shield</h3>
                    <p>We are not liable for the decisions of NSFAS or University Housing Departments, including payment delays or accreditation withdrawals.</p>
                  </div>
                </div>

                <h2 className="text-xl font-bold text-foreground mt-8 mb-4" id="indemnification">11. INDEMNIFICATION</h2>
                <div className="text-muted-foreground">
                  <p>You agree to indemnify and hold ReBooked Solutions (Pty) Ltd harmless from any claims, damages, or legal fees (on an attorney-and-own-client scale) arising from your use of the Site, your interaction with landlords, or your reliance on AI-generated content.</p>
                </div>

                <h2 className="text-xl font-bold text-foreground mt-8 mb-4" id="privacy">12. PRIVACY & POPIA COMPLIANCE</h2>
                <div className="space-y-3 text-muted-foreground">
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">12.1 Consent</h3>
                    <p>You consent to the processing of your personal data under the Protection of Personal Information Act (POPIA).</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">12.2 Information Officer</h3>
                    <p>Our Information Officer is reachable at <a href="mailto:legal@rebookedsolutions.co.za" className="text-primary hover:underline">legal@rebookedsolutions.co.za</a> for all data-related queries or deletion requests.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">12.3 Third-Party Sharing</h3>
                    <p>You consent to your data being shared with our AI providers (Google/OpenAI) and payment processors as necessary to provide the service.</p>
                  </div>
                </div>

                <h2 className="text-xl font-bold text-foreground mt-8 mb-4" id="law">13. GOVERNING LAW</h2>
                <div className="text-muted-foreground">
                  <p>These Terms are governed by the laws of the Republic of South Africa. Any dispute shall be subject to the exclusive jurisdiction of the High Court of South Africa.</p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-8">
                  <p className="text-sm font-semibold text-blue-900">
                    BY CLICKING "I ACCEPT" OR CONTINUING TO USE THE SITE, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREED TO BE LEGALLY BOUND BY THIS ENTIRE DOCUMENT.
                  </p>
                </div>

                <div className="border-t pt-4 mt-8 text-xs text-muted-foreground">
                  <p><strong>Last Updated:</strong> 2 February 2026</p>
                  <p><strong>Version:</strong> 5.0 (Final Consolidated)</p>
                  <p className="mt-2"><strong>Support & Legal Inquiries:</strong></p>
                  <ul className="ml-4 mt-1 space-y-1">
                    <li>Support: <a href="mailto:support@rebookedsolutions.co.za" className="text-primary hover:underline">support@rebookedsolutions.co.za</a></li>
                    <li>Legal: <a href="mailto:legal@rebookedsolutions.co.za" className="text-primary hover:underline">legal@rebookedsolutions.co.za</a></li>
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

export default Terms;
