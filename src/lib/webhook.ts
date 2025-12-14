import { supabase } from "@/integrations/supabase/client";

export async function triggerWebhook(eventType: string, payload: any): Promise<boolean> {
  try {
    const { data, error } = await supabase.functions.invoke("webhook-proxy", {
      body: {
        eventType,
        ...payload,
      },
    });

    if (error) {
      console.error("Webhook error:", error);
      return false;
    }

    console.log("Webhook triggered successfully:", data);
    return data?.success ?? false;
  } catch (error) {
    console.error("Failed to trigger webhook:", error);
    return false;
  }
}
