// Dashboard screen
"use client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");
const isSmallScreen = width < 380;

type TranslationEntry = {
  fromFlag: string;
  toFlag: string;
  text: string;
  translated: string;
  time: string;
};

type User = {
  full_name: string;
  email: string;
  country: string;
};

type Notification = {
  id: number;
  message: string;
};

const API_NOTIFICATION =
  "https://margivial.cravii.ng/api/send_notification.php";

export default function Dashboard() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [recentTranslations, setRecentTranslations] = useState<
    TranslationEntry[]
  >([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [notification, setNotification] = useState<Notification | null>(null);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    const loadData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }

        const stored = await AsyncStorage.getItem("translationHistory");
        if (stored) {
          const parsed = JSON.parse(stored) as TranslationEntry[];
          setRecentTranslations(parsed.slice(0, 5));
        }
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    if (!user?.email) return;

    try {
      const response = await fetch(API_NOTIFICATION, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "get",
          email: user.email.trim().toLowerCase(),
        }),
      });

      const data = await response.json();

      if (data.notifications && data.notifications.length > 0) {
        setNotification(data.notifications[0]);
        setIsModalVisible(true);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await fetch(API_NOTIFICATION, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "mark_read",
          id,
        }),
      });
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const handleLogout = async () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem("user");
          setUser(null);
          router.replace("/log");
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#6366F1" style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.orb1} />
      <View style={styles.orb2} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile / Greeting Section – now with more top margin */}
        <View style={styles.profileSection}>
          {user ? (
            <View style={styles.profileCard}>
              <Text style={styles.greeting}>
                Welcome back, {user.full_name.split(" ")[0]}!
              </Text>
              <Text style={styles.userDetail} numberOfLines={1}>
                📧 {user.email}
              </Text>
              <Text style={styles.userDetail}>📍 {user.country}</Text>

              <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                <Text style={styles.logoutText}>Log Out</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.profileCard}>
              <Text style={styles.greeting}>Hello there!</Text>
              <Text style={styles.userDetail}>
                Sign in to access your profile and saved translations
              </Text>
              <TouchableOpacity
                style={styles.loginBtn}
                onPress={() => router.push("/log")}
              >
                <Text style={styles.loginBtnText}>Sign In</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Main Call-to-Action Card */}
        <TouchableOpacity
          style={styles.mainCard}
          onPress={() => router.push("/translate")}
          activeOpacity={0.9}
        >
          <Image
            source={{
              uri: "https://play-lh.googleusercontent.com/V9w1SL-Msdryg-ppDyJ19l4nxCrisJkKJ1uTder7napALSwpTtdLMcVd3axW9E5W2ww",
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
          <Text style={styles.sectionTitle}>More Languages</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.languageScroll}
          >
            {[
              { flag: "🇳🇬", name: "Margi", code: "mrt" },
              { flag: "🇳🇬", name: "Hona", code: "hwo" },
              { flag: "🇳🇬", name: "Glavda", code: "glw" },
              { flag: "🇳🇬", name: "Hausa", code: "ha" },
              { flag: "🇳🇬", name: "Kanuri", code: "kr" },
            ].map((lang, index) => (
              <TouchableOpacity
                key={lang.code || index}
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

        {/* Extra bottom padding to prevent content being hidden under bottom nav */}
        <View style={{ height: 100 }} />
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

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/profile")}
        >
          <Text style={styles.navIcon}>👤</Text>
          <Text style={styles.navLabel}>Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Notification Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.modalContent,
              { opacity: fadeAnim, transform: [{ scale: fadeAnim }] },
            ]}
          >
            <Text style={styles.modalTitle}>New Notification</Text>
            <Text style={styles.modalMessage}>
              {notification?.message || ""}
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={async () => {
                if (notification?.id) {
                  await markAsRead(notification.id);
                }
                setIsModalVisible(false);
                setNotification(null);
              }}
            >
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
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
    top: -120,
    right: -100,
    opacity: 0.12,
  },
  orb2: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "#8B5CF6",
    bottom: 80,
    left: -80,
    opacity: 0.1,
  },

  scrollContent: {
    paddingTop: isSmallScreen ? 16 : 24,
    paddingBottom: height > 800 ? 160 : 140,
  },

  // ── Profile Section ───────────────────────────────────────────
  profileSection: {
    marginTop: isSmallScreen ? 8 : 16,
    marginBottom: 32,
  },
  profileCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 20,
    padding: isSmallScreen ? 16 : 20,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: "#333",
    alignItems: "center",
  },
  greeting: {
    fontSize: isSmallScreen ? 21 : 24,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 12,
  },
  userDetail: {
    fontSize: isSmallScreen ? 13.5 : 15,
    color: "#cccccc",
    marginVertical: 4,
  },
  logoutBtn: {
    marginTop: 16,
    backgroundColor: "#ef4444",
    paddingVertical: 10,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  logoutText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 15,
  },
  loginBtn: {
    marginTop: 16,
    backgroundColor: "#6366F1",
    paddingVertical: 12,
    paddingHorizontal: 36,
    borderRadius: 12,
  },
  loginBtnText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 16,
  },

  // ── Main CTA Card ─────────────────────────────────────────────
  mainCard: {
    marginHorizontal: 20,
    height: isSmallScreen ? 180 : 200,
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 32,
  },
  mainCardBg: {
    ...StyleSheet.absoluteFillObject,
  },
  mainCardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  mainCardContent: {
    flex: 1,
    padding: isSmallScreen ? 18 : 24,
    justifyContent: "center",
  },
  mainCardBadge: {
    fontSize: 11,
    fontWeight: "700",
    color: "#818CF8",
    letterSpacing: 1,
    marginBottom: 10,
  },
  mainCardTitle: {
    fontSize: isSmallScreen ? 26 : 32,
    fontWeight: "900",
    color: "#fff",
    marginBottom: 6,
  },
  mainCardSubtitle: {
    fontSize: isSmallScreen ? 13 : 14,
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
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: isSmallScreen ? 20 : 22,
    fontWeight: "700",
    color: "#fff",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6366F1",
  },
  languageScroll: {
    paddingHorizontal: 20,
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
    paddingHorizontal: 20,
    gap: 12,
  },
  featureCard: {
    flex: 1,
    padding: 18,
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
    paddingHorizontal: 20,
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
    marginTop: -36,
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
    elevation: 8,
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  centerNavIcon: {
    fontSize: 32,
    color: "#fff",
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#1A1A1A",
    borderRadius: 24,
    padding: 24,
    width: width - 48,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#333",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 16,
  },
  modalMessage: {
    fontSize: 16,
    color: "#ddd",
    textAlign: "center",
    marginBottom: 24,
  },
  modalButton: {
    backgroundColor: "#6366F1",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 12,
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
