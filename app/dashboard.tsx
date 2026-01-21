"use client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width } = Dimensions.get("window");

type TranslationEntry = {
  fromFlag: string;
  toFlag: string;
  text: string;
  translated: string;
  time: string; // ISO string
};

export default function Dashboard() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [recentTranslations, setRecentTranslations] = useState<
    TranslationEntry[]
  >([]);

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    // Load translation history
    const loadHistory = async () => {
      try {
        const stored = await AsyncStorage.getItem("translationHistory");
        if (stored) {
          const parsed = JSON.parse(stored) as TranslationEntry[];
          setRecentTranslations(parsed);
        }
      } catch (error) {
        console.error("Failed to load translation history:", error);
      }
    };

    loadHistory();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Floating orbs background */}
      <View style={styles.orb1} />
      <View style={styles.orb2} />
      <View style={styles.orb3} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Bar */}
        <TouchableOpacity style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <Text style={styles.searchPlaceholder}>
            Search languages, phrases...
          </Text>
        </TouchableOpacity>

        {/* Main Action - Translate Now */}
        <TouchableOpacity
          style={styles.mainCard}
          onPress={() => router.push("/translate")}
          activeOpacity={0.95}
        >
          <View style={styles.mainCardOverlay} />
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80",
            }}
            style={styles.mainCardBg}
          />
          <View style={styles.mainCardContent}>
            <Text style={styles.mainCardBadge}>✨ QUICK START</Text>
            <Text style={styles.mainCardTitle}>Translate</Text>
            <Text style={styles.mainCardTitle}>Anything Now</Text>
            <Text style={styles.mainCardSubtitle}>
              Instant translation in 100+ languages
            </Text>
            <View style={styles.mainCardButton}>
              <Text style={styles.mainCardButtonText}>Get Started</Text>
              <Text style={styles.mainCardArrow}>→</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Popular Languages - Updated with Hona & Glavda */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Popular Languages</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.languageScroll}
          >
            {[
              { flag: "🇳🇬", name: "Marghi", code: "mrt" },
              { flag: "🇳🇬", name: "Hona", code: "hwo" },
              { flag: "🇳🇬", name: "Glavda", code: "glw" },
              { flag: "🇳🇬", name: "Hausa", code: "ha" },
              { flag: "🇳🇬", name: "Kanuri", code: "kr" },
            ].map((lang, i) => (
              // Example for one card
              <TouchableOpacity
                key={i}
                style={styles.langCard}
                onPress={() => router.push("/minority-translate")} // ← add this
              >
                <Text style={styles.langFlag}>{lang.flag}</Text>
                <Text style={styles.langName}>{lang.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Features Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features</Text>
          <View style={styles.featuresGrid}>
            <TouchableOpacity
              style={[styles.featureCard, styles.featurePurple]}
            >
              <Text style={styles.featureIcon}>🎤</Text>
              <Text style={styles.featureTitle}>Voice</Text>
              <Text style={styles.featureSubtitle}>Speak & translate</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.featureCard, styles.featureBlue]}>
              <Text style={styles.featureIcon}>📸</Text>
              <Text style={styles.featureTitle}>Camera</Text>
              <Text style={styles.featureSubtitle}>Scan & convert</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.featureCard, styles.featureOrange]}
            >
              <Text style={styles.featureIcon}>💬</Text>
              <Text style={styles.featureTitle}>Chat</Text>
              <Text style={styles.featureSubtitle}>Live conversation</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.featureCard, styles.featureGreen]}>
              <Text style={styles.featureIcon}>📚</Text>
              <Text style={styles.featureTitle}>Learn</Text>
              <Text style={styles.featureSubtitle}>Practice daily</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent</Text>
            {recentTranslations.length > 0 && (
              <TouchableOpacity>
                <Text style={styles.seeAllText}>View all</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.recentList}>
            {recentTranslations.length === 0 ? (
              <Text style={styles.emptyRecentText}>
                No recent translations yet — start translating!
              </Text>
            ) : (
              recentTranslations.map((item, index) => (
                <TouchableOpacity key={index} style={styles.recentCard}>
                  <View style={styles.recentFlags}>
                    <Image
                      source={{ uri: item.fromFlag }}
                      style={styles.recentFlagImage}
                    />
                    <Text style={styles.recentArrow}>→</Text>
                    <Image
                      source={{ uri: item.toFlag }}
                      style={styles.recentFlagImage}
                    />
                  </View>
                  <Text style={styles.recentText} numberOfLines={1}>
                    {item.text} → {item.translated}
                  </Text>
                  <Text style={styles.recentTime}>
                    {new Date(item.time).toLocaleDateString([], {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNavContainer}>
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navItem}>
            <Text style={styles.navIcon}>🏠</Text>
            <Text style={styles.navLabel}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navItem, styles.navItemCenter]}
            onPress={() => router.push("/translate")}
          >
            <View style={styles.centerNavButton}>
              <Text style={styles.centerNavIcon}>🌐</Text>
            </View>
            <Text style={[styles.navLabel, { marginTop: 6 }]}>Translate</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem}>
            <Text style={styles.navIcon}>👤</Text>
            <Text style={styles.navLabel}>Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F0F0F",
  },
  orb1: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "#6366F1",
    top: -100,
    right: -100,
    opacity: 0.15,
  },
  orb2: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#8B5CF6",
    bottom: 100,
    left: -50,
    opacity: 0.12,
  },
  orb3: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#3B82F6",
    top: "40%",
    right: -30,
    opacity: 0.1,
  },
  scrollContent: {
    paddingBottom: 140,
    paddingTop: 8,
  },

  // Search
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
    marginHorizontal: 24,
    marginTop: 16,
    marginBottom: 32,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#333",
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  searchIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  searchPlaceholder: {
    fontSize: 15,
    color: "#666",
  },

  // Main Card
  mainCard: {
    marginHorizontal: 24,
    height: 220,
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 32,
    backgroundColor: "#1A1A1A",
    borderWidth: 1,
    borderColor: "#333",
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  mainCardBg: {
    ...StyleSheet.absoluteFillObject,
  },
  mainCardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  mainCardContent: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: "rgba(99, 102, 241, 0.1)",
  },
  mainCardBadge: {
    fontSize: 11,
    fontWeight: "700",
    color: "#818CF8",
    letterSpacing: 1,
    marginBottom: 12,
  },
  mainCardTitle: {
    fontSize: 36,
    fontWeight: "900",
    color: "#fff",
    lineHeight: 40,
  },
  mainCardSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.85)",
    marginTop: 8,
    marginBottom: 20,
  },
  mainCardButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#6366F1",
    alignSelf: "flex-start",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  mainCardButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
  },
  mainCardArrow: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },

  // Sections
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6366F1",
  },

  // Popular Languages
  languageScroll: {
    paddingHorizontal: 24,
    gap: 12,
  },
  langCard: {
    backgroundColor: "#1A1A1A",
    borderWidth: 1,
    borderColor: "#333",
    width: 100,
    height: 100,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  langFlag: {
    fontSize: 32,
    marginBottom: 8,
  },
  langName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#ccc",
  },

  // Features Grid
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 24,
    gap: 12,
  },
  featureCard: {
    width: (width - 60) / 2,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: "#1A1A1A",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  featurePurple: {
    borderColor: "#8B5CF6",
    shadowColor: "#8B5CF6",
  },
  featureBlue: {
    borderColor: "#3B82F6",
    shadowColor: "#3B82F6",
  },
  featureOrange: {
    borderColor: "#F97316",
    shadowColor: "#F97316",
  },
  featureGreen: {
    borderColor: "#10B981",
    shadowColor: "#10B981",
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  featureSubtitle: {
    fontSize: 13,
    color: "#999",
  },

  // Recent Activity
  recentList: {
    paddingHorizontal: 24,
    gap: 12,
  },
  recentCard: {
    backgroundColor: "#1A1A1A",
    borderWidth: 1,
    borderColor: "#333",
    padding: 16,
    borderRadius: 16,
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  recentFlags: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  recentFlagImage: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#444",
  },
  recentArrow: {
    fontSize: 16,
    color: "#666",
  },
  recentText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 4,
  },
  recentTime: {
    fontSize: 12,
    color: "#888",
  },
  emptyRecentText: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    paddingVertical: 30,
    fontStyle: "italic",
  },

  // Bottom Navigation
  bottomNavContainer: {
    position: "absolute",
    bottom: 24,
    left: 24,
    right: 24,
  },
  bottomNav: {
    flexDirection: "row",
    backgroundColor: "#1A1A1A",
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#333",
    paddingVertical: 16,
    paddingHorizontal: 24,
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
  },
  navItemCenter: {
    marginTop: -34,
  },
  navIcon: {
    fontSize: 28,
    opacity: 0.9,
    marginBottom: 4,
  },
  navLabel: {
    fontSize: 12,
    color: "#aaa",
    fontWeight: "500",
  },
  centerNavButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#6366F1",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55,
    shadowRadius: 14,
    elevation: 12,
  },
  centerNavIcon: {
    fontSize: 34,
    color: "#ffffff",
  },
});
