// app/dashboard.tsx  (or app/(tabs)/dashboard.tsx if using tabs)
import { useRouter } from "expo-router";
import React from "react";
import {
    Dimensions,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width } = Dimensions.get("window");

export default function Dashboard() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.profileContainer}>
          <Image
            source={{ uri: "https://i.pravatar.cc/150?u=cravii" }} // placeholder avatar
            style={styles.avatar}
          />
          <Text style={styles.greeting}>Logoue</Text>
        </View>

        <TouchableOpacity>
          <Text style={styles.searchIcon}>🔍</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Hero Section */}
        <View style={styles.hero}>
          <View style={styles.heroTextContainer}>
            <Text style={styles.heroTitle}>Translatate</Text>
            <Text style={styles.heroTitle}>Everything</Text>
          </View>

          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400", // hand holding phone
            }}
            style={styles.heroImage}
          />
        </View>

        <TouchableOpacity
          style={styles.startButton}
          onPress={() => router.push("/translate")} // ← link to your main translator screen
        >
          <Text style={styles.startButtonText}>Start</Text>
        </TouchableOpacity>

        {/* Cards Section */}
        <View style={styles.cardsContainer}>
          <View style={[styles.card, { backgroundColor: "#FF6B6B" }]}>
            <Text style={styles.cardTitle}>English For{"\n"}Child</Text>
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1503454537195-1dcabb9d2a9d?w=200", // cute animated boy
              }}
              style={styles.cardImage}
            />
            <View style={styles.playButton}>
              <Text style={styles.playIcon}>▶</Text>
            </View>
          </View>

          <View style={[styles.card, { backgroundColor: "#4ECDC4" }]}>
            <Text style={styles.cardTitle}>The Expert{"\n"}Class</Text>
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=200", // graduation cap
              }}
              style={styles.cardImage}
            />
            <View style={styles.playButton}>
              <Text style={styles.playIcon}>▶</Text>
            </View>
          </View>
        </View>

        {/* Recent Translations */}
        <View style={styles.recentHeader}>
          <Text style={styles.sectionTitle}>Recent Translate</Text>
          <Text style={styles.seeAll}>See All</Text>
        </View>

        <TouchableOpacity style={styles.recentItem}>
          <View style={styles.flagsContainer}>
            <Image
              source={{ uri: "https://flagcdn.com/w320/us.png" }}
              style={styles.smallFlag}
            />
            <Image
              source={{ uri: "https://flagcdn.com/w320/id.png" }}
              style={styles.smallFlag}
            />
          </View>
          <Text style={styles.recentText}>USA to Indonesians</Text>
        </TouchableOpacity>

        {/* Bottom Navigation (simplified icons) */}
        <View style={styles.bottomNav}>
          <TouchableOpacity>
            <Text style={styles.navIcon}>🎤</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={[styles.navIcon, styles.navIconActive]}>🔄</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={styles.navIcon}>⚙️</Text>
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  greeting: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
  },
  searchIcon: {
    fontSize: 24,
    color: "#aaa",
  },

  hero: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 24,
  },
  heroTextContainer: {
    flex: 1,
  },
  heroTitle: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
    lineHeight: 38,
  },
  heroImage: {
    width: 140,
    height: 180,
    resizeMode: "contain",
  },

  startButton: {
    backgroundColor: "#333",
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
    marginBottom: 40,
    borderWidth: 1,
    borderColor: "#555",
  },
  startButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },

  cardsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 40,
  },
  card: {
    width: (width - 60) / 2,
    height: 180,
    borderRadius: 20,
    padding: 16,
    justifyContent: "space-between",
    position: "relative",
    overflow: "hidden",
  },
  cardTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    lineHeight: 24,
  },
  cardImage: {
    width: 90,
    height: 90,
    alignSelf: "flex-end",
    borderRadius: 12,
  },
  playButton: {
    position: "absolute",
    bottom: 16,
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  playIcon: {
    color: "#fff",
    fontSize: 20,
    marginLeft: 3,
  },

  recentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
  },
  seeAll: {
    color: "#4CAF50",
    fontSize: 14,
  },
  recentItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  flagsContainer: {
    flexDirection: "row",
    marginRight: 16,
  },
  smallFlag: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#222",
    marginLeft: -12,
  },
  recentText: {
    color: "#ddd",
    fontSize: 16,
  },

  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 16,
    backgroundColor: "#111",
    borderTopWidth: 1,
    borderTopColor: "#222",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  navIcon: {
    fontSize: 28,
    color: "#777",
  },
  navIconActive: {
    color: "#4CAF50",
  },
});
