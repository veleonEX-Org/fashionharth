export interface Conversation {
  id: number;
  name?: string;
  is_group: boolean;
  created_at: Date;
  updated_at: Date;
  last_message?: string;
  last_message_at?: Date;
}

export interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  content: string;
  message_type: 'text' | 'image' | 'file';
  is_read: boolean;
  created_at: Date;
}

export interface ConversationMember {
  conversation_id: number;
  user_id: number;
  joined_at: Date;
}
