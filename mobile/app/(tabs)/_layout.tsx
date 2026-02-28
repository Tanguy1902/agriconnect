import { Tabs, Redirect, router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { useChat } from '../../contexts/ChatContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { View, ActivityIndicator, TouchableOpacity, Text } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

export default function TabsLayout() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { unreadCount: messageUnreadCount } = useChat();
  const { unreadCount: notificationUnreadCount } = useNotifications();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#059669" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  const isFarmer = user?.user_type === 'agriculteur';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#059669',
        tabBarInactiveTintColor: '#6b7280',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          paddingBottom: 10,
          paddingTop: 10,
          height: 70,
        },
        headerStyle: {
          backgroundColor: '#059669',
        },
        headerTintColor: '#ffffff',
        headerRight: () => (
          <TouchableOpacity 
            onPress={() => router.push('/notifications')}
            className="mr-6 relative"
          >
            <FontAwesome name="bell-o" size={24} color="#ffffff" />
            {notificationUnreadCount > 0 && (
              <View className="absolute -top-1 -right-1 bg-red-500 rounded-full min-w-[16px] h-4 items-center justify-center border-2 border-[#059669] px-1">
                <Text className="text-white text-[8px] font-bold">{notificationUnreadCount > 9 ? '9+' : notificationUnreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        ),
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="offers"
        options={{
          title: isFarmer ? 'Mes Offres' : 'Marché',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name={isFarmer ? 'list' : 'shopping-cart'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="matches"
        options={{
          title: 'Matches',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="handshake-o" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Messages',
          tabBarBadge: messageUnreadCount > 0 ? messageUnreadCount : undefined,
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="comments" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="user" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
