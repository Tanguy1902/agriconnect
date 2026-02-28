import api from './api';

export interface Message {
  id: number;
  sender_id: number;
  recipient_id: number;
  content: string;
  image_url?: string;
  timestamp: string;
  is_read: boolean;
}

export interface ConversationSummary {
  user_id: number;
  full_name: string;
  profile_picture?: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

export interface MessageCreate {
  recipient_id: number;
  content: string;
  image_url?: string;
}

export const chatService = {
  async getConversations(): Promise<ConversationSummary[]> {
    const response = await api.get<ConversationSummary[]>('/chats/conversations');
    return response.data;
  },

  async getMessageHistory(userId: number): Promise<Message[]> {
    const response = await api.get<Message[]>(`/chats/${userId}`);
    return response.data;
  },

  async sendMessage(data: MessageCreate): Promise<Message> {
    const response = await api.post<Message>('/chats/', data);
    return response.data;
  },

  async markAsRead(userId: number): Promise<void> {
    await api.put(`/chats/${userId}/read`);
  },

  async getUnreadCount(): Promise<{ count: number }> {
    const response = await api.get<{ count: number }>('/chats/unread-count');
    return response.data;
  },

  async uploadImage(imageUri: string): Promise<{ url: string }> {
    const formData = new FormData();
    const filename = imageUri.split('/').pop() || 'image.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image`;

    formData.append('file', {
      uri: imageUri,
      name: filename,
      type,
    } as any);

    const response = await api.post<{ url: string }>('/chats/upload', formData);
    return response.data;
  },
};
