"use client";
import * as Clipboard from "expo-clipboard";
import { useRouter } from "expo-router";
import * as Speech from "expo-speech";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Gemini API Config (2026 working model)
const GEMINI_API_KEY = "AIzaSyDRfTyjqd8t9Z30no-kfpm-rGQEScOeqgQ";
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

const languageOptions = [
  { key: "marghi", name: "Marghi", flag: "https://flagcdn.com/w320/ng.png" },
  { key: "hona", name: "Hona", flag: "https://flagcdn.com/w320/ng.png" },
  { key: "glavda", name: "Glavda", flag: "https://flagcdn.com/w320/ng.png" },
  { key: "ha", name: "Hausa", flag: "https://flagcdn.com/w320/ng.png" },
];

export default function Chat() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef(null);

  const [selectedLang, setSelectedLang] = useState(languageOptions[3]); // Hausa default
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      text: `Sannu! I'm your ${selectedLang.name} practice partner powered by Gemini. 😊\nHow can I help you today?`,
      sender: "bot",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Auto-scroll
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 150);
  }, [messages, isTyping]);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const currentInput = inputText.trim();
    const userMsg = {
      id: Date.now().toString(),
      text: currentInput,
      sender: "user",
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    // Fake typing delay (makes it feel alive)
    await new Promise((resolve) =>
      setTimeout(resolve, 1000 + Math.random() * 800),
    );

    try {
      const botReply = await getGeminiReply(currentInput, selectedLang.name);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          text: botReply,
          sender: "bot",
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          text: "Sorry, Gemini is having trouble right now. Try again?",
          sender: "bot",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const getGeminiReply = async (userInput, langName) => {
    const systemPrompt = `
You are a friendly, patient ${langName} language tutor.
Always detect and respond in the language the user is using or requesting.
If user writes in ${langName}, reply mostly in ${langName} with gentle corrections if needed.
If user writes in English, reply in English and offer ${langName} translations/practice.
Keep replies short, encouraging, and fun. Use emojis 😊.
Explain grammar/vocabulary briefly when correcting.
Recent conversation:
${messages
  .slice(-8)
  .map((m) => `${m.sender === "user" ? "User" : "Tutor"}: ${m.text}`)
  .join("\n")}
    `;

    try {
      const res = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            { parts: [{ text: `${systemPrompt}\nUser: ${userInput}` }] },
          ],
          generationConfig: {
            temperature: 0.85,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 300,
          },
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(
          `Gemini HTTP ${res.status}: ${errData.error?.message || "Unknown"}`,
        );
      }

      const data = await res.json();
      return (
        data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
        "Hmm... let's try that again! 😅"
      );
    } catch (err) {
      console.error("Gemini API error:", err);
      return "Oops! Connection issue with Gemini. Try again?";
    }
  };

  const speakMessage = async (text, isBot = false) => {
    if (!text || isSpeaking) return;

    setIsSpeaking(true);
    const lang = isBot && selectedLang.key === "ha" ? "ha" : "en";

    try {
      await Speech.speak(text, {
        language: lang,
        pitch: 1.0,
        rate: lang === "ha" ? 0.85 : 1.0,
      });
    } catch (err) {
      console.warn("Speech error:", err);
    } finally {
      setIsSpeaking(false);
    }
  };

  const stopSpeaking = () => {
    Speech.stop();
    setIsSpeaking(false);
  };

  const copyToClipboard = async (text) => {
    await Clipboard.setStringAsync(text);
    Alert.alert("Copied", "Message copied to clipboard!");
  };

  const cycleLanguage = () => {
    const idx = languageOptions.findIndex((l) => l.key === selectedLang.key);
    const next = languageOptions[(idx + 1) % languageOptions.length];
    setSelectedLang(next);
    setMessages([
      {
        id: "welcome",
        text: `Sannu! I'm your ${next.name} practice partner powered by Gemini. 😊\nHow can I help you today?`,
        sender: "bot",
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chat in {selectedLang.name}</Text>
        <TouchableOpacity onPress={cycleLanguage}>
          <Text style={styles.switchLang}>Switch</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={
          Platform.OS === "ios"
            ? insets.top + 50 + 80 + insets.bottom
            : insets.bottom + 100
        }
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={[
            styles.messagesContainer,
            { paddingBottom: insets.bottom + 140 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg) => (
            <TouchableOpacity
              key={msg.id}
              activeOpacity={0.7}
              onLongPress={() =>
                msg.sender === "bot" && copyToClipboard(msg.text)
              }
            >
              <View
                style={[
                  styles.messageBubble,
                  msg.sender === "user" ? styles.userBubble : styles.botBubble,
                ]}
              >
                <Text style={styles.messageText}>{msg.text}</Text>
                <View style={styles.messageActions}>
                  <TouchableOpacity
                    onPress={() => speakMessage(msg.text, msg.sender === "bot")}
                    disabled={isSpeaking}
                  >
                    <Text style={styles.speakIcon}>🔊</Text>
                  </TouchableOpacity>

                  {isSpeaking && msg.sender === "bot" && (
                    <TouchableOpacity onPress={stopSpeaking}>
                      <Text style={styles.stopIcon}>⏹</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}

          {isTyping && (
            <View style={styles.typingIndicator}>
              <ActivityIndicator size="small" color="#6366f1" />
              <Text style={styles.typingText}>Typing</Text>
              <Text style={styles.dots}>...</Text>
            </View>
          )}
        </ScrollView>

        {/* Input bar */}
        <View style={[styles.inputContainer, { paddingBottom: insets.bottom }]}>
          <TextInput
            style={styles.input}
            placeholder={`Type in ${selectedLang.name} or English...`}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxHeight={120}
            returnKeyType="send"
            onSubmitEditing={sendMessage}
            blurOnSubmit={false}
            onFocus={() => {
              setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: false });
              }, 300);
            }}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              !inputText.trim() && styles.sendButtonDisabled,
            ]}
            onPress={sendMessage}
            disabled={!inputText.trim()}
          >
            <Text style={styles.sendText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backIcon: { fontSize: 28, color: "#333" },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#111" },
  switchLang: { fontSize: 16, color: "#6366f1", fontWeight: "600" },

  messagesContainer: {
    paddingHorizontal: 16,
    flexGrow: 1,
  },
  messageBubble: {
    maxWidth: "80%",
    marginVertical: 8,
    padding: 14,
    borderRadius: 20,
    position: "relative",
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#6366f1",
  },
  botBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#e5e7eb",
  },
  messageText: {
    color: "#fff",
    fontSize: 16,
    lineHeight: 22,
  },
  messageActions: {
    flexDirection: "row",
    position: "absolute",
    bottom: 6,
    right: 10,
    gap: 8,
  },
  speakIcon: {
    backgroundColor: "rgba(0,0,0,0.25)",
    borderRadius: 12,
    padding: 6,
    fontSize: 16,
  },
  stopIcon: {
    backgroundColor: "#ef4444",
    color: "#fff",
    borderRadius: 12,
    padding: 6,
    fontSize: 14,
    fontWeight: "bold",
  },

  typingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginVertical: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#e5e7eb",
    borderRadius: 20,
  },
  typingText: { marginLeft: 8, color: "#666", fontStyle: "italic" },
  dots: { color: "#666", fontWeight: "bold" },

  inputContainer: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    alignItems: "center",
  },
  input: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 120,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: "#6366f1",
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingVertical: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#a5b4fc",
  },
  sendText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
});
