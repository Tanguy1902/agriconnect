import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Stack, router } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/auth';

export default function EditAdvancedProfile() {
  const { user, refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  // State for fields
  const [items, setItems] = useState<string[]>([]);
  const [newItem, setNewItem] = useState('');

  const isFarmer = user?.user_type === 'agriculteur';

  useEffect(() => {
    if (user) {
      const rawData = isFarmer ? user.crop_types : user.intervention_zones;
      if (rawData) {
        try {
          // Attempt to parse if it's a JSON string, otherwise split by comma if it's a simple string
          if (rawData.startsWith('[') || rawData.startsWith('{')) {
            setItems(JSON.parse(rawData));
          } else {
            setItems(rawData.split(',').map(s => s.trim()).filter(s => s !== ''));
          }
        } catch (e) {
          setItems(rawData.split(',').map(s => s.trim()).filter(s => s !== ''));
        }
      }
    }
  }, [user]);

  const addItem = () => {
    if (!newItem.trim()) return;
    if (items.includes(newItem.trim())) {
      Alert.alert('Info', 'Cet élément est déjà dans la liste');
      return;
    }
    setItems([...items, newItem.trim()]);
    setNewItem('');
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Actually the getCurrentUser updates the user in local storage
      // But we need a way to UPDATE the user profile.
      // Let's check users service or auth service for update profile.
      // I'll assume we need to implement updateProfile in authService if missing.
      
      const field = isFarmer ? 'crop_types' : 'intervention_zones';
      const updatedData = items.join(', '); 
      
      await authService.updateProfile({ [field]: updatedData });
      
      Alert.alert('Succès', 'Profil mis à jour');
      await refreshUser();
      router.back();
    } catch (error) {
      console.error('Update profile error:', error);
      Alert.alert('Erreur', 'La mise à jour a échoué');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <Stack.Screen options={{ 
        title: isFarmer ? 'Types de Cultures' : 'Zones d\'Intervention',
        headerShown: true, 
        headerTintColor: '#059669' 
      }} />
      
      <ScrollView className="flex-1 p-6">
        <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <Text className="text-gray-900 font-bold text-lg mb-2">
            {isFarmer ? 'Que cultivez-vous ?' : 'Où intervenez-vous ?'}
          </Text>
          <Text className="text-gray-500 text-sm mb-6">
            Ajoutez les éléments un par un pour aider les autres utilisateurs à vous trouver.
          </Text>

          {/* Input Section */}
          <View className="flex-row gap-3 mb-6">
            <TextInput 
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3"
              placeholder={isFarmer ? "Ex: Vanille, Riz..." : "Ex: Anosy, Vakinankaratra..."}
              value={newItem}
              onChangeText={setNewItem}
              onSubmitEditing={addItem}
            />
            <TouchableOpacity 
              onPress={addItem}
              className="bg-[#059669] px-6 rounded-xl items-center justify-center"
            >
              <FontAwesome name="plus" size={18} color="#ffffff" />
            </TouchableOpacity>
          </View>

          {/* List Section */}
          <View className="flex-row flex-wrap gap-2">
            {items.length === 0 ? (
               <Text className="text-gray-400 italic text-center w-full py-4">La liste est vide</Text>
            ) : (
              items.map((item, index) => (
                <View key={index} className="bg-[#059669]/10 border border-[#059669]/20 rounded-full px-4 py-2 flex-row items-center">
                  <Text className="text-[#059669] font-medium mr-2">{item}</Text>
                  <TouchableOpacity onPress={() => removeItem(index)}>
                    <FontAwesome name="times-circle" size={16} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        </View>

        <TouchableOpacity 
          onPress={handleSave}
          disabled={isLoading}
          className="bg-[#059669] rounded-2xl p-5 mt-8 items-center shadow-sm"
        >
          {isLoading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className="text-white font-bold text-lg">Enregistrer les modifications</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
