import React from "react";
import { MessageCircle, ArrowLeft } from "lucide-react";

interface ChatHeaderProps {
  conversationName: string;
  isGroup?: boolean;
  onBack?: () => void;
  showBackButton?: boolean;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  conversationName,
  isGroup = false,
  onBack,
  showBackButton = false,
}) => {
  return (
    <div className="p-4 border-b border-border bg-card/50 flex items-center gap-3 sticky top-0 z-10 backdrop-blur-sm">
      {showBackButton && onBack && (
        <button
          onClick={onBack}
          className="lg:hidden p-2 hover:bg-muted rounded-full transition-colors"
          aria-label="Back to conversations"
        >
          <ArrowLeft size={20} />
        </button>
      )}
      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
        <MessageCircle size={20} className="text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-bold text-lg truncate">{conversationName}</div>
      </div>
    </div>
  );
};
