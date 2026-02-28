import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { productsService, Product } from '../../services/products';
import { offersService, CreateOfferData } from '../../services/offers';
import { FontAwesome } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';

export default function CreateOfferScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<Partial<CreateOfferData>>({
    product_id: 0,
    quantity: 0,
    unit_price: 0,
    description: '',
    location_region: 'Analamanga',
    location_commune: '',
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
    if (!formData.product_id || !formData.quantity || !formData.unit_price) {
      Alert.alert('Erreur', 'Veuillez remplir les champs obligatoires');
      return;
    }

    setIsSubmitting(true);
    try {
      await offersService.createOffer(formData as CreateOfferData);
      Alert.alert('Succès', 'Votre offre a été créée avec succès', [
        { text: 'OK', onPress: () => router.replace('/offers') }
      ]);
    } catch (error) {
      console.error('Error creating offer:', error);
      Alert.alert('Erreur', 'Impossible de créer l\'offre');
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
        title: 'Créer une Offre',
        headerTintColor: '#059669',
      }} />
      
      <View className="p-6">
        <Text className="text-gray-500 mb-6">Partagez vos produits avec les collecteurs du réseau Agriconnect.</Text>

        {/* Product Selection */}
        <Text className="text-gray-700 font-bold mb-2">Produit *</Text>
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

        {/* Quantity and Price */}
        <View className="flex-row gap-4 mb-4">
          <View className="flex-1">
            <Text className="text-gray-700 font-bold mb-2">Quantité (kg) *</Text>
            <TextInput
              className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-lg"
              placeholder="Ex: 500"
              keyboardType="numeric"
              onChangeText={(val) => setFormData({ ...formData, quantity: parseFloat(val) || 0 })}
            />
          </View>
          <View className="flex-1">
            <Text className="text-gray-700 font-bold mb-2">Prix/kg (Ar) *</Text>
            <TextInput
              className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-lg text-[#059669] font-bold"
              placeholder="Ex: 2500"
              keyboardType="numeric"
              onChangeText={(val) => setFormData({ ...formData, unit_price: parseFloat(val) || 0 })}
            />
          </View>
        </View>

        {/* Region */}
        <Text className="text-gray-700 font-bold mb-2">Région</Text>
        <TextInput
          className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-4"
          placeholder="Ex: Analamanga"
          value={formData.location_region}
          onChangeText={(val) => setFormData({ ...formData, location_region: val })}
        />

        {/* Quality */}
        <Text className="text-gray-700 font-bold mb-2">Qualité</Text>
        <TextInput
          className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-4"
          placeholder="Ex: Grade A, Bio, Extra..."
          onChangeText={(val) => setFormData({ ...formData, quality: val })}
        />

        {/* Description */}
        <Text className="text-gray-700 font-bold mb-2">Description / Notes</Text>
        <TextInput
          className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-8"
          placeholder="Détails supplémentaires..."
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          onChangeText={(val) => setFormData({ ...formData, description: val })}
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
            <FontAwesome name="check-circle" size={20} color="#ffffff" className="mr-2" />
          )}
          <Text className="text-white font-bold text-lg ml-2">Publier l'Offre</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
