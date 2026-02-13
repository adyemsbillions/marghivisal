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

// Static fallback dictionary (only used if API fails or no match)
const staticDictionary: Record<
  string,
  { en: string; local: string; lang: string }
> = {
  "good morning": { en: "Good morning", local: "Dargu", lang: "marghi" },
  "how are you": { en: "How are you?", local: "Lapya gu?", lang: "marghi" },
  "thank you": { en: "Thank you", local: "N jiri", lang: "marghi" },
  "good night": { en: "Good night", local: "Abar cara", lang: "marghi" },
};

// Updated language list — consistent with /suggest and /learn screens
const languages = [
  { key: "en", name: "English", flag: "https://flagcdn.com/w320/us.png" },
  { key: "marghi", name: "Margi", flag: "https://flagcdn.com/w320/ng.png" },
  { key: "hona", name: "Hona", flag: "https://flagcdn.com/w320/ng.png" },
  { key: "glavda", name: "Glavda", flag: "https://flagcdn.com/w320/ng.png" },
  { key: "gnb", name: "Gavva", flag: "https://flagcdn.com/w320/ng.png" },
  { key: "bwr", name: "Bura", flag: "https://flagcdn.com/w320/ng.png" },
  { key: "fli", name: "Fali", flag: "https://flagcdn.com/w320/ng.png" },
  { key: "hig", name: "Kamwe", flag: "https://flagcdn.com/w320/ng.png" },
  { key: "ckl", name: "Kibaku", flag: "https://flagcdn.com/w320/ng.png" },

  // Major Nigerian + requested languages
  { key: "ha", name: "Hausa", flag: "https://flagcdn.com/w320/ng.png" },
  { key: "yo", name: "Yoruba", flag: "https://flagcdn.com/w320/ng.png" },
  { key: "ig", name: "Igbo", flag: "https://flagcdn.com/w320/ng.png" },
  {
    key: "pcm",
    name: "Nigerian Pidgin",
    flag: "https://flagcdn.com/w320/ng.png",
  },
  { key: "tiv", name: "Tiv", flag: "https://flagcdn.com/w320/ng.png" },
  { key: "kr", name: "Kanuri", flag: "https://flagcdn.com/w320/ng.png" },
  {
    key: "ff",
    name: "Fulfulde (Fula)",
    flag: "https://flagcdn.com/w320/ng.png",
  },
  { key: "ibb", name: "Ibibio", flag: "https://flagcdn.com/w320/ng.png" },
  { key: "efi", name: "Efik", flag: "https://flagcdn.com/w320/ng.png" },
  {
    key: "ann",
    name: "Obolo (Andoni)",
    flag: "https://flagcdn.com/w320/ng.png",
  },
  { key: "bin", name: "Edo (Bini)", flag: "https://flagcdn.com/w320/ng.png" },
  { key: "bom", name: "Berom", flag: "https://flagcdn.com/w320/ng.png" },
  { key: "kcg", name: "Tyap (Katab)", flag: "https://flagcdn.com/w320/ng.png" },

  // Others
  { key: "he", name: "Hebrew", flag: "https://flagcdn.com/w320/il.png" },
  { key: "rw", name: "Kinyarwanda", flag: "https://flagcdn.com/w320/rw.png" },
];

export default function MinorityTranslate() {
  const router = useRouter();

  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [sourceIsEnglish, setSourceIsEnglish] = useState(true);
  const [selectedLang, setSelectedLang] = useState(languages[1]); // default to Margi
  const [loading, setLoading] = useState(false);
  const [approvedSuggestions, setApprovedSuggestions] = useState<any[]>([]);

  useEffect(() => {
    fetchApprovedSuggestions();
  }, [selectedLang.key]);

  const fetchApprovedSuggestions = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_GET_APPROVED}?language_key=${encodeURIComponent(selectedLang.key)}`,
      );
      const data = await res.json();

      if (data.success && Array.isArray(data.suggestions)) {
        setApprovedSuggestions(data.suggestions);
      } else {
        setApprovedSuggestions([]);
      }
    } catch (err) {
      console.error("Failed to load approved suggestions:", err);
      setApprovedSuggestions([]);
    } finally {
      setLoading(false);
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
    if (!query) {
      return Alert.alert("Empty input", "Please type something to translate.");
    }

    setLoading(true);
    setTranslatedText("");

    setTimeout(() => {
      let result = "";
      let isExact = false;
      let suggestions: string[] = [];

      // ────────────────────────────────────────────────
      // Helper to calculate simple word overlap score
      // (you can later replace with more advanced matching if needed)
      // ────────────────────────────────────────────────
      const getMatchScore = (a: string, b: string) => {
        const wordsA = a.toLowerCase().split(/\s+/).filter(Boolean);
        const wordsB = b.toLowerCase().split(/\s+/).filter(Boolean);
        const intersection = wordsA.filter((w) => wordsB.includes(w));
        return (
          intersection.length / Math.max(wordsA.length, wordsB.length || 1)
        );
      };

      // 1. Look in approved suggestions
      const candidates = approvedSuggestions
        .map((s) => {
          const en = (s.english_meaning || "").trim();
          const loc = (s.local_phrase || "").trim();

          const target = sourceIsEnglish ? en : loc;
          const candidate = sourceIsEnglish ? loc : en;

          const score = getMatchScore(query, target);

          return {
            score,
            candidate,
            target,
            exact: target.toLowerCase() === query,
          };
        })
        .filter((c) => c.score > 0)
        .sort((a, b) => b.score - a.score); // best matches first

      if (candidates.length > 0) {
        const best = candidates[0];

        if (best.exact || best.score >= 0.8) {
          // Treat as good enough → show as direct translation
          result = best.candidate;
          isExact = best.exact;
        } else if (best.score >= 0.4) {
          // Partial match → show related suggestions
          suggestions = candidates
            .filter((c) => c.score >= 0.4)
            .slice(0, 3)
            .map((c) => `• ${c.target} → ${c.candidate}`);
          result = "No exact match — here are related phrases:";
        } else {
          result = "No close translation found — suggest it below!";
        }
      } else {
        // 2. Fallback to static dictionary (same logic)
        const staticCandidates = Object.values(staticDictionary)
          .filter((entry) => entry.lang === selectedLang.key)
          .map((entry) => {
            const target = sourceIsEnglish ? entry.en : entry.local;
            const candidate = sourceIsEnglish ? entry.local : entry.en;
            const score = getMatchScore(query, target);
            return {
              score,
              candidate,
              target,
              exact: target.toLowerCase() === query,
            };
          })
          .filter((c) => c.score > 0)
          .sort((a, b) => b.score - a.score);

        if (staticCandidates.length > 0) {
          const best = staticCandidates[0];
          if (best.exact || best.score >= 0.8) {
            result = best.candidate;
            isExact = best.exact;
          } else if (best.score >= 0.4) {
            suggestions = staticCandidates
              .filter((c) => c.score >= 0.4)
              .slice(0, 3)
              .map((c) => `• ${c.target} → ${c.candidate}`);
            result = "No exact match in dictionary — similar entries:";
          }
        }

        if (!result) {
          result = "No translation found — suggest it below!";
        }
      }

      // Build final display text
      let displayText = result;

      if (suggestions.length > 0) {
        displayText += "\n\n" + suggestions.join("\n");
      }

      if (!isExact && result && !result.includes("No")) {
        displayText += "\n\n(Partial match — check if this fits your context)";
      }

      setTranslatedText(displayText);
      setLoading(false);
    }, 600);
  };

  const speak = (text: string, langCode = "en") => {
    if (!text) return;
    Speech.speak(text, {
      language: langCode,
      pitch: 1.0,
      rate: 0.95,
    });
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
          <Text style={styles.langSwitcherTitle}>Select language:</Text>
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
                    setTranslatedText("");
                    setSourceText("");
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

        {/* From ↔ To indicators */}
        <View style={styles.directionContainer}>
          <View style={styles.langIndicator}>
            <Image
              source={{
                uri: sourceIsEnglish
                  ? "https://flagcdn.com/w320/us.png"
                  : selectedLang.flag,
              }}
              style={styles.smallFlag}
            />
            <Text style={styles.langName}>
              {sourceIsEnglish ? "English" : selectedLang.name}
            </Text>
          </View>

          <TouchableOpacity style={styles.swapButton} onPress={handleSwap}>
            <Text style={styles.swapIcon}>↔</Text>
          </TouchableOpacity>

          <View style={styles.langIndicator}>
            <Image
              source={{
                uri: sourceIsEnglish
                  ? selectedLang.flag
                  : "https://flagcdn.com/w320/us.png",
              }}
              style={styles.smallFlag}
            />
            <Text style={styles.langName}>
              {sourceIsEnglish ? selectedLang.name : "English"}
            </Text>
          </View>
        </View>

        {/* Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.sectionLabel}>Enter text</Text>
          <View style={styles.inputCard}>
            <TextInput
              style={styles.textInput}
              placeholder={
                sourceIsEnglish
                  ? "Type in English..."
                  : `Type in ${selectedLang.name}...`
              }
              multiline
              value={sourceText}
              onChangeText={setSourceText}
              editable={!loading}
            />

            {sourceText.length > 0 && (
              <TouchableOpacity
                style={styles.speakIcon}
                onPress={() => speak(sourceText, sourceIsEnglish ? "en" : "en")}
              >
                <Text style={styles.speakEmoji}>🔊</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Output */}
        <View style={styles.outputContainer}>
          <Text style={styles.sectionLabel}>Translation</Text>
          <View style={styles.outputCard}>
            {loading ? (
              <ActivityIndicator size="large" color="#10b981" />
            ) : (
              <Text style={styles.outputText}>
                {translatedText || "Translation will appear here"}
              </Text>
            )}

            {translatedText && !translatedText.includes("No") && (
              <TouchableOpacity
                style={styles.speakIconBottom}
                onPress={() =>
                  speak(translatedText, sourceIsEnglish ? "en" : "en")
                }
              >
                <Text style={styles.speakEmoji}>🔊</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Actions */}
        <TouchableOpacity
          style={[styles.actionButton, loading && styles.actionDisabled]}
          onPress={handleLookup}
          disabled={loading}
        >
          <Text style={styles.actionButtonText}>
            {loading ? "Looking up..." : "Translate"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.suggestButton}
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
          <Text style={styles.suggestButtonText}>
            Don't see a translation? Suggest it →
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  backIcon: {
    fontSize: 28,
    color: "#374151",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },

  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },

  langSwitcher: {
    marginBottom: 20,
  },
  langSwitcherTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#4b5563",
    marginBottom: 10,
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
    backgroundColor: "#f3f4f6",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  langChipSelected: {
    backgroundColor: "#10b981",
    borderColor: "#10b981",
  },
  langFlag: {
    width: 22,
    height: 22,
    borderRadius: 11,
    marginRight: 8,
  },
  langChipText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },

  directionContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  langIndicator: {
    flex: 1,
    alignItems: "center",
  },
  smallFlag: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginBottom: 6,
  },
  langName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  swapButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#10b981",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 12,
  },
  swapIcon: {
    fontSize: 28,
    color: "#fff",
  },

  inputContainer: {
    marginBottom: 20,
  },
  outputContainer: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#4b5563",
    marginBottom: 8,
  },

  inputCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    position: "relative",
  },
  outputCard: {
    backgroundColor: "#f0fdfa",
    borderRadius: 16,
    padding: 20,
    minHeight: 120,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ccfbf1",
  },
  textInput: {
    fontSize: 17,
    lineHeight: 24,
    minHeight: 100,
    textAlignVertical: "top",
    color: "#111827",
  },
  outputText: {
    fontSize: 17,
    lineHeight: 26,
    color: "#111827",
  },
  speakIcon: {
    position: "absolute",
    bottom: 12,
    right: 12,
    padding: 8,
    backgroundColor: "#f3f4f6",
    borderRadius: 20,
  },
  speakIconBottom: {
    alignSelf: "flex-end",
    marginTop: 12,
    padding: 8,
    backgroundColor: "#ecfdf5",
    borderRadius: 20,
  },
  speakEmoji: {
    fontSize: 20,
  },

  actionButton: {
    backgroundColor: "#10b981",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  actionDisabled: {
    backgroundColor: "#6ee7b7",
    opacity: 0.7,
  },
  actionButtonText: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "700",
  },

  suggestButton: {
    backgroundColor: "#ecfdf5",
    borderWidth: 1.5,
    borderColor: "#10b981",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  suggestButtonText: {
    color: "#065f46",
    fontSize: 16,
    fontWeight: "600",
  },
});
