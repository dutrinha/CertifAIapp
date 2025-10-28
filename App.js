// /App.jsx (Versão FINAL - Corrigido erro de estrutura do Navigator)
import React from 'react';
import { ActivityIndicator, View, StyleSheet, StatusBar, Platform } from 'react-native';
import { Home, FileText, BarChart3, User } from 'lucide-react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider, MD3LightTheme } from 'react-native-paper';
import { AuthProvider, useAuth } from './AuthContext'; //

// Import Pages
// ...
// Import Pages
import HomePage from './HomePage'; //
import TrilhasPage from './TrilhasPage'; //
import CpaTopicosPage from './CpaTopicosPage'; //
import CprorTopicosPage from './CprorTopicosPage'; //
import CproiTopicosPage from './CproiTopicosPage'; //
import SimuladoPage from './SimuladoPage'; //
import ResultadoPage from './ResultadoPage'; //
import CertificationHubPage from './CertificationHubPage'; //
import StudyCasePage from './StudyCasePage'; //
import InteractiveQuestionPage from './InteractiveQuestionPage'; //
import InteractiveResultPage from './InteractiveResultPage'; //

// Import Screens
import LoginScreen from './LoginScreen'; //
import SettingsScreen from './SettingsScreen'; //
import OnboardingNavigator from './OnboardingNavigator'; //
// ...

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();

// Cores
const lightColors = {
  primary: '#00C853', secondary: '#1A202C', background: '#FFFFFF',
  card: '#FFFFFF', text: '#1A202C', textSecondary: '#64748B', border: '#E2E8F0',
};

// --- Navegadores ---

function TabNavigator() {
  const colors = lightColors;
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: { fontSize: 12, fontWeight: '500' },
        tabBarStyle: {
          backgroundColor: 'rgba(255, 255, 255, 0.95)', borderTopColor: colors.border,
          borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 4, height: 80,
          paddingBottom: Platform.OS === 'ios' ? 25 : 10,
        },
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'Início') return <Home size={size} color={color} />;
          if (route.name === 'Trilhas') return <FileText size={size} color={color} />;
          if (route.name === 'Progresso') return <BarChart3 size={size} color={color} />;
          if (route.name === 'Perfil') return <User size={size} color={color} />;
          return null;
        },
      })}>
      <Tab.Screen name="Início" component={HomePage} />
      <Tab.Screen name="Trilhas" component={TrilhasPage} />
      <Tab.Screen name="Progresso" component={HomePage} listeners={{ tabPress: (e) => e.preventDefault() }} />
      <Tab.Screen name="Perfil" component={HomePage} listeners={{ tabPress: (e) => e.preventDefault() }} />
    </Tab.Navigator>
  );
}

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
    </AuthStack.Navigator>
  );
}

// =======================================================
// ☆ ROOT NAVIGATOR CORRIGIDO ☆
// =======================================================
function RootNavigator() {
  const { session, user, loading: authLoading } = useAuth(); //
  const colors = lightColors;

  if (authLoading) {
    return ( <View style={[ styles.loadingContainer, { backgroundColor: colors.background } ]}><ActivityIndicator size="large" color={colors.primary} /></View> );
  }

  const hasCompletedOnboarding = user?.user_metadata?.onboarding_completed === true; //

  return (
    // Removido qualquer espaço/comentário diretamente aqui
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {session && session.user ? (
        // Usuário Logado - Usamos um Fragment <> para agrupar as telas
        <>
          {/* --- DECISÃO: ONBOARDING OU APP PRINCIPAL --- */}
          {hasCompletedOnboarding ? (
             <Stack.Screen name="Tabs" component={TabNavigator} />
          ) : (
             <Stack.Screen name="Onboarding" component={OnboardingNavigator} /> //
          )}
          {/* --- Fim da decisão --- */}

          {/* --- Telas sempre disponíveis quando logado --- */}
          {/* Certifique-se de que não há espaços/comentários entre estas telas */}
          <Stack.Screen name="cpa-hub" component={CertificationHubPage} initialParams={{ certificationType: 'cpa', certificationName: 'Certificação CPA' }} />
          <Stack.Screen name="cpror-hub" component={CertificationHubPage} initialParams={{ certificationType: 'cpror', certificationName: 'Certificação C-PRO R' }} />
          <Stack.Screen name="cproi-hub" component={CertificationHubPage} initialParams={{ certificationType: 'cproi', certificationName: 'Certificação C-PRO I' }} />
          <Stack.Screen name="cpa-topicos" component={CpaTopicosPage} />
          <Stack.Screen name="cpror-topicos" component={CprorTopicosPage} />
          <Stack.Screen name="cproi-topicos" component={CproiTopicosPage} />
          <Stack.Screen name="simulado" component={SimuladoPage} />
          <Stack.Screen name="StudyCasePage" component={StudyCasePage} />
          <Stack.Screen name="InteractiveQuestionPage" component={InteractiveQuestionPage} />
          <Stack.Screen name="InteractiveResultPage" component={InteractiveResultPage} />
          <Stack.Screen name="resultado" component={ResultadoPage} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          {/* --- Fim das telas --- */}
        </> // Fim do Fragment para usuário logado
      ) : (
        // Usuário Deslogado
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
      {/* Removido qualquer espaço/comentário diretamente aqui */}
    </Stack.Navigator>
  );
}


// Componente App principal
export default function App() {
  console.log('App: Rendering AuthProvider');
  return (
    <AuthProvider> {/* */}
      <PaperProvider theme={MD3LightTheme}>
        <NavigationContainer theme={DefaultTheme}>
          <StatusBar barStyle="dark-content" backgroundColor={lightColors.background} />
          <RootNavigator />
        </NavigationContainer>
      </PaperProvider>
    </AuthProvider>
  );
}

// Estilos
const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});