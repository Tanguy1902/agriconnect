import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { router } from 'expo-router';
import i18n from '../utils/i18n';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setIsLoading(true);
    try {
      await login({ username: email, password });
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.detail || 'Email ou mot de passe incorrect');
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
        <View className="flex-1 px-6 pt-20 pb-10">
          {/* Header */}
          <View className="mb-12">
            <Text className="text-4xl font-bold text-gray-900 mb-2">
              {i18n.t('auth.login.title')}
            </Text>
            <Text className="text-lg text-gray-600">
              Bienvenue sur AgriConnect
            </Text>
          </View>

          {/* Form */}
          <View className="space-y-4">
            <View>
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                {i18n.t('auth.login.email')}
              </Text>
              <TextInput
                className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-base"
                placeholder="votre@email.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            <View className="mt-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                {i18n.t('auth.login.password')}
              </Text>
              <TextInput
                className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-base"
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="password"
              />
            </View>

            <TouchableOpacity
              className={`mt-8 rounded-xl py-4 ${isLoading ? 'bg-gray-400' : 'bg-[#059669]'}`}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Text className="text-white text-center font-bold text-lg">
                {isLoading ? 'Connexion...' : i18n.t('auth.login.submit')}
              </Text>
            </TouchableOpacity>

            <View className="flex-row justify-center items-center mt-6">
              <Text className="text-gray-600">
                {i18n.t('auth.login.noAccount')}{' '}
              </Text>
              <TouchableOpacity onPress={() => router.push('/register')}>
                <Text className="text-[#059669] font-bold">
                  {i18n.t('auth.login.signUp')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
