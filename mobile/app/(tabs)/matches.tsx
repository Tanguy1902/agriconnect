import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { matchesService, Match } from '../../services/matches';
import { FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function MatchesScreen() {
  const { user } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const isFarmer = user?.user_type === 'agriculteur';

  const fetchMatches = async () => {
    try {
      const data = await matchesService.getMatches();
      setMatches(data);
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMatches();
  };

  const handleAccept = async (id: number) => {
    try {
      await matchesService.acceptMatch(id);
      Alert.alert('Succès', 'Match accepté !');
      fetchMatches();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'accepter le match');
    }
  };

  const handleReject = async (id: number) => {
    try {
      await matchesService.rejectMatch(id);
      Alert.alert('Info', 'Match refusé');
      fetchMatches();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de refuser le match');
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView 
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="p-6">
          <Text className="text-3xl font-bold text-gray-900 mb-6">Matches</Text>

          {isLoading ? (
            <View className="py-20 justify-center items-center">
              <ActivityIndicator size="large" color="#059669" />
            </View>
          ) : matches.length === 0 ? (
            <View className="bg-white rounded-2xl p-10 border border-gray-100 items-center justify-center">
              <FontAwesome name="handshake-o" size={48} color="#cbd5e1" />
              <Text className="text-gray-500 mt-4 text-center">
                Aucun match trouvé pour le moment.
              </Text>
              <Text className="text-gray-400 mt-2 text-sm text-center">
                Les matches sont générés automatiquement quand vos offres et demandes correspondent.
              </Text>
            </View>
          ) : (
            <View className="gap-4">
              {matches.map((match) => (
                <View key={match.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <View className="flex-row justify-between items-center mb-4">
                    <View className="flex-row items-center">
                      <View className="bg-orange-100 p-2 rounded-lg">
                        <FontAwesome name="star" size={16} color="#f59e0b" />
                      </View>
                      <Text className="ml-3 font-bold text-gray-900">Score: {Math.round(match.match_score)}%</Text>
                    </View>
                    <View className={`px-3 py-1 rounded-full ${match.status === 'accepted' ? 'bg-green-100' : match.status === 'rejected' ? 'bg-red-100' : 'bg-blue-100'}`}>
                      <Text className={`text-xs font-bold ${match.status === 'accepted' ? 'text-green-700' : match.status === 'rejected' ? 'text-red-700' : 'text-blue-700'}`}>
                        {match.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  <Text className="text-gray-700 mb-4 leading-relaxed">
                    {match.matching_reason || "Ce match a été généré car vos critères correspondent parfaitement."}
                  </Text>

                  <View className="bg-gray-50 p-4 rounded-xl mb-4">
                    <View className="flex-row justify-between mb-2">
                       <Text className="text-gray-500">Produit</Text>
                       <Text className="font-bold text-gray-900">
                         {isFarmer ? match.demand?.product_name : match.offer?.product?.name}
                       </Text>
                    </View>
                    <View className="flex-row justify-between mb-2">
                       <Text className="text-gray-500">Quantité</Text>
                       <Text className="font-bold text-gray-900">
                         {isFarmer ? match.demand?.quantity : match.offer?.quantity} kg
                       </Text>
                    </View>
                    <View className="flex-row justify-between">
                       <Text className="text-gray-500">Prix cible</Text>
                       <Text className="font-bold text-[#059669]">
                         {isFarmer ? match.demand?.max_unit_price : match.offer?.unit_price} Ar/kg
                       </Text>
                    </View>
                  </View>
                  
                  {match.status === 'pending' && (
                    <View className="flex-row gap-3">
                      <TouchableOpacity 
                        onPress={() => handleReject(match.id)}
                        className="flex-1 bg-white border border-red-200 py-3 rounded-xl items-center"
                      >
                        <Text className="text-red-500 font-bold">Refuser</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        onPress={() => handleAccept(match.id)}
                        className="flex-2 bg-[#059669] py-3 rounded-xl items-center"
                      >
                        <Text className="text-white font-bold px-8">Accepter</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  
                  {match.status === 'accepted' && (
                    <TouchableOpacity 
                      onPress={() => {
                        const otherUserId = isFarmer ? match.demand?.collector?.id : match.offer?.farmer?.id;
                        if (otherUserId) {
                          router.push(`/chat/${otherUserId}`);
                        } else {
                          Alert.alert('Erreur', 'Impossible de trouver l\'interlocuteur');
                        }
                      }}
                      className="bg-[#059669] py-3 rounded-xl items-center flex-row justify-center"
                    >
                      <FontAwesome name="comments" size={18} color="#ffffff" />
                      <Text className="text-white font-bold ml-2">Démarrer le Chat</Text>
                    </TouchableOpacity>
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
