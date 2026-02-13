"use client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
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
import { WebView } from "react-native-webview";

const API_WORDS = "https://margivial.cravii.ng/api/words.php";

type Suggestion = {
  id: number;
  language_key: string;
  local_phrase: string;
  english_meaning: string;
  context: string | null;
  submitted_at: string;
  status: "pending" | "approved" | "rejected";
};

export default function MyWordsScreen() {
  const router = useRouter();
  const { langKey, langName } = useLocalSearchParams<{
    langKey?: string;
    langName?: string;
  }>();

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [fullName, setFullName] = useState<string>("");
  const [userId, setUserId] = useState<number | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  // Edit modal states
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingSuggestion, setEditingSuggestion] = useState<Suggestion | null>(
    null,
  );
  const [editLocalPhrase, setEditLocalPhrase] = useState("");
  const [editEnglishMeaning, setEditEnglishMeaning] = useState("");
  const [editContext, setEditContext] = useState("");

  // Admin WebView modal
  const [showAdminWebView, setShowAdminWebView] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const stored = await AsyncStorage.getItem("user");
        if (stored) {
          const parsed = JSON.parse(stored);
          const name = parsed?.full_name?.trim();
          const uid = parsed?.id ? Number(parsed.id) : null;

          if (name) setFullName(name);
          if (uid !== null) {
            setUserId(uid);
            setIsAdmin([1, 2].includes(uid));
          }
        }
      } catch (err) {
        console.warn("Failed to load user from storage", err);
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    if (!fullName) return;

    const fetchSuggestions = async () => {
      setLoading(true);
      try {
        const res = await fetch(API_WORDS, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "get_my_suggestions",
            full_name: fullName,
          }),
        });

        const data = await res.json();

        if (!res.ok || data.status !== "success") {
          throw new Error(data.error || "Failed to load suggestions");
        }

        setSuggestions(data.suggestions || []);
        if (data.full_name) setFullName(data.full_name);
      } catch (err: any) {
        Alert.alert("Error", err.message || "Could not load suggestions");
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [fullName]);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "approved":
        return { color: "#10b981", backgroundColor: "#d1fae5" };
      case "rejected":
        return { color: "#ef4444", backgroundColor: "#fee2e2" };
      default:
        return { color: "#f59e0b", backgroundColor: "#fef3c7" };
    }
  };

  const startEditing = (item: Suggestion) => {
    setEditingSuggestion(item);
    setEditLocalPhrase(item.local_phrase);
    setEditEnglishMeaning(item.english_meaning);
    setEditContext(item.context || "");
    setEditModalVisible(true);
  };

  const saveEdit = async () => {
    if (!editingSuggestion || !fullName) return;

    const phrase = editLocalPhrase.trim();
    const meaning = editEnglishMeaning.trim();
    const context = editContext.trim();

    if (!phrase || !meaning) {
      Alert.alert("Error", "Local phrase and English meaning are required");
      return;
    }

    try {
      const res = await fetch(API_WORDS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_my_suggestion",
          full_name: fullName,
          id: editingSuggestion.id,
          local_phrase: phrase,
          english_meaning: meaning,
          context: context || null,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.status !== "success") {
        throw new Error(data.error || "Update failed");
      }

      // Optimistic update
      setSuggestions((prev) =>
        prev.map((s) =>
          s.id === editingSuggestion.id
            ? {
                ...s,
                local_phrase: phrase,
                english_meaning: meaning,
                context: context || null,
              }
            : s,
        ),
      );

      Alert.alert("Success", "Suggestion updated!");
      setEditModalVisible(false);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Could not update suggestion");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Suggestions</Text>

        {isAdmin ? (
          <TouchableOpacity
            onPress={() => setShowAdminWebView(true)}
            style={styles.adminButton}
          >
            <Text style={styles.adminButtonText}>Admin Privileges</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <ActivityIndicator
            size="large"
            color="#10b981"
            style={{ marginTop: 60 }}
          />
        ) : (
          <>
            <Text style={styles.userGreeting}>
              {fullName ? `${fullName}'s Suggestions` : "Your Suggestions"}
            </Text>

            {suggestions.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  You haven't suggested any phrases yet.
                </Text>
                <TouchableOpacity
                  style={styles.suggestButton}
                  onPress={() =>
                    router.push({
                      pathname: "/suggest",
                      params: { langKey, langName },
                    })
                  }
                >
                  <Text style={styles.suggestButtonText}>Suggest a Phrase</Text>
                </TouchableOpacity>
              </View>
            ) : (
              suggestions.map((item) => (
                <View key={item.id} style={styles.card}>
                  <View style={styles.statusBadge}>
                    <Text
                      style={[
                        styles.statusText,
                        { color: getStatusStyle(item.status).color },
                      ]}
                    >
                      {item.status.toUpperCase()}
                    </Text>
                  </View>

                  {item.status === "approved" && (
                    <TouchableOpacity
                      style={[
                        styles.editButton,
                        { backgroundColor: "#dbeafe" },
                      ]}
                      onPress={() => startEditing(item)}
                    >
                      <Text
                        style={[styles.editButtonText, { color: "#1d4ed8" }]}
                      >
                        ✎ Edit
                      </Text>
                    </TouchableOpacity>
                  )}

                  <Text style={styles.phrase}>{item.local_phrase}</Text>
                  <Text style={styles.meaning}>→ {item.english_meaning}</Text>
                  {item.context ? (
                    <Text style={styles.context}>Context: {item.context}</Text>
                  ) : null}
                  <Text style={styles.date}>
                    Submitted:{" "}
                    {new Date(item.submitted_at).toLocaleDateString()}
                  </Text>
                </View>
              ))
            )}
          </>
        )}
      </ScrollView>

      {/* Edit Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Approved Suggestion</Text>

            <Text style={styles.label}>Local Phrase</Text>
            <TextInput
              style={styles.input}
              value={editLocalPhrase}
              onChangeText={setEditLocalPhrase}
              placeholder="Phrase in local language"
            />

            <Text style={styles.label}>English Meaning</Text>
            <TextInput
              style={styles.input}
              value={editEnglishMeaning}
              onChangeText={setEditEnglishMeaning}
              placeholder="English translation"
            />

            <Text style={styles.label}>Context (optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={editContext}
              onChangeText={setEditContext}
              placeholder="When/how is this used? (optional)"
              multiline
              numberOfLines={4}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.btnTextCancel}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, styles.saveBtn]}
                onPress={saveEdit}
              >
                <Text style={styles.btnText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Admin WebView Modal – only for ID 1 & 2 */}
      <Modal
        visible={showAdminWebView}
        animationType="slide"
        onRequestClose={() => setShowAdminWebView(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>
          <View style={styles.webviewHeader}>
            <TouchableOpacity
              onPress={() => setShowAdminWebView(false)}
              style={styles.closeWebview}
            >
              <Text style={styles.closeWebviewText}>Close</Text>
            </TouchableOpacity>
            <Text style={styles.webviewTitle}>Admin Management</Text>
            <View style={{ width: 60 }} />
          </View>

          <WebView
            source={{ uri: "https://margivial.cravii.ng/api/word_display.php" }}
            style={{ flex: 1 }}
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.warn("WebView error:", nativeEvent);
              Alert.alert("Error", "Could not load admin page");
            }}
          />
        </SafeAreaView>
      </Modal>
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

  adminButton: {
    backgroundColor: "#7c3aed", // purple for admin feel
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  adminButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },

  scrollContent: { padding: 20, paddingBottom: 40 },

  userGreeting: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  suggestButton: {
    backgroundColor: "#10b981",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  suggestButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#eee",
    position: "relative",
  },
  statusBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },

  editButton: {
    position: "absolute",
    top: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#dbeafe",
    borderRadius: 8,
    zIndex: 10,
  },
  editButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1d4ed8",
  },

  phrase: {
    fontSize: 17,
    fontWeight: "600",
    color: "#111",
    marginBottom: 6,
    paddingLeft: 80, // space for edit button
  },
  meaning: {
    fontSize: 16,
    color: "#374151",
    marginBottom: 8,
  },
  context: {
    fontSize: 14,
    color: "#6b7280",
    fontStyle: "italic",
    marginBottom: 8,
  },
  date: {
    fontSize: 13,
    color: "#9ca3af",
    marginTop: 4,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 480,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
  },
  label: {
    fontSize: 14,
    color: "#4b5563",
    marginTop: 16,
    marginBottom: 6,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fafafa",
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  modalButtons: {
    flexDirection: "row",
    marginTop: 32,
    gap: 12,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  cancelBtn: {
    backgroundColor: "#e5e7eb",
  },
  saveBtn: {
    backgroundColor: "#10b981",
  },
  btnText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  btnTextCancel: {
    color: "#374151",
    fontWeight: "600",
    fontSize: 16,
  },

  // WebView header styles
  webviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#111827",
  },
  webviewTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  closeWebview: {
    padding: 8,
  },
  closeWebviewText: {
    color: "#60a5fa",
    fontSize: 16,
    fontWeight: "500",
  },
});
