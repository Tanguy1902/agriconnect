import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, TextInput, Alert, Image } from 'react-native';
import { Stack } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { adminService } from '../../services/admin';
import i18n from '../../utils/i18n';
import { User } from '../../services/auth';

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchUsers = async () => {
    try {
      const data = await adminService.getAllUsers();
      setUsers(data);
      setFilteredUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      Alert.alert('Erreur', 'Impossible de charger la liste des utilisateurs');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(users);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredUsers(users.filter(u => 
        u.full_name.toLowerCase().includes(query) || 
        u.email.toLowerCase().includes(query)
      ));
    }
  }, [searchQuery, users]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  const handleToggleActive = async (userId: number, currentStatus: boolean) => {
    Alert.alert(
      currentStatus ? 'Désactiver le compte' : 'Activer le compte',
      `Êtes-vous sûr de vouloir ${currentStatus ? 'désactiver' : 'activer'} cet utilisateur ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Confirmer', 
          onPress: async () => {
            try {
              const result = await adminService.toggleUserActive(userId);
              setUsers(users.map(u => u.id === userId ? { ...u, is_active: result.is_active } : u));
              Alert.alert('Succès', `Compte ${result.is_active ? 'activé' : 'désactivé'}`);
            } catch (error) {
              console.error('Toggle error:', error);
              Alert.alert('Erreur', 'L\'opération a échoué');
            }
          }
        }
      ]
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      <Stack.Screen options={{ title: i18n.t('admin.users'), headerShown: true, headerTintColor: '#059669' }} />
      
      {/* Search Bar */}
      <View className="bg-white px-6 py-4 border-b border-gray-100 shadow-sm">
        <View className="bg-gray-50 flex-row items-center px-4 py-2 rounded-xl">
          <FontAwesome name="search" size={16} color="#94a3b8" />
          <TextInput 
             className="flex-1 ml-3 text-gray-900"
             placeholder={i18n.t('admin.userSearch')}
             value={searchQuery}
             onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <FontAwesome name="times-circle" size={16} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView 
        className="flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View className="p-4">
          {isLoading ? (
            <View className="py-20 justify-center items-center">
              <ActivityIndicator size="large" color="#059669" />
            </View>
          ) : filteredUsers.length === 0 ? (
            <View className="py-20 items-center justify-center">
              <FontAwesome name="user-times" size={48} color="#cbd5e1" />
              <Text className="text-gray-500 mt-4">{i18n.t('admin.noUsers')}</Text>
            </View>
          ) : (
            filteredUsers.map((user) => (
              <View key={user.id} className="bg-white rounded-2xl p-4 mb-3 border border-gray-100 shadow-sm">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    <View className="w-12 h-12 bg-[#059669]/10 rounded-full items-center justify-center">
                       {user.profile_picture ? (
                         <Image source={{ uri: user.profile_picture }} className="w-12 h-12 rounded-full" />
                       ) : (
                         <FontAwesome name="user" size={20} color="#059669" />
                       )}
                    </View>
                    <View className="ml-4 flex-1">
                      <Text className="text-gray-900 font-bold text-base">{user.full_name}</Text>
                      <Text className="text-gray-500 text-xs">{user.email}</Text>
                      <View className="flex-row items-center mt-1">
                        <View className={`px-2 py-0.5 rounded-full ${user.user_type === 'agriculteur' ? 'bg-green-100' : 'bg-amber-100'}`}>
                          <Text className={`text-[10px] font-bold ${user.user_type === 'agriculteur' ? 'text-green-700' : 'text-amber-700'}`}>
                            {user.user_type.toUpperCase()}
                          </Text>
                        </View>
                        <View className={`ml-2 px-2 py-0.5 rounded-full ${user.is_active ? 'bg-blue-100' : 'bg-red-100'}`}>
                          <Text className={`text-[10px] font-bold ${user.is_active ? 'text-blue-700' : 'text-red-700'}`}>
                            {user.is_active ? 'ACTIF' : 'INACTIF'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  <TouchableOpacity 
                    onPress={() => handleToggleActive(user.id, user.is_active)}
                    className={`ml-4 w-10 h-10 items-center justify-center rounded-full ${user.is_active ? 'bg-red-50' : 'bg-blue-50'}`}
                  >
                    <FontAwesome name={user.is_active ? "ban" : "check"} size={18} color={user.is_active ? "#ef4444" : "#3b82f6"} />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}
