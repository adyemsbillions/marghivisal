"use client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import * as Speech from "expo-speech";
import React, { useEffect, useState } from "react";
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

// API to fetch approved suggestions
const API_GET_APPROVED =
  "https://margivial.cravii.ng/api/get-approved-suggestions.php";

// Full language list (you can move this to a shared file later)
const languageOptions = [
  { key: "marghi", name: "Margi", flag: "https://flagcdn.com/w320/ng.png" },
  { key: "hona", name: "Hona", flag: "https://flagcdn.com/w320/ng.png" },
  { key: "glavda", name: "Glavda", flag: "https://flagcdn.com/w320/ng.png" },
  { key: "mrt", name: "Margi (alt)", flag: "https://flagcdn.com/w320/ng.png" },
  { key: "hwo", name: "Hona (alt)", flag: "https://flagcdn.com/w320/ng.png" },
  { key: "glw", name: "Glavda (alt)", flag: "https://flagcdn.com/w320/ng.png" },
  { key: "gav", name: "Gavva", flag: "https://flagcdn.com/w320/ng.png" },
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
  // Add more languages here as needed
];

export default function Learn() {
  const router = useRouter();

  const [selectedLang, setSelectedLang] = useState(languageOptions[0]);
  const [lessons, setLessons] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState({}); // { margi: 5, ha: 12, ... }
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);

  // Load saved progress once
  useEffect(() => {
    loadProgress();
  }, []);

  // Fetch lessons when selected language changes
  useEffect(() => {
    fetchLessons();
  }, [selectedLang.key]);

  const fetchLessons = async () => {
    setLoading(true);
    setFetchError(null);
    setLessons([]);

    try {
      const url = `${API_GET_APPROVED}?language_key=${encodeURIComponent(selectedLang.key)}`;
      const res = await fetch(url);
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to load lessons");
      }

      const formatted = (data.suggestions || []).map((item, idx) => ({
        id: idx + 1,
        english: item.english_meaning,
        local: item.local_phrase,
        audioLang: selectedLang.key === "ha" ? "ha" : "en", // better Hausa TTS
        explanation: item.context || "Community-contributed phrase",
        category: "Community Lesson",
      }));

      setLessons(formatted);

      if (formatted.length === 0) {
        setFetchError(`No approved lessons yet for ${selectedLang.name}.`);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setFetchError("Could not load lessons. Please check your connection.");
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
        "Great job!",
        `You've completed all available ${selectedLang.name} lessons!`,
      );
      setCurrentIndex(0);
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

  const LanguagePicker = () => {
    const [search, setSearch] = useState("");

    const filtered = languageOptions.filter((l) =>
      l.name.toLowerCase().includes(search.toLowerCase()),
    );

    return (
      <Modal
        visible={showLanguagePicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowLanguagePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choose Language</Text>

            <TextInput
              style={styles.searchInput}
              placeholder="Search language..."
              value={search}
              onChangeText={setSearch}
            />

            <FlatList
              data={filtered}
              keyExtractor={(item) => item.key}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.langItem,
                    item.key === selectedLang.key && styles.langItemSelected,
                  ]}
                  onPress={() => {
                    setSelectedLang(item);
                    setCurrentIndex(0);
                    setShowLanguagePicker(false);
                    setSearch("");
                  }}
                >
                  <Image source={{ uri: item.flag }} style={styles.langFlag} />
                  <Text style={styles.langName}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowLanguagePicker(false)}
            >
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
        <Text style={styles.headerTitle}>Learn {selectedLang.name}</Text>
        <TouchableOpacity onPress={() => setShowLanguagePicker(true)}>
          <Text style={styles.switchLang}>Change</Text>
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
        {loading ? (
          <ActivityIndicator
            size="large"
            color="#10b981"
            style={{ marginVertical: 60 }}
          />
        ) : fetchError ? (
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
            No approved lessons yet for {selectedLang.name}.{"\n"}Help grow the
            collection by suggesting phrases!
          </Text>
        )}

        {/* Stats */}
        <View style={styles.statsBox}>
          <Text style={styles.statsTitle}>Your Progress</Text>
          {languageOptions.map((lang) => (
            <Text key={lang.key} style={styles.statItem}>
              {lang.name}: {progress[lang.key] || 0} lessons completed
            </Text>
          ))}
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => router.push("/suggest")}
        >
          <Text style={styles.ctaText}>Suggest new phrases →</Text>
        </TouchableOpacity>
      </ScrollView>

      <LanguagePicker />
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

  // Modal styles
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
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  langItemSelected: {
    backgroundColor: "#e6f0ff",
  },
  langFlag: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 16,
  },
  langName: {
    fontSize: 17,
    color: "#222",
  },
  closeButton: {
    marginTop: 20,
    paddingVertical: 14,
    backgroundColor: "#6366f1",
    borderRadius: 12,
    alignItems: "center",
  },
  closeText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
