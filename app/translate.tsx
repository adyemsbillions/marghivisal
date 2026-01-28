"use client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Clipboard from "expo-clipboard";
import { useRouter } from "expo-router";
import * as Speech from "expo-speech";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// ────────────────────────────────────────────────
// API Endpoints
// ────────────────────────────────────────────────
const TRANSLATE_URL = "https://api.translateplus.io/v2/translate";
const TRANSLATE_API_KEY = "73e750e113d5dcf08d22d8b4ea5bb0954c078cdb";

const GEMINI_PROXY_URL = "https://margivial.cravii.ng/api/gemini-proxy.php";

const APPROVED_SUGGESTIONS_URL =
  "https://margivial.cravii.ng/api/get-approved-suggestions.php";

const MAX_CHARS = 5000;

// Expanded language list — 100+ languages
const languages = [
  // Core Nigerian + Special
  { code: "en", name: "English", flag: "https://flagcdn.com/w320/gb.png" },
  { code: "ha", name: "Hausa", flag: "https://flagcdn.com/w320/ng.png" },
  { code: "yo", name: "Yoruba", flag: "https://flagcdn.com/w320/ng.png" },
  { code: "ig", name: "Igbo", flag: "https://flagcdn.com/w320/ng.png" },
  {
    code: "pcm",
    name: "Nigerian Pidgin",
    flag: "https://flagcdn.com/w320/ng.png",
  },
  {
    code: "mrt",
    name: "Marghi",
    flag: "https://flagcdn.com/w320/ng.png",
    special: true,
  },
  {
    code: "hwo",
    name: "Hona",
    flag: "https://flagcdn.com/w320/ng.png",
    special: true,
  },
  {
    code: "glw",
    name: "Glavda",
    flag: "https://flagcdn.com/w320/ng.png",
    special: true,
  },
  { code: "tiv", name: "Tiv", flag: "https://flagcdn.com/w320/ng.png" },
  { code: "kr", name: "Kanuri", flag: "https://flagcdn.com/w320/ng.png" },
  {
    code: "ff",
    name: "Fulfulde (Fula)",
    flag: "https://flagcdn.com/w320/ng.png",
  },
  { code: "ibb", name: "Ibibio", flag: "https://flagcdn.com/w320/ng.png" },
  { code: "efi", name: "Efik", flag: "https://flagcdn.com/w320/ng.png" },
  { code: "nup", name: "Nupe", flag: "https://flagcdn.com/w320/ng.png" },
  {
    code: "ann",
    name: "Obolo (Andoni)",
    flag: "https://flagcdn.com/w320/ng.png",
  },
  { code: "bin", name: "Edo (Bini)", flag: "https://flagcdn.com/w320/ng.png" },
  { code: "bom", name: "Berom", flag: "https://flagcdn.com/w320/ng.png" },
  {
    code: "kcg",
    name: "Tyap (Katab)",
    flag: "https://flagcdn.com/w320/ng.png",
  },

  // Major global + additional languages
  { code: "ar", name: "Arabic", flag: "https://flagcdn.com/w320/sa.png" },
  {
    code: "zh",
    name: "Chinese (Simplified)",
    flag: "https://flagcdn.com/w320/cn.png",
  },
  {
    code: "zh-TW",
    name: "Chinese (Traditional)",
    flag: "https://flagcdn.com/w320/tw.png",
  },
  { code: "fr", name: "French", flag: "https://flagcdn.com/w320/fr.png" },
  { code: "es", name: "Spanish", flag: "https://flagcdn.com/w320/es.png" },
  { code: "de", name: "German", flag: "https://flagcdn.com/w320/de.png" },
  { code: "it", name: "Italian", flag: "https://flagcdn.com/w320/it.png" },
  { code: "pt", name: "Portuguese", flag: "https://flagcdn.com/w320/pt.png" },
  { code: "ru", name: "Russian", flag: "https://flagcdn.com/w320/ru.png" },
  { code: "ja", name: "Japanese", flag: "https://flagcdn.com/w320/jp.png" },
  { code: "ko", name: "Korean", flag: "https://flagcdn.com/w320/kr.png" },
  { code: "hi", name: "Hindi", flag: "https://flagcdn.com/w320/in.png" },
  { code: "bn", name: "Bengali", flag: "https://flagcdn.com/w320/bd.png" },
  { code: "ur", name: "Urdu", flag: "https://flagcdn.com/w320/pk.png" },
  { code: "id", name: "Indonesian", flag: "https://flagcdn.com/w320/id.png" },
  { code: "tr", name: "Turkish", flag: "https://flagcdn.com/w320/tr.png" },
  { code: "vi", name: "Vietnamese", flag: "https://flagcdn.com/w320/vn.png" },
  { code: "th", name: "Thai", flag: "https://flagcdn.com/w320/th.png" },
  { code: "pl", name: "Polish", flag: "https://flagcdn.com/w320/pl.png" },
  { code: "nl", name: "Dutch", flag: "https://flagcdn.com/w320/nl.png" },
  { code: "sv", name: "Swedish", flag: "https://flagcdn.com/w320/se.png" },
  { code: "no", name: "Norwegian", flag: "https://flagcdn.com/w320/no.png" },
  { code: "da", name: "Danish", flag: "https://flagcdn.com/w320/dk.png" },
  { code: "fi", name: "Finnish", flag: "https://flagcdn.com/w320/fi.png" },
  { code: "uk", name: "Ukrainian", flag: "https://flagcdn.com/w320/ua.png" },
  { code: "cs", name: "Czech", flag: "https://flagcdn.com/w320/cz.png" },
  { code: "hu", name: "Hungarian", flag: "https://flagcdn.com/w320/hu.png" },
  { code: "el", name: "Greek", flag: "https://flagcdn.com/w320/gr.png" },
  { code: "he", name: "Hebrew", flag: "https://flagcdn.com/w320/il.png" },
  {
    code: "fa",
    name: "Persian (Farsi)",
    flag: "https://flagcdn.com/w320/ir.png",
  },
  { code: "ro", name: "Romanian", flag: "https://flagcdn.com/w320/ro.png" },
  { code: "ms", name: "Malay", flag: "https://flagcdn.com/w320/my.png" },
  { code: "sw", name: "Swahili", flag: "https://flagcdn.com/w320/ke.png" },
  { code: "am", name: "Amharic", flag: "https://flagcdn.com/w320/et.png" },
  { code: "zu", name: "Zulu", flag: "https://flagcdn.com/w320/za.png" },
  { code: "xh", name: "Xhosa", flag: "https://flagcdn.com/w320/za.png" },
  { code: "so", name: "Somali", flag: "https://flagcdn.com/w320/so.png" },
  { code: "rw", name: "Kinyarwanda", flag: "https://flagcdn.com/w320/rw.png" },
  // ... you can continue adding more if needed
];

export default function TranslateScreen() {
  const router = useRouter();

  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [sourceLang, setSourceLang] = useState(languages[0]);
  const [targetLang, setTargetLang] = useState(languages[1]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [showSourcePicker, setShowSourcePicker] = useState(false);
  const [showTargetPicker, setShowTargetPicker] = useState(false);

  const handleSwapLanguages = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
    setErrorMessage(null);
  };

  const clearInput = () => {
    setSourceText("");
    setTranslatedText("");
    setErrorMessage(null);
  };

  const copyToClipboard = async (text: string) => {
    if (!text.trim()) return;
    await Clipboard.setStringAsync(text);
    Alert.alert("Copied", "Text copied to clipboard!");
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
      history = [newEntry, ...history].slice(0, 30);
      await AsyncStorage.setItem("translationHistory", JSON.stringify(history));
    } catch (e) {
      console.warn("History save failed:", e);
    }
  };

  const speakText = async (text: string, langCode: string) => {
    if (!text.trim()) return;
    try {
      await Speech.speak(text, {
        language: langCode || "en",
        pitch: 1.0,
        rate: langCode === "ha" ? 0.85 : 0.95,
      });
    } catch (err) {
      Alert.alert("Speech", "TTS not available for this language.");
    }
  };

  const stopSpeaking = () => Speech.stop();

  const callGeminiProxy = async (
    prompt: string,
    temperature = 0.4,
    maxTokens = 200,
  ) => {
    try {
      const res = await fetch(GEMINI_PROXY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, temperature, maxTokens }),
      });

      if (!res.ok) {
        if (res.status === 429) throw new Error("Rate limit — wait a moment");
        throw new Error(`Service error (${res.status})`);
      }

      const data = await res.json();
      return data.result?.trim() || "";
    } catch (err: any) {
      console.error("Gemini proxy error:", err);
      setErrorMessage(err.message || "Translation service unavailable");
      return "";
    }
  };

  const buildTranslationPrompt = useCallback(
    (text: string, from: string, to: string) =>
      `Translate this text accurately and naturally from ${from} to ${to}. Preserve meaning, tone, and formatting:\n\n${text}\n\nOutput ONLY the translated text — no explanations, no quotes.`,
    [],
  );

  const handleTranslate = async () => {
    const input = sourceText.trim();
    if (!input) return Alert.alert("Empty", "Please enter text to translate.");

    if (input.length > MAX_CHARS) {
      return Alert.alert("Too long", `Max ${MAX_CHARS} characters allowed.`);
    }

    setLoading(true);
    setTranslatedText("");
    setErrorMessage(null);

    const specialCodes = ["mrt", "hwo", "glw"];
    const isSpecial =
      specialCodes.includes(sourceLang.code) ||
      specialCodes.includes(targetLang.code);

    if (isSpecial) {
      // Redirect to minority-translate for special languages
      setLoading(false);
      router.push("/minority-translate");
      return;
    }

    try {
      // Normal translation - try TranslatePlus first
      const res = await fetch(TRANSLATE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": TRANSLATE_API_KEY,
        },
        body: JSON.stringify({
          text: input,
          source: sourceLang.code,
          target: targetLang.code,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const result = data?.translations?.translation || "";
        if (result) {
          setTranslatedText(result);
          await saveToHistory(
            sourceLang.flag,
            targetLang.flag,
            sourceLang.code,
            targetLang.code,
            input,
            result,
          );
          setLoading(false);
          return;
        }
      }

      // Fallback to Gemini
      const prompt = buildTranslationPrompt(
        input,
        sourceLang.name,
        targetLang.name,
      );
      const geminiResult = await callGeminiProxy(prompt, 0.3, 400);

      if (geminiResult) {
        setTranslatedText(geminiResult);
        await saveToHistory(
          sourceLang.flag,
          targetLang.flag,
          sourceLang.code,
          targetLang.code,
          input,
          geminiResult,
        );
      } else {
        setErrorMessage(
          "Translation failed. Please check your internet and try again.",
        );
      }
    } catch (err: any) {
      console.error("Translation error:", err);
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const LanguagePicker = ({
    visible,
    onClose,
    onSelect,
    current,
  }: {
    visible: boolean;
    onClose: () => void;
    onSelect: (lang: (typeof languages)[0]) => void;
    current: (typeof languages)[0];
  }) => {
    const [search, setSearch] = useState("");

    const filtered = languages.filter((l) =>
      l.name.toLowerCase().includes(search.toLowerCase()),
    );

    return (
      <Modal visible={visible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Language</Text>

            <TextInput
              style={styles.searchInput}
              placeholder="Search language..."
              value={search}
              onChangeText={setSearch}
            />

            <FlatList
              data={filtered}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.langItem,
                    item.code === current.code && styles.langItemSelected,
                  ]}
                  onPress={() => {
                    onSelect(item);
                    onClose();
                    setSearch("");
                  }}
                >
                  <Image source={{ uri: item.flag }} style={styles.langFlag} />
                  <Text style={styles.langName}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />

            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Translate</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.languageSelector}>
          <TouchableOpacity
            style={styles.languageButton}
            onPress={() => setShowSourcePicker(true)}
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
            onPress={() => setShowTargetPicker(true)}
          >
            <Image source={{ uri: targetLang.flag }} style={styles.flagImage} />
            <Text style={styles.languageText}>{targetLang.name}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.textCard}>
          <TextInput
            style={styles.textInput}
            placeholder="Type or paste text here..."
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
              <TouchableOpacity onPress={clearInput}>
                <Text style={styles.actionIcon}>🗑</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={[styles.textCard, styles.translationCard]}>
          {loading ? (
            <ActivityIndicator
              size="large"
              color="#6366f1"
              style={{ marginVertical: 60 }}
            />
          ) : errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : (
            <>
              <ScrollView style={styles.translationScroll}>
                <Text style={styles.translatedText}>
                  {translatedText ||
                    (sourceText.trim()
                      ? "Press Translate to begin"
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
                    onPress={() => copyToClipboard(translatedText)}
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

      <LanguagePicker
        visible={showSourcePicker}
        onClose={() => setShowSourcePicker(false)}
        onSelect={setSourceLang}
        current={sourceLang}
      />
      <LanguagePicker
        visible={showTargetPicker}
        onClose={() => setShowTargetPicker(false)}
        onSelect={setTargetLang}
        current={targetLang}
      />
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

  scrollContent: { padding: 20, paddingBottom: 140 },

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
    flex: 1,
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
    backgroundColor: "#6366f1",
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
  textInput: {
    fontSize: 17,
    color: "#111",
    lineHeight: 24,
    minHeight: 110,
  },
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
    backgroundColor: "#6366f1",
    borderRadius: 16,
    paddingVertical: 18,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    shadowColor: "#6366f1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  translateButtonText: { fontSize: 18, fontWeight: "700", color: "#fff" },
  translateButtonIcon: { fontSize: 22, color: "#fff", fontWeight: "bold" },

  errorText: {
    color: "red",
    textAlign: "center",
    padding: 20,
    fontSize: 16,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
    textAlign: "center",
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  langItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  langItemSelected: { backgroundColor: "#e6f0ff" },
  langFlag: { width: 32, height: 32, borderRadius: 16, marginRight: 12 },
  langName: { fontSize: 16, color: "#222" },
  closeButton: {
    marginTop: 16,
    paddingVertical: 14,
    backgroundColor: "#6366f1",
    borderRadius: 12,
    alignItems: "center",
  },
  closeText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
