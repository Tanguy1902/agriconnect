import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { FontAwesome } from '@expo/vector-icons';
import { statisticsService, FarmerStats, CollectorStats } from '../../services/statistics';
import i18n from '../../utils/i18n';
import { router } from 'expo-router';

export default function DashboardHome() {
  const { user } = useAuth();
  const [stats, setStats] = useState<FarmerStats | CollectorStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const isFarmer = user?.user_type === 'agriculteur';

  const fetchStats = async () => {
    try {
      if (isFarmer) {
        const data = await statisticsService.getFarmerStats();
        setStats(data);
      } else {
        const data = await statisticsService.getCollectorStats();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const farmerStats = stats as FarmerStats;
  const collectorStats = stats as CollectorStats;

  return (
    <ScrollView 
      className="flex-1 bg-gray-50"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View className="p-6">
        {/* Welcome Section */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-gray-900">
            Bonjour, {user?.full_name}!
          </Text>
          <Text className="text-lg text-gray-600 mt-1">
            {isFarmer ? 'Espace Agriculteur' : 'Espace Collecteur'}
          </Text>
        </View>

        {/* Stats Cards */}
        <View className="flex-row flex-wrap gap-4 mb-6">
          <TouchableOpacity 
            onPress={() => router.push('/offers')}
            className="flex-1 min-w-[45%] bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
          >
            <View className="flex-row items-center justify-between mb-2">
              <FontAwesome name={isFarmer ? "list" : "shopping-cart"} size={24} color="#059669" />
              <Text className="text-3xl font-bold text-gray-900">
                {isLoading ? '...' : (isFarmer ? farmerStats?.active_offers_count : collectorStats?.active_demands_count) || 0}
              </Text>
            </View>
            <Text className="text-sm text-gray-600 font-medium">
              {isFarmer ? 'Offres Actives' : 'Demandes Actives'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => router.push(isFarmer ? '/purchases' : '/matches')}
            className="flex-1 min-w-[45%] bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
          >
            <View className="flex-row items-center justify-between mb-2">
              <FontAwesome name="handshake-o" size={24} color="#f59e0b" />
              <Text className="text-3xl font-bold text-gray-900">
                {isLoading ? '...' : (isFarmer ? farmerStats?.active_orders_count : collectorStats?.new_offers_count) || 0}
              </Text>
            </View>
            <Text className="text-sm text-gray-600 font-medium">
              {isFarmer ? 'Achats Reçus' : 'Nouveaux Matches'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => router.push('/purchases')}
            className="flex-1 min-w-[45%] bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
          >
            <View className="flex-row items-center justify-between mb-2">
              <FontAwesome name="money" size={24} color="#3b82f6" />
              <Text className="text-2xl font-bold text-gray-900">
                {isLoading ? '...' : (isFarmer ? farmerStats?.monthly_revenue : collectorStats?.monthly_expenses) || 0}
              </Text>
            </View>
            <Text className="text-sm text-gray-600 font-medium">
              {isFarmer ? 'Revenu Mensuel' : 'Mes Achats'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => router.push('/chat')}
            className="flex-1 min-w-[45%] bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
          >
            <View className="flex-row items-center justify-between mb-2">
              <FontAwesome name="comments" size={24} color="#10b981" />
              <Text className="text-3xl font-bold text-gray-900">
                {isLoading ? '...' : (isFarmer ? farmerStats?.unread_messages_count : collectorStats?.unread_messages_count) || 0}
              </Text>
            </View>
            <Text className="text-sm text-gray-600 font-medium">
              Messages
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View className="mb-6">
          <Text className="text-xl font-bold text-gray-900 mb-4">
            Actions Rapides
          </Text>
          
          <TouchableOpacity 
            onPress={() => router.push(isFarmer ? '/offers/create' : '/demands/create')}
            className="bg-[#059669] rounded-2xl p-5 mb-3 flex-row items-center justify-between"
          >
            <View className="flex-row items-center">
              <FontAwesome name="plus-circle" size={24} color="#ffffff" />
              <Text className="text-white font-bold text-lg ml-3">
                {isFarmer ? 'Créer une Offre' : 'Créer une Demande'}
              </Text>
            </View>
            <FontAwesome name="arrow-right" size={20} color="#ffffff" />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => router.push('/offers')}
            className="bg-white rounded-2xl p-5 border border-gray-200 flex-row items-center justify-between"
          >
            <View className="flex-row items-center">
              <FontAwesome name="search" size={24} color="#059669" />
              <Text className="text-gray-900 font-bold text-lg ml-3">
                {isFarmer ? 'Voir les Demandes' : 'Explorer le Marché'}
              </Text>
            </View>
            <FontAwesome name="arrow-right" size={20} color="#059669" />
          </TouchableOpacity>
        </View>

        {/* Recent Activity */}
        <View>
          <Text className="text-xl font-bold text-gray-900 mb-4">
            Activité Récente
          </Text>
          <View className="bg-white rounded-2xl p-6 border border-gray-100">
            {(!isFarmer && !collectorStats?.recent_activity?.length) || (isFarmer && !farmerStats?.recent_activity?.length) ? (
              <Text className="text-gray-500 text-center">
                Aucune activité récente
              </Text>
            ) : (
              <View className="gap-4">
                {(isFarmer ? farmerStats?.recent_activity : collectorStats?.recent_activity)?.map((activity) => (
                  <View key={activity.id} className="flex-row items-center border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                    <View className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${activity.is_read ? 'bg-gray-100' : 'bg-green-100'}`}>
                      <FontAwesome name="bell-o" size={14} color={activity.is_read ? '#94a3b8' : '#059669'} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-gray-900 text-sm" numberOfLines={2}>{activity.message}</Text>
                      <Text className="text-gray-400 text-xs mt-1">
                        {(() => { const ds = activity.created_at; const tz = ds.includes('Z') || /[+-]\d{2}:\d{2}$/.test(ds); return new Date(tz ? ds : ds.trim() + 'Z').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }); })()}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
