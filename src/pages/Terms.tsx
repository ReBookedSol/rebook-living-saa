import Layout from "@/components/Layout";
import { FileText, Mail } from "lucide-react";

const Terms = () => {
  const toc = [
    { id: 'overview', label: 'Overview' },
    { id: 'company', label: 'Company Details' },
    { id: 'services', label: 'Services' },
    { id: 'accuracy', label: 'Accuracy of Info' },
    { id: 'liability', label: 'No Liability' },
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
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Legal</div>
                  <div className="font-semibold">Terms</div>
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
                  <h1 className="text-2xl md:text-3xl font-bold">Terms &amp; Conditions — ReBooked Living</h1>
                  <div className="text-sm text-muted-foreground mt-1">Last Updated: 31 October 2025</div>
                </div>
                <div className="hidden sm:flex items-center gap-3">
                  <a href="mailto:support@rebookedsolutions.co.za" className="inline-flex items-center gap-2 px-3 py-2 border rounded-md text-sm hover:bg-primary/5">
                    <Mail className="w-4 h-4 text-primary" />
                    support@rebookedsolutions.co.za
                  </a>
                </div>
              </div>

              <div className="mt-6 max-w-3xl text-base leading-relaxed text-muted-foreground space-y-6">
                <h2 className="text-xl md:text-2xl font-semibold text-foreground mt-6" id="overview">1. Overview</h2>
                <p className="text-base text-muted-foreground">These Terms &amp; Conditions ("Terms") govern your use of the website ReBooked Living ("the Site"), operated by ReBooked Solutions (Pty) Ltd. By accessing or using the Site, you agree to these Terms. If you do not agree, please stop using the Site immediately.</p>

                <h3 className="text-lg font-semibold text-foreground mt-4" id="company">2. Company Details</h3>
                <p className="text-base text-muted-foreground">
                  ReBooked Living is owned and operated by ReBooked Solutions (Pty) Ltd, a company incorporated in South Africa.<br />
                  Support: <a href="mailto:support@rebookedsolutions.co.za" className="text-primary underline">support@rebookedsolutions.co.za</a><br />
                  Legal: <a href="mailto:legal@rebookedsolutions.co.za" className="text-primary underline">legal@rebookedsolutions.co.za</a>
                </p>

                <h3 className="text-lg font-semibold text-foreground mt-4" id="services">3. Services</h3>
                <p className="text-base text-muted-foreground">ReBooked Living provides listings of university-accredited student accommodations, display of official university accreditation PDFs and listings, general contact and reference information, and advertising via Google Ads. We are not an accommodation provider, broker, or agent. We display publicly verified information only.</p>

                <h3 className="text-lg font-semibold text-foreground mt-4" id="accuracy">4. Accuracy of Information</h3>
                <p className="text-base text-muted-foreground">
                  ReBooked Living sources its accommodation listings from official university accreditation documents and publicly available information. While we make every effort to verify the source and accuracy, we cannot guarantee that all displayed information is accurate, current, or complete. University data, accreditation status, pricing, and availability may change without notice. Users must independently confirm details directly with the university or accommodation provider before making any bookings, payments, or other decisions.
                </p>

                <h3 className="text-lg font-semibold text-foreground mt-4" id="liability">5. No Liability</h3>
                <p className="text-base text-muted-foreground">
                  You acknowledge and agree that ReBooked Living and ReBooked Solutions shall not be held liable for any loss, damage, claim, or expense — direct or indirect — arising from your use or reliance on the Site. This includes, without limitation, financial loss, fraud, misrepresentation by third parties, inaccuracy, or omission of data. All use of the Site is at your own risk.
                </p>

                <h3 className="text-lg font-semibold text-foreground mt-4" id="contact">6. Contact</h3>
                <p className="text-base text-muted-foreground">
                  Support: <a href="mailto:support@rebookedsolutions.co.za" className="text-primary underline">support@rebookedsolutions.co.za</a><br />
                  Legal: <a href="mailto:legal@rebookedsolutions.co.za" className="text-primary underline">legal@rebookedsolutions.co.za</a>
                </p>

                <div className="mt-8 text-sm text-muted-foreground">We may update these Terms at any time. Continued use after updates means you accept the new Terms.</div>
              </div>

            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default Terms;
