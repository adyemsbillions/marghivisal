// app/profile.tsx
"use client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Small list of languages (consistent with your dashboard)
const languages = [
  { code: "en", name: "English" },
  { code: "ha", name: "Hausa" },
  { code: "yo", name: "Yoruba" },
  { code: "ig", name: "Igbo" },
  { code: "pcm", name: "Nigerian Pidgin" },
  { code: "mrt", name: "Marghi" },
  { code: "hwo", name: "Hona" },
  { code: "glw", name: "Glavda" },
  { code: "tiv", name: "Tiv" },
  { code: "kr", name: "Kanuri" },
  { code: "ff", name: "Fulfulde" },
];

export default function Profile() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState("");
  const [favoriteLang, setFavoriteLang] = useState("");
  const [totalTranslations, setTotalTranslations] = useState(0);
  const [joinedDate, setJoinedDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingName, setEditingName] = useState(false);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setLoading(true);

      // Name
      const savedName = await AsyncStorage.getItem("userName");
      if (savedName) setName(savedName);

      // Favorite language
      const savedLang = await AsyncStorage.getItem("favoriteLanguage");
      if (savedLang) setFavoriteLang(savedLang);

      // Translation count from history
      const history = await AsyncStorage.getItem("translationHistory");
      if (history) {
        const parsed = JSON.parse(history);
        setTotalTranslations(parsed.length);
      }

      // Joined date
      let joinDate = await AsyncStorage.getItem("joinedDate");
      if (!joinDate) {
        joinDate = new Date().toISOString();
        await AsyncStorage.setItem("joinedDate", joinDate);
      }
      setJoinedDate(
        new Date(joinDate).toLocaleDateString("en-GB", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      );
    } catch (e) {
      console.warn("Profile load error:", e);
    } finally {
      setLoading(false);
    }
  };

  const saveName = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Name cannot be empty");
      return;
    }
    try {
      await AsyncStorage.setItem("userName", name.trim());
      setEditingName(false);
      Alert.alert("Success", "Name saved!");
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

  const clearHistory = () => {
    Alert.alert(
      "Clear History",
      "This will delete all your translation history. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem("translationHistory");
              setTotalTranslations(0);
              Alert.alert("Done", "History cleared");
            } catch (e) {
              Alert.alert("Error", "Could not clear history");
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
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
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor="#666"
                autoFocus
              />
              <TouchableOpacity onPress={saveName}>
                <Text style={styles.saveButton}>Save</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.nameRow}>
              <Text style={styles.profileName}>{name || "Guest"}</Text>
              <TouchableOpacity onPress={() => setEditingName(true)}>
                <Text style={styles.editIcon}>✏️</Text>
              </TouchableOpacity>
            </View>
          )}

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

        {/* Favorite Language */}
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

          <TouchableOpacity
            style={[styles.actionButton, styles.dangerButton]}
            onPress={() =>
              Alert.alert("Coming Soon", "Full data reset & more features")
            }
          >
            <Text style={styles.actionButtonText}>Reset All Data</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  joinedDate: {
    fontSize: 14,
    color: "#888",
    marginTop: 12,
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
});
