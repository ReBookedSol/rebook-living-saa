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
      <DialogContent className="w-[92vw] max-w-sm sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Share className="w-5 h-5 text-primary" />
            Share this listing
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Share <span className="font-medium text-foreground">{listingName}</span> with friends
          </p>

          {/* Social Share Buttons */}
          <div className="grid grid-cols-2 gap-3">
            {shareOptions.map((option) => (
              <Button
                key={option.name}
                variant="outline"
                className={`flex items-center gap-2 text-white ${option.color}`}
                onClick={() => handleShare(option.url)}
              >
                <option.icon className="w-4 h-4" />
                {option.name}
              </Button>
            ))}
          </div>

          {/* Copy Link */}
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <Link2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <span className="text-sm truncate flex-1">{shareUrl}</span>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleCopyLink}
              className="gap-1"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareListingPopup;
