import React from "react";
import { MessageCircle } from "lucide-react";

interface ChatEmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export const ChatEmptyState: React.FC<ChatEmptyStateProps> = ({
  title,
  description,
  icon,
}) => {
  return (
    <div className="flex-1 flex items-center justify-center text-muted-foreground bg-muted/5 p-4">
      <div className="text-center p-4 md:p-8 max-w-md">
        <div className="mb-4 md:mb-6 flex justify-center">
          <div className="h-20 w-20 md:h-24 md:w-24 rounded-full bg-primary/5 flex items-center justify-center">
            {icon || <MessageCircle size={40} className="text-primary/40" />}
          </div>
        </div>
        <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2">{title}</h3>
        <p className="text-sm md:text-base">{description}</p>
      </div>
    </div>
  );
};
