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
        <View style={{ width: 60 }} /> {/* spacer for symmetry */}
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.comingSoonContainer}>
          <Text style={styles.comingSoonEmoji}>🚀</Text>

          <Text style={styles.comingSoonTitle}>Coming Soon!</Text>

          <Text style={styles.comingSoonText}>
            Interactive language practice chat with voice support is under
            development.
          </Text>

          <Text style={styles.comingSoonSubtitle}>Features you'll get:</Text>

          <View style={styles.featuresList}>
            <Text style={styles.featureItem}>
              • Real-time conversation in Hausa, Yoruba, Igbo + more
            </Text>
            <Text style={styles.featureItem}>
              • Gentle corrections & encouragement
            </Text>
            <Text style={styles.featureItem}>
              • Voice input & speech output
            </Text>
            <Text style={styles.featureItem}>
              • Switch between Nigerian languages easily
            </Text>
          </View>

          <Text style={styles.comingSoonFooter}>
            We're working hard to make it fun and helpful for language learners!
            😊
          </Text>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backIcon: {
    fontSize: 28,
    color: "#333",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
  },

  contentContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },

  comingSoonContainer: {
    alignItems: "center",
    paddingVertical: 60,
    maxWidth: 340,
  },
  comingSoonEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  comingSoonTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#111",
    marginBottom: 16,
  },
  comingSoonText: {
    fontSize: 18,
    color: "#444",
    textAlign: "center",
    lineHeight: 26,
    marginBottom: 32,
  },
  comingSoonSubtitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  featuresList: {
    alignSelf: "stretch",
    marginBottom: 32,
  },
  featureItem: {
    fontSize: 16,
    color: "#555",
    marginVertical: 6,
    lineHeight: 24,
  },
  comingSoonFooter: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 40,
  },

  backButton: {
    backgroundColor: "#6366f1",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 40,
    alignItems: "center",
    shadowColor: "#6366f1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
});
