// src/pages/CertificationHubPage.jsx (Versão 2.2 - Com busca RPC)
import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Platform, Alert, ActivityIndicator } from 'react-native'; // Adicionado ActivityIndicator
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, BookOpen, ClipboardList, ListChecks, FileText as Briefcase, Zap } from 'lucide-react-native'; // Ícones
import { supabase } from './AuthContext'; // Importa Supabase

// Paleta de cores padrão (da HomePage)
const cores = {
  primary: "#00C853",
  primaryLight: "#E6F8EB",
  textPrimary: "#1A202C",
  textSecondary: "#64748B",
  textLight: "#FFFFFF",
  background: "#F7FAFC",      // Fundo cinza-claro
  cardBackground: "#FFFFFF",   // Fundo dos cards
  border: "#E2E8F0",
  shadow: 'rgba(0, 0, 0, 0.05)',
};

// Componente de Card Reutilizável (Com isLoading)
const OptionCard = ({ icon: Icon, title, subtitle, onPress, isFeatured = false, isLoading = false }) => (
  <TouchableOpacity
    style={isFeatured ? styles.featuredCard : styles.optionCard}
    onPress={onPress}
    activeOpacity={0.8}
    disabled={isLoading} // Desabilita o botão durante o loading
  >
    {/* Mostra ActivityIndicator ou Ícone */}
    {isLoading ? (
       <ActivityIndicator color={isFeatured ? cores.textLight : cores.primary} style={styles.loadingIndicator} />
    ) : (
      <View style={[
        styles.iconContainer,
        isFeatured && styles.featuredIconContainer
      ]}>
        <Icon
          size={isFeatured ? 28 : 24}
          color={isFeatured ? cores.textLight : cores.primary}
        />
      </View>
    )}
    <View style={styles.textContainer}>
      <Text style={[
        styles.cardTitle,
        isFeatured && styles.featuredCardTitle
      ]}>{title}</Text>
      <Text style={[
        styles.cardSubtitle,
        isFeatured && styles.featuredCardSubtitle
      ]}>{subtitle}</Text>
    </View>
  </TouchableOpacity>
);


export default function CertificationHubPage() {
  const navigation = useNavigation();
  const route = useRoute();
  const [isLoadingCase, setIsLoadingCase] = useState(false); // Estado de loading
  const [isLoadingInterativa, setIsLoadingInterativa] = useState(false);

  const certificationType = route.params?.certificationType || 'unknown';
  const certificationName = route.params?.certificationName || 'Certificação';

  const handleNavigateToTopics = () => {
    if (certificationType === 'unknown') {
       Alert.alert('Erro', 'Tipo de certificação não identificado.');
       return;
    }
    navigation.navigate(`${certificationType}-topicos`);
  };
  const handleNavigateToApostilas = () => Alert.alert(`Apostilas para ${certificationName} (WIP)`);
  const handleNavigateToSimuladoCompleto = () => Alert.alert(`Simulado Completo ${certificationName} (WIP)`);
  const handleNavigateToInterativa = async () => {
  console.log("Iniciando 'handleNavigateToInterativa' com chamada REAL ao Supabase..."); // Log atualizado
  if (certificationType === 'unknown') {
    Alert.alert('Erro', 'Tipo de certificação não identificado.');
    return;
  }

  setIsLoadingInterativa(true);

  try {
    // 1. Chama a RPC REAL que criamos
    console.log(`Chamando RPC 'get_random_interactive_question' com filtro: ${certificationType}`);
    const { data, error: rpcError } = await supabase.rpc(
      'get_random_interactive_question',
      {
        prova_filter: certificationType // Passa "cpa", "cpror", etc.
      }
    );

    if (rpcError) {
      console.error("Erro da RPC:", rpcError);
      throw rpcError;
    }

    // 2. Verifica se a RPC achou alguma questão
    if (data && data.length > 0) {
      const questionData = data[0]; // Pega a primeira (e única) questão
      console.log("Dados recebidos do Supabase:", questionData.prova, questionData.contexto);

      console.log("Navegando para 'InteractiveQuestionPage' com dados REAIS...");
      navigation.navigate('InteractiveQuestionPage', { questionData: questionData }); //

    } else {
      console.log("Nenhum dado retornado pela RPC.");
      Alert.alert('Indisponível', `Nenhuma questão interativa encontrada para ${certificationName} ainda.`);
    }

  } catch (error) {
    console.error("Erro no bloco catch ao buscar questão:", error);
    Alert.alert('Erro', 'Não foi possível carregar a questão. Tente novamente.');
  } finally {
    setIsLoadingInterativa(false);
    console.log("Finalizando 'handleNavigateToInterativa'.");
  }
};

// Mantenha o resto do arquivo CertificationHubPage.js como estava.
  const handleNavigateToCases = async () => {
      console.log("Clicou em Cases Práticos para:", certificationType); // <-- LOG 1
      
      if (certificationType === 'unknown') {
        Alert.alert('Erro', 'Tipo de certificação não identificado.');
        return;
      }

      setIsLoadingCase(true);

      try {
        // --- ADICIONE ESTE LOG ---
        console.log(`>>> Valor de prova_filter a ser enviado: '${certificationType}'`); 
        // -------------------------

        const { data: caseDataArray, error: rpcError } = await supabase.rpc(
          'get_random_case',
          {
            prova_filter: certificationType // Passa a prova como argumento
          }
        );

        console.log("Resultado da RPC:", caseDataArray); // <-- LOG 3

        if (caseDataArray && caseDataArray.length > 0) {
          const caseData = caseDataArray[0];
          console.log("Navegando para StudyCasePage com dados:", caseData); // <-- LOG 4
          navigation.navigate('StudyCasePage', { caseData: caseData });
        } else {
          console.log("Nenhum caso encontrado pela RPC."); // <-- LOG 5
          Alert.alert('Indisponível', `Nenhum estudo de caso encontrado para ${certificationName} ainda.`);
        }

      } catch (error) {
        console.error("Erro GERAL ao buscar estudo de caso:", error); // <-- LOG ERRO GERAL
        Alert.alert('Erro', 'Não foi possível carregar o estudo de caso. Tente novamente.');
      } finally {
        setIsLoadingCase(false);
      }
    };
    // =======================================================


    return (
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft size={24} color={cores.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{certificationName}</Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.container}
        >
          {/* Seção Destaque: Apostilas */}
          <OptionCard
            icon={BookOpen}
            title="Apostilas Completas"
            subtitle="Revise todo o conteúdo teórico da prova."
            onPress={handleNavigateToApostilas}
            isFeatured={true}
          />

          {/* Seção Prática */}
          <Text style={styles.sectionTitle}>PRÁTICA</Text>

          {/* Cards de Opção */}
          <OptionCard
            icon={ClipboardList}
            title="Simulado Completo"
            subtitle="Teste em condições reais de prova."
            onPress={handleNavigateToSimuladoCompleto}
          />
          <OptionCard
            icon={ListChecks}
            title="Questões por Tópico"
            subtitle="Pratique áreas específicas."
            onPress={handleNavigateToTopics}
          />
          <OptionCard
            icon={Briefcase}
            title="Cases Práticos" // Nome correto
            subtitle="Analise cenários e tome decisões."
            onPress={handleNavigateToCases} // Função com a lógica RPC
            isLoading={isLoadingCase} // Passa o estado de loading
          />
          <OptionCard
            icon={Zap}
            title="Questões Interativas"
            subtitle="Desafios rápidos e dinâmicos."
            onPress={handleNavigateToInterativa}
            isLoading={isLoadingInterativa}
          />

        </ScrollView>
      </SafeAreaView>
    );
  }

// Estilos (Incluindo o loadingIndicator)
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: cores.background,
    paddingTop: Platform.OS === "android" ? 25 : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: Platform.OS === 'android' ? 30 : 16,
    gap: 16,
    backgroundColor: cores.background,
  },
  backButton: { padding: 4 },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: cores.textPrimary
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
    gap: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: cores.textSecondary,
    paddingHorizontal: 4,
    textTransform: 'uppercase',
  },
  featuredCard: {
    backgroundColor: cores.primary,
    borderRadius: 20,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  optionCard: {
    backgroundColor: cores.cardBackground,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    shadowColor: cores.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 5,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: cores.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
  },
  loadingIndicator: { // Estilo para o loading
      width: 48,
      height: 48,
      alignItems: 'center',
      justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: cores.textPrimary,
    marginBottom: 2,
  },
  featuredCardTitle: {
    color: cores.textLight,
    fontSize: 17,
  },
  cardSubtitle: {
    fontSize: 14,
    color: cores.textSecondary,
    lineHeight: 20,
  },
  featuredCardSubtitle: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 14,
  },
});