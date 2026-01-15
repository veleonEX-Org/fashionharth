import React, { useEffect, useState } from "react";
import { useChat } from "../../hooks/useChat";
import { useChatStore } from "../../state/chatStore";
import { useAuth } from "../../state/AuthContext";
import { format } from "date-fns";
import { Input } from "../../components/forms/Input";
import { MessageCircle, Users, Clock } from "lucide-react";
import { BackButton } from "../../components/ui/BackButton";

export const StaffSupportPage: React.FC = () => {
  const { fetchConversations, selectConversation, sendMessage, activeConversationId } = useChat();
  const { conversations, messages } = useChatStore();
  const { user } = useAuth();
  const [inputText, setInputText] = useState("");
  const [filter, setFilter] = useState<"all" | "support">("support");

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const activeMessages = activeConversationId ? messages[activeConversationId] || [] : [];
  
  // Filter to show only support conversations (group chats with "Support" in name)
  const filteredConversations = filter === "support" 
    ? conversations.filter(c => c.is_group && c.name?.toLowerCase().includes("support"))
    : conversations;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() && activeConversationId) {
      sendMessage(activeConversationId, inputText.trim());
      setInputText("");
    }
  };

  return (
    <div className="h-[calc(100vh-80px)]">
      <div className="mb-6 flex flex-col gap-4">
        <BackButton />
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Customer Support</h1>
          <p className="text-muted-foreground">Manage customer enquiries and support conversations</p>
        </div>
      </div>

      <div className="flex h-[calc(100%-100px)] bg-card border border-border rounded-xl overflow-hidden shadow-lg">
        {/* Sidebar */}
        <div className="w-96 border-r border-border flex flex-col bg-muted/5">
          <div className="p-4 border-b border-border bg-card/50">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <MessageCircle size={20} className="text-primary" />
                Conversations
              </h2>
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-semibold">
                {filteredConversations.length}
              </span>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setFilter("support")}
                className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  filter === "support" 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                Support Only
              </button>
              <button
                onClick={() => setFilter("all")}
                className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  filter === "all" 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                All Chats
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 && (
              <div className="p-6 text-center">
                <MessageCircle size={40} className="mx-auto text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">No conversations yet</p>
              </div>
            )}
            {filteredConversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => selectConversation(conv.id)}
                className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors border-l-4 ${
                  activeConversationId === conv.id ? "bg-muted/50 border-primary" : "border-transparent"
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <div className="font-semibold text-foreground flex items-center gap-2">
                    {conv.is_group && <Users size={14} className="text-primary" />}
                    <span className="truncate">{conv.name || `Chat #${conv.id}`}</span>
                  </div>
                  {conv.last_message_at && (
                    <div className="text-[10px] text-muted-foreground flex items-center gap-1">
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

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-background">
          {activeConversationId ? (
            <>
              <div className="p-4 border-b border-border bg-card/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <MessageCircle size={20} className="text-primary" />
                  </div>
                  <div>
                    <div className="font-bold text-lg">
                      {conversations.find((c) => c.id === activeConversationId)?.name || `Chat #${activeConversationId}`}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {conversations.find((c) => c.id === activeConversationId)?.is_group && "Group Conversation"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {activeMessages.length === 0 && (
                  <div className="text-center text-muted-foreground py-12">
                    <MessageCircle size={48} className="mx-auto mb-3 opacity-20" />
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                )}
                {activeMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender_id === user?.id ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`flex flex-col ${msg.sender_id === user?.id ? "items-end" : "items-start"} max-w-[75%]`}>
                      <div
                        className={`px-4 py-3 rounded-2xl shadow-sm ${
                          msg.sender_id === user?.id
                            ? "bg-primary text-primary-foreground rounded-tr-none"
                            : "bg-muted text-foreground rounded-tl-none border border-border"
                        }`}
                      >
                        <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-1 px-1 flex items-center gap-1">
                        <Clock size={10} />
                        {format(new Date(msg.created_at), "MMM d, h:mm a")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSend} className="p-4 border-t border-border bg-card/50">
                <div className="flex gap-3 max-w-4xl mx-auto">
                  <Input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type your response..."
                    className="rounded-full px-5 border-input bg-background h-12 text-sm"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full px-6 h-12 flex items-center justify-center transition-all shadow-md active:scale-95 font-medium text-sm"
                  >
                    Send
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground bg-muted/5">
              <div className="text-center p-8 max-w-md">
                <div className="mb-6 flex justify-center">
                  <div className="h-24 w-24 rounded-full bg-primary/5 flex items-center justify-center">
                    <MessageCircle size={40} className="text-primary/40" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Customer Support Dashboard</h3>
                <p className="text-sm">Select a conversation from the left to view and respond to customer enquiries.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffSupportPage;
