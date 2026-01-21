"use client";
import { useRouter } from "expo-router";
import * as Speech from "expo-speech";
import React, { useEffect, useState } from "react";
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

const API_SUBMIT = "https://margivial.cravii.ng/api/submit-suggestion.php";
const API_GET_APPROVED =
  "https://margivial.cravii.ng/api/get-approved-suggestions.php";

// Static fallback dictionary
const staticDictionary: Record<
  string,
  { en: string; local: string; lang: string }
> = {
  "good morning": { en: "Good morning", local: "Dargu", lang: "marghi" },
  "how are you": { en: "How are you?", local: "Lapya gu?", lang: "marghi" },
  "thank you": { en: "Thank you", local: "N jiri", lang: "marghi" },
  "good night": { en: "Good night", local: "Abar cara", lang: "marghi" },
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

  // Approved suggestions from server
  const [approvedSuggestions, setApprovedSuggestions] = useState<any[]>([]);

  // Suggestion form
  const [suggestLocal, setSuggestLocal] = useState("");
  const [suggestEnglish, setSuggestEnglish] = useState("");
  const [suggestContext, setSuggestContext] = useState("");
  const [suggestSubmitting, setSuggestSubmitting] = useState(false);

  // Fetch approved suggestions when language changes or on mount
  useEffect(() => {
    fetchApprovedSuggestions();
  }, [selectedLang.key]);

  const fetchApprovedSuggestions = async () => {
    try {
      const res = await fetch(
        `${API_GET_APPROVED}?language_key=${selectedLang.key}`,
      );
      const data = await res.json();

      if (data.success) {
        setApprovedSuggestions(data.suggestions || []);
      }
    } catch (err) {
      console.warn("Failed to load approved suggestions:", err);
      // silent fail — use static dictionary
    }
  };

  const handleSwap = () => {
    setSourceIsEnglish(!sourceIsEnglish);
    const temp = sourceText;
    setSourceText(translatedText);
    setTranslatedText(temp);
  };

  const handleLookup = () => {
    const query = sourceText.trim().toLowerCase();
    if (!query) return Alert.alert("Empty", "Please type something.");

    setLoading(true);
    setTranslatedText("");

    setTimeout(() => {
      let result = "";

      // 1. Check approved suggestions first (higher priority)
      const approvedMatch = approvedSuggestions.find((s) => {
        if (sourceIsEnglish) {
          return s.english_meaning?.toLowerCase().includes(query);
        } else {
          return s.local_phrase?.toLowerCase().includes(query);
        }
      });

      if (approvedMatch) {
        result = sourceIsEnglish
          ? approvedMatch.local_phrase
          : approvedMatch.english_meaning;
      } else {
        // 2. Fallback to static dictionary
        const staticMatch = Object.values(staticDictionary).find(
          (e) =>
            e.lang === selectedLang.key &&
            (sourceIsEnglish
              ? e.en.toLowerCase().includes(query)
              : e.local.toLowerCase().includes(query)),
        );

        result = staticMatch
          ? sourceIsEnglish
            ? staticMatch.local
            : staticMatch.en
          : "No translation found — suggest below!";
      }

      setTranslatedText(result);
      setLoading(false);
    }, 700);
  };

  const speak = (text: string) => {
    if (!text) return;
    Speech.speak(text, { language: "en" });
  };

  const handleSuggest = async () => {
    if (!suggestLocal.trim() || !suggestEnglish.trim()) {
      return Alert.alert("Missing info", "Please fill both fields.");
    }

    setSuggestSubmitting(true);

    try {
      const res = await fetch(API_SUBMIT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language_key: selectedLang.key,
          local_phrase: suggestLocal.trim(),
          english_meaning: suggestEnglish.trim(),
          context: suggestContext.trim() || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to submit");

      Alert.alert("Success!", data.message || "Suggestion sent — thank you!");
      setSuggestLocal("");
      setSuggestEnglish("");
      setSuggestContext("");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Could not send suggestion.");
    } finally {
      setSuggestSubmitting(false);
    }
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
        {/* Direction selector */}
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

        {/* Cycle language */}
        <TouchableOpacity
          style={styles.cycleButton}
          onPress={() => {
            const idx = languages.findIndex((l) => l.key === selectedLang.key);
            setSelectedLang(languages[(idx + 1) % languages.length]);
            setTranslatedText("");
          }}
        >
          <Text style={styles.cycleText}>Change: {selectedLang.name}</Text>
        </TouchableOpacity>

        {/* Input card */}
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

        {/* Output card */}
        <View style={styles.outputCard}>
          <Text style={styles.cardLabel}>
            {sourceIsEnglish ? selectedLang.name : "English"}
          </Text>
          {loading ? (
            <ActivityIndicator size="large" color="#6366f1" />
          ) : (
            <Text style={styles.outputText}>{translatedText || "—"}</Text>
          )}
          {translatedText && !translatedText.includes("No") && (
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
          <Text style={styles.suggestTitle}>Suggest New Phrase</Text>

          <TextInput
            style={styles.suggestInput}
            placeholder={`${selectedLang.name} phrase`}
            value={suggestLocal}
            onChangeText={setSuggestLocal}
            editable={!suggestSubmitting}
          />

          <TextInput
            style={styles.suggestInput}
            placeholder="English meaning"
            value={suggestEnglish}
            onChangeText={setSuggestEnglish}
            editable={!suggestSubmitting}
          />

          <TouchableOpacity
            style={[styles.suggestBtn, suggestSubmitting && { opacity: 0.6 }]}
            onPress={handleSuggest}
            disabled={suggestSubmitting}
          >
            {suggestSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.suggestBtnText}>Send Suggestion</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Styles remain the same as before
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
  speakBtn: { alignSelf: "flex-end", padding: 8, marginTop: 8 },

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
