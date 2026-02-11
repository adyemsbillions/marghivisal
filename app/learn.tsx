"use client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import * as Speech from "expo-speech";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
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

const { width, height } = Dimensions.get("window");

// API to fetch approved suggestions
const API_GET_APPROVED =
  "https://margivial.cravii.ng/api/get-approved-suggestions.php";

// Full language list
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
];

export default function Learn() {
  const router = useRouter();

  const [selectedLang, setSelectedLang] = useState(languageOptions[0]);
  const [lessons, setLessons] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [celebrationAnim] = useState(new Animated.Value(0));

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
        audioLang: selectedLang.key === "ha" ? "ha" : "en",
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
      // Show completion modal with animation
      setShowCompletionModal(true);
      Animated.spring(celebrationAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();
    }
  };

  const closeCompletionModal = () => {
    Animated.timing(celebrationAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setShowCompletionModal(false);
      setCurrentIndex(0);
    });
  };

  const speak = (text, langCode = "en") => {
    if (!text) return;
    Speech.speak(text, {
      language: langCode,
      pitch: 1.0,
      rate: langCode === "ha" ? 0.85 : 1.0,
    });
  };

  // Confetti particle component
  const ConfettiParticle = ({ delay, color, startX }) => {
    const [particleAnim] = useState(new Animated.Value(0));

    useEffect(() => {
      if (showCompletionModal) {
        Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(particleAnim, {
              toValue: 1,
              duration: 2000 + Math.random() * 1000,
              useNativeDriver: true,
            }),
          ]),
        ).start();
      }
    }, [showCompletionModal]);

    const translateY = particleAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [-50, height],
    });

    const translateX = particleAnim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [
        startX,
        startX + (Math.random() - 0.5) * 100,
        startX + (Math.random() - 0.5) * 150,
      ],
    });

    const rotate = particleAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ["0deg", "360deg"],
    });

    const opacity = particleAnim.interpolate({
      inputRange: [0, 0.1, 0.9, 1],
      outputRange: [0, 1, 1, 0],
    });

    return (
      <Animated.View
        style={[
          styles.confettiParticle,
          {
            backgroundColor: color,
            transform: [{ translateY }, { translateX }, { rotate }],
            opacity,
          },
        ]}
      />
    );
  };

  // Completion Modal
  const CompletionModal = () => {
    const confettiColors = [
      "#6366f1",
      "#10b981",
      "#f59e0b",
      "#ec4899",
      "#8b5cf6",
      "#14b8a6",
    ];
    const confettiCount = 30;

    const scale = celebrationAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 1],
    });

    const opacity = celebrationAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });

    return (
      <Modal
        visible={showCompletionModal}
        animationType="fade"
        transparent={true}
        onRequestClose={closeCompletionModal}
      >
        <View style={styles.completionOverlay}>
          {/* Confetti */}
          {Array.from({ length: confettiCount }).map((_, i) => (
            <ConfettiParticle
              key={i}
              delay={i * 50}
              color={confettiColors[i % confettiColors.length]}
              startX={Math.random() * width}
            />
          ))}

          {/* Modal Content */}
          <Animated.View
            style={[
              styles.completionContent,
              {
                transform: [{ scale }],
                opacity,
              },
            ]}
          >
            {/* Trophy Icon */}
            <View style={styles.trophyContainer}>
              <Text style={styles.trophyIcon}>🏆</Text>
              <View style={styles.trophyGlow} />
            </View>

            {/* Celebration Text */}
            <Text style={styles.completionTitle}>Amazing Work!</Text>
            <Text style={styles.completionSubtitle}>
              You've completed all {lessons.length} {selectedLang.name} lessons!
            </Text>

            {/* Stats */}
            <View style={styles.completionStats}>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{lessons.length}</Text>
                <Text style={styles.statLabel}>Lessons</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>
                  {progress[selectedLang.key] || 0}
                </Text>
                <Text style={styles.statLabel}>Total Mastered</Text>
              </View>
            </View>

            {/* Achievement Badge */}
            <View style={styles.achievementBadge}>
              <Text style={styles.achievementIcon}>⭐</Text>
              <Text style={styles.achievementText}>
                {selectedLang.name} Language Master
              </Text>
            </View>

            {/* Buttons */}
            <TouchableOpacity
              style={styles.restartButton}
              onPress={closeCompletionModal}
              activeOpacity={0.8}
            >
              <Text style={styles.restartButtonText}>Review Lessons Again</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.continueButton}
              onPress={() => {
                closeCompletionModal();
                setShowLanguagePicker(true);
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.continueButtonText}>
                Learn Another Language
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.shareButton}
              onPress={() => {
                closeCompletionModal();
                router.push("/suggest");
              }}
            >
              <Text style={styles.shareButtonText}>✨ Contribute Phrases</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    );
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
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose Language</Text>
              <TouchableOpacity
                onPress={() => setShowLanguagePicker(false)}
                style={styles.modalCloseBtn}
              >
                <Text style={styles.modalCloseIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.searchInput}
              placeholder="Search languages..."
              placeholderTextColor="#999"
              value={search}
              onChangeText={setSearch}
            />

            <FlatList
              data={filtered}
              keyExtractor={(item) => item.key}
              showsVerticalScrollIndicator={false}
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
                  {item.key === selectedLang.key && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    );
  };

  const progressPercentage = lessons.length
    ? ((currentIndex + 1) / lessons.length) * 100
    : 0;

  return (
    <SafeAreaView style={styles.container}>
      {/* Enhanced Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerSubtitle}>Learn</Text>
          <TouchableOpacity
            onPress={() => setShowLanguagePicker(true)}
            style={styles.languageSelector}
          >
            <Text style={styles.headerTitle}>{selectedLang.name}</Text>
            <Text style={styles.dropdownIcon}>▼</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.headerRight}>
          <View style={styles.streakBadge}>
            <Text style={styles.streakIcon}>🔥</Text>
            <Text style={styles.streakCount}>
              {progress[selectedLang.key] || 0}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Enhanced Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>
              Lesson {currentIndex + 1} of {lessons.length || 0}
            </Text>
            <Text style={styles.progressPercent}>
              {Math.round(progressPercentage)}%
            </Text>
          </View>
          <View style={styles.progressBarOuter}>
            <View
              style={[
                styles.progressBarInner,
                { width: `${progressPercentage}%` },
              ]}
            />
          </View>
        </View>

        {/* Lesson Content */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6366f1" />
            <Text style={styles.loadingText}>Loading lessons...</Text>
          </View>
        ) : fetchError ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorText}>{fetchError}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchLessons}>
              <Text style={styles.retryText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : currentLesson ? (
          <View style={styles.lessonCard}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{currentLesson.category}</Text>
            </View>

            <View style={styles.lessonContent}>
              <Text style={styles.questionLabel}>English</Text>
              <Text style={styles.englishPhrase}>{currentLesson.english}</Text>

              <View style={styles.divider} />

              <Text style={styles.answerLabel}>
                {selectedLang.name} Translation
              </Text>
              <Text style={styles.localPhrase}>{currentLesson.local}</Text>
            </View>

            <View style={styles.audioRow}>
              <TouchableOpacity
                style={styles.audioBtn}
                onPress={() => speak(currentLesson.english, "en")}
              >
                <Text style={styles.audioIcon}>🔊</Text>
                <Text style={styles.audioBtnText}>English</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.audioBtn, styles.audioBtnPrimary]}
                onPress={() =>
                  speak(currentLesson.local, currentLesson.audioLang)
                }
              >
                <Text style={styles.audioIcon}>🔊</Text>
                <Text style={styles.audioBtnTextPrimary}>
                  {selectedLang.name}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.explanationBox}>
              <Text style={styles.explanationLabel}>💡 Context</Text>
              <Text style={styles.explanation}>
                {currentLesson.explanation}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.learnedBtn}
              onPress={markAsLearned}
              activeOpacity={0.8}
            >
              <Text style={styles.learnedText}>
                {currentIndex < lessons.length - 1
                  ? "Got it! Next Lesson →"
                  : "Complete & Restart"}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📚</Text>
            <Text style={styles.emptyTitle}>No Lessons Yet</Text>
            <Text style={styles.emptyText}>
              No approved lessons for {selectedLang.name}.{"\n"}
              Help grow the collection by suggesting phrases!
            </Text>
            <TouchableOpacity
              style={styles.suggestButton}
              onPress={() => router.push("/suggest")}
            >
              <Text style={styles.suggestButtonText}>Suggest Phrases</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Compact Stats */}
        {Object.keys(progress).length > 0 && (
          <View style={styles.statsCard}>
            <View style={styles.statsHeader}>
              <Text style={styles.statsTitle}>📊 Your Progress</Text>
              <Text style={styles.totalLessons}>
                {Object.values(progress).reduce((a, b) => a + b, 0)} total
              </Text>
            </View>
            <View style={styles.statsGrid}>
              {languageOptions
                .filter((lang) => progress[lang.key] > 0)
                .slice(0, 6)
                .map((lang) => (
                  <View key={lang.key} style={styles.statItem}>
                    <Image
                      source={{ uri: lang.flag }}
                      style={styles.statFlag}
                    />
                    <View style={styles.statInfo}>
                      <Text style={styles.statLang}>{lang.name}</Text>
                      <Text style={styles.statCount}>
                        {progress[lang.key]} lessons
                      </Text>
                    </View>
                  </View>
                ))}
            </View>
          </View>
        )}

        {/* CTA Button */}
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => router.push("/suggest")}
          activeOpacity={0.9}
        >
          <Text style={styles.ctaIcon}>✨</Text>
          <Text style={styles.ctaText}>Suggest New Phrases</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <CompletionModal />
      <LanguagePicker />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },

  // Header Styles
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e8eaed",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  backIcon: {
    fontSize: 24,
    color: "#1f2937",
    fontWeight: "600",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "500",
    marginBottom: 2,
  },
  languageSelector: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  dropdownIcon: {
    fontSize: 10,
    color: "#6366f1",
    marginTop: 2,
  },
  headerRight: {
    width: 44,
    alignItems: "flex-end",
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef3c7",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  streakIcon: {
    fontSize: 14,
  },
  streakCount: {
    fontSize: 13,
    fontWeight: "700",
    color: "#92400e",
  },

  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },

  // Progress Bar
  progressContainer: {
    marginBottom: 20,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "600",
  },
  progressPercent: {
    fontSize: 14,
    color: "#6366f1",
    fontWeight: "700",
  },
  progressBarOuter: {
    height: 8,
    backgroundColor: "#e5e7eb",
    borderRadius: 8,
    overflow: "hidden",
  },
  progressBarInner: {
    height: "100%",
    backgroundColor: "#6366f1",
    borderRadius: 8,
  },

  // Lesson Card
  lessonCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 20,
  },
  categoryText: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  lessonContent: {
    marginBottom: 24,
  },
  questionLabel: {
    fontSize: 12,
    color: "#9ca3af",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  englishPhrase: {
    fontSize: 18,
    color: "#374151",
    marginBottom: 20,
    lineHeight: 26,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginBottom: 20,
  },
  answerLabel: {
    fontSize: 12,
    color: "#9ca3af",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  localPhrase: {
    fontSize: 28,
    fontWeight: "700",
    color: "#6366f1",
    lineHeight: 38,
  },

  audioRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  audioBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f9fafb",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    gap: 8,
  },
  audioBtnPrimary: {
    backgroundColor: "#eef2ff",
    borderColor: "#c7d2fe",
  },
  audioIcon: {
    fontSize: 18,
  },
  audioBtnText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "600",
  },
  audioBtnTextPrimary: {
    fontSize: 14,
    color: "#6366f1",
    fontWeight: "700",
  },

  explanationBox: {
    backgroundColor: "#fefce8",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: "#fbbf24",
  },
  explanationLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#92400e",
    marginBottom: 6,
  },
  explanation: {
    fontSize: 14,
    color: "#78350f",
    lineHeight: 20,
  },

  learnedBtn: {
    backgroundColor: "#6366f1",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#6366f1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  learnedText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  // Loading State
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: "#6b7280",
    fontWeight: "500",
  },

  // Error State
  errorContainer: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 15,
    color: "#ef4444",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#6366f1",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },

  // Empty State
  emptyState: {
    alignItems: "center",
    paddingVertical: 50,
    paddingHorizontal: 30,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 15,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 28,
  },
  suggestButton: {
    backgroundColor: "#6366f1",
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
  },
  suggestButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },

  // Stats Card
  statsCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  statsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  totalLessons: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6366f1",
  },
  statsGrid: {
    gap: 12,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    gap: 12,
  },
  statFlag: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  statInfo: {
    flex: 1,
  },
  statLang: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  statCount: {
    fontSize: 12,
    color: "#6b7280",
  },

  // CTA Button
  ctaButton: {
    backgroundColor: "#10b981",
    borderRadius: 16,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaIcon: {
    fontSize: 20,
  },
  ctaText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  bottomSpacer: {
    height: 20,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
    paddingBottom: 40,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCloseIcon: {
    fontSize: 18,
    color: "#6b7280",
    fontWeight: "600",
  },
  searchInput: {
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#f9fafb",
    color: "#111827",
  },
  langItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  langItemSelected: {
    backgroundColor: "#eef2ff",
  },
  langFlag: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 16,
  },
  langName: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
    fontWeight: "500",
  },
  checkmark: {
    fontSize: 20,
    color: "#6366f1",
    fontWeight: "700",
  },

  // Completion Modal Styles
  completionOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  confettiParticle: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  completionContent: {
    backgroundColor: "#ffffff",
    borderRadius: 32,
    padding: 32,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 10,
  },
  trophyContainer: {
    position: "relative",
    marginBottom: 24,
  },
  trophyIcon: {
    fontSize: 80,
    textAlign: "center",
  },
  trophyGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#fbbf24",
    borderRadius: 100,
    opacity: 0.2,
    transform: [{ scale: 1.5 }],
  },
  completionTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 12,
    textAlign: "center",
  },
  completionSubtitle: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  completionStats: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    width: "100%",
  },
  statBox: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 36,
    fontWeight: "800",
    color: "#6366f1",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: "600",
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#e5e7eb",
    marginHorizontal: 16,
  },
  achievementBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef3c7",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 100,
    marginBottom: 32,
    gap: 8,
  },
  achievementIcon: {
    fontSize: 20,
  },
  achievementText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#92400e",
  },
  restartButton: {
    backgroundColor: "#6366f1",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: "100%",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#6366f1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  restartButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  continueButton: {
    backgroundColor: "#10b981",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: "100%",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  shareButton: {
    backgroundColor: "transparent",
    paddingVertical: 12,
    paddingHorizontal: 24,
    width: "100%",
    alignItems: "center",
  },
  shareButtonText: {
    color: "#6b7280",
    fontSize: 15,
    fontWeight: "600",
  },
});
