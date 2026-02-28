import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { notificationsService, Notification } from '../../services/notifications';
import { useNotifications } from '../../contexts/NotificationContext';
import { FontAwesome } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import i18n from '../../utils/i18n';

export default function NotificationsScreen() {
  const { refreshUnreadCount } = useNotifications();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    try {
      const data = await notificationsService.getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    refreshUnreadCount();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const markAsRead = async (id: number) => {
    try {
      await notificationsService.markAsRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
      refreshUnreadCount();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllRead = async () => {
    try {
      await notificationsService.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      refreshUnreadCount();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const formatTime = (dateString: string) => {
    const hasTimezone = dateString.includes('Z') || /[+-]\d{2}:\d{2}$/.test(dateString);
    const date = new Date(hasTimezone ? dateString : dateString.trim() + 'Z');
    return date.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <View className="flex-1 bg-gray-50">
      <Stack.Screen options={{ 
        headerShown: true, 
        title: i18n.t('notifications.title'),
        headerTintColor: '#059669',
      }} />
      
      <View className="bg-white px-6 py-4 flex-row justify-between items-center border-b border-gray-100">
        <Text className="text-gray-500 font-medium">
          {notifications.filter(n => !n.is_read).length} non lues
        </Text>
        <TouchableOpacity onPress={markAllRead}>
          <Text className="text-[#059669] font-bold">{i18n.t('notifications.markAllRead')}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {isLoading ? (
          <View className="py-20 justify-center items-center">
            <ActivityIndicator size="large" color="#059669" />
          </View>
        ) : notifications.length === 0 ? (
          <View className="py-20 items-center justify-center px-6">
            <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
              <FontAwesome name="bell-o" size={40} color="#cbd5e1" />
            </View>
            <Text className="text-gray-500 text-lg">{i18n.t('notifications.none')}</Text>
          </View>
        ) : (
          notifications.map((notif) => (
            <TouchableOpacity 
              key={notif.id}
              onPress={() => !notif.is_read && markAsRead(notif.id)}
              className={`p-5 border-b border-gray-100 flex-row ${notif.is_read ? 'bg-white' : 'bg-green-50/50'}`}
            >
              <View className={`w-10 h-10 rounded-full items-center justify-center ${notif.is_read ? 'bg-gray-100' : 'bg-green-100'}`}>
                <FontAwesome name="info-circle" size={20} color={notif.is_read ? '#94a3b8' : '#059669'} />
              </View>
              <View className="flex-1 ml-4">
                <Text className={`text-base ${notif.is_read ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                  {notif.message}
                </Text>
                <Text className="text-xs text-gray-400 mt-1">
                  {formatTime(notif.created_at)}
                </Text>
              </View>
              {!notif.is_read && (
                <View className="w-2 h-2 rounded-full bg-[#059669] mt-2" />
              )}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}
