import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, Trash2, Eye } from "lucide-react";

interface Bursary {
  id: string;
  name: string;
  provider: string | null;
  description: string | null;
  amount: string | null;
  closing_date: string | null;
  status: string;
}

const BursariesTab = () => {
  const { toast } = useToast();
  const [bursaries, setBursaries] = useState<Bursary[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchBursaries();
  }, []);

  const fetchBursaries = async () => {
    try {
      const { data, error } = await supabase
        .from('bursaries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBursaries(data || []);
    } catch (error) {
      console.error('Error fetching bursaries:', error);
      toast({
        title: "Error",
        description: "Failed to fetch bursaries",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const text = await file.text();
      let data;

      if (file.name.endsWith('.json')) {
        data = JSON.parse(text);
      } else if (file.name.endsWith('.csv')) {
        // Simple CSV parser
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        data = lines.slice(1).map(line => {
          const values = line.split(',');
          const obj: any = {};
          headers.forEach((header, index) => {
            obj[header] = values[index]?.trim();
          });
          return obj;
        });
      } else {
        throw new Error('Unsupported file format. Please use JSON or CSV.');
      }

      // Ensure data is an array
      const bursariesArray = Array.isArray(data) ? data : [data];

      const { error } = await supabase
        .from('bursaries')
        .insert(bursariesArray);

      if (error) throw error;

      toast({
        title: "Success",
        description: `${bursariesArray.length} bursaries uploaded successfully`,
      });

      fetchBursaries();
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this bursary?')) return;

    try {
      const { error } = await supabase
        .from('bursaries')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Bursary deleted successfully",
      });

      fetchBursaries();
    } catch (error) {
      console.error('Error deleting bursary:', error);
      toast({
        title: "Error",
        description: "Failed to delete bursary",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Bursaries Management</h3>
          <p className="text-sm text-muted-foreground">
            Manage student bursaries and funding opportunities
          </p>
        </div>
        <div>
          <Input
            type="file"
            accept=".json,.csv"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
            id="bursary-upload"
          />
          <label htmlFor="bursary-upload">
            <Button disabled={uploading} asChild>
              <span>
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? 'Uploading...' : 'Upload JSON/CSV'}
              </span>
            </Button>
          </label>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Closing Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bursaries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No bursaries found. Upload a JSON or CSV file to add bursaries.
                </TableCell>
              </TableRow>
            ) : (
              bursaries.map((bursary) => (
                <TableRow key={bursary.id}>
                  <TableCell className="font-medium">{bursary.name}</TableCell>
                  <TableCell>{bursary.provider || '-'}</TableCell>
                  <TableCell>{bursary.amount || '-'}</TableCell>
                  <TableCell>
                    {bursary.closing_date 
                      ? new Date(bursary.closing_date).toLocaleDateString()
                      : '-'
                    }
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      bursary.status === 'active' 
                        ? 'bg-green-50 text-green-700' 
                        : 'bg-gray-50 text-gray-700'
                    }`}>
                      {bursary.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(bursary.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="bg-muted p-4 rounded-lg">
        <h4 className="font-semibold mb-2">Upload Format</h4>
        <p className="text-sm text-muted-foreground mb-2">
          Your JSON/CSV file should include these fields:
        </p>
        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
          <li><strong>name</strong>: Bursary name (required)</li>
          <li><strong>provider</strong>: Organization offering the bursary</li>
          <li><strong>description</strong>: Detailed description</li>
          <li><strong>amount</strong>: Funding amount (e.g., "R50,000")</li>
          <li><strong>requirements</strong>: Eligibility requirements</li>
          <li><strong>qualifications</strong>: Academic qualifications needed</li>
          <li><strong>closing_date</strong>: Application closing date (YYYY-MM-DD)</li>
          <li><strong>application_process</strong>: How to apply</li>
        </ul>
      </div>
    </div>
  );
};

export default BursariesTab;