import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import { triggerWebhook } from "@/lib/webhook";
import { Check, X, Send } from "lucide-react";

const WebhookDemo = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSent(false);

    try {
      const success = await triggerWebhook("user_signup", {
        email: formData.email,
        first_name: formData.firstName,
        last_name: formData.lastName,
        signup_timestamp: new Date().toISOString(),
        demo: true,
      });

      if (success) {
        setSent(true);
        toast({
          title: "Success",
          description: "Webhook sent successfully to Relay!",
        });
        
        // Reset form with new dummy data
        const newDummyEmail = `user${Math.floor(Math.random() * 10000)}@test.com`;
        setFormData({
          firstName: "Test",
          lastName: "User",
          email: newDummyEmail,
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to send webhook. Check console for details.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="grid gap-8">
          {/* Instructions Card */}
          <Card className="border-0 shadow-md bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900">Webhook Integration Demo</CardTitle>
              <CardDescription className="text-blue-800">
                Test the user signup webhook integration with fake data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-blue-900">
              <div>
                <p className="font-semibold mb-1">What this does:</p>
                <p>Sends a test user signup event to your Relay webhook.</p>
              </div>
              <div>
                <p className="font-semibold mb-1">Data sent:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Email address</li>
                  <li>First name</li>
                  <li>Last name</li>
                  <li>Signup timestamp</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold mb-1">Note:</p>
                <p>Passwords are never sent. Real signups also trigger this webhook.</p>
              </div>
            </CardContent>
          </Card>

          {/* Form Card */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Enter Test Details</CardTitle>
              <CardDescription>
                Fill in any information you want to send to the webhook
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="John"
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Doe"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="john@example.com"
                    disabled={loading}
                    required
                  />
                </div>

                {sent && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-green-900">Webhook sent successfully!</p>
                      <p className="text-sm text-green-800">Check your Relay playbook for the event.</p>
                    </div>
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading}
                  size="lg"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {loading ? "Sending..." : "Send to Webhook"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Raw Data Preview */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-sm">Data Preview (Sent to Relay)</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto font-mono">
{JSON.stringify({
  eventType: "user_signup",
  email: formData.email,
  first_name: formData.firstName,
  last_name: formData.lastName,
  signup_timestamp: new Date().toISOString(),
  demo: true,
}, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default WebhookDemo;
