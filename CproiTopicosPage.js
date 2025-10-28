// /src/pages/CproiTopicosPage.jsx (Versão 2.0 - Padronizada com a HomePage)
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Check, Minus, Plus, Play } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// =======================================================
// 1. PALETA DE CORES ATUALIZADA (da HomePage.js)
// =======================================================
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

export default function CproiTopicosPage() {
  const navigation = useNavigation();

  // =======================================================
  // ☆ MUDANÇA ☆ (Tópicos, Título e Prova)
  // =======================================================
  const allTopics = [
    'Produtos de Investimentos',
    'Investimentos alternativos, digitais e no exterior',
    'Previdência Complementar',
    'Gestão de risco, análise de carteiras e indicadores de performance',
  ];

  const difficultyOptions = ['Prova', 'Fácil', 'Médio', 'Difícil'];
  const [selectedDifficulty, setSelectedDifficulty] = useState('Prova');
  const [selectedTopics, setSelectedTopics] = useState(allTopics);
  const [questionsCount, setQuestionsCount] = useState(15);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  useEffect(() => {
    setIsButtonDisabled(selectedTopics.length === 0);
  }, [selectedTopics]);

  const handleTopicChange = (topic) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  };

  const handleStartQuiz = async () => {
    if (isButtonDisabled) return;
    try {
      // ☆ MUDANÇA ☆
      await AsyncStorage.setItem('lastStudiedTrail', JSON.stringify({ name: 'Simulado C-PRO I' }));
    } catch (e) { console.error('Erro ao salvar no AsyncStorage:', e); }

    navigation.navigate('simulado', {
      count: questionsCount,
      topics: selectedTopics,
      prova: 'cproi', // ☆ MUDANSA ☆
      difficulty: selectedDifficulty,
    });
  };
  // =======================================================

  const handleSelectAll = () => {
    setSelectedTopics(selectedTopics.length === allTopics.length ? [] : allTopics);
  };

  const handleDecrement = () => { setQuestionsCount(prev => Math.max(5, prev - 5)); };
  const handleIncrement = () => { setQuestionsCount(prev => Math.min(50, prev + 5)); };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft size={24} color={cores.textPrimary} />
          </TouchableOpacity>
          <View>
            {/* ☆ MUDANÇA ☆ */}
            <Text style={styles.headerTitle}>Simulado C-PRO I</Text>
            <Text style={styles.headerSubtitle}>Personalize seu treino</Text>
          </View>
        </View>

        <ScrollView style={styles.mainContent} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
          {/* Seção Tópicos */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>TÓPICOS</Text>
            <View style={styles.card}>
              <TouchableOpacity style={styles.topicItem} onPress={handleSelectAll}>
                <View style={[styles.checkboxBase, selectedTopics.length === allTopics.length && styles.checkboxChecked]}>
                  {selectedTopics.length === allTopics.length && <Check size={16} color={cores.textLight} />}
                </View>
                <Text style={styles.selectAllText}>Selecionar Todos</Text>
              </TouchableOpacity>
              <View style={styles.divider} />
              {allTopics.map((topic, index) => {
                const isSelected = selectedTopics.includes(topic);
                return (
                  <View key={topic}>
                    <TouchableOpacity style={styles.topicItem} onPress={() => handleTopicChange(topic)}>
                      <View style={[styles.checkboxBase, isSelected && styles.checkboxChecked]}>
                        {isSelected && <Check size={16} color={cores.textLight} />}
                      </View>
                      <Text style={styles.topicText}>{topic}</Text>
                    </TouchableOpacity>
                    {index < allTopics.length - 1 && <View style={styles.divider} />}
                  </View>
                );
              })}
            </View>
          </View>

          {/* Seção de Configurações */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>CONFIGURAÇÕES</Text>
            <View style={styles.card}>
              {/* Stepper de Questões */}
              <View style={styles.settingsRow}>
                <Text style={styles.settingsLabel}>Número de Questões</Text>
                <View style={styles.stepperControl}>
                  <TouchableOpacity style={[styles.stepperButton, questionsCount <= 5 && styles.stepperButtonDisabled]} onPress={handleDecrement} disabled={questionsCount <= 5}>
                    <Minus size={20} color={cores.primary} />
                  </TouchableOpacity>
                  <Text style={styles.stepperValue}>{questionsCount}</Text>
                  <TouchableOpacity style={[styles.stepperButton, questionsCount >= 50 && styles.stepperButtonDisabled]} onPress={handleIncrement} disabled={questionsCount >= 50}>
                    <Plus size={20} color={cores.primary} />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.divider} />
              {/* Filtro de Dificuldade */}
              <View style={[styles.settingsRow, { flexDirection: 'column', alignItems: 'flex-start' }]}>
                <Text style={styles.settingsLabel}>Dificuldade</Text>
                <View style={styles.difficultyContainer}>
                  {difficultyOptions.map(option => {
                    const isSelected = selectedDifficulty === option;
                    return (
                      <TouchableOpacity
                        key={option}
                        style={[styles.difficultyButton, isSelected && styles.difficultyButtonSelected]}
                        onPress={() => setSelectedDifficulty(option)}
                      >
                        <Text style={[styles.difficultyButtonText, isSelected && styles.difficultyButtonTextSelected]}>{option}</Text>
                      </TouchableOpacity>
                    )
                  })}
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity style={[styles.footerButton, isButtonDisabled && styles.footerButtonDisabled]} onPress={handleStartQuiz} disabled={isButtonDisabled} activeOpacity={0.8}>
            <Play size={22} color={cores.textLight} />
            <Text style={styles.footerButtonText}>Iniciar Simulado</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

// =======================================================
// 8. ESTILOS IDÊNTICOS AOS DA CpaTopicosPage
// =======================================================
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: cores.background },
  container: { flex: 1, backgroundColor: cores.background },
  header: { 
    paddingHorizontal: 20, 
    paddingVertical: 16, 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 16, 
    backgroundColor: cores.background,
    paddingTop: Platform.OS === 'android' ? 30 : 16,
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: cores.textPrimary },
  headerSubtitle: { fontSize: 14, color: cores.textSecondary },
  mainContent: { 
    flex: 1, 
    paddingHorizontal: 20, 
    paddingTop: 8,
  },
  section: { marginBottom: 24 },
  sectionTitle: { 
    fontSize: 12, 
    fontWeight: '600', 
    color: cores.textSecondary, 
    paddingHorizontal: 4, 
    marginBottom: 8, 
    textTransform: 'uppercase' 
  },
  card: { 
    backgroundColor: cores.cardBackground, 
    borderRadius: 20, 
    overflow: 'hidden',
    shadowColor: cores.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 5,
  },
  topicItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 16, 
    paddingHorizontal: 20 
  },
  checkboxBase: { 
    width: 24, 
    height: 24, 
    borderRadius: 8, 
    borderWidth: 2, 
    borderColor: cores.border, 
    backgroundColor: cores.background, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 16 
  },
  checkboxChecked: { 
    backgroundColor: cores.primary, 
    borderColor: cores.primary 
  },
  topicText: { 
    fontSize: 15, 
    color: cores.textPrimary, 
    flex: 1, 
    lineHeight: 20 
  },
  selectAllText: { 
    fontSize: 15, 
    color: cores.textPrimary, 
    fontWeight: 'bold', 
    flex: 1 
  },
  divider: { 
    height: 1, 
    backgroundColor: cores.border, 
    marginHorizontal: 20 
  },
  settingsRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingVertical: 16, 
    paddingHorizontal: 20, 
    backgroundColor: cores.cardBackground 
  },
  settingsLabel: { 
    fontSize: 16, 
    color: cores.textPrimary, 
    fontWeight: '500' 
  },
  stepperControl: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: cores.background, 
    borderRadius: 20 
  },
  stepperButton: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    justifyContent: 'center', 
    alignItems: 'center'
  },
  stepperButtonDisabled: { opacity: 0.3 },
  stepperValue: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: cores.textPrimary, 
    paddingHorizontal: 12 
  },
  difficultyContainer: { 
    flexDirection: 'row', 
    flexWrap: 'wrap',
    gap: 8,
    paddingTop: 16, 
    backgroundColor: cores.cardBackground,
  },
  difficultyButton: { 
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1, 
    borderColor: cores.border, 
    backgroundColor: cores.background, 
    borderRadius: 16,
  },
  difficultyButtonSelected: { 
    backgroundColor: cores.primaryLight, 
    borderColor: cores.primary 
  },
  difficultyButtonText: { 
    color: cores.textSecondary, 
    fontWeight: '600',
    fontSize: 14,
  },
  difficultyButtonTextSelected: { 
    color: cores.primary,
  },
  footer: { 
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24, 
    backgroundColor: 'transparent', 
  },
  footerButton: { 
    backgroundColor: cores.primary, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: 16, 
    borderRadius: 16, 
    gap: 10,
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 8,
  },
  footerButtonDisabled: { 
    backgroundColor: cores.textSecondary, 
    opacity: 0.5 
  },
  footerButtonText: { 
    color: cores.textLight, 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
});