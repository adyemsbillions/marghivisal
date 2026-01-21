"use client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import * as Speech from "expo-speech";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

// TranslatePlus.io endpoint & API key
const TRANSLATE_URL = "https://api.translateplus.io/v2/translate";
const API_KEY = "73e750e113d5dcf08d22d8b4ea5bb0954c078cdb"; // Replace with your own key from translateplus.io

const MAX_CHARS = 5000;

const languages = [
  { code: "en", name: "English", flag: "https://flagcdn.com/w320/us.png" },
  { code: "id", name: "Indonesia", flag: "https://flagcdn.com/w320/id.png" },
  { code: "ha", name: "Hausa", flag: "https://flagcdn.com/w320/ng.png" },
];

export default function TranslateScreen() {
  const router = useRouter();
  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [sourceLang, setSourceLang] = useState(languages[0]);
  const [targetLang, setTargetLang] = useState(languages[1]);
  const [loading, setLoading] = useState(false);

  const handleSwapLanguages = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
  };

  const saveToHistory = async (
    fromFlag: string,
    toFlag: string,
    fromCode: string,
    toCode: string,
    original: string,
    result: string,
  ) => {
    try {
      const newEntry = {
        fromFlag,
        toFlag,
        fromCode,
        toCode,
        text: original.trim(),
        translated: result.trim(),
        time: new Date().toISOString(),
      };

      const existing = await AsyncStorage.getItem("translationHistory");
      let history = existing ? JSON.parse(existing) : [];

      // Add new entry at the beginning (most recent first)
      history = [newEntry, ...history];

      // Limit to last 30 entries to prevent storage issues
      await AsyncStorage.setItem(
        "translationHistory",
        JSON.stringify(history.slice(0, 30)),
      );
    } catch (e) {
      console.warn("Failed to save translation history:", e);
    }
  };

  const handleTranslate = async () => {
    const textToTranslate = sourceText.trim();

    if (!textToTranslate) {
      Alert.alert("Empty", "Please enter text to translate.");
      return;
    }

    if (textToTranslate.length > MAX_CHARS) {
      Alert.alert("Too long", `Text exceeds ${MAX_CHARS} characters limit.`);
      return;
    }

    setLoading(true);
    setTranslatedText("");

    try {
      const response = await fetch(TRANSLATE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": API_KEY,
        },
        body: JSON.stringify({
          text: textToTranslate,
          source: sourceLang.code,
          target: targetLang.code,
        }),
      });

      if (!response.ok) {
        const errText = await response.text().catch(() => "Unknown error");
        throw new Error(`HTTP ${response.status}: ${errText}`);
      }

      const data = await response.json();

      // Correct structure based on TranslatePlus v2 docs
      const translationResult = data?.translations?.translation;

      if (!translationResult) {
        throw new Error("No translation returned in response");
      }

      setTranslatedText(translationResult);

      // Save to history
      await saveToHistory(
        sourceLang.flag,
        targetLang.flag,
        sourceLang.code,
        targetLang.code,
        textToTranslate,
        translationResult,
      );
    } catch (error: any) {
      console.error("Translation error:", error);

      let msg = "Translation failed. Please try again.";
      if (error.message.includes("401") || error.message.includes("403")) {
        msg =
          "Invalid or expired API key. Sign up at translateplus.io for your own key (free tier available).";
      } else if (error.message.includes("429")) {
        msg =
          "Rate limit reached. Wait a moment and try again (free tier has limits).";
      } else if (error.message.includes("Network")) {
        msg = "Network error — please check your internet connection.";
      } else if (error.message.includes("No translation")) {
        msg = "Translation service returned empty result.";
      }

      Alert.alert("Error", msg);
      setTranslatedText("Failed to translate...");
    } finally {
      setLoading(false);
    }
  };

  const speakText = async (text: string, langCode: string) => {
    if (!text.trim()) return;

    try {
      const voices = await Speech.getAvailableVoicesAsync();
      const voice =
        voices.find((v) => v.language.startsWith(langCode)) || voices[0];

      await Speech.speak(text, {
        language: langCode,
        pitch: 1.0,
        rate: langCode === "ha" ? 0.85 : 0.95,
        voice: voice?.identifier,
      });
    } catch (err) {
      Alert.alert(
        "Speech",
        "Text-to-speech not available for this language or device.",
      );
    }
  };

  const stopSpeaking = () => Speech.stop();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Translate</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.languageSelector}>
          <TouchableOpacity
            style={styles.languageButton}
            onPress={() => {
              const idx = languages.indexOf(sourceLang);
              setSourceLang(languages[(idx + 1) % languages.length]);
            }}
          >
            <Image source={{ uri: sourceLang.flag }} style={styles.flagImage} />
            <Text style={styles.languageText}>{sourceLang.name}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.swapButton}
            onPress={handleSwapLanguages}
          >
            <Text style={styles.swapIcon}>⇄</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.languageButton}
            onPress={() => {
              const idx = languages.indexOf(targetLang);
              setTargetLang(languages[(idx + 1) % languages.length]);
            }}
          >
            <Image source={{ uri: targetLang.flag }} style={styles.flagImage} />
            <Text style={styles.languageText}>{targetLang.name}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.textCard}>
          <TextInput
            style={styles.textInput}
            placeholder="Type here to translate..."
            placeholderTextColor="#aaa"
            multiline
            value={sourceText}
            onChangeText={setSourceText}
            textAlignVertical="top"
            maxLength={MAX_CHARS}
          />
          <View style={styles.cardFooter}>
            <Text style={styles.charCount}>
              {sourceText.length} / {MAX_CHARS}
            </Text>
            <View style={styles.cardActions}>
              <TouchableOpacity
                onPress={() => speakText(sourceText, sourceLang.code)}
              >
                <Text style={styles.actionIcon}>🔊</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={stopSpeaking}>
                <Text style={styles.actionIcon}>⏹</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={[styles.textCard, styles.translationCard]}>
          {loading ? (
            <ActivityIndicator
              size="large"
              color="#4CAF50"
              style={{ marginVertical: 60 }}
            />
          ) : (
            <>
              <ScrollView style={styles.translationScroll}>
                <Text style={styles.translatedText}>
                  {translatedText ||
                    (sourceText.trim()
                      ? "Press Translate"
                      : "Translation will appear here...")}
                </Text>
              </ScrollView>
              <View style={styles.cardFooter}>
                <Text style={styles.charCount}>
                  {translatedText.length} / {MAX_CHARS}
                </Text>
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    onPress={() => speakText(translatedText, targetLang.code)}
                  >
                    <Text style={styles.actionIcon}>🔊</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      // You can add clipboard copy here later
                      Alert.alert(
                        "Copied",
                        "Text copied to clipboard (feature coming soon)",
                      );
                    }}
                  >
                    <Text style={styles.actionIcon}>📋</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}
        </View>

        {sourceText.trim() && !loading && (
          <TouchableOpacity
            style={styles.translateButton}
            onPress={handleTranslate}
          >
            <Text style={styles.translateButtonText}>Translate</Text>
            <Text style={styles.translateButtonIcon}>→</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  scrollContent: { padding: 20, paddingBottom: 120 },
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
  backButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  backIcon: { fontSize: 28, color: "#333" },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#111" },
  languageSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  languageButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 8,
    borderRadius: 12,
  },
  flagImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  languageText: { fontSize: 16, fontWeight: "600", color: "#222" },
  swapButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 12,
  },
  swapIcon: { fontSize: 24, color: "#fff" },
  textCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    minHeight: 160,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  translationCard: { backgroundColor: "#f9f9f9" },
  textInput: { fontSize: 17, color: "#111", lineHeight: 24, minHeight: 110 },
  translationScroll: { maxHeight: 220 },
  translatedText: { fontSize: 17, color: "#222", lineHeight: 26 },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  charCount: { fontSize: 13, color: "#888" },
  cardActions: { flexDirection: "row", gap: 20 },
  actionIcon: { fontSize: 24, color: "#555" },
  translateButton: {
    position: "absolute",
    bottom: 30,
    left: 24,
    right: 24,
    backgroundColor: "#4CAF50",
    borderRadius: 16,
    paddingVertical: 18,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  translateButtonText: { fontSize: 18, fontWeight: "700", color: "#fff" },
  translateButtonIcon: { fontSize: 22, color: "#fff", fontWeight: "bold" },
});
