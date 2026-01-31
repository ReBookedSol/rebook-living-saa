import { isDeveloperMode } from "@/lib/productionMode";
import { X } from "lucide-react";
import { useState } from "react";

export const DeveloperModeBanner = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isDeveloperMode() || !isVisible) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-yellow-400 text-black px-4 py-2 flex items-center justify-between">
      <div className="flex-1 text-center">
        <p className="text-sm font-semibold">Developer Mode</p>
      </div>
      <button
        onClick={() => setIsVisible(false)}
        className="flex-shrink-0 ml-4 inline-flex text-black hover:opacity-70"
        aria-label="Close banner"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
