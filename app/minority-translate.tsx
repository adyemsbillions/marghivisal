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

const API_GET_APPROVED =
  "https://margivial.cravii.ng/api/get-approved-suggestions.php";

// Static fallback dictionary (only used if API fails completely)
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

// Updated language list — now includes all requested languages
const languages = [
  { key: "en", name: "English", flag: "https://flagcdn.com/w320/us.png" },
{ key: "marghi", name: "Margi", flag: "https://flagcdn.com/w320/ng.png" },
  // Requested additions
  { key: "he", name: "Hebrew", flag: "https://flagcdn.com/w320/il.png" },
  { key: "pcm", name: "Nigerian Pidgin", flag: "https://flagcdn.com/w320/ng.png" },
  { key: "tiv", name: "Tiv", flag: "https://flagcdn.com/w320/ng.png" },
  { key: "kr", name: "Kanuri", flag: "https://flagcdn.com/w320/ng.png" },
  { key: "ff", name: "Fulfulde (Fula)", flag: "https://flagcdn.com/w320/ng.png" },
  { key: "ibb", name: "Ibibio", flag: "https://flagcdn.com/w320/ng.png" },
  { key: "efi", name: "Efik", flag: "https://flagcdn.com/w320/ng.png" },
  { key: "ann", name: "Obolo (Andoni)", flag: "https://flagcdn.com/w320/ng.png" },
  { key: "bin", name: "Edo (Bini)", flag: "https://flagcdn.com/w320/ng.png" },
  { key: "bom", name: "Berom", flag: "https://flagcdn.com/w320/ng.png" },
  { key: "kcg", name: "Tyap (Katab)", flag: "https://flagcdn.com/w320/ng.png" },

  // Original minority languages
  
  { key: "hona", name: "Hona", flag: "https://flagcdn.com/w320/ng.png" },
  { key: "glavda", name: "Glavda", flag: "https://flagcdn.com/w320/ng.png" },
  { key: "bwr", name: "Bura", flag: "https://flagcdn.com/w320/ng.png" },
  { key: "fli", name: "Fali", flag: "https://flagcdn.com/w320/ng.png" },
  { key: "hig", name: "Kamwe", flag: "https://flagcdn.com/w320/ng.png" },
  { key: "ckl", name: "Kibaku", flag: "https://flagcdn.com/w320/ng.png" },
  { key: "gnb", name: "Gavva", flag: "https://flagcdn.com/w320/ng.png" },

  // Optional extra
  { key: "rw", name: "Kinyarwanda", flag: "https://flagcdn.com/w320/rw.png" },
];

export default function MinorityTranslate() {
  const router = useRouter();

  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [sourceIsEnglish, setSourceIsEnglish] = useState(true);
  const [selectedLang, setSelectedLang] = useState(languages[0]);
  const [loading, setLoading] = useState(false);
  const [approvedSuggestions, setApprovedSuggestions] = useState<any[]>([]);

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
      } else {
        setApprovedSuggestions([]);
      }
    } catch (err) {
      console.error("Failed to load approved suggestions:", err);
      setApprovedSuggestions([]);
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

    // Artificial delay to simulate lookup
    setTimeout(() => {
      let result = "";

      // 1. Try approved suggestions first
      const approvedMatch = approvedSuggestions.find((s) => {
        const en = (s.english_meaning || "").toLowerCase();
        const local = (s.local_phrase || "").toLowerCase();

        if (sourceIsEnglish) {
          return en.includes(query) || query.includes(en);
        } else {
          return local.includes(query) || query.includes(local);
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
          : "No translation found — please suggest it!";
      }

      setTranslatedText(result);
      setLoading(false);
    }, 700);
  };

  const speak = (text: string) => {
    if (!text) return;
    Speech.speak(text, { language: "en" });
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
        {/* Language selector */}
        <View style={styles.langSwitcher}>
          <Text style={styles.langSwitcherTitle}>Translate to/from:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.langChips}>
              {languages.map((lang) => (
                <TouchableOpacity
                  key={lang.key}
                  style={[
                    styles.langChip,
                    selectedLang.key === lang.key && styles.langChipSelected,
                  ]}
                  onPress={() => {
                    setSelectedLang(lang);
                    setTranslatedText(""); // clear previous translation
                  }}
                >
                  <Image source={{ uri: lang.flag }} style={styles.langFlag} />
                  <Text
                    style={[
                      styles.langChipText,
                      selectedLang.key === lang.key && { color: "#fff" },
                    ]}
                  >
                    {lang.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Source & Target language boxes + swap */}
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

        {/* Input area */}
        <View style={styles.inputCard}>
          <Text style={styles.cardLabel}>
            {sourceIsEnglish ? "English" : selectedLang.name}
          </Text>
          <TextInput
            style={styles.input}
            placeholder={
              sourceIsEnglish
                ? "Type English text..."
                : `Type in ${selectedLang.name}...`
            }
            multiline
            value={sourceText}
            onChangeText={setSourceText}
          />
          {sourceText.length > 0 && (
            <TouchableOpacity
              onPress={() => speak(sourceText)}
              style={styles.speakBtn}
            >
              <Text>🔊 Speak</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Output area */}
        <View style={styles.outputCard}>
          <Text style={styles.cardLabel}>
            {sourceIsEnglish ? selectedLang.name : "English"}
          </Text>
          {loading ? (
            <ActivityIndicator size="large" color="#6366f1" />
          ) : (
            <Text style={styles.outputText}>
              {translatedText || "— Translation appears here —"}
            </Text>
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

        {/* Action buttons */}
        <TouchableOpacity style={styles.actionBtn} onPress={handleLookup}>
          <Text style={styles.actionText}>Lookup</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.suggestNavBtn}
          onPress={() =>
            router.push({
              pathname: "/suggest",
              params: {
                langKey: selectedLang.key,
                langName: selectedLang.name,
              },
            })
          }
        >
          <Text style={styles.suggestNavText}>
            Suggest new {selectedLang.name} phrase →
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

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

  scrollContent: { padding: 16, paddingBottom: 40 },

  // ── Language switcher ──
  langSwitcher: {
    marginBottom: 16,
  },
  langSwitcherTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#555",
    marginBottom: 8,
  },
  langChips: {
    flexDirection: "row",
    gap: 10,
  },
  langChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: "#e0e0e0",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  langChipSelected: {
    backgroundColor: "#10b981",
    borderColor: "#10b981",
  },
  langFlag: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  langChipText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },

  selectorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
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

  inputCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  outputCard: {
    backgroundColor: "#f0f4ff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
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
    marginBottom: 16,
  },
  actionText: { color: "#fff", fontSize: 18, fontWeight: "bold" },

  suggestNavBtn: {
    backgroundColor: "#10b98122",
    borderWidth: 1,
    borderColor: "#10b981",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  suggestNavText: {
    color: "#10b981",
    fontSize: 16,
    fontWeight: "600",
  },
});