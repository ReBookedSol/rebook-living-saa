import MaintenanceLayout from "@/components/MaintenanceLayout";
import { Mail, Wrench, Instagram, Facebook } from 'lucide-react';

const Maintenance = () => {
  return (
    <MaintenanceLayout>
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
                href="https://www.instagram.com/rebooked.living/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors"
              >
                <Instagram className="w-5 h-5" />
                Instagram
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61585625007986"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors"
              >
                <Facebook className="w-5 h-5" />
                Facebook
              </a>
            </div>
          </div>

          {/* Email Contact */}
          <div className="bg-accent/10 border border-accent rounded-lg p-6 mb-8">
            <p className="text-muted-foreground mb-3">Have questions? Contact us:</p>
            <a
              href="mailto:info@rebookedsolutions.co.za"
              className="inline-flex items-center gap-2 text-primary hover:underline font-semibold"
            >
              <Mail size={20} />
              info@rebookedsolutions.co.za
            </a>
          </div>

          <p className="text-sm text-muted-foreground">
            We'll be back soon with an even better experience!
          </p>
        </div>
      </div>
    </MaintenanceLayout>
  );
};

export default Maintenance;
