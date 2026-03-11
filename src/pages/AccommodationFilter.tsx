import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { useSEO } from "@/hooks/useSEO";
import { getUniversitiesWithTrainAccess, getGautrainStation, getMycitiStation } from "@/lib/gautrain";

type FilterType = "property_name" | "city" | "university" | "province" | "train_access" | null;

interface FilterResult {
  type: FilterType;
  value: string;
  count: number;
}

const AccommodationFilter = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [filter, setFilter] = useState<FilterResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Generate SEO data based on filter state
  const getSEOData = () => {
    if (filter) {
      const titles: Record<FilterType, string> = {
        property_name: `${filter.value} - Student Accommodation`,
        city: `Student Accommodation in ${filter.value}`,
        university: `Student Accommodation near ${filter.value}`,
        province: `Student Accommodation in ${filter.value}`,
        train_access: "Student Accommodation near Gautrain & Train Stations",
        null: "Student Accommodation",
      };

      const descriptions: Record<FilterType, string> = {
        property_name: `${filter.count} listing(s) for ${filter.value}. NSFAS-accredited, verified student accommodation on ReBooked Living. Safe, affordable housing for students.`,
        city: `Browse ${filter.count} verified student accommodation in ${filter.value}. Safe, affordable housing from R1500/month. Find your perfect room on ReBooked Living.`,
        university: `Discover ${filter.count} student rooms near ${filter.value}. NSFAS-accredited, verified accommodation with safe housing options. Compare prices and amenities.`,
        province: `Find ${filter.count} student accommodation across ${filter.value}. Browse verified rooms in universities and cities. NSFAS-accredited, affordable student housing.`,
        train_access: `${filter.count} verified student accommodations near Gautrain and train stations. Easy commute to campus. NSFAS-accredited housing in South Africa.`,
        null: "Browse student accommodation in South Africa",
      };

      return {
        title: titles[filter.type],
        description: descriptions[filter.type],
      };
    }

    return {
      title: "Student Accommodation",
      description: "Browse student accommodation in South Africa",
    };
  };

  const seoData = getSEOData();
  useSEO({
    ...seoData,
    canonical: `/accommodation/${slug}`,
  });

  useEffect(() => {
    if (!slug) {
      navigate("/browse");
      return;
    }

    const detectAndRedirect = async () => {
      try {
        setIsLoading(true);

        // Normalize the slug for searching (replace hyphens with spaces)
        const normalizedSlug = slug.replace(/-/g, " ");

        // Check for special keywords first
        if (normalizedSlug.toLowerCase().includes("gautrain") ||
            normalizedSlug.toLowerCase().includes("near-train") ||
            normalizedSlug.toLowerCase().includes("train") ||
            normalizedSlug.toLowerCase().includes("station")) {

          const trainAccessUniversities = getUniversitiesWithTrainAccess();
          const { count } = await supabase
            .from("accommodations")
            .select("id", { count: "exact" })
            .in("university", trainAccessUniversities);

          setFilter({
            type: "train_access",
            value: "Gautrain/Train Stations",
            count: count || 0,
          });

          const params = new URLSearchParams(searchParams);
          params.set("nearTrain", "true");
          navigate(`/browse?${params.toString()}`);
          return;
        }

        // Query for property name match (accommodation name) - PRIORITY 1
        const { data: propertyData, error: propertyError } = await supabase
          .from("accommodations")
          .select("property_name", { count: "exact" })
          .ilike("property_name", `%${normalizedSlug}%`)
          .limit(1);

        if (propertyError) throw propertyError;

        if (propertyData && propertyData.length > 0) {
          const propertyName = propertyData[0].property_name;

          const { count } = await supabase
            .from("accommodations")
            .select("id", { count: "exact" })
            .ilike("property_name", `%${propertyName}%`);

          setFilter({
            type: "property_name",
            value: propertyName,
            count: count || 0,
          });

          const params = new URLSearchParams(searchParams);
          params.set("search", propertyName);
          navigate(`/browse?${params.toString()}`);
          return;
        }

        // Query for city match - PRIORITY 2
        const { data: cityData, error: cityError } = await supabase
          .from("accommodations")
          .select("city", { count: "exact" })
          .ilike("city", `%${normalizedSlug}%`)
          .limit(1);

        if (cityError) throw cityError;

        if (cityData && cityData.length > 0) {
          const cityName = cityData[0].city;

          const { count } = await supabase
            .from("accommodations")
            .select("id", { count: "exact" })
            .eq("city", cityName);

          setFilter({
            type: "city",
            value: cityName,
            count: count || 0,
          });

          const params = new URLSearchParams(searchParams);
          params.set("location", cityName);
          navigate(`/browse?${params.toString()}`);
          return;
        }

        // Query for university match - PRIORITY 3
        const { data: universityData, error: universityError } = await supabase
          .from("accommodations")
          .select("university", { count: "exact" })
          .ilike("university", `%${normalizedSlug}%`)
          .limit(1);

        if (universityError) throw universityError;

        if (universityData && universityData.length > 0) {
          const universityName = universityData[0].university;

          const { count } = await supabase
            .from("accommodations")
            .select("id", { count: "exact" })
            .eq("university", universityName);

          setFilter({
            type: "university",
            value: universityName,
            count: count || 0,
          });

          const params = new URLSearchParams(searchParams);
          params.set("university", universityName);
          navigate(`/browse?${params.toString()}`);
          return;
        }

        // Query for province match - PRIORITY 4
        const { data: provinceData, error: provinceError } = await supabase
          .from("accommodations")
          .select("province", { count: "exact" })
          .ilike("province", `%${normalizedSlug}%`)
          .limit(1);

        if (provinceError) throw provinceError;

        if (provinceData && provinceData.length > 0) {
          const provinceName = provinceData[0].province;

          const { count } = await supabase
            .from("accommodations")
            .select("id", { count: "exact" })
            .eq("province", provinceName);

          setFilter({
            type: "province",
            value: provinceName,
            count: count || 0,
          });

          const params = new URLSearchParams(searchParams);
          params.set("province", provinceName);
          navigate(`/browse?${params.toString()}`);
          return;
        }

        // No match found
        setError(`No accommodation found for "${slug}". Redirecting to browse...`);
        setTimeout(() => {
          navigate("/browse");
        }, 2000);
      } catch (err) {
        console.error("Error detecting filter:", err);
        setError("An error occurred while loading. Redirecting...");
        setTimeout(() => {
          navigate("/browse");
        }, 2000);
      } finally {
        setIsLoading(false);
      }
    };

    detectAndRedirect();
  }, [slug, navigate, searchParams]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 text-center">
        {isLoading ? (
          <div className="space-y-4">
            <div className="inline-block">
              <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4" />
            </div>
            <p className="text-lg font-semibold">Loading accommodation...</p>
            <p className="text-muted-foreground">Searching for "{slug}"</p>
          </div>
        ) : error ? (
          <div className="space-y-4">
            <p className="text-lg font-semibold text-destructive">{error}</p>
            <p className="text-muted-foreground">Redirecting to browse page...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-lg font-semibold">Found accommodation!</p>
            <p className="text-muted-foreground">Redirecting to browse page...</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AccommodationFilter;
