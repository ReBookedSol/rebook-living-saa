import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Share, Facebook, Twitter, Link2, Mail, MessageCircle, Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface ShareListingPopupProps {
  listingId: string;
  listingName: string;
  trigger?: React.ReactNode;
}

export const ShareListingPopup = ({ listingId, listingName, trigger }: ShareListingPopupProps) => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = `${window.location.origin}/listing/${listingId}`;
  const shareMessage = `Check out "${listingName}" on ReBooked Living`;
  const encodedMessage = encodeURIComponent(shareMessage);
  const encodedUrl = encodeURIComponent(shareUrl);

  const shareOptions = [
    {
      name: "WhatsApp",
      icon: MessageCircle,
      color: "bg-green-500 hover:bg-green-600",
      url: `https://wa.me/?text=${encodedMessage}%20${encodedUrl}`,
    },
    {
      name: "Facebook",
      icon: Facebook,
      color: "bg-blue-600 hover:bg-blue-700",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedMessage}`,
    },
    {
      name: "Twitter / X",
      icon: Twitter,
      color: "bg-black hover:bg-gray-800",
      url: `https://twitter.com/intent/tweet?text=${encodedMessage}&url=${encodedUrl}`,
    },
    {
      name: "Email",
      icon: Mail,
      color: "bg-orange-500 hover:bg-orange-600",
      url: `mailto:?subject=${encodeURIComponent(`Check this out: ${listingName}`)}&body=${encodedMessage}%20${encodedUrl}`,
    },
  ];

  const handleShare = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer,width=600,height=400");
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      toast.success("Link copied!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  return (
    <>
      {trigger ? (
        <div onClick={() => setOpen(true)}>
          {trigger}
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md"
        >
          <Share className="w-4 h-4" />
          Share
        </button>
      )}

      {/* Modal Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/50"
          onClick={() => setOpen(false)}
        >
          {/* Modal Container */}
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Content */}
            <div
              style={{
                width: "min(90vw, 420px)",
                maxWidth: "100%",
              }}
              className="bg-white rounded-2xl shadow-lg"
            >
              {/* Header */}
              <div
                style={{
                  padding: "20px",
                  borderBottom: "1px solid #e5e7eb",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <Share className="w-4 h-4 text-primary flex-shrink-0" />
                <h2 style={{ fontSize: "16px", fontWeight: 600, margin: 0 }}>
                  Share this listing
                </h2>
                <button
                  onClick={() => setOpen(false)}
                  style={{
                    marginLeft: "auto",
                    background: "none",
                    border: "none",
                    fontSize: "20px",
                    cursor: "pointer",
                    opacity: 0.7,
                    padding: "4px 8px",
                    display: "flex",
                    alignItems: "center",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = "1";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = "0.7";
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Subtitle */}
              <p
                style={{
                  padding: "0 20px",
                  paddingTop: "12px",
                  fontSize: "12px",
                  color: "#6b7280",
                  margin: 0,
                }}
              >
                Share with friends
              </p>

              {/* Social Share Buttons */}
              <div
                style={{
                  padding: "16px 20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                {shareOptions.map((option) => {
                  const IconComponent = option.icon;
                  return (
                    <button
                      key={option.name}
                      onClick={() => handleShare(option.url)}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        padding: "10px 16px",
                        height: "40px",
                        backgroundColor:
                          option.color === "bg-green-500 hover:bg-green-600"
                            ? "#22c55e"
                            : option.color === "bg-blue-600 hover:bg-blue-700"
                              ? "#2563eb"
                              : option.color === "bg-black hover:bg-gray-800"
                                ? "#000000"
                                : "#f97316",
                        color: "white",
                        fontWeight: 500,
                        fontSize: "13px",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        transition: "background-color 0.2s",
                        minHeight: "40px",
                        boxSizing: "border-box",
                      }}
                      onMouseEnter={(e) => {
                        const bgMap: Record<string, string> = {
                          "#22c55e": "#16a34a",
                          "#2563eb": "#1d4ed8",
                          "#000000": "#1f2937",
                          "#f97316": "#c2410c",
                        };
                        e.currentTarget.style.backgroundColor =
                          bgMap[e.currentTarget.style.backgroundColor];
                      }}
                      onMouseLeave={(e) => {
                        const bgMap: Record<string, string> = {
                          "#16a34a": "#22c55e",
                          "#1d4ed8": "#2563eb",
                          "#1f2937": "#000000",
                          "#c2410c": "#f97316",
                        };
                        e.currentTarget.style.backgroundColor =
                          bgMap[e.currentTarget.style.backgroundColor];
                      }}
                    >
                      <IconComponent
                        className="w-4 h-4"
                        style={{ flexShrink: 0 }}
                      />
                      <span style={{ flexShrink: 0 }}>
                        {option.name}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Copy Link Section */}
              <div
                style={{
                  padding: "12px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  backgroundColor: "#f3f4f6",
                  borderRadius: "8px",
                  margin: "16px 20px",
                  boxSizing: "border-box",
                  minHeight: "40px",
                }}
              >
                <Link2
                  className="w-3.5 h-3.5"
                  style={{
                    flexShrink: 0,
                    color: "#9ca3af",
                  }}
                />
                <span
                  style={{
                    fontSize: "12px",
                    color: "#6b7280",
                    flex: 1,
                    minWidth: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {shareUrl}
                </span>
                <button
                  onClick={handleCopyLink}
                  style={{
                    flexShrink: 0,
                    background: "none",
                    border: "none",
                    padding: "6px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "4px",
                    transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(59, 130, 246, 0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5" style={{ color: "#10b981" }} />
                  ) : (
                    <Copy className="w-3.5 h-3.5" style={{ color: "#6b7280" }} />
                  )}
                </button>
              </div>

              {/* Footer Padding */}
              <div style={{ height: "12px" }} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ShareListingPopup;
