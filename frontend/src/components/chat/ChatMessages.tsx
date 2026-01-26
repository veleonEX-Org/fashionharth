import React, { useEffect, useRef } from "react";
import { format } from "date-fns";
import { MessageCircle, Clock } from "lucide-react";

interface Message {
  id: number;
  content: string;
  sender_id: number;
  created_at: string;
}

interface ChatMessagesProps {
  messages: Message[];
  currentUserId?: number;
  emptyStateMessage?: string;
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({
  messages,
  currentUserId,
  emptyStateMessage = "No messages yet. Start the conversation!",
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6">
      {messages.length === 0 && (
        <div className="text-center text-muted-foreground py-12">
          <MessageCircle size={48} className="mx-auto mb-3 opacity-20" />
          <p className="text-sm md:text-base">{emptyStateMessage}</p>
        </div>
      )}
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex ${msg.sender_id === currentUserId ? "justify-end" : "justify-start"}`}
        >
          <div className={`flex flex-col ${msg.sender_id === currentUserId ? "items-end" : "items-start"} max-w-[85%] md:max-w-[75%]`}>
            <div
              className={`px-3 py-2 md:px-4 md:py-3 rounded-2xl shadow-sm ${
                msg.sender_id === currentUserId
                  ? "bg-primary text-primary-foreground rounded-tr-none"
                  : "bg-muted text-foreground rounded-tl-none border border-border"
              }`}
            >
              <div className="whitespace-pre-wrap break-words text-sm md:text-base">{msg.content}</div>
            </div>
            <div className="text-[10px] text-muted-foreground mt-1 px-1 flex items-center gap-1">
              <Clock size={10} />
              {format(new Date(msg.created_at), "MMM d, h:mm a")}
            </div>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};
