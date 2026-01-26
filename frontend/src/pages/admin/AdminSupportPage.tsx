import React, { useEffect, useState } from "react";
import { useChat } from "../../hooks/useChat";
import { useChatStore } from "../../state/chatStore";
import { useAuth } from "../../state/AuthContext";
import { BackButton } from "../../components/ui/BackButton";
import {
  ChatLayout,
  ChatSidebar,
  ChatHeader,
  ChatMessages,
  ChatInput,
  ChatEmptyState,
} from "../../components/chat";

export const AdminSupportPage: React.FC = () => {
  const { fetchConversations, selectConversation, sendMessage, activeConversationId } = useChat();
  const { conversations, messages } = useChatStore();
  const { user } = useAuth();
  const [filter, setFilter] = useState<"all" | "support">("support");

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const activeMessages = activeConversationId ? messages[activeConversationId] || [] : [];
  
  // Filter to show only support conversations (group chats with "Support" in name)
  const filteredConversations = filter === "support" 
    ? conversations.filter(c => c.is_group && c.name?.toLowerCase().includes("support"))
    : conversations;

  const activeConversation = filteredConversations.find((c) => c.id === activeConversationId);

  const handleSend = (message: string) => {
    if (activeConversationId) {
      sendMessage(activeConversationId, message);
    }
  };

  const handleBack = () => {
    selectConversation(null);
  };

  return (
    <div className="h-[calc(100vh-80px)]">
      <div className="mb-4 md:mb-6 flex flex-col gap-4">
        <BackButton />
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Customer Support</h1>
          <p className="text-sm md:text-base text-muted-foreground">Manage customer enquiries and support conversations</p>
        </div>
      </div>

      <div className="h-[calc(100%-120px)] md:h-[calc(100%-100px)] bg-card border border-border rounded-xl overflow-hidden shadow-lg">
        <ChatLayout
          hasActiveConversation={!!activeConversationId}
          sidebar={
            <ChatSidebar
              conversations={filteredConversations}
              activeConversationId={activeConversationId}
              onSelectConversation={selectConversation}
              title="Conversations"
              showFilter={true}
              filter={filter}
              onFilterChange={setFilter}
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
              <ChatInput
                onSend={handleSend}
                placeholder="Type your response..."
                buttonText="Send"
                showButtonText={true}
              />
            </>
          ) : (
            <ChatEmptyState
              title="Customer Support Dashboard"
              description="Select a conversation from the left to view and respond to customer enquiries."
            />
          )}
        </ChatLayout>
      </div>
    </div>
  );
};

export default AdminSupportPage;

