import { create } from "zustand";

interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  content: string;
  message_type: string;
  created_at: string;
}

interface Conversation {
  id: number;
  name: string;
  is_group: boolean;
  last_message: string;
  last_message_at: string;
}

interface ChatState {
  conversations: Conversation[];
  activeConversationId: number | null;
  messages: Record<number, Message[]>; // conversationId -> messages
  setConversations: (conversations: Conversation[]) => void;
  setActiveConversation: (id: number | null) => void;
  setMessages: (conversationId: number, messages: Message[]) => void;
  addMessage: (message: Message) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  conversations: [],
  activeConversationId: null,
  messages: {},
  setConversations: (conversations) => set({ conversations }),
  setActiveConversation: (id) => set({ activeConversationId: id }),
  setMessages: (conversationId, messages) => 
    set((state) => ({ 
      messages: { ...state.messages, [conversationId]: messages } 
    })),
  addMessage: (message) => 
    set((state) => {
      const convMessages = state.messages[message.conversation_id] || [];
      return {
        messages: {
          ...state.messages,
          [message.conversation_id]: [...convMessages, message]
        }
      };
    }),
}));
