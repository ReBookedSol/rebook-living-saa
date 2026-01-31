import { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Mail, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { triggerWebhook } from "@/lib/webhook";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("messages").insert({
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
      });

      if (error) throw error;

      await triggerWebhook("contact_message", formData);

      toast.success("Message sent successfully! We'll get back to you soon.");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-muted/20 to-background">
        <div className="container mx-auto px-4 py-16 md:py-20">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Get In Touch</h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Have questions about finding student accommodation? We're here to help you every step of the way.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
              {/* Main Contact Form */}
              <div className="lg:col-span-2">
                <Card className="border-0 shadow-md">
                  <CardHeader className="border-b bg-muted/30 px-6 py-4">
                    <CardTitle className="text-lg">Send us a message</CardTitle>
                    <CardDescription>We'll get back to you within 48 hours</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name" className="text-sm font-semibold mb-2 block">Name *</Label>
                          <Input
                            id="name"
                            placeholder="Your full name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            className="rounded-lg"
                          />
                        </div>
                        <div>
                          <Label htmlFor="email" className="text-sm font-semibold mb-2 block">Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="your@email.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                            className="rounded-lg"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="subject" className="text-sm font-semibold mb-2 block">Subject *</Label>
                        <Input
                          id="subject"
                          placeholder="How can we help?"
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          required
                          className="rounded-lg"
                        />
                      </div>
                      <div>
                        <Label htmlFor="message" className="text-sm font-semibold mb-2 block">Message *</Label>
                        <Textarea
                          id="message"
                          rows={6}
                          placeholder="Tell us how we can help you find your perfect accommodation..."
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          required
                          className="rounded-lg"
                        />
                      </div>
                      <Button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary/90 rounded-lg font-semibold"
                        disabled={isSubmitting}
                        size="lg"
                      >
                        {isSubmitting ? "Sending..." : "Send Message"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Contact Info Sidebar */}
              <div className="space-y-6">
                {/* Support Card */}
                <Card className="border-0 shadow-md">
                  <CardHeader className="border-b bg-muted/30 px-6 py-4">
                    <CardTitle className="text-base">Support</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-5">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Mail className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Email</p>
                          <a href="mailto:support@rebookedsolutions.co.za" className="text-sm font-medium hover:text-primary transition-colors">
                            support@rebookedsolutions.co.za
                          </a>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Clock className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Working Hours</p>
                          <div className="space-y-1 text-sm">
                            <p className="font-medium text-foreground">Monday–Friday</p>
                            <p className="text-muted-foreground">09:00–17:00</p>
                            <p className="font-medium text-foreground mt-2">Saturday–Sunday</p>
                            <p className="text-muted-foreground">Closed</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Socials Card */}
                <Card className="border-0 shadow-md">
                  <CardHeader className="border-b bg-muted/30 px-6 py-4">
                    <CardTitle className="text-base">Follow Us</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-3">
                      <a
                        href="https://www.instagram.com/rebookd.living/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 text-white hover:shadow-md transition-all text-sm font-medium"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                        Instagram
                      </a>
                      <a
                        href="https://www.facebook.com/profile.php?id=61585625007986"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white hover:shadow-md transition-all text-sm font-medium"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                        Facebook
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* FAQ Section */}
            <Card className="border-0 shadow-md">
              <CardHeader className="border-b bg-muted/30 px-6 py-4">
                <CardTitle className="text-lg">Common Questions</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-semibold text-base mb-2">How do I search for accommodation?</h3>
                    <p className="text-sm text-muted-foreground">Visit our Browse page and use filters to find accommodation near your university. You can filter by location, price, amenities, and NSFAS accreditation.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-base mb-2">Is ReBooked Living verified?</h3>
                    <p className="text-sm text-muted-foreground">Yes! We work with NSFAS-accredited landlords and verify all listings to ensure student safety and accommodation quality.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-base mb-2">What if I have payment issues?</h3>
                    <p className="text-sm text-muted-foreground">Contact our support team at support@rebookedsolutions.co.za with your order details and we'll assist you within 24 hours.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-base mb-2">Can I upgrade my account?</h3>
                    <p className="text-sm text-muted-foreground">Yes! Visit our pricing page to upgrade from free to premium access for more listings, photos, and features.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Contact;
