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

export default function DonateScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Donate</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.comingSoonContainer}>
          <Text style={styles.comingSoonTitle}>Coming Soon</Text>
          <Text style={styles.comingSoonText}>
            We're working hard to set up a secure and easy way for you to
            support the project.
          </Text>
          <Text style={styles.comingSoonText}>
            Soon you'll be able to contribute and help keep Margivasal growing —
            thank you for believing in this mission!
          </Text>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back to Profile</Text>
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
    flexGrow: 1,
    padding: 24,
    justifyContent: "center",
  },

  comingSoonContainer: {
    alignItems: "center",
    backgroundColor: "#1A1A1A",
    borderRadius: 24,
    padding: 40,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  comingSoonTitle: {
    fontSize: 32,
    fontWeight: "900",
    color: "#FFD700",
    marginBottom: 20,
  },
  comingSoonText: {
    fontSize: 16,
    color: "#bbb",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 16,
  },

  backButton: {
    marginTop: 32,
    paddingVertical: 14,
    paddingHorizontal: 32,
    backgroundColor: "#6366F1",
    borderRadius: 16,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
