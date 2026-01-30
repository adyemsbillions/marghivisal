"use client";
import { useRouter } from "expo-router";
import React from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Chat() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Language Chat</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 60 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.emoji}>🚀</Text>

          <Text style={styles.title}>Coming Soon!</Text>

          <Text style={styles.description}>
            Interactive language practice chat with voice support is under
            active development.
          </Text>

          <Text style={styles.subtitle}>What you'll get:</Text>

          <View style={styles.features}>
            <Text style={styles.feature}>
              • Real-time conversation in Hausa, Yoruba, Igbo + more
            </Text>
            <Text style={styles.feature}>
              • Gentle corrections & positive encouragement
            </Text>
            <Text style={styles.feature}>
              • Voice input & natural speech output
            </Text>
            <Text style={styles.feature}>
              • Easy language switching mid-conversation
            </Text>
          </View>

          <Text style={styles.footerText}>
            We're building something fun, helpful and culturally rich for
            language learners 😊
          </Text>

          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.8}
            onPress={() => router.back()}
          >
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e7eb",
  },
  backIcon: {
    fontSize: 32,
    color: "#374151",
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    letterSpacing: -0.2,
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  card: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 24,
    paddingVertical: 48,
    paddingHorizontal: 28,
    marginVertical: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    maxWidth: 380,
    alignSelf: "center",
  },

  emoji: {
    fontSize: 72,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 17,
    color: "#4b5563",
    textAlign: "center",
    lineHeight: 26,
    marginBottom: 32,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 16,
  },
  features: {
    alignSelf: "stretch",
    marginBottom: 32,
  },
  feature: {
    fontSize: 16,
    color: "#4b5563",
    lineHeight: 26,
    marginVertical: 4,
  },
  footerText: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 26,
    marginBottom: 40,
  },

  primaryButton: {
    backgroundColor: "#6366f1",
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 48,
    alignItems: "center",
    shadowColor: "#6366f1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
});
