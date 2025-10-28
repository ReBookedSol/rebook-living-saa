import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Upload, FileText } from "lucide-react";

const AddAccommodationTab = () => {
  const queryClient = useQueryClient();
  const [csvText, setCsvText] = useState("");
  const [jsonText, setJsonText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const addMutation = useMutation({
    mutationFn: async (accommodations: any[]) => {
      const { error } = await supabase
        .from("accommodations")
        .insert(accommodations);
      
      if (error) throw error;
      return accommodations.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ["admin-accommodations"] });
      toast.success(`Successfully added ${count} accommodation(s)`);
      setCsvText("");
      setJsonText("");
    },
    onError: (error: any) => {
      toast.error(`Failed to add accommodations: ${error.message}`);
    },
  });

  const parseCSV = (csv: string) => {
    const lines = csv.trim().split("\n");
    if (lines.length < 2) {
      throw new Error("CSV must have at least a header row and one data row");
    }

    const headers = lines[0].split(",").map(h => h.trim());
    const accommodations = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map(v => v.trim());
      const acc: any = {};
      
      headers.forEach((header, index) => {
        const value = values[index];
        
        // Handle special fields
        if (header === "amenities" || header === "certified_universities" || header === "image_urls") {
          acc[header] = value ? value.split("|").map(v => v.trim()) : [];
        } else if (header === "monthly_cost" || header === "rooms_available" || header === "units") {
          acc[header] = value ? parseInt(value) : null;
        } else if (header === "rating") {
          acc[header] = value ? parseFloat(value) : 0;
        } else if (header === "nsfas_accredited") {
          acc[header] = value?.toLowerCase() === "true" || value === "1";
        } else {
          acc[header] = value || null;
        }
      });

      // Ensure required fields
      if (!acc.property_name || !acc.type || !acc.address) {
        throw new Error(`Row ${i + 1}: property_name, type, and address are required`);
      }

      accommodations.push(acc);
    }

    return accommodations;
  };

  const handleCSVSubmit = async () => {
    if (!csvText.trim()) {
      toast.error("Please enter CSV data");
      return;
    }

    setIsProcessing(true);
    try {
      const accommodations = parseCSV(csvText);
      await addMutation.mutateAsync(accommodations);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleJSONSubmit = async () => {
    if (!jsonText.trim()) {
      toast.error("Please enter JSON data");
      return;
    }

    setIsProcessing(true);
    try {
      const data = JSON.parse(jsonText);
      const accommodations = Array.isArray(data) ? data : [data];
      
      // Validate required fields
      accommodations.forEach((acc, index) => {
        if (!acc.property_name || !acc.type || !acc.address) {
          throw new Error(`Item ${index + 1}: property_name, type, and address are required`);
        }
      });

      await addMutation.mutateAsync(accommodations);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Add Accommodations</h2>
      </div>

      <Tabs defaultValue="csv">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="csv">
            <FileText className="w-4 h-4 mr-2" />
            CSV Format
          </TabsTrigger>
          <TabsTrigger value="json">
            <Upload className="w-4 h-4 mr-2" />
            JSON Format
          </TabsTrigger>
        </TabsList>

        <TabsContent value="csv" className="space-y-4">
          <div>
            <Label htmlFor="csv-input">CSV Data</Label>
            <p className="text-sm text-muted-foreground mb-2">
              Format: property_name,type,address,city,province,monthly_cost,rooms_available,amenities,gender_policy,contact_person,contact_email,contact_phone,university,nsfas_accredited,website,units,description
              <br />
              Use | to separate array items (amenities, certified_universities, image_urls)
            </p>
            <Textarea
              id="csv-input"
              placeholder="property_name,type,address,city,province,monthly_cost,rooms_available,amenities,gender_policy,contact_person,contact_email,contact_phone,university,nsfas_accredited,website,units,description
Student Haven,Apartment,123 Main St,Cape Town,Western Cape,3500,10,WiFi|Laundry|Study Room,Mixed,John Doe,john@example.com,0123456789,UCT,true,https://example.com,5,Modern student accommodation"
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              rows={10}
              className="font-mono text-sm"
            />
          </div>
          <Button onClick={handleCSVSubmit} disabled={isProcessing}>
            {isProcessing ? "Processing..." : "Add from CSV"}
          </Button>
        </TabsContent>

        <TabsContent value="json" className="space-y-4">
          <div>
            <Label htmlFor="json-input">JSON Data</Label>
            <p className="text-sm text-muted-foreground mb-2">
              Paste a JSON object or array of objects. Required fields: property_name, type, address
            </p>
            <Textarea
              id="json-input"
              placeholder={`{
  "property_name": "Student Haven",
  "type": "Apartment",
  "address": "123 Main St",
  "city": "Cape Town",
  "province": "Western Cape",
  "monthly_cost": 3500,
  "rooms_available": 10,
  "amenities": ["WiFi", "Laundry", "Study Room"],
  "gender_policy": "Mixed",
  "contact_person": "John Doe",
  "contact_email": "john@example.com",
  "contact_phone": "0123456789",
  "university": "UCT",
  "nsfas_accredited": true,
  "website": "https://example.com",
  "units": 5,
  "description": "Modern student accommodation"
}`}
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              rows={15}
              className="font-mono text-sm"
            />
          </div>
          <Button onClick={handleJSONSubmit} disabled={isProcessing}>
            {isProcessing ? "Processing..." : "Add from JSON"}
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AddAccommodationTab;
