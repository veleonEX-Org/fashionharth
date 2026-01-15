import React, { useEffect, useState } from "react";
import { useChat } from "../hooks/useChat";
import { useChatStore } from "../state/chatStore";
import { useAuth } from "../state/AuthContext";
import { format } from "date-fns";
import { Input } from "../components/forms/Input";

export const ChatPage: React.FC = () => {
  const { fetchConversations, selectConversation, sendMessage, activeConversationId } = useChat();
  const { conversations, messages } = useChatStore();
  const { user } = useAuth();
  const [inputText, setInputText] = useState("");

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const activeMessages = activeConversationId ? messages[activeConversationId] || [] : [];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() && activeConversationId) {
      sendMessage(activeConversationId, inputText.trim());
      setInputText("");
    }
  };

  return (
    <div className="flex h-[calc(100vh-65px)] bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 border-r border-border flex flex-col bg-muted/10">
        <div className="p-4 border-b border-border bg-card/50">
          <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Messages
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 && (
             <div className="p-4 text-center text-sm text-muted-foreground">
               No conversations yet.
             </div>
          )}
          {conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => selectConversation(conv.id)}
              className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors border-l-4 ${
                activeConversationId === conv.id ? "bg-muted/50 border-primary" : "border-transparent"
              }`}
            >
              <div className="font-semibold text-foreground flex justify-between items-center">
                 <span>{conv.name || `Chat #${conv.id}`}</span>
                 {conv.is_group && <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">Group</span>}
              </div>
              <div className="text-sm text-muted-foreground truncate font-medium">
                {conv.last_message || "No messages yet"}
              </div>
              {conv.last_message_at && (
                <div className="text-[10px] text-muted-foreground mt-1 text-right">
                  {format(new Date(conv.last_message_at), 'MMM d, h:mm a')}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-background relative">
        {activeConversationId ? (
          <>
            <div className="p-4 border-b border-border bg-card/50 flex items-center justify-between sticky top-0 z-10 backdrop-blur-sm">
              <div className="font-bold text-lg flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-black">
                   #
                </div>
                {conversations.find((c) => c.id === activeConversationId)?.name || `Chat #${activeConversationId}`}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {activeMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender_id === user?.id ? "justify-end" : "justify-start"}`}
                >
                  <div className={`flex flex-col ${msg.sender_id === user?.id ? "items-end" : "items-start"} max-w-[80%]`}>
                    <div
                      className={`px-4 py-3 rounded-2xl shadow-sm ${
                        msg.sender_id === user?.id
                          ? "bg-primary text-primary-foreground rounded-tr-none"
                          : "bg-muted text-foreground rounded-tl-none border border-border"
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-1 px-1">
                      {format(new Date(msg.created_at), "h:mm a")}
                    </div>
                  </div>
                </div>
              ))}
              <div id="messages-end" />
            </div>

            <form onSubmit={handleSend} className="p-4 border-t border-border bg-card/50">
              <div className="flex gap-2 max-w-4xl mx-auto">
                <Input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type a message..."
                  className="rounded-full px-4 border-input bg-muted/30 focus:bg-background h-12"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-white rounded-full p-2 w-12 h-12 flex items-center justify-center transition-all shadow-md active:scale-95"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5 transform rotate-90"
                  >
                    <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                  </svg>
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground bg-muted/5">
            <div className="text-center p-8 max-w-md">
              <div className="mb-6 flex justify-center">
                <div className="h-24 w-24 rounded-full bg-primary/5 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-10 h-10 text-primary/40"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-2.281l-9.8-9.8c-.641-.641-1.75-.295-1.75.606V4.5a2.25 2.25 0 00-2.25 2.25m19.5 0a2.25 2.25 0 00-2.25-2.25S5.25 2.25 5.25 11.25m15 0V15a2.25 2.25 0 01-2.25 2.25H5.25"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Welcome to Support Chat</h3>
              <p className="text-sm">Select a conversation from the left to continue chatting with our team.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
