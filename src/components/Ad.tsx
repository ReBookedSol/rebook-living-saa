import React, { useEffect, useRef } from "react";

const AD_CLIENT = "ca-pub-7763187849877535";
const AD_SLOT = "8895459763";

export default function Ad({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Load Google Ads script once
    if (!document.querySelector('script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]')) {
      const s = document.createElement("script");
      s.async = true;
      s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${AD_CLIENT}`;
      s.crossOrigin = "anonymous";
      document.head.appendChild(s);
    }

    // Ask adsbygoogle to render this slot
    try {
      (window as any).adsbygoogle = (window as any).adsbygoogle || [];
      (window as any).adsbygoogle.push({});
    } catch (e) {
      // ignore
    }
  }, []);

  return (
    <div ref={ref} className={`w-full my-2 ${className}`}>
      <ins
        className="adsbygoogle block"
        style={{ display: "block", height: 90 }}
        data-ad-client={AD_CLIENT}
        data-ad-slot={AD_SLOT}
        data-ad-format="horizontal"
        data-full-width-responsive="true"
      />
    </div>
  );
}
