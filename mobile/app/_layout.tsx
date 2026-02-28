import { Stack } from 'expo-router';
import { AuthProvider } from '../contexts/AuthContext';
import { ChatProvider } from '../contexts/ChatContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import { StatusBar } from 'expo-status-bar';
import '../global.css';

export default function RootLayout() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <ChatProvider>
          <StatusBar style="auto" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen 
              name="chat/[id]" 
              options={{ 
                headerShown: true,
                headerTitle: 'Chat',
                headerTintColor: '#059669',
              }} 
            />
          </Stack>
        </ChatProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}
