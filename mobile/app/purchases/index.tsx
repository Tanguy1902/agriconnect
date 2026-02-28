import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { directPurchasesService, DirectPurchase, DirectPurchaseStatus } from '../../services/direct_purchases';
import { FontAwesome } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import i18n from '../../utils/i18n';

export default function PurchasesScreen() {
  const { user } = useAuth();
  const [purchases, setPurchases] = useState<DirectPurchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const isFarmer = user?.user_type === 'agriculteur';

  const fetchPurchases = async () => {
    try {
      const data = isFarmer 
        ? await directPurchasesService.getReceivedPurchases()
        : await directPurchasesService.getSentPurchases();
      setPurchases(data);
    } catch (error) {
      console.error('Error fetching purchases:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPurchases();
  };

  const handleUpdateStatus = async (id: number, status: DirectPurchaseStatus) => {
    try {
      await directPurchasesService.updateStatus(id, status);
      Alert.alert(i18n.t('common.success'), i18n.t('purchases.confirmSuccess'));
      fetchPurchases();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de mettre à jour le statut');
    }
  };

  const getStatusStyle = (status: DirectPurchaseStatus) => {
    switch (status) {
      case DirectPurchaseStatus.ACCEPTED: return 'bg-green-100 text-green-700';
      case DirectPurchaseStatus.REJECTED: return 'bg-red-100 text-red-700';
      case DirectPurchaseStatus.PENDING: return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <Stack.Screen options={{ 
        headerShown: true, 
        title: isFarmer ? i18n.t('purchases.received') : i18n.t('purchases.sent'),
        headerTintColor: '#059669',
      }} />

      <ScrollView 
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="p-6">
          {isLoading ? (
            <View className="py-20 justify-center items-center">
              <ActivityIndicator size="large" color="#059669" />
            </View>
          ) : purchases.length === 0 ? (
            <View className="bg-white rounded-2xl p-10 items-center justify-center border border-gray-100">
              <FontAwesome name="shopping-bag" size={48} color="#cbd5e1" />
              <Text className="text-gray-500 mt-4 text-center">{i18n.t('purchases.none')}</Text>
            </View>
          ) : (
            <View className="gap-4">
              {purchases.map((purchase) => (
                <View key={purchase.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <View className="flex-row justify-between items-center mb-4">
                    <View className="flex-row items-center">
                      <FontAwesome name="calendar" size={14} color="#94a3b8" />
                      <Text className="ml-2 text-gray-400 text-xs">
                        {(() => { const ds = purchase.created_at; const tz = ds.includes('Z') || /[+-]\d{2}:\d{2}$/.test(ds); return new Date(tz ? ds : ds.trim() + 'Z').toLocaleDateString('fr-FR'); })()}
                      </Text>
                    </View>
                    <View className={`px-3 py-1 rounded-full ${getStatusStyle(purchase.status).split(' ')[0]}`}>
                      <Text className={`text-[10px] font-bold ${getStatusStyle(purchase.status).split(' ')[1]}`}>
                        {i18n.t(`purchases.status.${purchase.status}`).toUpperCase()}
                      </Text>
                    </View>
                  </View>

                    <View className="mb-4">
                    <Text className="text-gray-500 text-xs mb-1">{i18n.t('purchases.offer')}{purchase.offer_id}</Text>
                    <View className="flex-row justify-between items-center">
                      <Text className="text-lg font-bold text-gray-900">{purchase.quantity} kg</Text>
                      <Text className="text-xl font-bold text-[#059669]">
                        {(purchase.total_price || (purchase.quantity * purchase.unit_price))} Ar
                      </Text>
                    </View>
                  </View>

                  {isFarmer && purchase.status === DirectPurchaseStatus.PENDING && (
                    <View className="flex-row gap-3 pt-4 border-t border-gray-50">
                      <TouchableOpacity 
                        onPress={() => handleUpdateStatus(purchase.id, DirectPurchaseStatus.REJECTED)}
                        className="flex-1 bg-white border border-red-200 py-3 rounded-xl items-center"
                      >
                        <Text className="text-red-500 font-bold">{i18n.t('purchases.reject')}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        onPress={() => handleUpdateStatus(purchase.id, DirectPurchaseStatus.ACCEPTED)}
                        className="flex-1 bg-[#059669] py-3 rounded-xl items-center"
                      >
                        <Text className="text-white font-bold">{i18n.t('purchases.accept')}</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
