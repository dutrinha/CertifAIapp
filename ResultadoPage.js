// /src/pages/ResultadoPage.jsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { X, RefreshCw, Home } from 'lucide-react-native';
import { Svg, Circle } from 'react-native-svg'; // 1. Importando componentes SVG

// Cores
const cores = {
  primary: '#00C853',
  primary700: '#00B048',
  primary100: '#B3EBC6',
  primary50: '#E6F8EB',
  secondary: '#1A202C',
  light: '#FFFFFF',
  softGray: '#F7FAFC',
  gray100: '#F1F5F9',
  gray200: '#E2E8F0',
  gray500: '#64748B',
  green700: '#15803D',
  green600: '#16A34A',
  red600: '#DC2626',
  yellow700: '#B45309',
};

export default function ResultadoPage() {
  const route = useRoute();
  const navigation = useNavigation();

  // 2. Pega os dados via route.params
  const { score = 0, total = 1 } = route.params;
  const incorrect = total - score;
  const percentage = Math.round((score / total) * 100);
  const isApproved = percentage >= 70;

  // Estados para a animação do círculo (lógica idêntica à web)
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const [progressOffset, setProgressOffset] = useState(circumference);

  useEffect(() => {
    const offset = circumference - (percentage / 100) * circumference;
    // Adiciona um pequeno delay para a animação ser visível
    const timer = setTimeout(() => setProgressOffset(offset), 300);
    return () => clearTimeout(timer); // Limpa o timer ao desmontar
  }, [percentage, circumference]);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Resultado do Simulado</Text>
          <Text style={styles.headerSubtitle}>Confira seu desempenho.</Text>
        </View>
        <TouchableOpacity 
          onPress={() => navigation.popToTop()} 
          style={styles.closeButton}>
          <X size={24} color={cores.secondary} />
        </TouchableOpacity>
      </View>

      {/* Conteúdo Principal */}
      <View style={styles.mainContent}>
        {/* 3. Gráfico SVG Nativo */}
        <View style={styles.circleContainer}>
          <Svg height="100%" width="100%" viewBox="0 0 120 120">
            {/* Círculo de fundo */}
            <Circle cx="60" cy="60" r={radius} stroke={cores.gray200} strokeWidth="12" fill="none" />
            {/* Círculo de progresso */}
            <Circle
              cx="60"
              cy="60"
              r={radius}
              stroke={isApproved ? cores.primary : '#F59E0B'} // Amarelo para não aprovado
              strokeWidth="12"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={progressOffset}
              originX="60"
              originY="60"
              rotation="-90" // Rotaciona o início do círculo
            />
          </Svg>
          <View style={styles.circleTextContainer}>
            <Text style={styles.percentageText}>{percentage}%</Text>
            <View style={[styles.statusBadge, isApproved ? styles.badgeApproved : styles.badgeReproved]}>
              <Text style={[styles.statusText, isApproved ? styles.textApproved : styles.textReproved]}>
                {isApproved ? 'Aprovado' : 'Não Aprovado'}
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.mainTitle}>
          {isApproved ? 'Parabéns!' : 'Continue estudando'}
        </Text>
        <Text style={styles.mainSubtitle}>
          {isApproved
            ? 'Você atingiu a pontuação necessária. Continue praticando para garantir a aprovação!'
            : 'Você está no caminho certo! Revise as questões e tente novamente.'}
        </Text>

        {/* Card de Resumo */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Acertos</Text>
            <Text style={[styles.summaryValue, { color: cores.green600 }]}>{score}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Erros</Text>
            <Text style={[styles.summaryValue, { color: cores.red600 }]}>{incorrect}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total</Text>
            <Text style={[styles.summaryValue, { color: cores.secondary }]}>{total}</Text>
          </View>
        </View>
      </View>

      {/* Footer com botões de navegação */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.replace('cpa-topicos')}
        >
          <RefreshCw size={20} color={cores.primary700} />
          <Text style={styles.secondaryButtonText}>Refazer</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.popToTop()}
        >
          <Home size={20} color={cores.light} />
          <Text style={styles.primaryButtonText}>Voltar ao Início</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// StyleSheet
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: cores.light, paddingTop: Platform.OS === 'android' ? 25 : 0 },
  header: { paddingHorizontal: 24, paddingTop: 32, paddingBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: cores.secondary },
  headerSubtitle: { fontSize: 14, color: cores.gray500 },
  closeButton: { padding: 4 },
  mainContent: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  circleContainer: { width: 192, height: 192, marginBottom: 24 },
  circleTextContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' },
  percentageText: { fontSize: 40, fontWeight: 'bold', color: cores.secondary },
  statusBadge: { marginTop: 4, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 16 },
  badgeApproved: { backgroundColor: '#F0FDF4' }, // green-50
  badgeReproved: { backgroundColor: '#FFFBEB' }, // yellow-50
  statusText: { fontSize: 14, fontWeight: '600' },
  textApproved: { color: cores.green700 },
  textReproved: { color: cores.yellow700 },
  mainTitle: { fontSize: 24, fontWeight: 'bold', color: cores.secondary },
  mainSubtitle: { color: cores.gray500, marginTop: 8, textAlign: 'center', maxWidth: 300 },
  summaryCard: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: cores.softGray, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: cores.gray100, marginTop: 32, width: '100%', maxWidth: 400 },
  summaryItem: { alignItems: 'center', flex: 1 },
  summaryLabel: { fontSize: 14, color: cores.gray500, fontWeight: '500' },
  summaryValue: { fontSize: 24, fontWeight: 'bold' },
  divider: { width: 1, backgroundColor: cores.gray200 },
  footer: { padding: 24, borderTopWidth: 1, borderColor: cores.gray200, flexDirection: 'row', gap: 16 },
  primaryButton: { flex: 1, backgroundColor: cores.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 12, gap: 8 },
  primaryButtonText: { color: cores.light, fontSize: 16, fontWeight: 'bold' },
  secondaryButton: { flex: 1, backgroundColor: cores.primary50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 12, gap: 8 },
  secondaryButtonText: { color: cores.primary700, fontSize: 16, fontWeight: 'bold' },
});