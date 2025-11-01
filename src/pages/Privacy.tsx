import Layout from "@/components/Layout";
import { Shield, Mail } from "lucide-react";

const Privacy = () => {
  const toc = [
    { id: 'introduction', label: 'Introduction' },
    { id: 'info-we-collect', label: 'Information We Collect' },
    { id: 'purpose', label: 'Purpose of Processing' },
    { id: 'cookies', label: 'Google Ads & Cookies' },
    { id: 'data-sharing', label: 'Data Sharing' },
    { id: 'retention', label: 'Data Retention' },
    { id: 'security', label: 'Security' },
    { id: 'rights', label: 'Your Rights' },
    { id: 'contact', label: 'Contact' },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-8">
          <aside className="hidden md:block">
            <div className="sticky top-24 rounded-lg border bg-card p-4 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/10 rounded">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Privacy</div>
                  <div className="font-semibold">Policy</div>
                </div>
              </div>

              <nav className="text-sm">
                <ul className="space-y-2">
                  {toc.map((t) => (
                    <li key={t.id}>
                      <a href={`#${t.id}`} className="block rounded px-2 py-1 text-muted-foreground hover:bg-muted hover:text-primary">{t.label}</a>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="border-t mt-4 pt-3 text-xs text-muted-foreground">
                <div>Last updated</div>
                <div className="font-medium">31 October 2025</div>
              </div>

            </div>
          </aside>

          <section>
            <div className="bg-white border rounded-lg shadow-sm p-8">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold">Privacy Policy — ReBooked Living</h1>
                  <div className="text-sm text-muted-foreground mt-1">Last Updated: 31 October 2025</div>
                </div>
                <div className="hidden sm:flex items-center gap-3">
                  <a href="mailto:legal@rebookedsolutions.co.za" className="inline-flex items-center gap-2 px-3 py-2 border rounded-md text-sm hover:bg-primary/5">
                    <Mail className="w-4 h-4 text-primary" />
                    legal@rebookedsolutions.co.za
                  </a>
                </div>
              </div>

              <div className="mt-6 max-w-3xl text-base leading-relaxed text-muted-foreground space-y-6">
                <h2 className="text-xl md:text-2xl font-semibold text-foreground mt-6" id="introduction">1. Introduction</h2>
                <p className="text-base text-muted-foreground">
                  ReBooked Living ("ReBooked Living", "we", "us", "our") is a platform owned and operated by ReBooked Solutions (Pty) Ltd. This Privacy Policy explains how we collect, use, share, and protect your personal information in accordance with the Protection of Personal Information Act (POPIA) and other applicable South African privacy laws.
                </p>

                <h3 className="text-lg font-semibold text-foreground mt-4" id="info-we-collect">2. Information We Collect</h3>
                <h4 className="text-sm font-semibold text-foreground mt-3">A. Personal Information</h4>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Full name and surname</li>
                  <li>Email address</li>
                  <li>University or institution name</li>
                </ul>

                <h4 className="text-sm font-semibold text-foreground mt-3">B. Automatically Collected Information</h4>
                <ul className="list-disc pl-6 space-y-2">
                  <li>IP address and browser type</li>
                  <li>Device information</li>
                  <li>Pages visited and session activity</li>
                  <li>Cookies and analytics data (including Google Ads cookies)</li>
                </ul>

                <h4 className="text-sm font-semibold text-foreground mt-3">C. University Data</h4>
                <p className="text-base text-muted-foreground">
                  We collect and display PDFs, accreditation documents, and public accommodation lists issued by South African universities. These materials are published publicly by the universities, and we display them for informational and reference purposes only.
                </p>

                <h3 className="text-lg font-semibold text-foreground mt-4" id="purpose">3. Purpose of Processing</h3>
                <p className="text-base text-muted-foreground">We process information for:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Displaying accredited student accommodation listings</li>
                  <li>Managing user accounts and inquiries</li>
                  <li>Sending updates and service notices</li>
                  <li>Displaying Google Ads and measuring ad performance</li>
                  <li>Improving our website and user experience</li>
                  <li>Legal compliance and fraud prevention</li>
                </ul>

                <h3 className="text-lg font-semibold text-foreground mt-4" id="cookies">4. Google Ads &amp; Cookies</h3>
                <p className="text-base text-muted-foreground">We use Google Ads and Analytics to display and measure advertising. Cookies are used to maintain essential site functionality, analyse site usage, and deliver relevant advertisements. You can manage or disable cookies in your browser or Google’s ad settings.</p>

                <h3 className="text-lg font-semibold text-foreground mt-4" id="data-sharing">5. Data Sharing</h3>
                <p className="text-base text-muted-foreground">We may share limited data with trusted service providers, Google Ads/Analytics, universities for verification, and law enforcement where required. We do not sell your data for monetary gain.</p>

                <h3 className="text-lg font-semibold text-foreground mt-4" id="retention">6. Data Retention</h3>
                <p className="text-base text-muted-foreground">Account information: kept until deletion. Analytics: retained up to 24 months. Support emails: retained for up to 2 years.</p>

                <h3 className="text-lg font-semibold text-foreground mt-4" id="security">7. Security</h3>
                <p className="text-base text-muted-foreground">We use encryption, secure hosting, and strict access controls to protect personal information. However, no system is 100% secure.</p>

                <h3 className="text-lg font-semibold text-foreground mt-4" id="rights">8. Your Rights</h3>
                <p className="text-base text-muted-foreground">You have the right to access, correct, delete, withdraw consent, object to direct marketing, and lodge a complaint with the Information Regulator of South Africa.</p>

                <h3 className="text-lg font-semibold text-foreground mt-4" id="contact">9. Contact</h3>
                <p className="text-base text-muted-foreground">
                  For privacy requests and legal inquiries: <a href="mailto:legal@rebookedsolutions.co.za" className="text-primary underline">legal@rebookedsolutions.co.za</a><br />
                  Support: <a href="mailto:support@rebookedsolutions.co.za" className="text-primary underline">support@rebookedsolutions.co.za</a>
                </p>

                <div className="mt-8 text-sm text-muted-foreground">We may update this Privacy Policy periodically. Continued use of the Site after changes means acceptance of the updated policy.</div>
              </div>

            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default Privacy;
