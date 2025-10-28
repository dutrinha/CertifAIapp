// src/pages/InteractiveResultPage.js (VERSÃO 2.0 - Com Score Máx, Markdown e Chat de Coaching)
import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  Platform, 
  ActivityIndicator,
  Modal, // <-- Importado
  TextInput, // <-- Importado
  KeyboardAvoidingView, // <-- Importado
  FlatList // <-- Importado
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { supabase } from './AuthContext';
import { Sparkles, Home, ChevronRight, Send, X } from 'lucide-react-native';

// Paleta de cores (baseada nas suas outras páginas)
const cores = {
  primary: "#00C853", primaryChat: "#DCF8C6", primaryLight: "#E6F8EB", 
  textPrimary: "#1A202C", textSecondary: "#64748B", textLight: "#FFFFFF", 
  background: "#F7FAFC", cardBackground: "#FFFFFF", border: "#E2E8F0", 
  redText: '#DC2626', greenText: '#16A34A',
};

// =======================================================
// ☆ NOVO COMPONENTE: RENDERIZADOR DE MARKDOWN (NEGRITO) ☆
// =======================================================
const MarkdownRenderer = ({ text, style }) => {
  if (!text) return null;
  const parts = text.split('**'); // Divide o texto por **
  return (
    <Text style={style}>
      {parts.map((part, index) =>
        index % 2 === 1 ? (
          // Se o índice for ímpar, está entre **
          <Text key={index} style={{ fontWeight: 'bold' }}>{part}</Text>
        ) : (
          // Se for par, é texto normal
          part
        )
      )}
    </Text>
  );
};

// Componente para o chat (copiado da InteractiveQuestionPage)
const AiChatMessage = ({ item }) => {
  if (item.role === 'user') {
    return (
      <View style={styles.userMessage}>
        <Text style={styles.messageText}>{item.text}</Text>
      </View>
    );
  }
  return (
    <View style={styles.clientMessage}>
      <MarkdownRenderer text={item.text} style={styles.messageText} />
    </View>
  );
};

export default function InteractiveResultPage() {
  const navigation = useNavigation();
  const route = useRoute();
  const chatRef = useRef(null);
  
  const { userPath, totalScore, questionData } = route.params;

  // =======================================================
  // ☆ PONTUAÇÃO MÁXIMA (REQUEST 1) ☆
  // =======================================================
  // Cada passo que o usuário deu tinha uma pontuação máxima de 5
  const maxScore = userPath.length * 5; 

  const [isLoading, setIsLoading] = useState(true);
  const [aiFeedback, setAiFeedback] = useState("");

  // =======================================================
  // ☆ NOVOS ESTADOS: Para o Modal de Chat (REQUEST 4) ☆
  // =======================================================
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [followUpHistory, setFollowUpHistory] = useState([]);
  const [isAiReplying, setIsAiReplying] = useState(false);
  const [chatInput, setChatInput] = useState("");

  // Efeito que busca o feedback INICIAL da IA
  useEffect(() => {
    const getAiFeedback = async () => {
      try {
        const payload = { 
          history: userPath, 
          context: questionData.contexto, 
          topic: questionData.topico 
        };
        const { data, error } = await supabase.functions.invoke(
          'get-ai-interactive-feedback', 
          { body: JSON.stringify(payload) }
        );
        if (error) throw error;
        setAiFeedback(data.feedback || "Não foi possível obter o feedback.");
      } catch (error) {
        console.error("Erro ao buscar feedback da IA:", error);
        setAiFeedback("Houve um erro ao analisar seu resultado. Tente novamente mais tarde.");
      } finally {
        setIsLoading(false);
      }
    };
    getAiFeedback();
  }, [userPath, questionData]);

  // Função para lidar com o chat de follow-up
  const handleFollowUp = async (question) => {
    // Se a modal não estiver aberta, abre e pré-carrega
    if (!isChatModalOpen) {
      setIsChatModalOpen(true);
    }

    const newUserMessage = { role: 'user', text: question };
    const newHistory = [...followUpHistory, newUserMessage];
    
    setFollowUpHistory(newHistory);
    setChatInput("");
    setIsAiReplying(true);

    try {
      // Prepara o payload para o "Professor de Vendas"
      const payload = {
        originalContext: questionData.contexto,
        originalHistory: userPath,
        chatHistory: newHistory // Envia o histórico do chat ATUAL
      };

      // Chama a NOVA função de IA de vendas
      const { data, error } = await supabase.functions.invoke(
        'get-ai-sales-coaching',
        { body: JSON.stringify(payload) }
      );

      if (error) throw error;
      
      const aiResponse = { role: 'model', text: data.response || "..." };
      setFollowUpHistory(prev => [...prev, aiResponse]);

    } catch (error) {
      console.error("Erro no chat de coaching:", error);
      const errorMsg = { role: 'model', text: "Desculpe, não consegui processar agora." };
      setFollowUpHistory(prev => [...prev, errorMsg]);
    } finally {
      setIsAiReplying(false);
    }
  };


  const irParaHub = () => {
    navigation.navigate(`${questionData.prova.toLowerCase()}-hub`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Análise de Desempenho</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.container}>
        {/* Card de Pontuação */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Sua Pontuação</Text>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreText}>{totalScore}</Text>
            <Text style={styles.scoreMaxText}>/ {maxScore}</Text>
          </View>
          <Text style={styles.scoreSubtitle}>Pontos obtidos neste diálogo</Text>
        </View>

        {/* Card de Feedback da IA */}
        <View style={styles.card}>
          <View style={styles.aiHeader}>
            <Sparkles size={22} color={cores.primary} />
            <Text style={styles.sectionTitle}>Feedback do Professor</Text>
          </View>
          
          {isLoading ? (
            <ActivityIndicator size="large" color={cores.primary} style={{ marginVertical: 20 }} />
          ) : (
            // =======================================================
            // ☆ RENDERIZADOR DE NEGRITO (REQUEST 2) ☆
            // =======================================================
            <MarkdownRenderer text={aiFeedback} style={styles.feedbackText} />
          )}

          {/* ======================================================= */}
          {/* ☆ BOTÕES DE CHAT (REQUEST 4) ☆ */}
          {/* ======================================================= */}
          {!isLoading && (
            <View style={styles.quickReplyContainer}>
              <TouchableOpacity style={styles.quickReplyButton} onPress={() => handleFollowUp("Como posso melhorar minha quebra de objeções?")}>
                <Text style={styles.quickReplyText}>Como melhorar na quebra de objeções?</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickReplyButton} onPress={() => handleFollowUp("Qual é uma boa maneira de abordar um cliente?")}>
                <Text style={styles.quickReplyText}>Qual uma boa forma de abordar o cliente?</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Card de Próximos Passos */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Recomendação</Text>
          <Text style={styles.recommendationText}>
            Continue praticando o tópico: <Text style={{fontWeight: 'bold'}}>{questionData.topico}</Text>
          </Text>
          <TouchableOpacity style={styles.buttonSecondary} onPress={irParaHub}>
            <Text style={styles.buttonSecondaryText}>Ver Hub da Certificação</Text>
            <ChevronRight size={18} color={cores.primary} />
          </TouchableOpacity>
        </View>

        {/* Botão de Voltar ao Início */}
        <TouchableOpacity style={styles.buttonPrimary} onPress={() => navigation.popToTop()}>
          <Home size={20} color={cores.textLight} />
          <Text style={styles.buttonPrimaryText}>Voltar ao Início</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ======================================================= */}
      {/* ☆ MODAL DE CHAT (REQUEST 4) ☆ */}
      {/* ======================================================= */}
      <Modal 
        animationType="slide" 
        transparent={true} 
        visible={isChatModalOpen} 
        onRequestClose={() => setIsChatModalOpen(false)}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"} 
          style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            {/* Header do Modal */}
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                 <Sparkles size={20} color={cores.primary} />
                 <Text style={styles.modalTitle}>Professor de Vendas</Text>
              </View>
              <TouchableOpacity onPress={() => setIsChatModalOpen(false)} style={styles.closeButton}>
                <X size={20} color={cores.textPrimary} />
              </TouchableOpacity>
            </View>
            {/* Histórico do Chat */}
            <FlatList
              ref={chatRef}
              style={styles.chatContainer}
              contentContainerStyle={styles.chatContentContainer}
              data={followUpHistory}
              renderItem={AiChatMessage}
              keyExtractor={(item, index) => index.toString()}
              onContentSizeChange={() => chatRef.current?.scrollToEnd({ animated: true })}
            />
            {isAiReplying && <ActivityIndicator style={{marginVertical: 4}} color={cores.primary}/>}
             {/* Input do Chat */}
             <View style={styles.chatInputContainer}>
                <TextInput 
                  style={styles.chatInput} 
                  placeholder="Tire suas dúvidas..." 
                  value={chatInput} 
                  onChangeText={setChatInput} 
                  editable={!isAiReplying}
                  onSubmitEditing={() => handleFollowUp(chatInput)}
                />
                <TouchableOpacity 
                  onPress={() => handleFollowUp(chatInput)} 
                  disabled={!chatInput.trim() || isAiReplying} 
                  style={[styles.sendButton, (!chatInput.trim() || isAiReplying) && styles.sendButtonDisabled]}>
                   <Send size={20} color={cores.textLight} />
                </TouchableOpacity>
             </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </SafeAreaView>
  );
}

// ESTILOS
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: cores.background, paddingTop: Platform.OS === 'android' ? 25 : 0 },
  header: { 
    paddingHorizontal: 20, paddingTop: 32, paddingBottom: 16, 
    backgroundColor: cores.background, 
  },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: cores.textPrimary },
  container: { padding: 20, gap: 16, paddingBottom: 60 },
  card: {
    backgroundColor: cores.cardBackground,
    borderRadius: 20,
    padding: 20,
    shadowColor: 'rgba(0, 0, 0, 0.05)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: cores.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderBottomWidth: 1,
    borderColor: cores.border,
    paddingBottom: 12,
    marginBottom: 12,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  scoreText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: cores.primary,
    lineHeight: 52,
  },
  scoreMaxText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: cores.textSecondary,
    paddingBottom: 4,
    marginLeft: 4,
  },
  scoreSubtitle: {
    fontSize: 14,
    color: cores.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  feedbackText: {
    fontSize: 16,
    color: cores.textPrimary,
    lineHeight: 24,
  },
  quickReplyContainer: {
    marginTop: 16,
    borderTopWidth: 1,
    borderColor: cores.border,
    paddingTop: 16,
    gap: 8,
  },
  quickReplyButton: {
    backgroundColor: cores.background,
    borderColor: cores.border,
    borderWidth: 1.5,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  quickReplyText: {
    color: cores.textPrimary,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  recommendationText: {
    fontSize: 15,
    color: cores.textPrimary,
    lineHeight: 22,
    marginBottom: 16,
  },
  buttonPrimary: {
    backgroundColor: cores.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 10,
    elevation: 3,
  },
  buttonPrimaryText: {
    color: cores.textLight,
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonSecondary: {
    backgroundColor: cores.primaryLight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  buttonSecondaryText: {
    color: cores.primary,
    fontSize: 15,
    fontWeight: 'bold',
  },

  // === ESTILOS DO MODAL DE CHAT ===
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  modalContainer: { 
    height: '85%', 
    backgroundColor: cores.background, // Fundo padrão
    borderTopLeftRadius: 20, 
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  modalHeader: { 
    padding: 16, borderBottomWidth: 1, borderColor: cores.border, 
    flexDirection: 'row', justifyContent: 'space-between', 
    alignItems: 'center', backgroundColor: cores.cardBackground,
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: cores.textPrimary },
  closeButton: { padding: 4 },
  chatContainer: {
    flex: 1,
    backgroundColor: cores.background,
  },
  chatContentContainer: {
    padding: 10,
  },
  messageText: {
    fontSize: 15,
    color: cores.textPrimary,
    lineHeight: 20,
  },
  clientMessage: { // Balão da IA (Professor)
    backgroundColor: cores.cardBackground,
    padding: 12,
    borderRadius: 12,
    borderBottomLeftRadius: 2,
    alignSelf: 'flex-start',
    maxWidth: '85%',
    marginBottom: 8,
    elevation: 1,
  },
  userMessage: { // Balão do Usuário
    backgroundColor: cores.primaryChat,
    padding: 12,
    borderRadius: 12,
    borderBottomRightRadius: 2,
    alignSelf: 'flex-end',
    maxWidth: '85%',
    marginBottom: 8,
    elevation: 1,
  },
  chatInputContainer: { 
    paddingHorizontal: 16, paddingVertical: 8, borderTopWidth: 1, 
    borderColor: cores.border, backgroundColor: cores.cardBackground, 
    flexDirection: 'row', gap: 8, paddingBottom: Platform.OS === 'ios' ? 32 : 8
  },
  chatInput: { 
    flex: 1, backgroundColor: cores.background, borderRadius: 20, 
    paddingHorizontal: 16, fontSize: 15, height: 44 
  },
  sendButton: { 
    width: 44, height: 44, borderRadius: 22, 
    backgroundColor: cores.primary, 
    justifyContent: 'center', alignItems: 'center' 
  },
  sendButtonDisabled: {
    backgroundColor: cores.textSecondary,
    opacity: 0.5,
  }
});