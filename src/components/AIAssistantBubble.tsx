import { useState } from "react";
import { MessageCircle, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAccessControl } from "@/hooks/useAccessControl";
import { AIChat } from "@/components/AIChat";

export const AIAssistantBubble = () => {
  const { accessLevel, isLoading } = useAccessControl();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const isPaidUser = accessLevel === "paid";

  // Don't render if user is not paid or still loading
  if (isLoading || !isPaidUser) {
    return null;
  }

  return (
    <>
      {/* Floating Chat Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all bg-primary hover:bg-primary/90"
          size="icon"
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <div className="relative">
              <MessageCircle className="w-6 h-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </div>
          )}
        </Button>
      </div>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-40 w-96 max-w-[calc(100vw-2rem)] shadow-2xl rounded-lg border bg-white">
          <AIChat onUnreadChange={setUnreadCount} />
        </div>
      )}
    </>
  );
};
