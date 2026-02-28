import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Image, ActivityIndicator, TextInput, Alert } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { offersService, Offer } from '../../services/offers';
import { productsService, Product } from '../../services/products';
import { FontAwesome } from '@expo/vector-icons';
import { API_URL } from '../../constants/Colors';
import { directPurchasesService } from '../../services/direct_purchases';
import { router } from 'expo-router';

export default function OffersScreen() {
  const { user } = useAuth();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  const handleBuy = async (offer: any) => {
    Alert.alert(
      'Confirmer l\'achat',
      `Voulez-vous acheter ${offer.quantity}kg de ce produit pour ${offer.unit_price * offer.quantity} Ar ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Confirmer', 
          onPress: async () => {
            try {
              await directPurchasesService.createPurchase({
                offer_id: offer.id,
                quantity: offer.quantity,
                unit_price: offer.unit_price
              });
              Alert.alert('Succès', 'Achat effectué ! Retrouvez-le dans votre historique.');
              router.push('/purchases');
            } catch (error) {
              Alert.alert('Erreur', 'L\'achat a échoué');
            }
          }
        }
      ]
    );
  };

  const isFarmer = user?.user_type === 'agriculteur';

  const fetchInitialData = async () => {
    try {
      const productsData = await productsService.getProducts();
      setProducts(productsData);
      const uniqueCategories = Array.from(new Set(productsData.map(p => p.category)));
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchOffers = async () => {
    try {
      let data: Offer[];
      if (isFarmer) {
        data = await offersService.getMyOffers();
        // Manual client-side filtering for farmer's own offers if needed, 
        // but typically they want to see all their offers.
      } else {
        const params: any = { status: 'active' };
        if (selectedRegion) params.region = selectedRegion;
        
        // If searching or filtering by category, we need to map to product IDs
        if (searchQuery || selectedCategory) {
          const filteredProducts = products.filter(p => {
            const matchesSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = !selectedCategory || p.category === selectedCategory;
            return matchesSearch && matchesCategory;
          });
          
          if (filteredProducts.length === 0) {
            setOffers([]);
            return;
          }
          
          // The backend /offers endpoint supports filters, but usually one product_id at a time.
          // If multiple products match, we might need a different approach or fetch all and filter.
          // For now, let's fetch all active and filter client-side for complex search/category
          // unless the backend is extended.
          data = await offersService.getOffers({ status: 'active', region: selectedRegion });
          data = data.filter(offer => 
            filteredProducts.some(p => p.id === offer.product_id)
          );
        } else {
          data = await offersService.getOffers(params);
        }
      }
      setOffers(data);
    } catch (error) {
      console.error('Error fetching offers:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchInitialData();
    }
  }, [user]);

  useEffect(() => {
    if (user) { // Ensure user is loaded before fetching offers
      fetchOffers();
    }
  }, [user, isFarmer, selectedCategory, selectedRegion]); // searchQuery is handled via manual search or debounce

  const handleSearch = () => {
    setIsLoading(true);
    fetchOffers();
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchOffers();
  };

  const getFullImageUrl = (url?: string) => {
    if (!url) return 'https://via.placeholder.com/150';
    if (url.startsWith('http')) return url;
    return `${API_URL}${url}`;
  };

  const getProductName = (productId: number) => {
    return products.find(p => p.id === productId)?.name || `Produit #${productId}`;
  };

  const regions = [
    'Analamanga', 'Vakinankaratra', 'Bongolava', 'Itasy', 'Alaotra-Mangoro', 
    'Atsinanana', 'Analanjirofo', 'Boeny', 'Sofia', 'Betsiboka', 'Melaky',
    'Atsimo-Andrefana', 'Androy', 'Anosy', 'Menabe', 'Haute Matsiatra',
    'Amoron\'i Mania', 'Vatovavy', 'Fitovinany', 'Atsimo-Atsinanana', 'Ihorombe', 'Sava', 'Diana'
  ].sort();

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white pt-12 pb-4 px-6 border-b border-gray-100">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-3xl font-bold text-gray-900">
            {isFarmer ? 'Mes Offres' : 'Marché'}
          </Text>
          {isFarmer && (
            <TouchableOpacity className="bg-[#059669] p-3 rounded-xl">
              <FontAwesome name="plus" size={20} color="#ffffff" />
            </TouchableOpacity>
          )}
        </View>

        {!isFarmer && (
          <View>
            {/* Search Bar */}
            <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-2 mb-4">
              <FontAwesome name="search" size={18} color="#64748b" />
              <TextInput
                className="flex-1 ml-3 text-gray-900 py-1"
                placeholder="Rechercher un produit..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearch}
                returnKeyType="search"
              />
              {searchQuery !== '' && (
                <TouchableOpacity onPress={() => { setSearchQuery(''); handleSearch(); }}>
                  <FontAwesome name="times-circle" size={18} color="#94a3b8" />
                </TouchableOpacity>
              )}
            </View>

            {/* Categories */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
              <TouchableOpacity
                onPress={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded-full mr-2 ${selectedCategory === null ? 'bg-[#059669]' : 'bg-gray-100'}`}
              >
                <Text className={`font-semibold ${selectedCategory === null ? 'text-white' : 'text-gray-600'}`}>Tous</Text>
              </TouchableOpacity>
              {categories.map(cat => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
                  className={`px-4 py-2 rounded-full mr-2 ${selectedCategory === cat ? 'bg-[#059669]' : 'bg-gray-100'}`}
                >
                  <Text className={`font-semibold ${selectedCategory === cat ? 'text-white' : 'text-gray-600'}`}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Region Filter Dropdown (simplified as a horizontal list for now) */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-2">
               <View className="flex-row items-center bg-gray-50 rounded-lg px-2 mr-2">
                 <FontAwesome name="map-marker" size={14} color="#64748b" className="mr-2" />
                 <Text className="text-gray-500 font-medium text-xs ml-1 mr-2">Région:</Text>
               </View>
              <TouchableOpacity
                onPress={() => setSelectedRegion(null)}
                className={`px-3 py-1 rounded-lg mr-2 border ${selectedRegion === null ? 'border-[#059669] bg-[#059669]/5' : 'border-gray-200'}`}
              >
                <Text className={`text-xs ${selectedRegion === null ? 'text-[#059669] font-bold' : 'text-gray-500'}`}>Toutes</Text>
              </TouchableOpacity>
              {regions.map(region => (
                <TouchableOpacity
                  key={region}
                  onPress={() => setSelectedRegion(region === selectedRegion ? null : region)}
                  className={`px-3 py-1 rounded-lg mr-2 border ${selectedRegion === region ? 'border-[#059669] bg-[#059669]/5' : 'border-gray-200'}`}
                >
                  <Text className={`text-xs ${selectedRegion === region ? 'text-[#059669] font-bold' : 'text-gray-500'}`}>{region}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

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
          ) : offers.length === 0 ? (
            <View className="bg-white rounded-2xl p-10 border border-gray-100 items-center justify-center">
              <FontAwesome name="folder-open-o" size={48} color="#cbd5e1" />
              <Text className="text-gray-500 mt-4 text-center">
                {isFarmer 
                  ? "Vous n'avez pas encore créé d'offres." 
                  : "Aucune offre n'est disponible pour le moment."}
              </Text>
              {isFarmer && (
                <TouchableOpacity className="mt-6 bg-[#059669] px-6 py-3 rounded-xl">
                  <Text className="text-white font-bold">Créer ma première offre</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View className="gap-4">
              {offers.map((offer) => (
                <View key={offer.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                  <Image 
                    source={{ uri: getFullImageUrl(offer.image_url) }}
                    className="w-full h-48 bg-gray-200"
                    resizeMode="cover"
                  />
                  <View className="p-4">
                    <View className="flex-row justify-between items-start mb-2">
                      <Text className="text-xl font-bold text-gray-900">{getProductName(offer.product_id)}</Text>
                      <View className={`px-3 py-1 rounded-full ${offer.status === 'active' ? 'bg-green-100' : 'bg-gray-100'}`}>
                        <Text className={`text-xs font-bold ${offer.status === 'active' ? 'text-green-700' : 'text-gray-700'}`}>
                          {offer.status.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                    
                    <View className="flex-row items-center mb-1">
                      <FontAwesome name="balance-scale" size={14} color="#64748b" />
                      <Text className="text-gray-600 ml-2">{offer.quantity} kg</Text>
                    </View>
                    
                    <View className="flex-row items-center mb-3">
                      <FontAwesome name="map-marker" size={14} color="#64748b" />
                      <Text className="text-gray-600 ml-2">{offer.location_region || 'Madagascar'}</Text>
                    </View>

                    <View className="flex-row items-center justify-between mt-2 pt-4 border-t border-gray-50">
                      <Text className="text-2xl font-bold text-[#059669]">{offer.unit_price} Ar/kg</Text>
                      <TouchableOpacity 
                        onPress={() => isFarmer ? router.push(`/offers/edit/${offer.id}`) : handleBuy(offer)}
                        className={`px-4 py-2 rounded-lg ${isFarmer ? 'bg-gray-50' : 'bg-[#059669]'}`}
                      >
                        <Text className={`font-bold ${isFarmer ? 'text-gray-700' : 'text-white'}`}>
                          {isFarmer ? 'Modifier' : 'Acheter'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
