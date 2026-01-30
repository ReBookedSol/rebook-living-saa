import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Upload, Search, Trash2, GraduationCap, Building2, Plus } from "lucide-react";
import { toast } from "sonner";

interface Program {
  id: string;
  university_id: string;
  name: string;
  faculty_name: string | null;
  description: string | null;
  duration: string | null;
  aps_requirement: number | null;
  subjects: any;
  career_prospects: any;
  skills_developed: any;
  salary_range: string | null;
  employment_rate: number | null;
  application_details: any;
  is_active: boolean;
  created_at: string;
}

interface UniversityImport {
  university_id: string;
  name: string;
  abbreviation?: string;
  location?: string;
  programs: ProgramImport[];
}

interface ProgramImport {
  id: string;
  university_id: string;
  name: string;
  faculty_name?: string;
  description?: string;
  duration?: string;
  aps_requirement?: number;
  subjects?: any[];
  career_prospects?: string[];
  skills_developed?: string[];
  salary_range?: string;
  employment_rate?: number;
  application_details?: any;
}

const ProgramsTab = () => {
  const queryClient = useQueryClient();
  const [jsonInput, setJsonInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [importPreview, setImportPreview] = useState<UniversityImport[] | null>(null);

  // Fetch all programs
  const { data: programs, isLoading } = useQuery({
    queryKey: ["admin-programs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("programs")
        .select("*")
        .order("university_id", { ascending: true });

      if (error) throw error;
      return data as Program[];
    },
  });

  // Fetch universities for reference
  const { data: universities } = useQuery({
    queryKey: ["universities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("universities")
        .select("id, name, abbreviation")
        .order("name");

      if (error) throw error;
      return data || [];
    },
  });

  // Import programs mutation
  const importMutation = useMutation({
    mutationFn: async (universitiesData: UniversityImport[]) => {
      let totalImported = 0;

      for (const uniData of universitiesData) {
        for (const program of uniData.programs) {
          const programData = {
            id: program.id || undefined, // Let the database generate ID if not provided
            university_id: program.university_id || uniData.university_id,
            name: program.name,
            faculty_name: program.faculty_name || null,
            description: program.description || null,
            duration: program.duration || null,
            aps_requirement: program.aps_requirement || null,
            subjects: program.subjects || [],
            career_prospects: program.career_prospects || [],
            skills_developed: program.skills_developed || [],
            salary_range: program.salary_range || null,
            employment_rate: program.employment_rate || null,
            application_details: program.application_details || {},
            is_active: true,
          };

          // Upsert program (insert or update if id exists)
          const { error } = await supabase
            .from("programs")
            .upsert(programData, { onConflict: 'id' });

          if (error) {
            console.error("Failed to import program:", program.name, error);
            throw error;
          }
          totalImported++;
        }
      }

      return totalImported;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ["admin-programs"] });
      toast.success(`Successfully imported ${count} programs`);
      setJsonInput("");
      setImportPreview(null);
    },
    onError: (error: any) => {
      toast.error(`Import failed: ${error.message}`);
    },
  });

  // Delete program mutation
  const deleteMutation = useMutation({
    mutationFn: async (programId: string) => {
      const { error } = await supabase
        .from("programs")
        .delete()
        .eq("id", programId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-programs"] });
      toast.success("Program deleted successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to delete program: ${error.message}`);
    },
  });

  // Delete all programs for a university
  const deleteAllForUniversityMutation = useMutation({
    mutationFn: async (universityId: string) => {
      const { error } = await supabase
        .from("programs")
        .delete()
        .eq("university_id", universityId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-programs"] });
      toast.success("All programs for this university deleted");
    },
    onError: (error: any) => {
      toast.error(`Failed to delete programs: ${error.message}`);
    },
  });

  // Parse and validate JSON
  const handleParseJson = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      
      // Handle both array format and object with universities key
      let universitiesData: UniversityImport[];
      
      if (Array.isArray(parsed)) {
        // Direct array of universities
        universitiesData = parsed;
      } else if (parsed.universities && Array.isArray(parsed.universities)) {
        // Object with universities key
        universitiesData = parsed.universities;
      } else {
        throw new Error("Invalid format. Expected array of universities or object with 'universities' key");
      }

      // Validate structure
      for (const uni of universitiesData) {
        if (!uni.university_id) {
          throw new Error(`Missing university_id for university: ${uni.name || 'unknown'}`);
        }
        if (!uni.programs || !Array.isArray(uni.programs)) {
          throw new Error(`Missing or invalid programs array for university: ${uni.university_id}`);
        }
        for (const prog of uni.programs) {
          if (!prog.name) {
            throw new Error(`Missing program name in university: ${uni.university_id}`);
          }
        }
      }

      setImportPreview(universitiesData);
      toast.success(`Parsed ${universitiesData.length} universities with ${universitiesData.reduce((acc, u) => acc + u.programs.length, 0)} programs`);
    } catch (error: any) {
      toast.error(`JSON parsing error: ${error.message}`);
      setImportPreview(null);
    }
  };

  const handleImport = () => {
    if (importPreview) {
      importMutation.mutate(importPreview);
    }
  };

  // Filter programs
  const filteredPrograms = programs?.filter(program => {
    const query = searchQuery.toLowerCase();
    return (
      program.name.toLowerCase().includes(query) ||
      program.university_id.toLowerCase().includes(query) ||
      (program.faculty_name?.toLowerCase().includes(query) || false)
    );
  }) || [];

  // Group programs by university
  const programsByUniversity = filteredPrograms.reduce((acc, program) => {
    const key = program.university_id;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(program);
    return acc;
  }, {} as Record<string, Program[]>);

  // Get university name helper
  const getUniversityName = (universityId: string) => {
    const uni = universities?.find(u => u.id === universityId);
    return uni?.name || uni?.abbreviation || universityId;
  };

  return (
    <div className="space-y-6">
      {/* Import Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Programs from JSON
          </CardTitle>
          <CardDescription>
            Paste a JSON array of universities with their programs to import them into the database.
            The format should follow the structure with university_id, name, and programs array.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="json-input">JSON Data</Label>
            <Textarea
              id="json-input"
              placeholder={`{
  "universities": [
    {
      "university_id": "uct",
      "name": "University of Cape Town",
      "programs": [
        {
          "id": "uct-bsc-actuarial",
          "name": "Bachelor of Business Science (Actuarial Science)",
          "faculty_name": "Faculty of Commerce",
          "duration": "3 years",
          "aps_requirement": 54,
          ...
        }
      ]
    }
  ]
}`}
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              className="min-h-[300px] font-mono text-sm"
            />
          </div>

          <div className="flex gap-3">
            <Button onClick={handleParseJson} variant="outline" disabled={!jsonInput.trim()}>
              Parse & Validate
            </Button>
            {importPreview && (
              <Button onClick={handleImport} disabled={importMutation.isPending}>
                <Plus className="h-4 w-4 mr-2" />
                Import {importPreview.reduce((acc, u) => acc + u.programs.length, 0)} Programs
              </Button>
            )}
          </div>

          {/* Import Preview */}
          {importPreview && (
            <div className="border rounded-lg p-4 bg-muted/30">
              <h4 className="font-semibold mb-3">Import Preview</h4>
              <div className="space-y-2">
                {importPreview.map((uni) => (
                  <div key={uni.university_id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{uni.name || uni.university_id}</span>
                    </div>
                    <Badge variant="secondary">
                      {uni.programs.length} programs
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Existing Programs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Existing Programs ({programs?.length || 0})
          </CardTitle>
          <CardDescription>
            View and manage all programs in the database
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search programs by name, university, or faculty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {isLoading ? (
            <div className="text-center py-8">Loading programs...</div>
          ) : Object.keys(programsByUniversity).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No programs found. Import some using the JSON importer above.
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(programsByUniversity).map(([universityId, uniPrograms]) => (
                <div key={universityId} className="border rounded-lg overflow-hidden">
                  <div className="bg-muted/50 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      <span className="font-semibold">{getUniversityName(universityId)}</span>
                      <Badge variant="outline">{uniPrograms.length} programs</Badge>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete All
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete all programs?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete all {uniPrograms.length} programs for {getUniversityName(universityId)}.
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteAllForUniversityMutation.mutate(universityId)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete All
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Program Name</TableHead>
                        <TableHead>Faculty</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>APS</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-16"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {uniPrograms.map((program) => (
                        <TableRow key={program.id}>
                          <TableCell className="font-medium">{program.name}</TableCell>
                          <TableCell>{program.faculty_name || "—"}</TableCell>
                          <TableCell>{program.duration || "—"}</TableCell>
                          <TableCell>{program.aps_requirement || "—"}</TableCell>
                          <TableCell>
                            <Badge variant={program.is_active ? "default" : "secondary"}>
                              {program.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete program?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently delete "{program.name}". This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteMutation.mutate(program.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgramsTab;
