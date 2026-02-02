import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <Share className="w-4 h-4" />
            Share
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="w-screen max-w-sm rounded-2xl p-4 gap-0 overflow-hidden">
        <div className="flex flex-col gap-3 w-full">
          <div className="flex items-center gap-2">
            <Share className="w-4 h-4 text-primary flex-shrink-0" />
            <h2 className="text-base font-semibold">Share this listing</h2>
            <button
              onClick={() => setOpen(false)}
              className="ml-auto opacity-70 hover:opacity-100"
            >
              ✕
            </button>
          </div>

          <p className="text-xs text-muted-foreground -mt-1">
            Share with friends
          </p>

          {/* Social Share Buttons */}
          <div className="flex flex-col gap-1.5 w-full">
            {shareOptions.map((option) => {
              const IconComponent = option.icon;
              return (
                <button
                  key={option.name}
                  onClick={() => handleShare(option.url)}
                  className={`w-full flex items-center justify-center gap-2 text-white font-medium py-2 px-4 text-xs rounded ${option.color} transition-colors flex-shrink-0`}
                >
                  <IconComponent className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-shrink-0">{option.name}</span>
                </button>
              );
            })}
          </div>

          {/* Copy Link */}
          <div className="flex items-center gap-2 p-2.5 bg-muted rounded-lg w-full overflow-hidden">
            <Link2 className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
            <span className="text-xs text-muted-foreground truncate text-ellipsis overflow-hidden">{shareUrl}</span>
            <button
              onClick={handleCopyLink}
              className="flex-shrink-0 h-7 w-7 p-0 rounded hover:bg-primary/10 transition-colors"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareListingPopup;
