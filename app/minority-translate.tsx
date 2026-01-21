"use client";
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

// Dictionary (English keys → local)
const dictionary: Record<
  string,
  { en: string; local: string; lang: "marghi" | "hona" | "glavda" }
> = {
  "good morning": { en: "Good morning", local: "Dargu", lang: "marghi" },
  "how are you": { en: "How are you?", local: "Lapya gu?", lang: "marghi" },
  "thank you": { en: "Thank you", local: "N jiri", lang: "marghi" },
  "good night": { en: "Good night", local: "Abar cara", lang: "marghi" },
  // Add more as you collect them...
  hello: { en: "Hello", local: "(suggest below)", lang: "hona" },
  beautiful: {
    en: "You look beautiful",
    local: "(suggest below)",
    lang: "glavda",
  },
};

const languages = [
  { key: "marghi", name: "Marghi", flag: "https://flagcdn.com/w320/ng.png" },
  { key: "hona", name: "Hona", flag: "https://flagcdn.com/w320/ng.png" },
  { key: "glavda", name: "Glavda", flag: "https://flagcdn.com/w320/ng.png" },
];

export default function MinorityTranslate() {
  const router = useRouter();
  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [sourceIsEnglish, setSourceIsEnglish] = useState(true);
  const [selectedLang, setSelectedLang] = useState(languages[0]);
  const [loading, setLoading] = useState(false);

  const [suggestLocal, setSuggestLocal] = useState("");
  const [suggestEnglish, setSuggestEnglish] = useState("");
  const [suggestContext, setSuggestContext] = useState("");

  const handleSwap = () => {
    setSourceIsEnglish(!sourceIsEnglish);
    const temp = sourceText;
    setSourceText(translatedText);
    setTranslatedText(temp);
  };

  const handleLookup = () => {
    const query = sourceText.trim().toLowerCase();
    if (!query) return Alert.alert("Empty input", "Please type something.");

    setLoading(true);
    setTranslatedText("");

    setTimeout(() => {
      let result = "";

      if (sourceIsEnglish) {
        // English → Local
        const match = Object.values(dictionary).find(
          (e) =>
            e.lang === selectedLang.key && e.en.toLowerCase().includes(query),
        );
        result = match ? match.local : "No translation found — suggest below!";
      } else {
        // Local → English
        const match = Object.values(dictionary).find(
          (e) =>
            e.lang === selectedLang.key &&
            e.local.toLowerCase().includes(query),
        );
        result = match ? match.en : "No translation found — suggest below!";
      }

      setTranslatedText(result);
      setLoading(false);
    }, 700);
  };

  const speak = (text: string) => {
    if (!text) return;
    Speech.speak(text, { language: sourceIsEnglish ? "en" : "en" }); // local TTS limited
  };

  const handleSuggest = () => {
    if (!suggestLocal.trim() || !suggestEnglish.trim()) {
      return Alert.alert("Missing info", "Please fill both fields.");
    }
    Alert.alert(
      "Suggestion received!",
      `For ${selectedLang.name}:\nLocal: ${suggestLocal}\nEnglish: ${suggestEnglish}`,
    );
    setSuggestLocal("");
    setSuggestEnglish("");
    setSuggestContext("");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Minority Translate</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Direction & Language selector */}
        <View style={styles.selectorContainer}>
          <View style={styles.langBox}>
            <Image
              source={{
                uri: sourceIsEnglish
                  ? "https://flagcdn.com/w320/us.png"
                  : selectedLang.flag,
              }}
              style={styles.flag}
            />
            <Text style={styles.langLabel}>
              {sourceIsEnglish ? "English" : selectedLang.name}
            </Text>
          </View>

          <TouchableOpacity style={styles.swapBtn} onPress={handleSwap}>
            <Text style={styles.swapIcon}>⇄</Text>
          </TouchableOpacity>

          <View style={styles.langBox}>
            <Image
              source={{
                uri: sourceIsEnglish
                  ? selectedLang.flag
                  : "https://flagcdn.com/w320/us.png",
              }}
              style={styles.flag}
            />
            <Text style={styles.langLabel}>
              {sourceIsEnglish ? selectedLang.name : "English"}
            </Text>
          </View>
        </View>

        {/* Cycle minority language */}
        <TouchableOpacity
          style={styles.cycleButton}
          onPress={() => {
            const idx = languages.findIndex((l) => l.key === selectedLang.key);
            setSelectedLang(languages[(idx + 1) % languages.length]);
            setTranslatedText("");
          }}
        >
          <Text style={styles.cycleText}>
            Change language: {selectedLang.name}
          </Text>
        </TouchableOpacity>

        {/* Input */}
        <View style={styles.inputCard}>
          <Text style={styles.cardLabel}>
            {sourceIsEnglish ? "English" : selectedLang.name}
          </Text>
          <TextInput
            style={styles.input}
            placeholder={
              sourceIsEnglish
                ? "Type English..."
                : `Type ${selectedLang.name}...`
            }
            multiline
            value={sourceText}
            onChangeText={setSourceText}
          />
          <TouchableOpacity
            onPress={() => speak(sourceText)}
            style={styles.speakBtn}
          >
            <Text>🔊 Speak</Text>
          </TouchableOpacity>
        </View>

        {/* Output */}
        <View style={styles.outputCard}>
          <Text style={styles.cardLabel}>
            {sourceIsEnglish ? selectedLang.name : "English"}
          </Text>
          {loading ? (
            <ActivityIndicator size="large" color="#6366f1" />
          ) : (
            <Text style={styles.outputText}>{translatedText || "—"}</Text>
          )}
          {translatedText && (
            <TouchableOpacity
              onPress={() => speak(translatedText)}
              style={styles.speakBtn}
            >
              <Text>🔊 Speak</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Lookup button */}
        <TouchableOpacity style={styles.actionBtn} onPress={handleLookup}>
          <Text style={styles.actionText}>Lookup</Text>
        </TouchableOpacity>

        {/* Suggestion form */}
        <View style={styles.suggestBox}>
          <Text style={styles.suggestTitle}>Suggest new phrase</Text>
          <TextInput
            style={styles.suggestInput}
            placeholder={`${selectedLang.name} phrase`}
            value={suggestLocal}
            onChangeText={setSuggestLocal}
          />
          <TextInput
            style={styles.suggestInput}
            placeholder="English meaning"
            value={suggestEnglish}
            onChangeText={setSuggestEnglish}
          />
          <TouchableOpacity style={styles.suggestBtn} onPress={handleSuggest}>
            <Text style={styles.suggestBtnText}>Send Suggestion</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Styles (simplified & matched to your main translate screen feel)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  backIcon: { fontSize: 32, color: "#333" },
  headerTitle: { fontSize: 20, fontWeight: "bold" },

  scrollContent: { padding: 16 },

  selectorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  langBox: { flex: 1, alignItems: "center" },
  flag: { width: 40, height: 40, borderRadius: 20 },
  langLabel: { fontSize: 14, fontWeight: "600", marginTop: 4 },

  swapBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#6366f1",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 12,
  },
  swapIcon: { fontSize: 32, color: "#fff" },

  cycleButton: {
    alignSelf: "center",
    padding: 8,
    marginBottom: 16,
  },
  cycleText: { color: "#6366f1", fontWeight: "600" },

  inputCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  outputCard: {
    backgroundColor: "#f0f4ff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
    marginBottom: 8,
  },
  input: { fontSize: 17, minHeight: 100, textAlignVertical: "top" },
  outputText: { fontSize: 17, lineHeight: 24, color: "#222" },
  speakBtn: { alignSelf: "flex-end", padding: 8 },

  actionBtn: {
    backgroundColor: "#6366f1",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 24,
  },
  actionText: { color: "#fff", fontSize: 18, fontWeight: "bold" },

  suggestBox: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  suggestTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 12 },
  suggestInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  suggestBtn: {
    backgroundColor: "#10b981",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  suggestBtnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
