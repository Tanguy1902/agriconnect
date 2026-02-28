import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Image } from 'react-native';
import { useChat } from '../../contexts/ChatContext';
import { FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function ChatScreen() {
  const { conversations, isLoading, loadConversations } = useChat();

  useEffect(() => {
    loadConversations();
  }, []);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 24 * 60 * 60 * 1000) {
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView 
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={loadConversations} />
        }
      >
        {conversations.length === 0 ? (
          <View className="py-20 items-center justify-center px-6">
            <View className="w-20 h-20 bg-gray-50 rounded-full items-center justify-center mb-4">
              <FontAwesome name="comments-o" size={40} color="#cbd5e1" />
            </View>
            <Text className="text-gray-500 text-center text-lg">
              Aucune conversation pour le moment.
            </Text>
            <Text className="text-gray-400 text-center mt-2">
              Trouvez un partenaire dans le marché pour commencer à discuter !
            </Text>
          </View>
        ) : (
          conversations.map((conv) => (
            <TouchableOpacity 
              key={conv.user_id}
              className="flex-row items-center p-4 border-b border-gray-50"
              onPress={() => router.push(`/chat/${conv.user_id}`)}
            >
              <View className="w-14 h-14 rounded-full bg-gray-100 items-center justify-center">
                {conv.profile_picture ? (
                  <Image source={{ uri: conv.profile_picture }} className="w-full h-full rounded-full" />
                ) : (
                  <FontAwesome name="user" size={24} color="#94a3b8" />
                )}
              </View>
              
              <View className="flex-1 ml-4">
                <View className="flex-row justify-between items-center mb-1">
                  <Text className="text-lg font-bold text-gray-900" numberOfLines={1}>
                    {conv.full_name}
                  </Text>
                  <Text className="text-xs text-gray-400">
                    {formatTime(conv.last_message_time)}
                  </Text>
                </View>
                
                <View className="flex-row justify-between items-center">
                  <Text className="text-gray-500 flex-1 mr-2" numberOfLines={1}>
                    {conv.last_message}
                  </Text>
                  {conv.unread_count > 0 && (
                    <View className="bg-[#059669] rounded-full min-w-[20px] h-5 px-1.5 items-center justify-center">
                      <Text className="text-white text-[10px] font-bold">
                        {conv.unread_count}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}
