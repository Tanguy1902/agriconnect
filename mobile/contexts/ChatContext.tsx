import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { chatService, Message, ConversationSummary } from '../services/chat';
import { API_URL } from '../constants/Colors';

interface ChatContextType {
  conversations: ConversationSummary[];
  activeChatMessages: Message[];
  unreadCount: number;
  isLoading: boolean;
  sendMessage: (recipientId: number, content: string, imageUrl?: string) => Promise<void>;
  markConversationAsRead: (userId: number) => Promise<void>;
  loadConversations: () => Promise<void>;
  loadMessageHistory: (userId: number) => Promise<void>;
  activeChatUserId: number | null;
  setActiveChatUserId: (userId: number | null) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const { user, isAuthenticated } = useAuth();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [activeChatMessages, setActiveChatMessages] = useState<Message[]>([]);
  const [activeChatUserId, setActiveChatUserId] = useState<number | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [socket, setSocket] = useState<WebSocket | null>(null);

  const loadConversations = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const data = await chatService.getConversations();
      setConversations(data);
      const countData = await chatService.getUnreadCount();
      setUnreadCount(countData.count);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  }, [isAuthenticated]);

  const loadMessageHistory = useCallback(async (userId: number) => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const data = await chatService.getMessageHistory(userId);
      setActiveChatMessages(data);
    } catch (error) {
      console.error('Error loading message history:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const sendMessage = async (recipientId: number, content: string, imageUrl?: string) => {
    try {
      const newMessage = await chatService.sendMessage({ recipient_id: recipientId, content, image_url: imageUrl });
      // Message will also arrive via WebSocket, so we check for existence before adding
      if (activeChatUserId === recipientId) {
        setActiveChatMessages(prev => {
          const exists = prev.some(m => m.id === newMessage.id);
          return exists ? prev : [...prev, newMessage];
        });
      }
      loadConversations();
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  const markConversationAsRead = async (userId: number) => {
    try {
      await chatService.markAsRead(userId);
      setConversations(prev => 
        prev.map(conv => conv.user_id === userId ? { ...conv, unread_count: 0 } : conv)
      );
      const countData = await chatService.getUnreadCount();
      setUnreadCount(countData.count);
    } catch (error) {
      console.error('Error marking conversation as read:', error);
    }
  };

  // WebSocket Connection
  useEffect(() => {
    if (isAuthenticated && user) {
      const wsUrl = API_URL.replace('http', 'ws');
      const ws = new WebSocket(`${wsUrl}/api/chats/ws/${user.id}`);

      ws.onopen = () => {
        console.log('Chat WebSocket connected');
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('Chat WebSocket message received:', data);
        
        // Update unread count and conversations list
        loadConversations();

        // If message is for active chat, update history
        if (activeChatUserId && (data.sender_id === activeChatUserId || data.recipient_id === activeChatUserId)) {
          // Check if message is already in list (from optimistic update)
          setActiveChatMessages(prev => {
            const exists = prev.some(m => m.id === data.id);
            return exists ? prev : [...prev, data];
          });
          
          // If we're looking at the chat, mark as read
          if (data.sender_id === activeChatUserId) {
            markConversationAsRead(activeChatUserId);
          }
        }
      };

      ws.onerror = (e) => {
        console.error('Chat WebSocket error:', e);
      };

      ws.onclose = () => {
        console.log('Chat WebSocket disconnected');
      };

      setSocket(ws);

      return () => {
        ws.close();
      };
    }
  }, [isAuthenticated, user, activeChatUserId, loadConversations]);

  // Initial data load and cleanup
  useEffect(() => {
    if (isAuthenticated) {
      loadConversations();
    } else {
      // Clear state on logout
      setConversations([]);
      setActiveChatMessages([]);
      setUnreadCount(0);
      setActiveChatUserId(null);
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [isAuthenticated, loadConversations]);

  return (
    <ChatContext.Provider
      value={{
        conversations,
        activeChatMessages,
        unreadCount,
        isLoading,
        sendMessage,
        markConversationAsRead,
        loadConversations,
        loadMessageHistory,
        activeChatUserId,
        setActiveChatUserId,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
