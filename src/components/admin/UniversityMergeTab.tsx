import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, AlertTriangle, ArrowRight, CheckSquare, Square } from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";

const UniversityMergeTab = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedSourceUniversity, setSelectedSourceUniversity] = useState("");
  const [selectedTargetUniversity, setSelectedTargetUniversity] = useState("");
  const [targetUniversityForSelected, setTargetUniversityForSelected] = useState("");
  
  const [bulkUpdateDialogOpen, setBulkUpdateDialogOpen] = useState(false);
  const [mergeDialogOpen, setMergeDialogOpen] = useState(false);

  // Fetch accommodations
  const { data: accommodations, isLoading: accommodationsLoading } = useQuery({
    queryKey: ["admin-accommodations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("accommodations")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Extract unique universities and their counts from BOTH university and certified_universities fields
  const universities = useMemo(() => {
    if (!accommodations) return [];
    const uniMap = new Map<string, number>();

    accommodations.forEach((acc: any) => {
      // Count from main university field
      if (acc.university) {
        uniMap.set(acc.university, (uniMap.get(acc.university) || 0) + 1);
      }

      // Count from certified_universities array
      if (acc.certified_universities && Array.isArray(acc.certified_universities)) {
        acc.certified_universities.forEach((uni: string) => {
          if (uni) {
            uniMap.set(uni, (uniMap.get(uni) || 0) + 1);
          }
        });
      }
    });

    return Array.from(uniMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [accommodations]);

  // Filter accommodations based on search
  const filteredAccommodations = useMemo(() => {
    if (!accommodations) return [];
    const q = (searchQuery || "").trim().toLowerCase();
    if (!q) return accommodations;

    return accommodations.filter((acc: any) => {
      const hay = [acc.property_name, acc.city, acc.type, acc.university, acc.address]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      
      return hay.includes(q) || String(acc.id || '').toLowerCase().includes(q);
    });
  }, [accommodations, searchQuery]);

  // Count affected accommodations for merge (includes both main university field and certified_universities array)
  const sourceUniversityCount = useMemo(() => {
    if (!accommodations) return 0;
    return accommodations.filter(acc =>
      acc.university === selectedSourceUniversity ||
      (acc.certified_universities && acc.certified_universities.includes(selectedSourceUniversity))
    ).length;
  }, [accommodations, selectedSourceUniversity]);

  // Helper function to merge certified_universities array (for merge operation)
  const replaceCertifiedUniversity = (certified: string[] | null, sourceUni: string, targetUni: string): string[] | null => {
    if (!certified || certified.length === 0) return certified;
    return certified.map(uni => uni === sourceUni ? targetUni : uni);
  };

  // Helper function to add to certified_universities array (for bulk update operation)
  const addToCertifiedUniversities = (certified: string[] | null, targetUni: string): string[] => {
    const currentList = certified || [];
    if (currentList.includes(targetUni)) {
      return currentList;
    }
    return [...currentList, targetUni];
  };

  // Mutations
  const bulkUpdateMutation = useMutation({
    mutationFn: async (targetUniversity: string) => {
      if (selectedIds.length === 0) throw new Error("No accommodations selected");

      // Fetch all selected accommodations to update certified_universities
      const { data: accsToUpdate, error: fetchError } = await supabase
        .from("accommodations")
        .select("id, certified_universities")
        .in("id", selectedIds);

      if (fetchError) throw fetchError;

      // Update each accommodation: change main university and add to certified list
      if (accsToUpdate && accsToUpdate.length > 0) {
        for (const acc of accsToUpdate) {
          const updatedCertified = addToCertifiedUniversities(acc.certified_universities, targetUniversity);

          const { error } = await supabase
            .from("accommodations")
            .update({
              university: targetUniversity,
              certified_universities: updatedCertified
            })
            .eq("id", acc.id);

          if (error) throw error;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-accommodations"] });
      toast.success(`Successfully updated ${selectedIds.length} accommodations to "${targetUniversityForSelected}" (added to certified universities)`);
      setSelectedIds([]);
      setTargetUniversityForSelected("");
      setBulkUpdateDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(`Failed to update accommodations: ${error.message}`);
    },
  });

  const mergeMutation = useMutation({
    mutationFn: async () => {
      if (!selectedSourceUniversity || !selectedTargetUniversity) {
        throw new Error("Both source and target universities are required");
      }

      // Fetch ALL accommodations (we'll filter client-side for those with source university)
      const { data: allAccommodations, error: fetchError } = await supabase
        .from("accommodations")
        .select("id, university, certified_universities");

      if (fetchError) throw fetchError;

      // Filter accommodations that have the source university in either field
      const accsToMerge = allAccommodations?.filter((acc: any) =>
        acc.university === selectedSourceUniversity ||
        (acc.certified_universities && acc.certified_universities.includes(selectedSourceUniversity))
      ) || [];

      // Update each accommodation to replace source with target in all university fields
      if (accsToMerge && accsToMerge.length > 0) {
        for (const acc of accsToMerge) {
          // Replace all occurrences of source university with target in certified list
          const updatedCertified = replaceCertifiedUniversity(
            acc.certified_universities,
            selectedSourceUniversity,
            selectedTargetUniversity
          );

          // Update main university only if it matches source university
          const updatedMainUniversity = acc.university === selectedSourceUniversity ? selectedTargetUniversity : acc.university;

          const { error } = await supabase
            .from("accommodations")
            .update({
              university: updatedMainUniversity,
              certified_universities: updatedCertified
            })
            .eq("id", acc.id);

          if (error) throw error;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-accommodations"] });
      toast.success(`Successfully merged ${sourceUniversityCount} accommodations from "${selectedSourceUniversity}" to "${selectedTargetUniversity}" (all university fields updated)`);
      setSelectedSourceUniversity("");
      setSelectedTargetUniversity("");
      setMergeDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(`Failed to merge universities: ${error.message}`);
    },
  });

  // Handlers
  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredAccommodations.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredAccommodations.map(acc => acc.id));
    }
  };

  const handleToggleSelectId = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  if (accommodationsLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Bulk Update Selected Listings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>Bulk Update Selected Listings</span>
            {selectedIds.length > 0 && (
              <Badge variant="secondary">{selectedIds.length} selected</Badge>
            )}
          </CardTitle>
          <CardDescription>
            Change the university name for multiple selected accommodation listings at once
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by property name, city, or university..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Results count and target university selector */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
            <div>
              <p className="text-sm text-muted-foreground">
                Showing {filteredAccommodations.length} of {accommodations?.length || 0} accommodations
              </p>
            </div>
            {selectedIds.length > 0 && (
              <div className="flex-1 flex flex-col sm:flex-row gap-3 items-start sm:items-end w-full sm:w-auto">
                <div className="flex-1">
                  <Label htmlFor="target-university-bulk" className="text-sm mb-2 block">
                    Change to University:
                  </Label>
                  <Select value={targetUniversityForSelected} onValueChange={setTargetUniversityForSelected}>
                    <SelectTrigger id="target-university-bulk">
                      <SelectValue placeholder="Select target university" />
                    </SelectTrigger>
                    <SelectContent>
                      {universities.map((uni) => (
                        <SelectItem key={uni.name} value={uni.name}>
                          {uni.name} ({uni.count} properties)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {targetUniversityForSelected && (
                  <Button
                    variant="default"
                    onClick={() => setBulkUpdateDialogOpen(true)}
                    disabled={selectedIds.length === 0}
                  >
                    Update Selected
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Table of accommodations */}
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedIds.length === filteredAccommodations.length && filteredAccommodations.length > 0}
                      onCheckedChange={handleToggleSelectAll}
                      aria-label="Select all accommodations"
                    />
                  </TableHead>
                  <TableHead>Property Name</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Current University</TableHead>
                  <TableHead className="text-right">Select</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAccommodations.length > 0 ? (
                  filteredAccommodations.map((acc) => (
                    <TableRow key={acc.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.includes(acc.id)}
                          onCheckedChange={() => handleToggleSelectId(acc.id)}
                          aria-label={`Select ${acc.property_name}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{acc.property_name}</TableCell>
                      <TableCell>{acc.city || "N/A"}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{acc.university || "Not set"}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleSelectId(acc.id)}
                        >
                          {selectedIds.includes(acc.id) ? (
                            <CheckSquare className="h-4 w-4 text-blue-600" />
                          ) : (
                            <Square className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No accommodations found matching your search
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Merge Universities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Merge Universities (Global)
          </CardTitle>
          <CardDescription>
            Update all accommodations from one university name to another existing university name
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-sm text-orange-800">
              ⚠️ <strong>Warning:</strong> This operation affects ALL accommodations associated with the source university. The merge cannot be undone.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            {/* Source University */}
            <div className="space-y-2">
              <Label htmlFor="source-university">From University:</Label>
              <Select value={selectedSourceUniversity} onValueChange={setSelectedSourceUniversity}>
                <SelectTrigger id="source-university">
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  {universities.map((uni) => (
                    <SelectItem key={uni.name} value={uni.name}>
                      {uni.name} ({uni.count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedSourceUniversity && (
                <p className="text-xs text-muted-foreground">
                  {sourceUniversityCount} accommodation{sourceUniversityCount !== 1 ? 's' : ''}
                </p>
              )}
            </div>

            {/* Arrow */}
            <div className="flex justify-center pb-2">
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </div>

            {/* Target University */}
            <div className="space-y-2">
              <Label htmlFor="target-university">To University:</Label>
              <Select value={selectedTargetUniversity} onValueChange={setSelectedTargetUniversity}>
                <SelectTrigger id="target-university">
                  <SelectValue placeholder="Select target" />
                </SelectTrigger>
                <SelectContent>
                  {universities
                    .filter((uni) => uni.name !== selectedSourceUniversity)
                    .map((uni) => (
                      <SelectItem key={uni.name} value={uni.name}>
                        {uni.name} ({uni.count})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedSourceUniversity && selectedTargetUniversity && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                This will move <strong>{sourceUniversityCount} accommodation{sourceUniversityCount !== 1 ? 's' : ''}</strong> from <strong>{selectedSourceUniversity}</strong> to <strong>{selectedTargetUniversity}</strong>
              </p>
            </div>
          )}

          <Button
            variant="default"
            onClick={() => setMergeDialogOpen(true)}
            disabled={!selectedSourceUniversity || !selectedTargetUniversity}
            className="w-full"
          >
            Merge Universities
          </Button>
        </CardContent>
      </Card>

      {/* Bulk Update Confirmation Dialog */}
      <AlertDialog open={bulkUpdateDialogOpen} onOpenChange={setBulkUpdateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Bulk Update</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                Update {selectedIds.length} accommodation{selectedIds.length !== 1 ? 's' : ''} to <strong>{targetUniversityForSelected}</strong>?
              </p>
              <div className="text-xs bg-blue-50 p-3 rounded border border-blue-200">
                <p className="font-semibold mb-1">Fields that will be updated:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>university:</strong> Changed to "{targetUniversityForSelected}"</li>
                  <li><strong>certified_universities:</strong> "{targetUniversityForSelected}" will be added (if not already present)</li>
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => bulkUpdateMutation.mutate(targetUniversityForSelected)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Confirm Update
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Merge Confirmation Dialog */}
      <AlertDialog open={mergeDialogOpen} onOpenChange={setMergeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm University Merge</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                This will permanently merge <strong>{sourceUniversityCount} accommodation{sourceUniversityCount !== 1 ? 's' : ''}</strong> that have "{selectedSourceUniversity}" in either the main university field or certified universities array:
              </p>
              <p className="font-semibold">
                {selectedSourceUniversity} <ArrowRight className="h-4 w-4 inline mx-2" /> {selectedTargetUniversity}
              </p>
              <div className="text-xs bg-red-50 p-3 rounded border border-red-200">
                <p className="font-semibold mb-1">What will be updated:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>university field:</strong> If equals "{selectedSourceUniversity}", changed to "{selectedTargetUniversity}"</li>
                  <li><strong>certified_universities array:</strong> All occurrences of "{selectedSourceUniversity}" replaced with "{selectedTargetUniversity}"</li>
                </ul>
              </div>
              <p className="text-xs text-muted-foreground">
                This action cannot be undone.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => mergeMutation.mutate()}
              className="bg-red-600 hover:bg-red-700"
            >
              Confirm Merge
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UniversityMergeTab;
