import React from "react";
import { format } from "date-fns";
import { MessageCircle, Users, Clock } from "lucide-react";

interface Conversation {
  id: number;
  name?: string;
  is_group?: boolean;
  last_message?: string;
  last_message_at?: string;
}

interface ChatSidebarProps {
  conversations: Conversation[];
  activeConversationId: number | null;
  onSelectConversation: (id: number) => void;
  title?: string;
  showFilter?: boolean;
  filter?: "all" | "support";
  onFilterChange?: (filter: "all" | "support") => void;
  className?: string;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  title = "Messages",
  showFilter = false,
  filter = "all",
  onFilterChange,
  className = "",
}) => {
  return (
    <div className={`border-r border-border flex flex-col bg-muted/5 ${className}`}>
      <div className="p-4 border-b border-border bg-card/50">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <MessageCircle size={20} className="text-primary" />
            {title}
          </h2>
          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-semibold">
            {conversations.length}
          </span>
        </div>
        
        {showFilter && onFilterChange && (
          <div className="flex gap-2">
            <button
              onClick={() => onFilterChange("support")}
              className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                filter === "support" 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Support Only
            </button>
            <button
              onClick={() => onFilterChange("all")}
              className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                filter === "all" 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              All Chats
            </button>
          </div>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 && (
          <div className="p-6 text-center">
            <MessageCircle size={40} className="mx-auto text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">No conversations yet</p>
          </div>
        )}
        {conversations.map((conv) => (
          <div
            key={conv.id}
            onClick={() => onSelectConversation(conv.id)}
            className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors border-l-4 ${
              activeConversationId === conv.id ? "bg-muted/50 border-primary" : "border-transparent"
            }`}
          >
            <div className="flex items-start justify-between mb-1">
              <div className="font-semibold text-foreground flex items-center gap-2 flex-1 min-w-0">
                {conv.is_group && <Users size={14} className="text-primary flex-shrink-0" />}
                <span className="truncate">{conv.name || `Chat #${conv.id}`}</span>
              </div>
              {conv.last_message_at && (
                <div className="text-[10px] text-muted-foreground flex items-center gap-1 flex-shrink-0 ml-2">
                  <Clock size={10} />
                  {format(new Date(conv.last_message_at), 'MMM d')}
                </div>
              )}
            </div>
            <div className="text-sm text-muted-foreground truncate">
              {conv.last_message || "No messages yet"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
