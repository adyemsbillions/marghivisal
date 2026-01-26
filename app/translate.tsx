"use client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import * as Speech from "expo-speech";
import React, { useState } from "react";
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

const GEMINI_API_KEY = "AIzaSyDRfTyjqd8t9Z30no-kfpm-rGQEScOeqgQ";
const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

const APPROVED_SUGGESTIONS_URL =
  "https://margivial.cravii.ng/api/get-approved-suggestions.php";

const MAX_CHARS = 5000;

const languages = [
  { code: "en", name: "English", flag: "https://flagcdn.com/w320/us.png" },
  { code: "ha", name: "Hausa", flag: "https://flagcdn.com/w320/ng.png" },
  { code: "yo", name: "Yoruba", flag: "https://flagcdn.com/w320/ng.png" },
  { code: "ig", name: "Igbo", flag: "https://flagcdn.com/w320/ng.png" },
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
  { code: "id", name: "Indonesian", flag: "https://flagcdn.com/w320/id.png" },
  { code: "es", name: "Spanish", flag: "https://flagcdn.com/w320/es.png" },
  { code: "fr", name: "French", flag: "https://flagcdn.com/w320/fr.png" },
  // ... more if needed
];

export default function TranslateScreen() {
  const router = useRouter();

  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [sourceLang, setSourceLang] = useState(languages[0]); // English
  const [targetLang, setTargetLang] = useState(languages[1]); // Hausa
  const [loading, setLoading] = useState(false);

  const [showSourcePicker, setShowSourcePicker] = useState(false);
  const [showTargetPicker, setShowTargetPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSwapLanguages = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
  };

  const saveToHistory = async (
    fromFlag,
    toFlag,
    fromCode,
    toCode,
    original,
    result,
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

  // ────────────────────────────────────────────────
  // Main translation handler
  // ────────────────────────────────────────────────
  const handleTranslate = async () => {
    const input = sourceText.trim();
    if (!input) return Alert.alert("Empty", "Please enter text.");

    if (input.length > MAX_CHARS) {
      return Alert.alert("Too long", `Max ${MAX_CHARS} characters allowed.`);
    }

    setLoading(true);
    setTranslatedText("");

    // Detect if either source OR target is a special language
    const specialCodes = ["mrt", "hwo", "glw"];
    const isSpecial =
      specialCodes.includes(sourceLang.code) ||
      specialCodes.includes(targetLang.code);

    if (!isSpecial) {
      // Normal flow: TranslatePlus → Gemini fallback
      try {
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
      } catch (err) {
        console.warn("TranslatePlus failed:", err);
      }

      // Gemini fallback for normal languages
      const geminiResult = await translateWithGemini(
        input,
        sourceLang.name,
        targetLang.name,
      );
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
        setTranslatedText("Translation failed — try again");
      }
    } else {
      // Special language logic (Marghi / Hona / Glavda) — both directions
      const specialCode = specialCodes.includes(targetLang.code)
        ? targetLang.code
        : sourceLang.code;

      const isToSpecial = specialCodes.includes(targetLang.code);

      try {
        const res = await fetch(
          `${APPROVED_SUGGESTIONS_URL}?language_key=${specialCode}`,
        );
        const data = await res.json();

        console.log("API Response:", data); // ← Debug: check this in console

        if (!data.success || !data.suggestions?.length) {
          setTranslatedText(
            `No approved translations yet for ${isToSpecial ? targetLang.name : sourceLang.name}.\nPlease suggest some phrases!`,
          );
          setLoading(false);
          return;
        }

        // Case-insensitive partial match
        const lowerInput = input.toLowerCase();
        const match = data.suggestions.find((s) => {
          const en = (s.english_meaning || "").toLowerCase();
          const local = (s.local_phrase || "").toLowerCase();
          return (
            en.includes(lowerInput) ||
            local.includes(lowerInput) ||
            lowerInput.includes(en) ||
            lowerInput.includes(local)
          );
        });

        if (!match) {
          setTranslatedText(
            "No matching approved phrase found.\nTry rephrasing or suggest it!",
          );
          setLoading(false);
          return;
        }

        // Polish with Gemini
        const polishPrompt = `
You are a native ${isToSpecial ? targetLang.name : sourceLang.name} speaker.
Use this approved pair:
English: "${match.english_meaning}"
${isToSpecial ? targetLang.name : sourceLang.name}: "${match.local_phrase}"

Create one natural, fluent sentence in ${isToSpecial ? targetLang.name : sourceLang.name} that fits the user's input:
"${input}"

Return **only** the final sentence — nothing else.
        `;

        const geminiRes = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: polishPrompt }] }],
            generationConfig: { temperature: 0.4, maxOutputTokens: 150 },
          }),
        });

        if (!geminiRes.ok) {
          throw new Error(`Gemini polish failed: ${geminiRes.status}`);
        }

        const geminiData = await geminiRes.json();
        const polished =
          geminiData.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

        if (polished) {
          setTranslatedText(polished);
          await saveToHistory(
            sourceLang.flag,
            targetLang.flag,
            sourceLang.code,
            targetLang.code,
            input,
            polished,
          );
        } else {
          // Raw fallback
          setTranslatedText(
            isToSpecial ? match.local_phrase : match.english_meaning,
          );
        }
      } catch (err) {
        console.error("Special translation error:", err);
        setTranslatedText("Error loading suggestions — try again");
      }
    }

    setLoading(false);
  };

  // ────────────────────────────────────────────────
  // Rest of the component (speak, modal, UI) unchanged
  // ────────────────────────────────────────────────
  const speakText = async (text, langCode) => {
    if (!text.trim()) return;
    try {
      await Speech.speak(text, {
        language: langCode,
        pitch: 1.0,
        rate: langCode === "ha" ? 0.85 : 0.95,
      });
    } catch (err) {
      Alert.alert("Speech", "TTS not available for this language.");
    }
  };

  const stopSpeaking = () => Speech.stop();

  const LanguagePicker = ({ visible, onClose, onSelect, current }) => {
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Translate</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Language Selector */}
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

        {/* Source Input */}
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

        {/* Translation Result */}
        <View style={[styles.textCard, styles.translationCard]}>
          {loading ? (
            <ActivityIndicator
              size="large"
              color="#6366f1"
              style={{ marginVertical: 60 }}
            />
          ) : (
            <>
              <ScrollView style={styles.translationScroll}>
                <Text style={styles.translatedText}>
                  {translatedText ||
                    (sourceText.trim()
                      ? "Press Translate"
                      : "Translation appears here...")}
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
                      Alert.alert("Coming soon", "Copy to clipboard feature");
                    }}
                  >
                    <Text style={styles.actionIcon}>📋</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}
        </View>

        {/* Translate Button */}
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

      {/* Pickers */}
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

// Styles remain unchanged
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

  scrollContent: { padding: 20, paddingBottom: 120 },

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
