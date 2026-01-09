import React, { useEffect, useState } from "react";
import { useChat } from "../hooks/useChat";
import { useChatStore } from "../state/chatStore";
import { useAuth } from "../state/AuthContext";
import { format } from "date-fns";

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
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 border-r border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Messages
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => selectConversation(conv.id)}
              className={`p-4 cursor-pointer hover:bg-gray-800 transition-colors ${
                activeConversationId === conv.id ? "bg-gray-800 border-l-4 border-blue-500" : ""
              }`}
            >
              <div className="font-semibold text-gray-200">{conv.name || `Chat #${conv.id}`}</div>
              <div className="text-sm text-gray-400 truncate">{conv.last_message || "No messages yet"}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeConversationId ? (
          <>
            <div className="p-4 border-b border-gray-700 bg-gray-800/50 flex items-center justify-between">
              <div className="font-bold text-lg">
                {conversations.find((c) => c.id === activeConversationId)?.name || `Chat #${activeConversationId}`}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {activeMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender_id === user?.id ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs md:max-w-md p-3 rounded-2xl ${
                      msg.sender_id === user?.id
                        ? "bg-blue-600 text-white rounded-tr-none"
                        : "bg-gray-700 text-gray-200 rounded-tl-none"
                    }`}
                  >
                    <div>{msg.content}</div>
                    <div className="text-[10px] opacity-70 mt-1 text-right">
                      {format(new Date(msg.created_at), "HH:mm")}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSend} className="p-4 border-t border-gray-700 bg-gray-800/50">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-gray-700 border-none rounded-full px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-full p-2 w-10 h-10 flex items-center justify-center transition-colors"
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
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <div className="mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-16 h-16 mx-auto opacity-20"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7.5 8.25h9m-9 3h9m-9 3h3m-6.75 4.125a3 3 0 003 3h7.5a3 3 0 003-3V7.5a3 3 0 00-3-3h-7.5a3 3 0 00-3 3v10.625z"
                  />
                </svg>
              </div>
              <p className="text-lg">Select a conversation to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
