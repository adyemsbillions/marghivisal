"use client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
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
  const [loading, setLoading] = useState(true);

  // Load full_name from storage (same place suggest screen uses)
  useEffect(() => {
    const loadUser = async () => {
      try {
        const stored = await AsyncStorage.getItem("user");
        if (stored) {
          const parsed = JSON.parse(stored);
          const name = parsed?.full_name?.trim();
          if (name) {
            setFullName(name);
          }
        }
      } catch (err) {
        console.warn("Could not load user name", err);
      }
    };
    loadUser();
  }, []);

  // Fetch suggestions once we have the name
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
        // Optional: update displayed name from server response
        if (data.full_name) setFullName(data.full_name);
      } catch (err: any) {
        Alert.alert("Error", err.message || "Could not load your suggestions");
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Suggestions</Text>
        <View style={{ width: 40 }} />
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

  scrollContent: { padding: 20, paddingBottom: 40 },

  userGreeting: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },

  emptyContainer: {
    flex: 1,
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
  phrase: {
    fontSize: 17,
    fontWeight: "600",
    color: "#111",
    marginBottom: 6,
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
});
