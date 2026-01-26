"use client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type TranslationEntry = {
  fromFlag: string;
  toFlag: string;
  text: string;
  translated: string;
  time: string;
};

export default function Recent() {
  const router = useRouter();
  const [translations, setTranslations] = useState<TranslationEntry[]>([]);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const stored = await AsyncStorage.getItem("translationHistory");
        if (stored) {
          const parsed = JSON.parse(stored) as TranslationEntry[];
          setTranslations(parsed);
        }
      } catch (error) {
        console.error("Failed to load translation history:", error);
      }
    };

    loadHistory();
  }, []);

  const clearHistory = async () => {
    try {
      await AsyncStorage.removeItem("translationHistory");
      setTranslations([]);
    } catch (error) {
      console.error("Failed to clear history:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Recent Translations</Text>
        {translations.length > 0 && (
          <TouchableOpacity onPress={clearHistory}>
            <Text style={styles.clearButton}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {translations.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>No translations yet</Text>
            <Text style={styles.emptySubtext}>
              Start translating to see your history here
            </Text>
          </View>
        ) : (
          translations.map((item, index) => (
            <View key={index} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.flags}>
                  <Image
                    source={{ uri: item.fromFlag }}
                    style={styles.flagImage}
                  />
                  <Text style={styles.arrow}>→</Text>
                  <Image
                    source={{ uri: item.toFlag }}
                    style={styles.flagImage}
                  />
                </View>
                <Text style={styles.time}>
                  {new Date(item.time).toLocaleDateString([], {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
              <Text style={styles.originalText}>{item.text}</Text>
              <Text style={styles.translatedText}>{item.translated}</Text>
            </View>
          ))
        )}
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
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  backButton: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6366F1",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  clearButton: {
    fontSize: 16,
    fontWeight: "600",
    color: "#F87171",
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#1A1A1A",
    borderWidth: 1,
    borderColor: "#333",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  flags: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  flagImage: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  arrow: {
    fontSize: 16,
    color: "#666",
  },
  time: {
    fontSize: 12,
    color: "#888",
  },
  originalText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 8,
  },
  translatedText: {
    fontSize: 15,
    color: "#aaa",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 15,
    color: "#666",
  },
});
