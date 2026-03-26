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
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const API_SUBMIT = "https://margivial.cravii.ng/api/submit-suggestion.php";

const languages = [
  { code: "en", name: "English" },

  // Major Nigerian + requested languages
  { code: "ha", name: "Hausa" },
  { code: "yo", name: "Yoruba" },
  { code: "ig", name: "Igbo" },
  { code: "pcm", name: "Nigerian Pidgin" },
  { code: "tiv", name: "Tiv" },
  { code: "kr", name: "Kanuri" },
  { code: "ff", name: "Fulfulde (Fula)" },
  { code: "ibb", name: "Ibibio" },
  { code: "efi", name: "Efik" },
  { code: "ann", name: "Obolo (Andoni)" },
  { code: "bin", name: "Edo (Bini)" },
  { code: "bom", name: "Berom" },
  { code: "kcg", name: "Tyap (Katab)" },

  // Hebrew
  { code: "he", name: "Hebrew" },

  // Minority / specialized languages
  { code: "mrt", name: "Margi" },
  { code: "hwo", name: "Hona" },
  { code: "glw", name: "Glavda" },
  { code: "gnb", name: "Gavva" },
  { code: "bwr", name: "Bura" },
  { code: "fli", name: "Fali" },
  { code: "hig", name: "Kamwe" },
  { code: "ckl", name: "Kibaku" },

  // Optional / extra
  { code: "rw", name: "Kinyarwanda" },
];

type AllowedUser = {
  id: number;
  name: string;
  email: string;
};

export default function SuggestScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    langKey?: string;
    langName?: string;
  }>();

  const [selectedLang, setSelectedLang] = useState<{
    code: string;
    name: string;
  }>(
    params.langKey && params.langName
      ? { code: params.langKey as string, name: params.langName as string }
      : languages[0],
  );

  const [localPhrase, setLocalPhrase] = useState("");
  const [englishMeaning, setEnglishMeaning] = useState("");
  const [context, setContext] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const [user, setUser] = useState<AllowedUser | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const stored = await AsyncStorage.getItem("user");

        if (stored) {
          const parsed = JSON.parse(stored);
          const id = Number(parsed?.id);

          if (id === 1) {
            setUser({
              id: 1,
              name: "adyems",
              email: "adyemsgodlove@gmail.com",
            });
          } else if (id === 2) {
            setUser({
              id: 2,
              name: "Joshua Ishaya Mamza",
              email: "josh1dille@gmail.com",
            });
          } else {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        console.warn("Failed to load user", err);
        setUser(null);
      } finally {
        setLoadingUser(false);
      }
    };

    loadUser();
  }, []);

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert(
        "Access denied",
        "Only Admins can submit suggestions from this screen.",
        [
          { text: "Cancel" },
          { text: "Go to Login", onPress: () => router.replace("/log") },
        ],
      );
      return;
    }

    const trimmedPhrase = localPhrase.trim();
    const trimmedMeaning = englishMeaning.trim();
    const trimmedContext = context.trim();

    if (!trimmedPhrase || !trimmedMeaning) {
      return Alert.alert(
        "Required fields",
        "Please fill in the phrase and its English meaning.",
      );
    }

    if (trimmedPhrase.length > 500 || trimmedMeaning.length > 300) {
      return Alert.alert(
        "Input too long",
        "Please shorten the phrase or meaning.",
      );
    }

    setSubmitting(true);

    try {
      const res = await fetch(API_SUBMIT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language_key: selectedLang.code,
          local_phrase: trimmedPhrase,
          english_meaning: trimmedMeaning,
          context: trimmedContext || null,
          full_name: user.name,
          email: user.email,
          user_id: user.id,
        }),
      });

      const text = await res.text();
      let data;

      try {
        data = JSON.parse(text);
      } catch (parseErr) {
        console.error("Raw backend response:", text);
        throw new Error("Invalid response from server (not JSON)");
      }

      if (!res.ok || data.status === "error") {
        throw new Error(data.message || data.error || "Submission failed");
      }

      setLocalPhrase("");
      setEnglishMeaning("");
      setContext("");

      Alert.alert(
        "Success!",
        data.message || "Your suggestion has been sent — thank you!",
        [
          {
            text: "OK",
            onPress: () => {
              setTimeout(() => {
                router.push("/words");
              }, 300);
            },
          },
        ],
      );
    } catch (err: any) {
      console.error("Submit failed:", err);
      Alert.alert(
        "Submission failed",
        err.message?.includes("not JSON")
          ? "Server returned invalid data — check backend logs"
          : err.message || "Something went wrong. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingUser) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#10b981" style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Suggest Phrase</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.langSwitcher}>
          <Text style={styles.langSwitcherTitle}>Suggesting for:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.langChips}>
              {languages.map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.langChip,
                    selectedLang.code === lang.code && styles.langChipSelected,
                  ]}
                  onPress={() => setSelectedLang(lang)}
                >
                  <Text
                    style={[
                      styles.langChipText,
                      selectedLang.code === lang.code && { color: "#fff" },
                    ]}
                  >
                    {lang.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        <Text style={styles.intro}>
          {user ? `Hi ${user.name},` : "Hello!"} Help grow the{" "}
          <Text style={{ fontWeight: "bold", color: "#10b981" }}>
            {selectedLang.name}
          </Text>{" "}
          dictionary.
        </Text>

        {!user && (
          <View style={styles.warningCard}>
            <Text style={styles.warningText}>
              Only approved users can submit suggestions on this screen.
            </Text>
            <TouchableOpacity onPress={() => router.replace("/log")}>
              <Text style={styles.loginLink}>Log in now →</Text>
            </TouchableOpacity>
          </View>
        )}

        {user && (
          <View style={styles.userCard}>
            <Text style={styles.userCardTitle}>Approved account</Text>
            <Text style={styles.userCardText}>Name: {user.name}</Text>
            <Text style={styles.userCardText}>Email: {user.email}</Text>
            <Text style={styles.userCardText}>User ID: {user.id}</Text>
          </View>
        )}

        <View style={styles.formCard}>
          <Text style={styles.label}>Phrase in {selectedLang.name}</Text>
          <TextInput
            style={styles.input}
            placeholder={`e.g. ${
              selectedLang.code === "he"
                ? "Shalom aleichem..."
                : selectedLang.code === "pcm"
                  ? "How far?"
                  : selectedLang.code === "rw"
                    ? "Muraho..."
                    : "Hello..."
            }`}
            value={localPhrase}
            onChangeText={setLocalPhrase}
            multiline
            numberOfLines={3}
            maxLength={500}
            editable={!submitting && !!user}
          />

          <Text style={styles.label}>English meaning</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. I love you"
            value={englishMeaning}
            onChangeText={setEnglishMeaning}
            multiline
            numberOfLines={2}
            maxLength={300}
            editable={!submitting && !!user}
          />

          <Text style={styles.label}>Context / example (optional)</Text>
          <TextInput
            style={[styles.input, styles.contextInput]}
            placeholder="e.g. Said to a close friend in the morning"
            value={context}
            onChangeText={setContext}
            multiline
            numberOfLines={4}
            maxLength={800}
            editable={!submitting && !!user}
          />

          <TouchableOpacity
            style={[
              styles.submitButton,
              (submitting || !user) && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={submitting || !user}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitText}>Send Suggestion</Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.note}>
          All suggestions are reviewed before they appear in the app. Thank you!
        </Text>
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

  backIcon: {
    fontSize: 32,
    color: "#333",
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },

  langSwitcher: {
    marginBottom: 20,
  },

  langSwitcherTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#555",
    marginBottom: 10,
  },

  langChips: {
    flexDirection: "row",
    gap: 10,
  },

  langChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#e0e0e0",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ccc",
  },

  langChipSelected: {
    backgroundColor: "#10b981",
    borderColor: "#10b981",
  },

  langChipText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },

  intro: {
    fontSize: 17,
    color: "#333",
    lineHeight: 26,
    marginBottom: 20,
    textAlign: "center",
    fontWeight: "500",
  },

  warningCard: {
    backgroundColor: "#fef3c7",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#f59e0b",
    alignItems: "center",
  },

  warningText: {
    color: "#92400e",
    fontSize: 15,
    marginBottom: 12,
    textAlign: "center",
  },

  loginLink: {
    color: "#2563eb",
    fontWeight: "600",
    fontSize: 15,
  },

  userCard: {
    backgroundColor: "#ecfdf5",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#10b981",
  },

  userCardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#065f46",
    marginBottom: 8,
  },

  userCardText: {
    fontSize: 14,
    color: "#065f46",
    marginBottom: 4,
  },

  formCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },

  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    marginTop: 16,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    minHeight: 60,
    textAlignVertical: "top",
    marginBottom: 8,
    backgroundColor: "#fff",
  },

  contextInput: {
    minHeight: 100,
  },

  submitButton: {
    backgroundColor: "#10b981",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 28,
  },

  submitButtonDisabled: {
    backgroundColor: "#94d3b5",
    opacity: 0.7,
  },

  submitText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
  },

  note: {
    marginTop: 28,
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
});
