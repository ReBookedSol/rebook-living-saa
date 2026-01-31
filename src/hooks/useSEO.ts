import { useEffect } from "react";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  canonical?: string;
}

const BASE_TITLE = "ReBooked Living";
const BASE_URL = "https://rebookedliving.co.za";

export const useSEO = ({ 
  title, 
  description, 
  keywords, 
  ogTitle, 
  ogDescription,
  canonical 
}: SEOProps) => {
  useEffect(() => {
    // Update title
    if (title) {
      document.title = `${title} | ${BASE_TITLE}`;
    }

    // Update meta description
    if (description) {
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement("meta");
        metaDescription.setAttribute("name", "description");
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute("content", description);
    }

    // Update keywords
    if (keywords) {
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement("meta");
        metaKeywords.setAttribute("name", "keywords");
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.setAttribute("content", keywords);
    }

    // Update OG title
    if (ogTitle || title) {
      let ogTitleMeta = document.querySelector('meta[property="og:title"]');
      if (!ogTitleMeta) {
        ogTitleMeta = document.createElement("meta");
        ogTitleMeta.setAttribute("property", "og:title");
        document.head.appendChild(ogTitleMeta);
      }
      ogTitleMeta.setAttribute("content", ogTitle || `${title} | ${BASE_TITLE}`);
    }

    // Update OG description
    if (ogDescription || description) {
      let ogDescMeta = document.querySelector('meta[property="og:description"]');
      if (!ogDescMeta) {
        ogDescMeta = document.createElement("meta");
        ogDescMeta.setAttribute("property", "og:description");
        document.head.appendChild(ogDescMeta);
      }
      ogDescMeta.setAttribute("content", ogDescription || description || "");
    }

    // Update canonical URL
    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!link) {
        link = document.createElement("link");
        link.rel = "canonical";
        document.head.appendChild(link);
      }
      link.href = `${BASE_URL}${canonical}`;
    }

    // Cleanup on unmount - reset to defaults
    return () => {
      document.title = `${BASE_TITLE} - NSFAS Student Accommodation South Africa`;
    };
  }, [title, description, keywords, ogTitle, ogDescription, canonical]);
};

export default useSEO;
