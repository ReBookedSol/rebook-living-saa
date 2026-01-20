import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  Building2, 
  Upload, 
  X, 
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  FileText,
  Image as ImageIcon
} from "lucide-react";
import { toast } from "sonner";

const SA_UNIVERSITIES = [
  "University of Cape Town",
  "Stellenbosch University",
  "University of Pretoria",
  "University of the Witwatersrand",
  "University of KwaZulu-Natal",
  "Rhodes University",
  "University of the Free State",
  "North-West University",
  "University of Johannesburg",
  "Nelson Mandela University",
  "Cape Peninsula University of Technology",
  "Durban University of Technology",
  "Tshwane University of Technology",
  "Vaal University of Technology",
  "Central University of Technology",
  "Mangosuthu University of Technology",
  "Walter Sisulu University",
  "University of Venda",
  "University of Limpopo",
  "University of Zululand",
  "University of Fort Hare",
  "Sol Plaatje University",
  "Sefako Makgatho Health Sciences University",
];

const AMENITIES = [
  "WiFi",
  "Parking",
  "Laundry",
  "Security",
  "CCTV",
  "Study Room",
  "Gym",
  "Pool",
  "Furnished",
  "Air Conditioning",
  "Backup Power",
  "Water Tank",
  "Kitchen",
  "Cleaning Service",
  "Shuttle Service",
  "24hr Access",
];

const PROVINCES = [
  "Eastern Cape",
  "Free State",
  "Gauteng",
  "KwaZulu-Natal",
  "Limpopo",
  "Mpumalanga",
  "North West",
  "Northern Cape",
  "Western Cape",
];

const DOCUMENT_TYPES = [
  { value: "pdr_certificate", label: "PDR Certificate" },
  { value: "safety_compliance", label: "Safety Compliance Certificate" },
  { value: "business_registration", label: "Business Registration" },
  { value: "proof_of_ownership", label: "Proof of Ownership" },
  { value: "other", label: "Other Document" },
];

const AddListing = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [user, setUser] = useState<any>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    propertyName: "",
    type: "",
    address: "",
    city: "",
    province: "",
    university: "",
    description: "",
    monthlyCost: "",
    units: "",
    roomsAvailable: "",
    genderPolicy: "",
    nsfasAccredited: false,
    amenities: [] as string[],
    contactPerson: "",
    contactPhone: "",
    contactEmail: "",
    website: "",
  });
  
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [documents, setDocuments] = useState<{ file: File; type: string }[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      }
    });
  }, [navigate]);

  // Check user role
  const { data: userRole } = useQuery({
    queryKey: ["user-role", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();
      
      if (error && error.code !== "PGRST116") throw error;
      return data?.role || "user";
    },
    enabled: !!user?.id,
  });

  // Check listing count
  const { data: listingCount } = useQuery({
    queryKey: ["landlord-listing-count", user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      const { count, error } = await supabase
        .from("landlord_listings")
        .select("*", { count: "exact", head: true })
        .eq("landlord_id", user.id);
      
      if (error) throw error;
      return count || 0;
    },
    enabled: !!user?.id && userRole === "landlord",
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAmenityToggle = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 10) {
      toast.error("Maximum 10 images allowed");
      return;
    }
    
    const validFiles = files.filter(file => {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 5MB)`);
        return false;
      }
      return true;
    });

    setImages(prev => [...prev, ...validFiles]);
    
    // Create previews
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>, docType: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Document too large (max 10MB)");
      return;
    }
    
    // Replace if same type exists
    setDocuments(prev => {
      const filtered = prev.filter(d => d.type !== docType);
      return [...filtered, { file, type: docType }];
    });
  };

  const removeDocument = (docType: string) => {
    setDocuments(prev => prev.filter(d => d.type !== docType));
  };

  const createListingMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Not authenticated");
      
      setUploadProgress(10);
      
      // 1. Upload images to storage
      const imageUrls: string[] = [];
      for (let i = 0; i < images.length; i++) {
        const file = images[i];
        const fileExt = file.name.split(".").pop();
        const fileName = `${user.id}/${Date.now()}-${i}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from("landlord-documents")
          .upload(`images/${fileName}`, file);
        
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from("landlord-documents")
          .getPublicUrl(`images/${fileName}`);
        
        imageUrls.push(publicUrl);
        setUploadProgress(10 + ((i + 1) / images.length) * 30);
      }
      
      setUploadProgress(45);
      
      // 2. Create accommodation record
      const { data: accommodation, error: accError } = await supabase
        .from("accommodations")
        .insert({
          property_name: formData.propertyName,
          type: formData.type,
          address: formData.address,
          city: formData.city,
          province: formData.province,
          university: formData.university,
          description: formData.description,
          monthly_cost: parseInt(formData.monthlyCost) || null,
          units: parseInt(formData.units) || null,
          rooms_available: parseInt(formData.roomsAvailable) || null,
          gender_policy: formData.genderPolicy || null,
          nsfas_accredited: formData.nsfasAccredited,
          amenities: formData.amenities,
          contact_person: formData.contactPerson,
          contact_phone: formData.contactPhone,
          contact_email: formData.contactEmail,
          website: formData.website || null,
          image_urls: imageUrls,
          status: "pending",
          is_landlord_listing: true,
          landlord_id: user.id,
        })
        .select()
        .single();
      
      if (accError) throw accError;
      
      setUploadProgress(60);
      
      // 3. Create landlord_listing record
      const { data: landlordListing, error: listingError } = await supabase
        .from("landlord_listings")
        .insert({
          accommodation_id: accommodation.id,
          landlord_id: user.id,
          submission_status: "draft",
        })
        .select()
        .single();
      
      if (listingError) throw listingError;
      
      setUploadProgress(75);
      
      // 4. Upload documents
      for (let i = 0; i < documents.length; i++) {
        const doc = documents[i];
        const fileExt = doc.file.name.split(".").pop();
        const fileName = `${user.id}/${landlordListing.id}/${doc.type}-${Date.now()}.${fileExt}`;
        
        const { error: docUploadError } = await supabase.storage
          .from("landlord-documents")
          .upload(`documents/${fileName}`, doc.file);
        
        if (docUploadError) throw docUploadError;
        
        // Save document record
        const { error: docRecordError } = await supabase
          .from("landlord_documents")
          .insert({
            landlord_listing_id: landlordListing.id,
            document_type: doc.type,
            document_name: doc.file.name,
            storage_path: `documents/${fileName}`,
            file_size: doc.file.size,
            mime_type: doc.file.type,
          });
        
        if (docRecordError) throw docRecordError;
        
        setUploadProgress(75 + ((i + 1) / documents.length) * 20);
      }
      
      setUploadProgress(100);
      
      return landlordListing;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["landlord-listings"] });
      toast.success("Listing created successfully!");
      navigate(`/landlord/listing/${data.id}`);
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to create listing");
      setUploadProgress(0);
    },
  });

  const validateStep = (currentStep: number) => {
    switch (currentStep) {
      case 1:
        if (!formData.propertyName || !formData.type || !formData.address || !formData.city || !formData.province) {
          toast.error("Please fill in all required fields");
          return false;
        }
        return true;
      case 2:
        if (!formData.contactPerson || !formData.contactPhone || !formData.contactEmail) {
          toast.error("Please fill in contact details");
          return false;
        }
        return true;
      case 3:
        if (images.length === 0) {
          toast.error("Please upload at least one image");
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  if (userRole !== "landlord" && userRole !== "admin") {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Alert className="border-amber-200 bg-amber-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You need to upgrade to a Landlord account to add listings.
              <Button variant="link" onClick={() => navigate("/landlord")}>
                Upgrade Now
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-3xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/landlord")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Add New Listing</h1>
            <p className="text-muted-foreground">Step {step} of 4</p>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <Progress value={step * 25} className="h-2" />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span className={step >= 1 ? "text-primary font-medium" : ""}>Property Details</span>
            <span className={step >= 2 ? "text-primary font-medium" : ""}>Contact Info</span>
            <span className={step >= 3 ? "text-primary font-medium" : ""}>Images</span>
            <span className={step >= 4 ? "text-primary font-medium" : ""}>Documents</span>
          </div>
        </div>

        {/* Step 1: Property Details */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Property Details
              </CardTitle>
              <CardDescription>Basic information about your property</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="propertyName">Property Name *</Label>
                <Input
                  id="propertyName"
                  value={formData.propertyName}
                  onChange={(e) => handleInputChange("propertyName", e.target.value)}
                  placeholder="e.g., Sunrise Student Residence"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Property Type *</Label>
                  <Select value={formData.type} onValueChange={(v) => handleInputChange("type", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Residence">Residence</SelectItem>
                      <SelectItem value="Apartment">Apartment</SelectItem>
                      <SelectItem value="House">House</SelectItem>
                      <SelectItem value="Commune">Commune</SelectItem>
                      <SelectItem value="Flat">Flat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="genderPolicy">Gender Policy</Label>
                  <Select value={formData.genderPolicy} onValueChange={(v) => handleInputChange("genderPolicy", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select policy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mixed">Mixed</SelectItem>
                      <SelectItem value="Male Only">Male Only</SelectItem>
                      <SelectItem value="Female Only">Female Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="Street address"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    placeholder="City"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="province">Province *</Label>
                  <Select value={formData.province} onValueChange={(v) => handleInputChange("province", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select province" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROVINCES.map(p => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="university">University/Universities Served</Label>
                <Select value={formData.university} onValueChange={(v) => handleInputChange("university", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select university" />
                  </SelectTrigger>
                  <SelectContent>
                    {SA_UNIVERSITIES.map(u => (
                      <SelectItem key={u} value={u}>{u}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Describe your property..."
                  className="min-h-24"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="monthlyCost">Monthly Cost (R)</Label>
                  <Input
                    id="monthlyCost"
                    type="number"
                    value={formData.monthlyCost}
                    onChange={(e) => handleInputChange("monthlyCost", e.target.value)}
                    placeholder="e.g., 5000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="units">Total Units</Label>
                  <Input
                    id="units"
                    type="number"
                    value={formData.units}
                    onChange={(e) => handleInputChange("units", e.target.value)}
                    placeholder="e.g., 50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="roomsAvailable">Rooms Available</Label>
                  <Input
                    id="roomsAvailable"
                    type="number"
                    value={formData.roomsAvailable}
                    onChange={(e) => handleInputChange("roomsAvailable", e.target.value)}
                    placeholder="e.g., 10"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="nsfasAccredited"
                  checked={formData.nsfasAccredited}
                  onCheckedChange={(checked) => handleInputChange("nsfasAccredited", checked)}
                />
                <Label htmlFor="nsfasAccredited">NSFAS Accredited</Label>
              </div>

              <div className="space-y-2">
                <Label>Amenities</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {AMENITIES.map(amenity => (
                    <div key={amenity} className="flex items-center space-x-2">
                      <Checkbox
                        id={amenity}
                        checked={formData.amenities.includes(amenity)}
                        onCheckedChange={() => handleAmenityToggle(amenity)}
                      />
                      <Label htmlFor={amenity} className="text-sm">{amenity}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Contact Info */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>How students can reach you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contactPerson">Contact Person *</Label>
                <Input
                  id="contactPerson"
                  value={formData.contactPerson}
                  onChange={(e) => handleInputChange("contactPerson", e.target.value)}
                  placeholder="Full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPhone">Phone Number *</Label>
                <Input
                  id="contactPhone"
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => handleInputChange("contactPhone", e.target.value)}
                  placeholder="e.g., 012 345 6789"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactEmail">Email *</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => handleInputChange("contactEmail", e.target.value)}
                  placeholder="email@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website (Optional)</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleInputChange("website", e.target.value)}
                  placeholder="https://www.yoursite.com"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Images */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Property Images
              </CardTitle>
              <CardDescription>Upload up to 10 images of your property</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <input
                  type="file"
                  id="images"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <label htmlFor="images" className="cursor-pointer">
                  <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">Click to upload images</p>
                  <p className="text-sm text-muted-foreground">PNG, JPG up to 5MB each</p>
                </label>
              </div>

              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-sm text-muted-foreground text-center">
                {images.length}/10 images uploaded
              </p>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Documents */}
        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Compliance Documents
              </CardTitle>
              <CardDescription>
                Upload required compliance documents for verification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {DOCUMENT_TYPES.map(docType => {
                const uploadedDoc = documents.find(d => d.type === docType.value);
                return (
                  <div key={docType.value} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className={`w-5 h-5 ${uploadedDoc ? "text-green-500" : "text-muted-foreground"}`} />
                      <div>
                        <p className="font-medium">{docType.label}</p>
                        {uploadedDoc && (
                          <p className="text-sm text-muted-foreground">{uploadedDoc.file.name}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {uploadedDoc ? (
                        <>
                          <Check className="w-5 h-5 text-green-500" />
                          <Button variant="ghost" size="sm" onClick={() => removeDocument(docType.value)}>
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <input
                            type="file"
                            id={`doc-${docType.value}`}
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            onChange={(e) => handleDocumentUpload(e, docType.value)}
                            className="hidden"
                          />
                          <label htmlFor={`doc-${docType.value}`}>
                            <Button variant="outline" size="sm" asChild>
                              <span>Upload</span>
                            </Button>
                          </label>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Documents will be reviewed by our admin team before your listing is approved.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}

        {/* Upload Progress */}
        {createListingMutation.isPending && (
          <div className="mt-6">
            <Progress value={uploadProgress} className="h-2" />
            <p className="text-sm text-center mt-2 text-muted-foreground">
              Uploading... {uploadProgress}%
            </p>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          <Button 
            variant="outline" 
            onClick={prevStep}
            disabled={step === 1 || createListingMutation.isPending}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          
          {step < 4 ? (
            <Button onClick={nextStep} disabled={createListingMutation.isPending}>
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button 
              onClick={() => createListingMutation.mutate()}
              disabled={createListingMutation.isPending}
            >
              {createListingMutation.isPending ? "Creating..." : "Create Listing"}
              <Check className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AddListing;
