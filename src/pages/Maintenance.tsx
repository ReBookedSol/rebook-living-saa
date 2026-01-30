import Layout from "@/components/Layout";
import { Mail, Wrench } from 'lucide-react';

const Maintenance = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 flex-1 flex items-center justify-center">
        <div className="text-center max-w-2xl w-full">
          {/* Icon */}
          <div className="mb-8 flex justify-center">
            <div className="p-4 rounded-full bg-primary/10">
              <Wrench className="w-12 h-12 text-primary" />
            </div>
          </div>

          {/* Main Message */}
          <div className="space-y-6 mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              We're Being Updated
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Our site is currently being updated with exciting new features and improvements to better serve you.
            </p>
            <p className="text-base text-muted-foreground">
              Thank you for your patience. We're working hard to bring you a better experience.
            </p>
          </div>

          {/* Social Media CTA */}
          <div className="space-y-6 mb-12 bg-card border rounded-lg p-8">
            <div>
              <h2 className="text-lg font-semibold mb-4">Stay Tuned on Our Social Media</h2>
              <p className="text-muted-foreground mb-6">
                Follow us for updates on when the site will be back:
              </p>
            </div>

            <div className="flex justify-center gap-4 flex-wrap">
              <a
                href="https://www.instagram.com/rebookd.living/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z"/>
                </svg>
                Instagram
              </a>
              <a
                href="https://facebook.com/rebookedliving"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </a>
            </div>
          </div>

          {/* Email Contact */}
          <div className="bg-accent/10 border border-accent rounded-lg p-6 mb-8">
            <p className="text-muted-foreground mb-3">Have questions? Contact us:</p>
            <a
              href="mailto:support@rebookedliving.com"
              className="inline-flex items-center gap-2 text-primary hover:underline font-semibold"
            >
              <Mail size={20} />
              support@rebookedliving.com
            </a>
          </div>

          <p className="text-sm text-muted-foreground">
            We'll be back soon with an even better experience!
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Maintenance;
