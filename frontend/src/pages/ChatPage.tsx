import React, { useEffect } from "react";
import { useChat } from "../hooks/useChat";
import { useChatStore } from "../state/chatStore";
import { useAuth } from "../state/AuthContext";
import {
  ChatLayout,
  ChatSidebar,
  ChatHeader,
  ChatMessages,
  ChatInput,
  ChatEmptyState,
} from "../components/chat";

export const ChatPage: React.FC = () => {
  const { fetchConversations, selectConversation, sendMessage, activeConversationId } = useChat();
  const { conversations, messages } = useChatStore();
  const { user } = useAuth();

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const activeMessages = activeConversationId ? messages[activeConversationId] || [] : [];
  const activeConversation = conversations.find((c) => c.id === activeConversationId);

  const handleSend = (message: string) => {
    if (activeConversationId) {
      sendMessage(activeConversationId, message);
    }
  };

  const handleBack = () => {
    selectConversation(null);
  };

  return (
    <div className="h-[calc(100vh-65px)]">
      <ChatLayout
        hasActiveConversation={!!activeConversationId}
        sidebar={
          <ChatSidebar
            conversations={conversations}
            activeConversationId={activeConversationId}
            onSelectConversation={selectConversation}
            title="Messages"
          />
        }
      >
        {activeConversationId ? (
          <>
            <ChatHeader
              conversationName={activeConversation?.name || `Chat #${activeConversationId}`}
              isGroup={activeConversation?.is_group}
              onBack={handleBack}
              showBackButton={true}
            />
            <ChatMessages
              messages={activeMessages}
              currentUserId={user?.id}
              emptyStateMessage="No messages yet. Start the conversation!"
            />
            <ChatInput onSend={handleSend} placeholder="Type a message..." />
          </>
        ) : (
          <ChatEmptyState
            title="Welcome to Support Chat"
            description="Select a conversation from the left to continue chatting with our team."
          />
        )}
      </ChatLayout>
    </div>
  );
};
