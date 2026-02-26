"use client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

const API_USER = "https://margivial.cravii.ng/api/user.php";

// Admin emails – only these users see the Admin Privileges button
const ADMIN_EMAILS = ["adyemsgodlove@gmail.com", "josh1dille@gmail.com"].map(
  (e) => e.toLowerCase().trim(),
);

const languages = [
  { code: "en", name: "English" },
  { code: "ha", name: "Hausa" },
  { code: "yo", name: "Yoruba" },
  { code: "ig", name: "Igbo" },
  { code: "pcm", name: "Nigerian Pidgin" },
  { code: "mrt", name: "Margi" },
  { code: "hwo", name: "Hona" },
  { code: "glw", name: "Glavda" },
  { code: "tiv", name: "Tiv" },
  { code: "kr", name: "Kanuri" },
  { code: "ff", name: "Fulfulde" },
];

export default function Profile() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("");
  const [joinedDate, setJoinedDate] = useState("");
  const [favoriteLang, setFavoriteLang] = useState("");
  const [totalTranslations, setTotalTranslations] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editingName, setEditingName] = useState(false);

  // Admin control
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminWebView, setShowAdminWebView] = useState(false);
  const [webViewLoading, setWebViewLoading] = useState(true);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    setLoading(true);

    try {
      const storedUser = await AsyncStorage.getItem("user");
      let emailToSend = "";

      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        emailToSend = parsed?.email?.trim()?.toLowerCase() || "";

        setFullName(parsed.full_name || "Guest");
        setEmail(emailToSend || "");

        // Check if this email is admin
        if (emailToSend && ADMIN_EMAILS.includes(emailToSend)) {
          setIsAdmin(true);
        }

        setCountry(parsed.country || "");
      }

      if (emailToSend) {
        const response = await fetch(API_USER, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "get_profile",
            email: emailToSend,
          }),
        });

        const data = await response.json();

        if (data.status === "success" && data.user) {
          const u = data.user;
          const backendEmail = u.email?.trim()?.toLowerCase() || "";

          setFullName(u.full_name || "Guest");
          setEmail(backendEmail);
          setCountry(u.country || "");

          // Prefer backend email for admin check
          if (backendEmail && ADMIN_EMAILS.includes(backendEmail)) {
            setIsAdmin(true);
          }

          if (u.created_at) {
            try {
              const date = new Date(u.created_at);
              if (!isNaN(date.getTime())) {
                setJoinedDate(
                  date.toLocaleDateString("en-GB", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }),
                );
              }
            } catch {}
          }

          await AsyncStorage.setItem("user", JSON.stringify(u));
        }
      }

      const favLang = await AsyncStorage.getItem("favoriteLanguage");
      if (favLang) setFavoriteLang(favLang);

      const history = await AsyncStorage.getItem("translationHistory");
      if (history) {
        setTotalTranslations(JSON.parse(history).length);
      }

      if (!joinedDate) {
        let storedJoinDate = await AsyncStorage.getItem("joinedDate");
        if (!storedJoinDate) {
          storedJoinDate = new Date().toISOString();
          await AsyncStorage.setItem("joinedDate", storedJoinDate);
        }
        setJoinedDate(
          new Date(storedJoinDate).toLocaleDateString("en-GB", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
        );
      }
    } catch (error) {
      console.error("Profile load error:", error);
      const fallback = await AsyncStorage.getItem("user");
      if (fallback) {
        const parsed = JSON.parse(fallback);
        const fallbackEmail = parsed?.email?.trim()?.toLowerCase() || "";
        setFullName(parsed.full_name || "Guest");
        setEmail(fallbackEmail);
        setCountry(parsed.country || "");

        if (fallbackEmail && ADMIN_EMAILS.includes(fallbackEmail)) {
          setIsAdmin(true);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const saveName = async () => {
    if (!fullName.trim()) {
      return Alert.alert("Error", "Name cannot be empty");
    }

    try {
      const currentUser = JSON.parse(
        (await AsyncStorage.getItem("user")) || "{}",
      );
      const updatedUser = { ...currentUser, full_name: fullName.trim() };
      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));

      setEditingName(false);
      Alert.alert("Success", "Name updated");
    } catch (e) {
      Alert.alert("Error", "Could not save name");
    }
  };

  const saveFavoriteLanguage = async (langName: string) => {
    try {
      await AsyncStorage.setItem("favoriteLanguage", langName);
      setFavoriteLang(langName);
      Alert.alert("Updated", `${langName} is now your favorite`);
    } catch (e) {
      Alert.alert("Error", "Could not save preference");
    }
  };

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.multiRemove([
            "user",
            "favoriteLanguage",
            "joinedDate",
          ]);
          router.replace("/log");
        },
      },
    ]);
  };

  const clearHistory = () => {
    Alert.alert("Clear History", "Delete all translation history?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem("translationHistory");
          setTotalTranslations(0);
          Alert.alert("Done", "History cleared");
        },
      },
    ]);
  };

  const goToDonate = () => {
    router.push("/donate");
  };

  const goToMySuggestions = () => {
    router.push("/words");
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
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarEmoji}>👤</Text>
          </View>

          {editingName ? (
            <View style={styles.nameEditRow}>
              <TextInput
                style={styles.nameInput}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Your name"
                placeholderTextColor="#666"
                autoFocus
              />
              <TouchableOpacity onPress={saveName}>
                <Text style={styles.saveButton}>Save</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.nameRow}>
              <Text style={styles.profileName}>{fullName || "Guest"}</Text>
              <TouchableOpacity onPress={() => setEditingName(true)}>
                <Text style={styles.editIcon}>✏️</Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={styles.emailText}>{email || "—"}</Text>
          <Text style={styles.countryText}>📍 {country || "—"}</Text>
          <Text style={styles.joinedDate}>Joined {joinedDate || "—"}</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{totalTranslations}</Text>
            <Text style={styles.statLabel}>Translations</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{favoriteLang || "None"}</Text>
            <Text style={styles.statLabel}>Favorite</Text>
          </View>
        </View>

        {/* My Suggestions Button */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={goToMySuggestions}
        >
          <Text style={styles.actionButtonText}>My Suggestions</Text>
        </TouchableOpacity>

        {/* Admin Privileges Button – placed right below My Suggestions */}
        {isAdmin && (
          <TouchableOpacity
            style={[styles.actionButton, styles.adminActionButton]}
            onPress={() => {
              setWebViewLoading(true);
              setShowAdminWebView(true);
            }}
          >
            <Text style={styles.adminButtonText}>Admin Privileges</Text>
          </TouchableOpacity>
        )}

        {/* Favorite Language Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Favorite Language</Text>
          <View style={styles.langGrid}>
            {languages.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.langOption,
                  favoriteLang === lang.name && styles.langOptionSelected,
                ]}
                onPress={() => saveFavoriteLanguage(lang.name)}
              >
                <Text
                  style={[
                    styles.langText,
                    favoriteLang === lang.name && { color: "#fff" },
                  ]}
                >
                  {lang.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.actionButton} onPress={clearHistory}>
            <Text style={styles.actionButtonText}>
              Clear Translation History
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={goToDonate}>
            <Text style={[styles.actionButtonText, { color: "#FFD700" }]}>
              Donate to Support the Project
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.dangerButton]}
            onPress={handleLogout}
          >
            <Text style={styles.actionButtonText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Nicer Admin Privileges Modal */}
      {isAdmin && (
        <Modal
          visible={showAdminWebView}
          animationType="slide"
          onRequestClose={() => setShowAdminWebView(false)}
        >
          <SafeAreaView style={styles.modalContainer}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={() => setShowAdminWebView(false)}
                style={styles.modalCloseButton}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Admin Management</Text>
              <View style={{ width: 40 }} />
            </View>

            {/* Loading overlay while WebView loads */}
            {webViewLoading && (
              <View style={styles.webviewLoadingOverlay}>
                <ActivityIndicator size="large" color="#6366f1" />
                <Text style={styles.webviewLoadingText}>
                  Loading admin panel...
                </Text>
              </View>
            )}

            <WebView
              source={{
                uri: "https://margivial.cravii.ng/api/word_display.php",
              }}
              style={styles.webview}
              onLoadStart={() => setWebViewLoading(true)}
              onLoadEnd={() => setWebViewLoading(false)}
              onError={(syntheticEvent) => {
                const { nativeEvent } = syntheticEvent;
                console.warn("WebView error:", nativeEvent);
                Alert.alert("Error", "Could not load admin page");
                setWebViewLoading(false);
              }}
            />
          </SafeAreaView>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F0F0F",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: "#1A1A1A",
    borderBottomWidth: 1,
    borderBottomColor: "#2A2A2A",
  },
  backIcon: { fontSize: 28, color: "#ddd" },
  headerTitle: { fontSize: 22, fontWeight: "800", color: "#fff" },

  scrollContent: {
    padding: 24,
    paddingBottom: 140,
  },

  // Admin button placed below My Suggestions
  adminActionButton: {
    backgroundColor: "#7c3aed",
    borderColor: "#7c3aed",
    marginTop: 8,
  },

  profileCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    marginBottom: 28,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#2A2A2A",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 3,
    borderColor: "#6366F1",
  },
  avatarEmoji: { fontSize: 60 },

  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  nameEditRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    gap: 12,
  },
  profileName: {
    fontSize: 26,
    fontWeight: "800",
    color: "#fff",
  },
  nameInput: {
    flex: 1,
    fontSize: 22,
    padding: 14,
    backgroundColor: "#222",
    borderRadius: 14,
    color: "#fff",
    borderWidth: 1,
    borderColor: "#444",
  },
  saveButton: {
    color: "#A5B4FC",
    fontWeight: "700",
    fontSize: 16,
  },
  editIcon: { fontSize: 22, color: "#A5B4FC" },

  emailText: {
    fontSize: 15,
    color: "#bbb",
    marginTop: 8,
  },
  countryText: {
    fontSize: 15,
    color: "#bbb",
    marginTop: 4,
  },
  joinedDate: {
    fontSize: 14,
    color: "#888",
    marginTop: 8,
  },

  statsContainer: {
    flexDirection: "row",
    backgroundColor: "#1A1A1A",
    borderRadius: 20,
    padding: 20,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "800",
    color: "#6366F1",
  },
  statLabel: {
    fontSize: 14,
    color: "#aaa",
    marginTop: 6,
  },
  statDivider: {
    width: 1,
    backgroundColor: "#2A2A2A",
    marginHorizontal: 20,
  },

  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 16,
  },

  langGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  langOption: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    backgroundColor: "#222",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#333",
  },
  langOptionSelected: {
    backgroundColor: "#6366F1",
    borderColor: "#6366F1",
  },
  langText: {
    fontSize: 15,
    color: "#ddd",
    fontWeight: "600",
  },

  actionButton: {
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#2A2A2A",
    alignItems: "center",
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ddd",
  },
  dangerButton: {
    borderColor: "#ef4444",
  },

  // ────────────────────────────────────────────────
  // Nicer Modal Styles
  // ────────────────────────────────────────────────
  modalContainer: {
    flex: 1,
    backgroundColor: "#0F0F0F",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#1A1A1A",
    borderBottomWidth: 1,
    borderBottomColor: "#2A2A2A",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },
  modalCloseButton: {
    padding: 8,
  },
  modalCloseText: {
    fontSize: 28,
    color: "#ff6b6b",
    fontWeight: "bold",
  },
  webview: {
    flex: 1,
  },
  webviewLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 15, 15, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  webviewLoadingText: {
    marginTop: 16,
    color: "#ddd",
    fontSize: 16,
  },
});
