import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { productsService, Product } from '../../services/products';
import { demandsService, CreateDemandData } from '../../services/demands';
import { FontAwesome } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';

export default function CreateDemandScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<Partial<CreateDemandData>>({
    product_id: 0,
    quantity: 0,
    max_unit_price: 0,
    special_requirements: '',
    quality_required: '',
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await productsService.getProducts();
        setProducts(data);
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, product_id: data[0].id }));
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleSubmit = async () => {
    if (!formData.product_id || !formData.quantity || !formData.max_unit_price) {
      Alert.alert('Erreur', 'Veuillez remplir les champs obligatoires');
      return;
    }

    setIsSubmitting(true);
    try {
      await demandsService.createDemand(formData as CreateDemandData);
      Alert.alert('Succès', 'Votre demande a été publiée avec succès', [
        { text: 'OK', onPress: () => router.replace('/') }
      ]);
    } catch (error) {
      console.error('Error creating demand:', error);
      Alert.alert('Erreur', 'Impossible de publier la demande');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#059669" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white">
      <Stack.Screen options={{ 
        headerShown: true, 
        title: 'Publier une Demande',
        headerTintColor: '#059669',
      }} />
      
      <View className="p-6">
        <Text className="text-gray-500 mb-6">Indiquez aux agriculteurs ce que vous recherchez actuellement.</Text>

        {/* Product Selection */}
        <Text className="text-gray-700 font-bold mb-2">Produit recherché *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
          {products.map(product => (
            <TouchableOpacity
              key={product.id}
              onPress={() => setFormData({ ...formData, product_id: product.id })}
              className={`mr-3 px-4 py-3 rounded-xl border-2 ${formData.product_id === product.id ? 'border-[#059669] bg-green-50' : 'border-gray-100 bg-gray-50'}`}
            >
              <Text className={`font-bold ${formData.product_id === product.id ? 'text-[#059669]' : 'text-gray-600'}`}>
                {product.name}
              </Text>
              <Text className="text-xs text-gray-400">{product.category}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Quantity and Max Price */}
        <View className="flex-row gap-4 mb-4">
          <View className="flex-1">
            <Text className="text-gray-700 font-bold mb-2">Quantité voulue (kg) *</Text>
            <TextInput
              className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-lg"
              placeholder="Ex: 1000"
              keyboardType="numeric"
              onChangeText={(val) => setFormData({ ...formData, quantity: parseFloat(val) || 0 })}
            />
          </View>
          <View className="flex-1">
            <Text className="text-gray-700 font-bold mb-2">Prix max (Ar/kg) *</Text>
            <TextInput
              className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-lg text-[#059669] font-bold"
              placeholder="Ex: 2400"
              keyboardType="numeric"
              onChangeText={(val) => setFormData({ ...formData, max_unit_price: parseFloat(val) || 0 })}
            />
          </View>
        </View>

        {/* Quality */}
        <Text className="text-gray-700 font-bold mb-2">Qualité requise</Text>
        <TextInput
          className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-4"
          placeholder="Ex: Grade A, Bio, Extra..."
          onChangeText={(val) => setFormData({ ...formData, quality_required: val })}
        />

        {/* Description / Special Requirements */}
        <Text className="text-gray-700 font-bold mb-2">Instructions spécifiques</Text>
        <TextInput
          className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-8"
          placeholder="Délai de livraison, conditions, etc."
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          onChangeText={(val) => setFormData({ ...formData, special_requirements: val })}
        />

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isSubmitting}
          className={`bg-[#059669] rounded-2xl p-5 items-center flex-row justify-center ${isSubmitting ? 'opacity-70' : ''}`}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#ffffff" className="mr-2" />
          ) : (
            <FontAwesome name="send" size={20} color="#ffffff" className="mr-2" />
          )}
          <Text className="text-white font-bold text-lg ml-2">Publier la Demande</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
