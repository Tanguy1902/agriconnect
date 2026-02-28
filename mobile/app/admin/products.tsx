import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, TextInput, Alert, Modal } from 'react-native';
import { Stack } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { productsService, Product, CreateProductData } from '../../services/products';
import i18n from '../../utils/i18n';

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  
  // New Product State
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newUnit, setNewUnit] = useState('kg');
  const [isCreating, setIsCreating] = useState(false);

  const fetchProducts = async () => {
    try {
      const data = await productsService.getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      Alert.alert('Erreur', 'Impossible de charger le catalogue');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  const handleCreateProduct = async () => {
    if (!newName || !newCategory || !newUnit) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    setIsCreating(true);
    try {
      await productsService.createProduct({
        name: newName,
        category: newCategory,
        unit: newUnit
      });
      Alert.alert('Succès', 'Produit ajouté au catalogue');
      setIsModalVisible(false);
      setNewName('');
      setNewCategory('');
      fetchProducts();
    } catch (error) {
       console.error('Create product error:', error);
       Alert.alert('Erreur', 'L\'ajout a échoué');
    } finally {
      setIsCreating(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View className="flex-1 bg-gray-50">
      <Stack.Screen options={{ title: i18n.t('admin.products'), headerShown: true, headerTintColor: '#059669' }} />
      
      {/* Header Actions */}
      <View className="bg-white px-6 py-4 border-b border-gray-100 shadow-sm">
        <View className="flex-row items-center gap-3">
          <View className="bg-gray-50 flex-row items-center px-4 py-2 rounded-xl flex-1">
            <FontAwesome name="search" size={16} color="#94a3b8" />
            <TextInput 
               className="flex-1 ml-3 text-gray-900"
               placeholder={i18n.t('common.search')}
               value={searchQuery}
               onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity 
            onPress={() => setIsModalVisible(true)}
            className="bg-[#059669] w-12 h-10 rounded-xl items-center justify-center"
          >
            <FontAwesome name="plus" size={18} color="#ffffff" />
          </TouchableOpacity>
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
          ) : filteredProducts.length === 0 ? (
            <View className="py-20 items-center justify-center">
              <FontAwesome name="tag" size={48} color="#cbd5e1" />
              <Text className="text-gray-500 mt-4">Aucun produit trouvé</Text>
            </View>
          ) : (
            filteredProducts.map((product) => (
              <View key={product.id} className="bg-white rounded-2xl p-4 mb-3 border border-gray-100 shadow-sm flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-gray-900 font-bold text-lg">{product.name}</Text>
                  <View className="flex-row items-center mt-1">
                    <Text className="text-gray-500 text-xs bg-gray-100 px-2 py-0.5 rounded mr-2">{product.category}</Text>
                    <Text className="text-gray-400 text-xs">Unité: {product.unit}</Text>
                  </View>
                </View>
                <View className="items-end">
                   <Text className="text-[#059669] font-bold text-xs">{product.offer_count || 0} offres</Text>
                   <FontAwesome name="angle-right" size={20} color="#cbd5e1" />
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Add Product Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-gray-900">{i18n.t('admin.products')}</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <FontAwesome name="times" size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View className="gap-4">
              <View>
                <Text className="text-sm font-bold text-gray-700 mb-2">{i18n.t('offers.product')}</Text>
                <TextInput 
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3"
                  placeholder="Ex: Riz Makalioka"
                  value={newName}
                  onChangeText={setNewName}
                />
              </View>

              <View>
                <Text className="text-sm font-bold text-gray-700 mb-2">Catégorie</Text>
                <TextInput 
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3"
                  placeholder="Ex: Céréales"
                  value={newCategory}
                  onChangeText={setNewCategory}
                />
              </View>

              <View>
                <Text className="text-sm font-bold text-gray-700 mb-2">Unité de mesure</Text>
                <TextInput 
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3"
                  placeholder="Ex: kg, litre, sac"
                  value={newUnit}
                  onChangeText={setNewUnit}
                />
              </View>

              <TouchableOpacity 
                onPress={handleCreateProduct}
                disabled={isCreating}
                className={`bg-[#059669] py-4 rounded-xl items-center mt-4 ${isCreating ? 'opacity-50' : ''}`}
              >
                {isCreating ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text className="text-white font-bold text-lg">{i18n.t('common.save')}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
