"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faUser, faCircle, faPaperclip, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useTranslations } from 'next-intl';
import { parseBackendDate } from '@/utils/dateUtils';

interface Conversation {
  user_id: number;
  full_name: string;
  profile_picture: string | null;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

interface Message {
  id: number;
  sender_id: number;
  recipient_id: number;
  content: string;
  image_url: string | null;
  timestamp: string;
  is_read: boolean;
}

export default function ChatPage() {
  const t = useTranslations('Chat');
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const initialUserId = searchParams.get('user_id');
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<number | null>(initialUserId ? parseInt(initialUserId) : null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const socketRef = useRef<WebSocket | null>(null);

  // Load conversations on mount
  useEffect(() => {
    fetchConversations();
  }, []);

  // WebSocket Connection
  useEffect(() => {
    if (!user) return;

    // Connect to WebSocket
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.hostname}:8000/api/chats/ws/${user.id}`;
    
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("WebSocket Connected");
    };

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      
      // If message belongs to active conversation, add it
      if (activeConversation && (message.sender_id === activeConversation || message.recipient_id === activeConversation)) {
        setMessages(prev => {
          // Avoid duplicates
          if (prev.some(m => m.id === message.id)) return prev;
          return [...prev, message];
        });
        
        // Mark as read if we are looking at this conversation
        if (message.sender_id === activeConversation) {
           markAsRead(activeConversation);
        }
      }
      
      // Update conversations list (to show new message preview / unread count)
      fetchConversations();
      
      // Play sound if it's an incoming message
      if (message.sender_id !== user.id) {
        import('@/utils/sound').then(mod => mod.playNotificationSound());
      }
    };

    socket.onclose = () => {
      console.log("WebSocket Disconnected");
    };

    return () => {
      socket.close();
    };
  }, [user, activeConversation]);

  // Load messages when active conversation changes
  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation);
      // Mark as read
      markAsRead(activeConversation);
    }
  }, [activeConversation]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const response = await api.get('/chats/conversations');
      setConversations(response.data);
      
      // If active conversation is set but not in list (new chat), fetch user details?
      // For now, we assume the list is enough or we handle "new chat" logic separately
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (userId: number) => {
    try {
      const response = await api.get(`/chats/${userId}`);
      setMessages(response.data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const markAsRead = async (userId: number) => {
    try {
      await api.put(`/chats/${userId}/read`);
      // Update local unread count
      setConversations(prev => prev.map(c => 
        c.user_id === userId ? { ...c, unread_count: 0 } : c
      ));
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedImage) || !activeConversation) return;

    try {
      let imageUrl = null;
      
      if (selectedImage) {
        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', selectedImage);
        const uploadRes = await api.post('/chats/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        imageUrl = uploadRes.data.url;
      }

      const response = await api.post('/chats/', {
        recipient_id: activeConversation,
        content: newMessage,
        image_url: imageUrl
      });
      
      // Add to local list
      setMessages([...messages, response.data]);
      setNewMessage("");
      removeSelectedImage();
      
      // Update conversation list (move to top, update last message)
      fetchConversations();
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatTime = (dateString: string) => {
    const date = parseBackendDate(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) return <div className="p-8 text-center">{t('loading')}</div>;

  return (
    <div className="flex h-[calc(100vh-100px)] bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
      {/* Sidebar - Conversations List */}
      <div className="w-1/3 border-r border-gray-100 bg-gray-50 flex flex-col">
        <div className="p-4 border-b border-gray-100 bg-white">
          <h2 className="font-bold text-lg text-gray-800">{t('title')}</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              {t('noConversations')}
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.user_id}
                onClick={() => setActiveConversation(conv.user_id)}
                className={`p-4 cursor-pointer hover:bg-white transition-colors border-b border-gray-100 ${
                  activeConversation === conv.user_id ? 'bg-white border-l-4 border-l-green-600 shadow-sm' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {conv.profile_picture ? (
                      <img 
                        src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${conv.profile_picture}`} 
                        alt={conv.full_name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                        <FontAwesomeIcon icon={faUser} />
                      </div>
                    )}
                    {conv.unread_count > 0 && (
                      <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                        {conv.unread_count}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-semibold text-gray-800 truncate">{conv.full_name}</h3>
                      <span className="text-xs text-gray-400">{formatTime(conv.last_message_time)}</span>
                    </div>
                    <p className={`text-sm truncate ${conv.unread_count > 0 ? 'font-semibold text-gray-700' : 'text-gray-500'}`}>
                      {conv.last_message}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-100 flex items-center gap-3 bg-white shadow-sm z-10">
              {/* Find active user details */}
              {(() => {
                const activeUser = conversations.find(c => c.user_id === activeConversation);
                // If not in list (new chat), we might need to fetch or show placeholder
                // For now, let's assume we can find it or it's a new chat initiated from profile
                return (
                  <>
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 overflow-hidden relative">
                       {activeUser?.profile_picture ? (
                          <img 
                            src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${activeUser.profile_picture}`} 
                            className="w-full h-full rounded-full object-cover"
                            alt={activeUser.full_name}
                          />
                       ) : <FontAwesomeIcon icon={faUser} />}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">{activeUser?.full_name || `${t('user')} #${activeConversation}`}</h3>
                      <div className="flex items-center gap-1 text-xs text-green-600">
                        <FontAwesomeIcon icon={faCircle} className="w-2 h-2" />
                        <span>{t('online')}</span>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
              {messages.map((msg, index) => {
                const isMe = msg.sender_id === user?.id;
                const activeUser = conversations.find(c => c.user_id === activeConversation);
                
                // Show avatar only for the first message in a sequence or if it's the other user
                const showAvatar = index === 0 || messages[index - 1].sender_id !== msg.sender_id;

                return (
                  <div key={msg.id} className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs overflow-hidden ${
                      showAvatar ? (isMe ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500') : 'opacity-0'
                    }`}>
                      {showAvatar && (
                        isMe ? (
                          user?.profile_picture ? (
                            <img src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${user.profile_picture}`} className="w-full h-full object-cover" alt="Me" />
                          ) : user?.full_name.charAt(0).toUpperCase()
                        ) : (
                          activeUser?.profile_picture ? (
                            <img src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${activeUser.profile_picture}`} className="w-full h-full object-cover" alt={activeUser.full_name} />
                          ) : <FontAwesomeIcon icon={faUser} />
                        )
                      )}
                    </div>

                    {/* Message Bubble */}
                    <div className={`max-w-[70%] rounded-2xl px-4 py-2 shadow-sm ${
                      isMe 
                        ? 'bg-green-600 text-white rounded-br-none' 
                        : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                    }`}>
                      {msg.image_url && (
                        <div className="mb-2 rounded-lg overflow-hidden border border-black/5">
                          <img 
                            src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${msg.image_url}?token=${localStorage.getItem('token')}`} 
                            alt="Shared" 
                            className="max-w-full h-auto cursor-pointer hover:opacity-95 transition-opacity"
                            onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${msg.image_url}?token=${localStorage.getItem('token')}`, '_blank')}
                          />
                        </div>
                      )}
                      {msg.content && <p className="text-sm">{msg.content}</p>}
                      <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-green-100' : 'text-gray-400'}`}>
                        {formatTime(msg.timestamp)}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100">
              {imagePreview && (
                <div className="mb-3 relative inline-block">
                  <img src={imagePreview} alt="Preview" className="h-20 w-20 object-cover rounded-lg border border-gray-200" />
                  <button 
                    onClick={removeSelectedImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs shadow-md hover:bg-red-600"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>
              )}
              <form onSubmit={sendMessage} className="flex gap-2 items-center">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageSelect} 
                  accept="image/*" 
                  className="hidden" 
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-10 h-10 text-gray-400 hover:text-green-600 transition-colors flex items-center justify-center"
                >
                  <FontAwesomeIcon icon={faPaperclip} className="text-xl" />
                </button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={t('placeholder')}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50"
                />
                <button
                  type="submit"
                  disabled={(!newMessage.trim() && !selectedImage) || isUploading}
                  className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  {isUploading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <FontAwesomeIcon icon={faPaperPlane} className="w-4 h-4" />
                  )}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50/30">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FontAwesomeIcon icon={faPaperPlane} className="w-6 h-6 text-gray-300" />
            </div>
            <p>{t('selectConversation')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
