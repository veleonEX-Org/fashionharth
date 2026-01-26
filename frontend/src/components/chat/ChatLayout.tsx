import React, { useState } from "react";

interface ChatLayoutProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
  hasActiveConversation: boolean;
}

export const ChatLayout: React.FC<ChatLayoutProps> = ({
  sidebar,
  children,
  hasActiveConversation,
}) => {
  const [showSidebar, setShowSidebar] = useState(true);

  // On mobile, hide sidebar when a conversation is active
  // On desktop, always show both
  const sidebarVisible = showSidebar || !hasActiveConversation;

  return (
    <div className="flex h-full bg-background text-foreground overflow-hidden">
      {/* Sidebar - hidden on mobile when chat is active */}
      <div
        className={`${
          hasActiveConversation ? "hidden lg:flex" : "flex"
        } w-full lg:w-80 xl:w-96 flex-shrink-0`}
      >
        {sidebar}
      </div>

      {/* Main Chat Area - hidden on mobile when no active conversation */}
      <div
        className={`${
          !hasActiveConversation ? "hidden lg:flex" : "flex"
        } flex-1 flex-col bg-background min-w-0`}
      >
        {children}
      </div>
    </div>
  );
};
