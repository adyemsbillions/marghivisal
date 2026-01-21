"use client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import * as Speech from "expo-speech";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

// API to fetch approved suggestions
const API_GET_APPROVED =
  "https://margivial.cravii.ng/api/get-approved-suggestions.php";

const languageOptions = [
  { key: "marghi", name: "Marghi", flag: "https://flagcdn.com/w320/ng.png" },
  { key: "hona", name: "Hona", flag: "https://flagcdn.com/w320/ng.png" },
  { key: "glavda", name: "Glavda", flag: "https://flagcdn.com/w320/ng.png" },
  { key: "ha", name: "Hausa", flag: "https://flagcdn.com/w320/ng.png" },
];

export default function Learn() {
  const router = useRouter();

  const [selectedLang, setSelectedLang] = useState(languageOptions[0]);
  const [lessons, setLessons] = useState([]); // fetched approved suggestions
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState({}); // { marghi: 3, hona: 0, ... }
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Load saved progress + fetch lessons when language changes
  useEffect(() => {
    loadProgress();
  }, []);

  useEffect(() => {
    fetchLessons();
  }, [selectedLang.key]);

  const fetchLessons = async () => {
    setLoading(true);
    setFetchError(null);
    setLessons([]);

    try {
      const res = await fetch(
        `${API_GET_APPROVED}?language_key=${selectedLang.key}`,
      );
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to load lessons");
      }

      // Map API response to lesson format
      const formatted = (data.suggestions || []).map((item, idx) => ({
        id: idx + 1,
        english: item.english_meaning,
        local: item.local_phrase,
        audioLang: selectedLang.key === "ha" ? "ha" : "en", // Hausa has better TTS support
        explanation: item.context || "Community-contributed phrase",
        category: "Community Lesson",
      }));

      setLessons(formatted);

      if (formatted.length === 0) {
        setFetchError("No approved lessons available for this language yet.");
      }
    } catch (err) {
      console.error("Fetch lessons error:", err);
      setFetchError("Could not load lessons. Check internet or try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadProgress = async () => {
    try {
      const saved = await AsyncStorage.getItem("learnProgress");
      if (saved) {
        setProgress(JSON.parse(saved));
      }
    } catch (e) {
      console.warn("Failed to load progress", e);
    }
  };

  const saveProgress = async () => {
    try {
      await AsyncStorage.setItem("learnProgress", JSON.stringify(progress));
    } catch (e) {
      console.warn("Failed to save progress", e);
    }
  };

  const currentLesson = lessons[currentIndex] || null;

  const markAsLearned = () => {
    if (!currentLesson) return;

    const newProgress = { ...progress };
    const key = selectedLang.key;
    newProgress[key] = (newProgress[key] || 0) + 1;
    setProgress(newProgress);
    saveProgress();

    if (currentIndex < lessons.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      Alert.alert(
        "Well done!",
        `You've reviewed all available ${selectedLang.name} lessons!`,
      );
      setCurrentIndex(0); // restart from beginning
    }
  };

  const speak = (text, langCode = "en") => {
    if (!text) return;
    Speech.speak(text, {
      language: langCode,
      pitch: 1.0,
      rate: langCode === "ha" ? 0.85 : 1.0,
    });
  };

  const cycleLanguage = () => {
    const idx = languageOptions.findIndex((l) => l.key === selectedLang.key);
    const next = languageOptions[(idx + 1) % languageOptions.length];
    setSelectedLang(next);
    setCurrentIndex(0);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#6366f1" style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Learn {selectedLang.name}</Text>
        <TouchableOpacity onPress={cycleLanguage}>
          <Text style={styles.switchLang}>Switch</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Progress */}
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Lesson {currentIndex + 1} / {lessons.length || "?"}
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: lessons.length
                    ? `${((currentIndex + 1) / lessons.length) * 100}%`
                    : "0%",
                },
              ]}
            />
          </View>
        </View>

        {/* Lesson content */}
        {fetchError ? (
          <Text style={styles.errorText}>{fetchError}</Text>
        ) : currentLesson ? (
          <View style={styles.lessonCard}>
            <Text style={styles.englishPhrase}>{currentLesson.english}</Text>
            <Text style={styles.localPhrase}>{currentLesson.local}</Text>

            <View style={styles.audioRow}>
              <TouchableOpacity
                style={styles.audioBtn}
                onPress={() => speak(currentLesson.english, "en")}
              >
                <Text>🔊 English</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.audioBtn}
                onPress={() =>
                  speak(currentLesson.local, currentLesson.audioLang)
                }
              >
                <Text>🔊 {selectedLang.name}</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.explanation}>{currentLesson.explanation}</Text>

            <TouchableOpacity style={styles.learnedBtn} onPress={markAsLearned}>
              <Text style={styles.learnedText}>Learned → Next</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={styles.noLessons}>
            No approved lessons yet for {selectedLang.name}. Help by suggesting
            some phrases!
          </Text>
        )}

        {/* Stats */}
        <View style={styles.statsBox}>
          <Text style={styles.statsTitle}>Your Learning Progress</Text>
          {languageOptions.map((lang) => (
            <Text key={lang.key} style={styles.statItem}>
              {lang.name}: {progress[lang.key] || 0} lessons completed
            </Text>
          ))}
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => router.push("/minority-translate")}
        >
          <Text style={styles.ctaText}>
            Suggest new phrases to add lessons →
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

  scrollContent: { padding: 20, paddingBottom: 100 },

  progressContainer: { marginBottom: 24 },
  progressText: { fontSize: 14, color: "#666", marginBottom: 8 },
  progressBar: {
    height: 10,
    backgroundColor: "#e0e0e0",
    borderRadius: 5,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#10b981",
  },

  lessonCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 5,
  },
  englishPhrase: {
    fontSize: 18,
    color: "#555",
    marginBottom: 12,
    fontStyle: "italic",
  },
  localPhrase: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#d63384",
    textAlign: "center",
    marginBottom: 20,
  },
  audioRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 40,
    marginBottom: 20,
  },
  audioBtn: {
    backgroundColor: "#f0f4ff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  explanation: {
    fontSize: 15,
    color: "#444",
    lineHeight: 22,
    marginBottom: 24,
  },
  learnedBtn: {
    backgroundColor: "#10b981",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  learnedText: { color: "#fff", fontSize: 16, fontWeight: "700" },

  errorText: {
    fontSize: 16,
    color: "#e74c3c",
    textAlign: "center",
    marginVertical: 40,
  },
  noLessons: {
    fontSize: 17,
    color: "#777",
    textAlign: "center",
    marginVertical: 40,
    lineHeight: 24,
  },

  statsBox: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  statsTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  statItem: { fontSize: 15, color: "#444", marginBottom: 6 },

  ctaButton: {
    backgroundColor: "#6366f1",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
  },
  ctaText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
