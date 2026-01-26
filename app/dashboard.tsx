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
  time: string;
};

export default function Dashboard() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [recentTranslations, setRecentTranslations] = useState<
    TranslationEntry[]
  >([]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    const loadHistory = async () => {
      try {
        const stored = await AsyncStorage.getItem("translationHistory");
        if (stored) {
          const parsed = JSON.parse(stored) as TranslationEntry[];
          setRecentTranslations(parsed.slice(0, 5));
        }
      } catch (error) {
        console.error("Failed to load translation history:", error);
      }
    };

    loadHistory();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.orb1} />
      <View style={styles.orb2} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Call-to-Action Card */}
        <TouchableOpacity
          style={styles.mainCard}
          onPress={() => {
            // console.log("Main Get Started pressed → navigating to /translate");
            router.push("/translate");
          }}
          activeOpacity={0.9}
        >
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80",
            }}
            style={styles.mainCardBg}
          />
          <View style={styles.mainCardOverlay} />
          <View style={styles.mainCardContent}>
            <Text style={styles.mainCardBadge}>QUICK START</Text>
            <Text style={styles.mainCardTitle}>Translate Anything Now</Text>
            <Text style={styles.mainCardSubtitle}>
              Instant translation in 100+ languages
            </Text>
            <View style={styles.mainCardButton}>
              <Text style={styles.mainCardButtonText}>Get Started →</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Popular Languages Section */}
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
            ].map((lang, index) => (
              <TouchableOpacity
                key={lang.code || index} // better to use code if unique
                style={styles.langCard}
                onPress={() => router.push("/minority-translate")}
              >
                <Text style={styles.langFlag}>{lang.flag}</Text>
                <Text style={styles.langName}>{lang.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Features Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features</Text>
          <View style={styles.featuresGrid}>
            <TouchableOpacity
              style={styles.featureCard}
              onPress={() => router.push("/chat")}
            >
              <Text style={styles.featureIcon}>💬</Text>
              <Text style={styles.featureTitle}>Chat</Text>
              <Text style={styles.featureSubtitle}>Live conversation</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.featureCard}
              onPress={() => router.push("/learn")}
            >
              <Text style={styles.featureIcon}>📚</Text>
              <Text style={styles.featureTitle}>Learn</Text>
              <Text style={styles.featureSubtitle}>Practice daily</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Translations Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent</Text>
            {recentTranslations.length > 0 && (
              <TouchableOpacity onPress={() => router.push("/recent")}>
                <Text style={styles.seeAllText}>View all</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.recentList}>
            {recentTranslations.length === 0 ? (
              <Text style={styles.emptyRecentText}>
                No recent translations yet
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
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>🏠</Text>
          <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItemCenter}
          onPress={() => router.push("/translate")}
        >
          <View style={styles.centerNavButton}>
            <Text style={styles.centerNavIcon}>🌐</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>👤</Text>
          <Text style={styles.navLabel}>Profile</Text>
        </TouchableOpacity>
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
  scrollContent: {
    paddingBottom: 120,
    paddingTop: 20,
  },
  mainCard: {
    marginHorizontal: 24,
    height: 200,
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 32,
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
  },
  mainCardBadge: {
    fontSize: 11,
    fontWeight: "700",
    color: "#818CF8",
    letterSpacing: 1,
    marginBottom: 12,
  },
  mainCardTitle: {
    fontSize: 32,
    fontWeight: "900",
    color: "#fff",
    marginBottom: 8,
  },
  mainCardSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.85)",
    marginBottom: 16,
  },
  mainCardButton: {
    backgroundColor: "#6366F1",
    alignSelf: "flex-start",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  mainCardButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
  },
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
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6366F1",
  },
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
  featuresGrid: {
    flexDirection: "row",
    paddingHorizontal: 24,
    gap: 12,
  },
  featureCard: {
    flex: 1,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#333",
    backgroundColor: "#1A1A1A",
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
  },
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    backgroundColor: "#1A1A1A",
    paddingBottom: 34,
    paddingTop: 12,
    paddingHorizontal: 24,
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
  },
  navItemCenter: {
    alignItems: "center",
    marginTop: -40,
  },
  navIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  navLabel: {
    fontSize: 12,
    color: "#aaa",
    fontWeight: "500",
  },
  centerNavButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#6366F1",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  centerNavIcon: {
    fontSize: 32,
    color: "#fff",
  },
});
