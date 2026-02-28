import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator, Image } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import { Message, chatService } from '../../services/chat';
import { authService } from '../../services/auth';
import { FontAwesome } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { API_URL } from '../../constants/Colors';

export default function IndividualChatScreen() {
  const { id } = useLocalSearchParams();
  const userId = parseInt(id as string);
  const { user } = useAuth();
  const { activeChatMessages, isLoading, loadMessageHistory, sendMessage, setActiveChatUserId, markConversationAsRead, conversations } = useChat();
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  // Find other user's name from conversations
  const otherUser = conversations.find(c => c.user_id === userId);

  useEffect(() => {
    const initChat = async () => {
      setActiveChatUserId(userId);
      loadMessageHistory(userId);
      markConversationAsRead(userId);
      
      const token = await authService.getStoredToken();
      setAuthToken(token);
    };

    initChat();

    return () => {
      setActiveChatUserId(null);
    };
  }, [userId]);

  const handleSend = async (content: string = inputText, imageUrl?: string) => {
    if ((!content.trim() && !imageUrl) || isSending) return;
    
    setIsSending(true);
    try {
      await sendMessage(userId, content.trim(), imageUrl);
      setInputText('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setIsUploading(true);
      try {
        const uploadResult = await chatService.uploadImage(result.assets[0].uri);
        // Automatically send the image with an empty or placeholder message if no text
        await handleSend('Sended an image', uploadResult.url);
      } catch (error) {
        console.error('Image upload failed:', error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const getFullImageUrl = (url?: string) => {
    if (!url) return null;
    let finalUrl = url.startsWith('http') ? url : `${API_URL}${url}`;
    
    // Append token for authentication if it exists and hasn't been appended yet
    if (authToken && !finalUrl.includes('token=')) {
      finalUrl += `${finalUrl.includes('?') ? '&' : '?'}token=${authToken}`;
    }
    return finalUrl;
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.sender_id === user?.id;

    return (
      <View className={`mb-4 flex-row ${isMe ? 'justify-end' : 'justify-start'}`}>
        <View 
          style={{ maxWidth: Platform.OS === 'web' ? 500 : '80%' }}
          className={`rounded-2xl px-4 py-3 shadow-sm ${
            isMe ? 'bg-[#059669] rounded-tr-none' : 'bg-gray-100 rounded-tl-none'
          }`}
        >
          {item.image_url && (
            <Image 
              source={{ uri: getFullImageUrl(item.image_url) || '' }} 
              className="w-48 h-48 rounded-lg mb-2 bg-gray-200"
              resizeMode="cover"
            />
          )}
          <Text className={`${isMe ? 'text-white' : 'text-gray-900'} text-base`}>
            {item.content}
          </Text>
          <Text className={`text-[10px] mt-1 self-end ${isMe ? 'text-white/70' : 'text-gray-400'}`}>
            {(() => { const ds = item.timestamp; const tz = ds.includes('Z') || /[+-]\d{2}:\d{2}$/.test(ds); return new Date(tz ? ds : ds.trim() + 'Z').toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }); })()}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 20}
    >
      <Stack.Screen 
        options={{
          headerTitle: otherUser?.full_name || 'Chat',
          headerShown: true,
          headerBackVisible: true,
          headerTintColor: '#059669',
          headerStyle: {
            backgroundColor: '#ffffff',
          },
        }}
      />

      <View className="flex-1 px-4 pt-4">
        {isLoading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#059669" />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={activeChatMessages}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderMessage}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}
      </View>

      <View className="p-4 border-t border-gray-100 flex-row items-center">
        <TouchableOpacity 
          onPress={handlePickImage}
          disabled={isUploading}
          className="w-10 h-10 items-center justify-center mr-2"
        >
          {isUploading ? (
            <ActivityIndicator size="small" color="#94a3b8" />
          ) : (
            <FontAwesome name="image" size={24} color="#94a3b8" />
          )}
        </TouchableOpacity>
        
        <TextInput
          className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2.5 text-base max-h-32"
          placeholder="Écrivez votre message..."
          value={inputText}
          onChangeText={setInputText}
          multiline
        />
        
        <TouchableOpacity 
          className={`ml-3 w-12 h-12 rounded-full items-center justify-center ${
            inputText.trim() ? 'bg-[#059669]' : 'bg-gray-200'
          }`}
          onPress={() => handleSend()}
          disabled={!inputText.trim() || isSending}
        >
          {isSending ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <FontAwesome name="send" size={20} color="#ffffff" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
