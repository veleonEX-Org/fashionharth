import { useEffect, useCallback } from "react";
import { socketService } from "../lib/socket";
import { useChatStore } from "../state/chatStore";
import { http } from "../api/http"; // Assuming this is where axios is configured

export const useChat = () => {
  const { 
    setActiveConversation, 
    addMessage, 
    setMessages, 
    setConversations,
    activeConversationId 
  } = useChatStore();

  const fetchConversations = useCallback(async () => {
    try {
      const response = await http.get("/chat/conversations");
      setConversations(response.data);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  }, [setConversations]);

  const fetchMessages = useCallback(async (conversationId: number) => {
    try {
      const response = await http.get(`/chat/conversations/${conversationId}/messages`);
      setMessages(conversationId, response.data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  }, [setMessages]);

  const sendMessage = useCallback((conversationId: number, content: string) => {
    const socket = socketService.getSocket();
    if (socket) {
      socket.emit("send_message", { conversationId, content });
    }
  }, []);

  const selectConversation = useCallback((conversationId: number | null) => {
    setActiveConversation(conversationId);
    if (conversationId === null) return;
    
    const socket = socketService.getSocket();
    if (socket) {
      socket.emit("join_conversation", conversationId);
    }
    fetchMessages(conversationId);
  }, [setActiveConversation, fetchMessages]);

  useEffect(() => {
    const socket = socketService.getSocket();
    if (!socket) return;

    socket.on("new_message", (message) => {
      addMessage(message);
      // Update conversations list to show last message
      fetchConversations();
    });

    socket.on("error", (error) => {
      console.error("Socket error event:", error.message);
    });

    socket.on("new_conversation", () => {
      fetchConversations();
    });

    return () => {
      socket.off("new_message");
      socket.off("new_conversation");
      socket.off("error");
    };
  }, [addMessage, fetchConversations]);

  return {
    sendMessage,
    selectConversation,
    fetchConversations,
    activeConversationId
  };
};
