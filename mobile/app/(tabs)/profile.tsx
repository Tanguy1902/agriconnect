import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { router } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import i18n from '../../utils/i18n';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    console.log('[Profile] Logout button pressed, platform:', Platform.OS);
    
    const performLogout = async () => {
      console.log('[Profile] Execution of logout sequence...');
      try {
        await logout();
        console.log('[Profile] Logout successful, redirecting...');
        router.replace('/login');
      } catch (error) {
        console.error('[Profile] Logout failed:', error);
        Alert.alert('Erreur', 'Impossible de se déconnecter');
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
        await performLogout();
      }
    } else {
      Alert.alert(
        'Déconnexion',
        'Êtes-vous sûr de vouloir vous déconnecter ?',
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Déconnexion',
            style: 'destructive',
            onPress: performLogout,
          },
        ]
      );
    }
  };

  if (!user) {
    console.log('[Profile] No user record, showing loader');
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#059669" />
        <TouchableOpacity onPress={() => router.replace('/login')} className="mt-4">
          <Text className="text-[#059669]">Retour à la connexion</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-6">
        {/* Profile Header */}
        <View className="bg-white rounded-2xl p-6 mb-6 items-center border border-gray-100">
          <View className="w-24 h-24 rounded-full bg-[#059669] items-center justify-center mb-4">
            <Text className="text-white text-4xl font-bold">
              {user?.full_name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text className="text-2xl font-bold text-gray-900 mb-1">
            {user?.full_name}
          </Text>
          <Text className="text-base text-gray-600 mb-2">
            {user?.email}
          </Text>
          <View className="bg-[#059669]/10 px-4 py-2 rounded-full">
            <Text className="text-[#059669] font-semibold">
              {user?.user_type === 'agriculteur' ? 'Agriculteur' : 'Collecteur'}
            </Text>
          </View>
        </View>

        {/* Profile Info */}
        <View className="bg-white rounded-2xl p-6 mb-6 border border-gray-100">
          <Text className="text-lg font-bold text-gray-900 mb-4">
            {i18n.t('landing.features.title')}
          </Text>
          
          <View className="space-y-3">
            <View className="flex-row items-center py-3 border-b border-gray-100">
              <FontAwesome name="phone" size={20} color="#6b7280" />
              <Text className="ml-3 text-gray-700">{user?.phone}</Text>
            </View>
            
            {user?.location_region && (
              <View className="flex-row items-center py-3 border-b border-gray-100">
                <FontAwesome name="map-marker" size={20} color="#6b7280" />
                <Text className="ml-3 text-gray-700">
                  {user.location_region}{user.location_commune ? `, ${user.location_commune}` : ''}
                </Text>
              </View>
            )}
            
            <View className="flex-row items-center py-3">
              <FontAwesome name="calendar" size={20} color="#6b7280" />
              <Text className="ml-3 text-gray-700">
                {i18n.t('profile.memberSince')} {(() => { const ds = user?.created_at || ''; const tz = ds.includes('Z') || /[+-]\d{2}:\d{2}$/.test(ds); return new Date(tz ? ds : ds.trim() + 'Z').toLocaleDateString('fr-FR'); })()}
              </Text>
            </View>
          </View>
        </View>

        {/* User Stats/Info (Placeholder or summary) */}
        <View className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">
          <View className="flex-row justify-between mb-4">
            <View>
              <Text className="text-gray-400 text-xs uppercase font-bold tracking-wider">{i18n.t('profile.accountType')}</Text>
              <Text className="text-gray-900 font-bold text-lg capitalize">{user?.user_type === 'agriculteur' ? i18n.t('auth.register.farmer') : i18n.t('auth.register.collector')}</Text>
            </View>
            <View>
              <Text className="text-gray-400 text-xs uppercase font-bold tracking-wider">{i18n.t('profile.memberSince')}</Text>
              <Text className="text-gray-900 font-bold text-lg">
                {user?.created_at ? (() => { const ds = user.created_at; const tz = ds.includes('Z') || /[+-]\d{2}:\d{2}$/.test(ds); return new Date(tz ? ds : ds.trim() + 'Z').getFullYear(); })() : '2024'}
              </Text>
            </View>
          </View>
        </View>

        {/* Buttons / Actions */}
        <View className="gap-3">
          {user?.user_type === 'admin' && (
            <TouchableOpacity 
              onPress={() => router.push('/admin')}
              className="bg-gray-900 flex-row items-center justify-center p-4 rounded-2xl border border-gray-100"
            >
              <FontAwesome name="shield" size={20} color="#ffffff" />
              <Text className="text-white font-bold text-lg ml-3">{i18n.t('profile.adminSpace')}</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity className="bg-white flex-row items-center justify-center p-4 rounded-2xl border border-gray-100">
            <FontAwesome name="edit" size={20} color="#059669" />
            <Text className="text-[#059669] font-bold text-lg ml-3">{i18n.t('profile.edit')}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => router.push('/profile/edit-advanced')}
            className="bg-white flex-row items-center justify-center p-4 rounded-2xl border border-gray-100"
          >
            <FontAwesome name={user?.user_type === 'agriculteur' ? "leaf" : "map"} size={20} color="#059669" />
            <Text className="text-[#059669] font-bold text-lg ml-3">
              {user?.user_type === 'agriculteur' ? i18n.t('profile.advanced.farmer') : i18n.t('profile.advanced.collector')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => handleLogout()}
            className="bg-red-50 flex-row items-center justify-center p-4 rounded-2xl border border-red-100"
          >
            <FontAwesome name="sign-out" size={20} color="#ef4444" />
            <Text className="text-[#ef4444] font-bold text-lg ml-3">{i18n.t('dashboard.logout')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
