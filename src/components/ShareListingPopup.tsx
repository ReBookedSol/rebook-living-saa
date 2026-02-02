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
      <DialogContent className="w-[90vw] sm:w-full max-w-2xl rounded-2xl p-4 sm:p-6 gap-3 overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Share className="w-5 h-5 text-primary" />
            Share this listing
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 w-full">
          <p className="text-sm text-muted-foreground">
            Share with friends
          </p>

          {/* Social Share Buttons */}
          <div className="flex flex-col gap-2 w-full">
            {shareOptions.map((option) => (
              <Button
                key={option.name}
                className={`w-full flex items-center justify-center gap-2 text-white font-medium py-2 text-sm overflow-hidden ${option.color}`}
                onClick={() => handleShare(option.url)}
              >
                <option.icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{option.name}</span>
              </Button>
            ))}
          </div>

          {/* Copy Link */}
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg overflow-hidden">
            <Link2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <span className="text-xs text-muted-foreground overflow-hidden text-ellipsis whitespace-nowrap flex-1 min-w-0">{shareUrl}</span>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleCopyLink}
              className="flex-shrink-0 h-8 w-8 p-0"
            >
              {copied ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareListingPopup;
