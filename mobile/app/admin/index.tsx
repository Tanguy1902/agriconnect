import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Alert, Platform } from 'react-native';
import { Stack, router } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { adminService, PlatformStats } from '../../services/admin';
import i18n from '../../utils/i18n';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { API_URL } from '../../constants/Colors';
import { useAuth } from '../../contexts/AuthContext';

import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const fetchStats = async () => {
    try {
      const data = await adminService.getPlatformStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      Alert.alert('Erreur', 'Impossible de charger les statistiques');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const handleExport = async (type: 'users' | 'stats') => {
    setIsExporting(true);
    try {
      const endpoint = type === 'users' ? adminService.getExportUsersUrl() : adminService.getExportStatsUrl();
      const downloadUrl = `${API_URL}/api${endpoint}`;
      
      if (Platform.OS === 'web') {
        window.open(downloadUrl, '_blank');
        setIsExporting(false);
        return;
      }

      const fileName = `${type}_export_${new Date().getTime()}.csv`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      
      const token = await AsyncStorage.getItem('access_token');

      const { uri } = await FileSystem.downloadAsync(downloadUrl, fileUri, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert('Succès', 'Fichier exporté avec succès: ' + uri);
      }
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Erreur', 'L\'exportation a échoué');
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#059669" />
      </View>
    );
  }

  return (
    <ScrollView 
      className="flex-1 bg-gray-50"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Stack.Screen options={{ title: i18n.t('admin.title'), headerShown: true, headerTintColor: '#059669' }} />
      
      <View className="p-6">
        <Text className="text-2xl font-bold text-gray-900 mb-6 font-primary">{i18n.t('admin.dashboard')}</Text>

        {/* Platform Overview */}
        <View className="flex-row flex-wrap gap-4 mb-8">
          <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 w-[47%]">
            <FontAwesome name="users" size={24} color="#3b82f6" />
            <Text className="text-2xl font-bold text-gray-900 mt-2">{stats?.users.total || 0}</Text>
            <Text className="text-xs text-gray-500 uppercase font-bold tracking-wider">{i18n.t('admin.users')}</Text>
          </View>
          <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 w-[47%]">
            <FontAwesome name="shopping-basket" size={24} color="#059669" />
            <Text className="text-2xl font-bold text-gray-900 mt-2">{stats?.content.offers || 0}</Text>
            <Text className="text-xs text-gray-500 uppercase font-bold tracking-wider">{i18n.t('offers.title')}</Text>
          </View>
          <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 w-[47%]">
            <FontAwesome name="bullhorn" size={24} color="#f59e0b" />
            <Text className="text-2xl font-bold text-gray-900 mt-2">{stats?.content.demands || 0}</Text>
            <Text className="text-xs text-gray-500 uppercase font-bold tracking-wider">{i18n.t('dashboard.myDemands')}</Text>
          </View>
          <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 w-[47%]">
            <FontAwesome name="tag" size={24} color="#8b5cf6" />
            <Text className="text-2xl font-bold text-gray-900 mt-2">{stats?.content.products || 0}</Text>
            <Text className="text-xs text-gray-500 uppercase font-bold tracking-wider">{i18n.t('admin.products')}</Text>
          </View>
        </View>

        {/* Management Links */}
        <Text className="text-lg font-bold text-gray-900 mb-4">{i18n.t('common.edit')}</Text>
        
        <TouchableOpacity 
          onPress={() => router.push('/admin/users')}
          className="bg-white rounded-2xl p-5 mb-3 flex-row items-center justify-between border border-gray-100 shadow-sm"
        >
          <View className="flex-row items-center">
            <View className="w-10 h-10 bg-blue-50 rounded-full items-center justify-center mr-4">
              <FontAwesome name="user-circle" size={20} color="#3b82f6" />
            </View>
            <View>
              <Text className="text-gray-900 font-bold text-base">{i18n.t('admin.users')}</Text>
              <Text className="text-gray-500 text-xs">{i18n.t('admin.usersDesc')}</Text>
            </View>
          </View>
          <FontAwesome name="angle-right" size={24} color="#cbd5e1" />
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => router.push('/admin/products')}
          className="bg-white rounded-2xl p-5 mb-3 flex-row items-center justify-between border border-gray-100 shadow-sm"
        >
          <View className="flex-row items-center">
            <View className="w-10 h-10 bg-purple-50 rounded-full items-center justify-center mr-4">
              <FontAwesome name="cubes" size={20} color="#8b5cf6" />
            </View>
            <View>
              <Text className="text-gray-900 font-bold text-base">{i18n.t('admin.products')}</Text>
              <Text className="text-gray-500 text-xs">{i18n.t('admin.productsDesc')}</Text>
            </View>
          </View>
          <FontAwesome name="angle-right" size={24} color="#cbd5e1" />
        </TouchableOpacity>

        {/* Export Section */}
        <Text className="text-lg font-bold text-gray-900 mt-6 mb-4">{i18n.t('admin.exports')}</Text>
        
        <View className="flex-row gap-3">
          <TouchableOpacity 
            onPress={() => handleExport('users')}
            disabled={isExporting}
            className="flex-1 bg-gray-900 rounded-2xl p-4 items-center justify-center flex-row"
          >
            <FontAwesome name="file-excel-o" size={16} color="#ffffff" className="mr-2" />
            <Text className="text-white font-bold ml-2">{i18n.t('admin.users')}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => handleExport('stats')}
            disabled={isExporting}
            className="flex-1 bg-gray-900 rounded-2xl p-4 items-center justify-center flex-row"
          >
            <FontAwesome name="bar-chart" size={16} color="#ffffff" className="mr-2" />
            <Text className="text-white font-bold ml-2">{i18n.t('admin.stats')}</Text>
          </TouchableOpacity>
        </View>

        {isExporting && (
           <View className="mt-4 flex-row items-center justify-center">
             <ActivityIndicator size="small" color="#64748b" />
             <Text className="text-gray-500 ml-2">{i18n.t('admin.exporting')}</Text>
           </View>
        )}
      </View>
    </ScrollView>
  );
}
