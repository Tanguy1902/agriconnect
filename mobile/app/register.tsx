import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../contexts/AuthContext';
import { router } from 'expo-router';
import i18n from '../utils/i18n';

export default function RegisterScreen() {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    user_type: 'agriculteur' as 'agriculteur' | 'collecteur',
    region: '',
    commune: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();

  const handleRegister = async () => {
    // Validation
    if (!formData.full_name || !formData.email || !formData.phone || !formData.password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Erreur', i18n.t('auth.register.passwordMismatch'));
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setIsLoading(true);
    try {
      console.log('[Register] Submitting data for:', formData.email, 'type:', formData.user_type);
      await register({
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        phone: formData.phone,
        user_type: formData.user_type,
        region: formData.region || undefined,
        commune: formData.commune || undefined,
      });
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.detail || 'Erreur lors de l\'inscription');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <ScrollView className="flex-1 bg-white">
        <View className="flex-1 px-6 pt-16 pb-10">
          {/* Header */}
          <View className="mb-8">
            <Text className="text-4xl font-bold text-gray-900 mb-2">
              {i18n.t('auth.register.title')}
            </Text>
            <Text className="text-lg text-gray-600">
              Rejoignez AgriConnect
            </Text>
          </View>

          {/* Form */}
          <View className="space-y-4">
            <View>
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                {i18n.t('auth.register.fullName')} *
              </Text>
              <TextInput
                className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-base"
                placeholder="Jean Dupont"
                value={formData.full_name}
                onChangeText={(text) => setFormData({ ...formData, full_name: text })}
                autoComplete="name"
              />
            </View>

            <View className="mt-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                {i18n.t('auth.register.email')} *
              </Text>
              <TextInput
                className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-base"
                placeholder="votre@email.com"
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            <View className="mt-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                {i18n.t('auth.register.phone')} *
              </Text>
              <TextInput
                className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-base"
                placeholder="+261 34 00 000 00"
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                keyboardType="phone-pad"
                autoComplete="tel"
              />
            </View>

            <View className="mt-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                {i18n.t('auth.register.userType')} *
              </Text>
              <View className="bg-gray-50 border border-gray-300 rounded-xl overflow-hidden">
                <Picker
                  selectedValue={formData.user_type}
                  onValueChange={(value) => setFormData({ ...formData, user_type: value as 'agriculteur' | 'collecteur' })}
                >
                  <Picker.Item label={i18n.t('auth.register.farmer')} value="agriculteur" />
                  <Picker.Item label={i18n.t('auth.register.collector')} value="collecteur" />
                </Picker>
              </View>
            </View>

            <View className="mt-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                {i18n.t('auth.register.region')}
              </Text>
              <TextInput
                className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-base"
                placeholder="Analamanga"
                value={formData.region}
                onChangeText={(text) => setFormData({ ...formData, region: text })}
              />
            </View>

            <View className="mt-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                {i18n.t('auth.register.commune')}
              </Text>
              <TextInput
                className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-base"
                placeholder="Antananarivo"
                value={formData.commune}
                onChangeText={(text) => setFormData({ ...formData, commune: text })}
              />
            </View>

            <View className="mt-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                {i18n.t('auth.register.password')} *
              </Text>
              <TextInput
                className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-base"
                placeholder="••••••••"
                value={formData.password}
                onChangeText={(text) => setFormData({ ...formData, password: text })}
                secureTextEntry
                autoComplete="password-new"
              />
            </View>

            <View className="mt-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                {i18n.t('auth.register.confirmPassword')} *
              </Text>
              <TextInput
                className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-base"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                secureTextEntry
                autoComplete="password-new"
              />
            </View>

            <TouchableOpacity
              className={`mt-8 rounded-xl py-4 ${isLoading ? 'bg-gray-400' : 'bg-[#059669]'}`}
              onPress={handleRegister}
              disabled={isLoading}
            >
              <Text className="text-white text-center font-bold text-lg">
                {isLoading ? 'Inscription...' : i18n.t('auth.register.submit')}
              </Text>
            </TouchableOpacity>

            <View className="flex-row justify-center items-center mt-6 mb-8">
              <Text className="text-gray-600">
                {i18n.t('auth.register.hasAccount')}{' '}
              </Text>
              <TouchableOpacity onPress={() => router.push('/login')}>
                <Text className="text-[#059669] font-bold">
                  {i18n.t('auth.register.signIn')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
