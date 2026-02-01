import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, Trash2, Eye, Search, CheckSquare, Square, AlertTriangle } from "lucide-react";
import { useMemo } from "react";
import { toast } from "sonner";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const AccommodationsTab = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedAccommodation, setSelectedAccommodation] = useState<any>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [batchDeleteDialogOpen, setBatchDeleteDialogOpen] = useState(false);
  const [universityDeleteDialogOpen, setUniversityDeleteDialogOpen] = useState(false);
  const [selectedUniversity, setSelectedUniversity] = useState("");

  const { data: accommodations, isLoading } = useQuery({
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

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("accommodations")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-accommodations"] });
      toast.success("Accommodation deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete accommodation");
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, newStatus }: { id: string; newStatus: string }) => {
      const { error } = await supabase
        .from("accommodations")
        .update({ status: newStatus })
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-accommodations"] });
      toast.success("Status updated successfully");
    },
    onError: () => {
      toast.error("Failed to update status");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (accommodation: any) => {
      const { error } = await supabase
        .from("accommodations")
        .update(accommodation)
        .eq("id", accommodation.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-accommodations"] });
      toast.success("Accommodation updated successfully");
      setEditDialogOpen(false);
    },
    onError: () => {
      toast.error("Failed to update accommodation");
    },
  });

  const batchDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase
        .from("accommodations")
        .delete()
        .in("id", ids);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-accommodations"] });
      toast.success(`Successfully deleted ${selectedIds.length} accommodations`);
      setSelectedIds([]);
      setBatchDeleteDialogOpen(false);
    },
    onError: () => {
      toast.error("Failed to delete accommodations");
    },
  });

  const deleteByUniversityMutation = useMutation({
    mutationFn: async (university: string) => {
      const { error } = await supabase
        .from("accommodations")
        .delete()
        .eq("university", university);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-accommodations"] });
      toast.success(`Successfully deleted all accommodations from ${selectedUniversity}`);
      setSelectedUniversity("");
      setUniversityDeleteDialogOpen(false);
    },
    onError: () => {
      toast.error("Failed to delete accommodations");
    },
  });

  const handleEdit = (acc: any) => {
    setSelectedAccommodation(acc);
    setEditDialogOpen(true);
  };

  const handleView = (acc: any) => {
    setSelectedAccommodation(acc);
    setViewDialogOpen(true);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(selectedAccommodation);
  };

  const filteredAccommodations = useMemo(() => {
    if (!accommodations) return [];
    const q = (searchQuery || "").trim().toLowerCase();
    if (!q) return accommodations;

    return accommodations.filter((acc: any) => {
      const hay = [acc.property_name, acc.city, acc.type, acc.university, acc.address]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      if (hay.includes(q)) return true;

      // numeric search (price/id)
      if (String(acc.monthly_cost || '').includes(q)) return true;
      if (String(acc.id || '').toLowerCase().includes(q)) return true;

      return false;
    });
  }, [accommodations, searchQuery]);

  const universities = [...new Set(accommodations?.map(acc => acc.university).filter(Boolean))];

  const duplicatesMap = useMemo(() => {
    const map = new Map<string, any[]>();
    accommodations?.forEach((acc: any) => {
      const name = (acc.property_name || "").trim().toLowerCase();
      const address = (acc.address || "").trim().toLowerCase();
      const key = `${name}|${address}`;
      if (!name || !address) return;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(acc);
    });
    return map;
  }, [accommodations]);

  const duplicateEntries = useMemo(() => Array.from(duplicatesMap.entries()).filter(([, arr]) => arr.length > 1), [duplicatesMap]);

  const [selectedDuplicateKey, setSelectedDuplicateKey] = useState<string | null>(null);
  const [duplicateDeleteDialogOpen, setDuplicateDeleteDialogOpen] = useState(false);
  const [deleteAllDuplicatesDialogOpen, setDeleteAllDuplicatesDialogOpen] = useState(false);

  const deleteDuplicatesMutation = useMutation({
    mutationFn: async ({ key, keepId }: { key: string; keepId: string }) => {
      const items = duplicatesMap.get(key) || [];
      const idsToDelete = items.map((i: any) => i.id).filter((id: string) => id !== keepId);
      if (idsToDelete.length === 0) return;
      const { error } = await supabase.from("accommodations").delete().in("id", idsToDelete);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-accommodations"] });
      toast.success("Deleted duplicates successfully");
      setDuplicateDeleteDialogOpen(false);
      setSelectedDuplicateKey(null);
    },
    onError: () => {
      toast.error("Failed to delete duplicates");
    },
  });

  const deleteAllDuplicatesMutation = useMutation({
    mutationFn: async () => {
      const allDuplicateIds: string[] = [];
      duplicateEntries.forEach(([, items]) => {
        // Sort by created_at to keep the oldest
        const sorted = [...items].sort((a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        // Keep the first (oldest), delete the rest
        sorted.slice(1).forEach((item: any) => {
          allDuplicateIds.push(item.id);
        });
      });

      if (allDuplicateIds.length === 0) return;
      const { error } = await supabase.from("accommodations").delete().in("id", allDuplicateIds);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-accommodations"] });
      toast.success("Successfully deleted all duplicate listings");
    },
    onError: () => {
      toast.error("Failed to delete duplicate listings");
    },
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredAccommodations?.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredAccommodations?.map(acc => acc.id) || []);
    }
  };

  const toggleSelectId = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const getUniversityCount = (university: string) => {
    return accommodations?.filter(acc => acc.university === university).length || 0;
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Accommodations</h2>
        <p className="text-sm text-muted-foreground">{accommodations?.length || 0} total</p>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search accommodations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="text-sm text-muted-foreground mr-4">Showing {filteredAccommodations?.length || 0} / {accommodations?.length || 0}</div>
        {selectedIds.length > 0 && (
          <Button
            variant="destructive"
            onClick={() => setBatchDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Selected ({selectedIds.length})
          </Button>
        )}
      </div>

      <div className="flex gap-4 items-center">
        <Select value={selectedUniversity} onValueChange={setSelectedUniversity}>
          <SelectTrigger className="w-[300px]">
            <SelectValue placeholder="Select university to delete all" />
          </SelectTrigger>
          <SelectContent>
            {universities.map((uni) => (
              <SelectItem key={uni} value={uni}>
                {uni} ({getUniversityCount(uni)} properties)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedUniversity && (
          <Button
            variant="destructive"
            onClick={() => setUniversityDeleteDialogOpen(true)}
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Delete All from {selectedUniversity}
          </Button>
        )}
      </div>

      {duplicateEntries.length > 0 && (
        <div className="mb-4 p-4 bg-yellow-50 border rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-semibold">Duplicate Properties Detected</h3>
              <p className="text-sm text-muted-foreground">Multiple accommodations share the same property name and address. You can remove duplicates while keeping the oldest record.</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">{duplicateEntries.length} duplicated properties</div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setDeleteAllDuplicatesDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete All Duplicates
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {duplicateEntries.map(([key, list]) => {
              const sorted = [...list].sort((a, b) =>
                new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
              );
              const oldestId = sorted[0].id;
              return (
                <div key={key} className="flex items-center justify-between bg-white p-3 rounded border">
                  <div>
                    <div className="font-medium">{list[0].property_name}</div>
                    <div className="text-xs text-muted-foreground">{list.length} entries (will keep oldest)</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => { setSelectedDuplicateKey(key); setDuplicateDeleteDialogOpen(true); }}>
                      Delete duplicates
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedIds.length === filteredAccommodations?.length && filteredAccommodations?.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>Property Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>NSFAS</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAccommodations?.map((acc) => (
              <TableRow key={acc.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(acc.id)}
                    onCheckedChange={() => toggleSelectId(acc.id)}
                  />
                </TableCell>
                <TableCell className="font-medium">{acc.property_name}</TableCell>
                <TableCell>{acc.type}</TableCell>
                <TableCell>{acc.city}</TableCell>
                <TableCell>R{acc.monthly_cost?.toLocaleString()}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      toggleStatusMutation.mutate({
                        id: acc.id,
                        newStatus: acc.status === "active" ? "inactive" : "active",
                      })
                    }
                  >
                    <Badge variant={acc.status === "active" ? "default" : "secondary"}>
                      {acc.status}
                    </Badge>
                  </Button>
                </TableCell>
                <TableCell>
                  {acc.nsfas_accredited ? (
                    <Badge variant="default" className="bg-accent">Yes</Badge>
                  ) : (
                    <Badge variant="secondary">No</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleView(acc)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(acc)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(acc.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Accommodation</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="property_name">Property Name</Label>
                <Input
                  id="property_name"
                  value={selectedAccommodation?.property_name || ""}
                  onChange={(e) => setSelectedAccommodation({ ...selectedAccommodation, property_name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={selectedAccommodation?.type || ""}
                  onValueChange={(value) => setSelectedAccommodation({ ...selectedAccommodation, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Apartment">Apartment</SelectItem>
                    <SelectItem value="House">House</SelectItem>
                    <SelectItem value="Residence">Residence</SelectItem>
                    <SelectItem value="Room">Room</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="monthly_cost">Monthly Cost</Label>
                <Input
                  id="monthly_cost"
                  type="number"
                  value={selectedAccommodation?.monthly_cost || ""}
                  onChange={(e) => setSelectedAccommodation({ ...selectedAccommodation, monthly_cost: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rooms_available">Rooms Available</Label>
                <Input
                  id="rooms_available"
                  type="number"
                  value={selectedAccommodation?.rooms_available || ""}
                  onChange={(e) => setSelectedAccommodation({ ...selectedAccommodation, rooms_available: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="units">Units</Label>
                <Input
                  id="units"
                  type="number"
                  value={selectedAccommodation?.units || ""}
                  onChange={(e) => setSelectedAccommodation({ ...selectedAccommodation, units: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={selectedAccommodation?.city || ""}
                  onChange={(e) => setSelectedAccommodation({ ...selectedAccommodation, city: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="province">Province</Label>
                <Input
                  id="province"
                  value={selectedAccommodation?.province || ""}
                  onChange={(e) => setSelectedAccommodation({ ...selectedAccommodation, province: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="university">University</Label>
                <Input
                  id="university"
                  value={selectedAccommodation?.university || ""}
                  onChange={(e) => setSelectedAccommodation({ ...selectedAccommodation, university: e.target.value })}
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={selectedAccommodation?.address || ""}
                  onChange={(e) => setSelectedAccommodation({ ...selectedAccommodation, address: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={selectedAccommodation?.description || ""}
                  onChange={(e) => setSelectedAccommodation({ ...selectedAccommodation, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_person">Contact Person</Label>
                <Input
                  id="contact_person"
                  value={selectedAccommodation?.contact_person || ""}
                  onChange={(e) => setSelectedAccommodation({ ...selectedAccommodation, contact_person: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_email">Contact Email</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={selectedAccommodation?.contact_email || ""}
                  onChange={(e) => setSelectedAccommodation({ ...selectedAccommodation, contact_email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_phone">Contact Phone</Label>
                <Input
                  id="contact_phone"
                  value={selectedAccommodation?.contact_phone || ""}
                  onChange={(e) => setSelectedAccommodation({ ...selectedAccommodation, contact_phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={selectedAccommodation?.website || ""}
                  onChange={(e) => setSelectedAccommodation({ ...selectedAccommodation, website: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedAccommodation?.property_name}</DialogTitle>
            <DialogDescription>{selectedAccommodation?.type}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">City</p>
                <p>{selectedAccommodation?.city || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Province</p>
                <p>{selectedAccommodation?.province || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Monthly Cost</p>
                <p>R{selectedAccommodation?.monthly_cost?.toLocaleString() || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Rooms Available</p>
                <p>{selectedAccommodation?.rooms_available || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Units</p>
                <p>{selectedAccommodation?.units || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">University</p>
                <p>{selectedAccommodation?.university || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">NSFAS Accredited</p>
                <Badge variant={selectedAccommodation?.nsfas_accredited ? "default" : "secondary"}>
                  {selectedAccommodation?.nsfas_accredited ? "Yes" : "No"}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <Badge variant={selectedAccommodation?.status === "active" ? "default" : "secondary"}>
                  {selectedAccommodation?.status}
                </Badge>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Address</p>
              <p>{selectedAccommodation?.address}</p>
            </div>
            {selectedAccommodation?.description && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Description</p>
                <p className="text-sm">{selectedAccommodation?.description}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Contact Person</p>
                <p>{selectedAccommodation?.contact_person || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Contact Email</p>
                <p>{selectedAccommodation?.contact_email || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Contact Phone</p>
                <p>{selectedAccommodation?.contact_phone || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Website</p>
                <p>{selectedAccommodation?.website || "N/A"}</p>
              </div>
            </div>
          </div>
          </DialogContent>
      </Dialog>

      {/* Batch Delete Confirmation */}
      <AlertDialog open={batchDeleteDialogOpen} onOpenChange={setBatchDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedIds.length} Accommodations?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete {selectedIds.length} selected accommodations from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => batchDeleteMutation.mutate(selectedIds)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Duplicate Delete Confirmation */}
      <AlertDialog open={duplicateDeleteDialogOpen} onOpenChange={setDuplicateDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete duplicate entries?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete all duplicate records for the selected property but keep the oldest record. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!selectedDuplicateKey) return;
                const items = duplicatesMap.get(selectedDuplicateKey) || [];
                // Sort by created_at to keep the oldest
                const sorted = [...items].sort((a, b) =>
                  new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                );
                const keepId = sorted[0]?.id;
                if (!keepId) return;
                deleteDuplicatesMutation.mutate({ key: selectedDuplicateKey, keepId });
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Duplicates
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* University Delete Confirmation */}
      <AlertDialog open={universityDeleteDialogOpen} onOpenChange={setUniversityDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete All from {selectedUniversity}?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete all {getUniversityCount(selectedUniversity)} accommodations from {selectedUniversity}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteByUniversityMutation.mutate(selectedUniversity)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete All Duplicates Confirmation */}
      <AlertDialog open={deleteAllDuplicatesDialogOpen} onOpenChange={setDeleteAllDuplicatesDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete All Duplicate Listings?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all duplicate accommodations, keeping only the oldest record for each property (name + address combination). This action cannot be undone.
              <div className="mt-2 p-2 bg-muted rounded text-sm">
                {duplicateEntries.length} duplicate properties detected • Will delete multiple entries per property
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteAllDuplicatesMutation.mutate()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete All Duplicates
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AccommodationsTab;
