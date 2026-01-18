import { useNavigation } from "@react-navigation/native";
import React from "react";
import {
    Dimensions,
    Image,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width } = Dimensions.get("window");

const GO_BUTTON_SIZE = Math.min(width * 0.28, 110); // responsive: ~28% of screen width, max 110px

export default function WelcomeScreen() {
  const navigation = useNavigation();

  const handleGoPress = () => {
    // @ts-ignore
    navigation.navigate("dashboard"); // adjust 'Login' to your actual route name
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Subtle world map background */}
      <Image
        source={{
          uri: "https://images.unsplash.com/photo-1521295121783-8a321d551ad2?w=800&q=80",
        }}
        style={styles.backgroundMap}
        resizeMode="cover"
      />

      <View style={styles.content}>
        {/* Flags arrangement - replaced Saudi with Nigeria */}
        <View style={styles.flagsContainer}>
          <Image
            source={{ uri: "https://flagcdn.com/w320/ca.png" }}
            style={[styles.flag, styles.flag1]}
          />
          <Image
            source={{ uri: "https://flagcdn.com/w320/id.png" }}
            style={[styles.flag, styles.flag2]}
          />
          <Image
            source={{ uri: "https://flagcdn.com/w320/gb.png" }}
            style={[styles.flag, styles.flag3]}
          />
          <Image
            source={{ uri: "https://flagcdn.com/w320/us.png" }}
            style={[styles.flag, styles.flag4]}
          />
          <Image
            source={{ uri: "https://flagcdn.com/w320/ng.png" }} // ← Nigeria flag here
            style={[styles.flag, styles.flag5]}
          />
          <Image
            source={{ uri: "https://flagcdn.com/w320/fr.png" }}
            style={[styles.flag, styles.flag6]}
          />
          <Image
            source={{ uri: "https://flagcdn.com/w320/kh.png" }}
            style={[styles.flag, styles.flag7]}
          />
          <Image
            source={{ uri: "https://flagcdn.com/w320/se.png" }}
            style={[styles.flag, styles.flag8]}
          />
          <Image
            source={{ uri: "https://flagcdn.com/w320/de.png" }}
            style={[styles.flag, styles.flag9]}
          />
        </View>

        {/* Text */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>Marghivasal</Text>
          <Text style={styles.title}>Translate All</Text>
          {/* <Text style={styles.title}>Type Word</Text> */}

          <Text style={styles.subtitle}>
            Help You Communicate In{"\n"}Different Languages
          </Text>
        </View>

        {/* Smaller, responsive GO button */}
        <TouchableOpacity
          style={[
            styles.goButton,
            {
              width: GO_BUTTON_SIZE,
              height: GO_BUTTON_SIZE,
              borderRadius: GO_BUTTON_SIZE / 2,
            },
          ]}
          onPress={handleGoPress}
          activeOpacity={0.85}
        >
          <Text style={[styles.goText, { fontSize: GO_BUTTON_SIZE * 0.38 }]}>
            GO
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  backgroundMap: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.12,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  flagsContainer: {
    width: width * 0.8,
    height: width * 0.8,
    position: "relative",
    marginBottom: 50,
  },
  flag: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 3,
    borderColor: "#ffffff",
    position: "absolute",
  },
  flag1: { top: "5%", left: "10%" },
  flag2: { top: "8%", right: "12%" },
  flag3: { top: "30%", right: "0%" },
  flag4: { top: "55%", right: "15%" },
  flag5: { bottom: "25%", right: "10%" }, // ← Now Nigeria
  flag6: { bottom: "10%", right: "35%" },
  flag7: { bottom: "5%", left: "25%" },
  flag8: { top: "25%", left: "0%" },
  flag9: { top: "50%", left: "5%" },

  textContainer: {
    alignItems: "center",
    marginBottom: 60,
  },
  title: {
    color: "#ffffff",
    fontSize: 38,
    fontWeight: "bold",
    letterSpacing: 1.2,
    textAlign: "center",
  },
  subtitle: {
    color: "#bbbbbb",
    fontSize: 16,
    marginTop: 20,
    textAlign: "center",
    lineHeight: 26,
  },

  goButton: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    borderWidth: 4,
    borderColor: "#388E3C",
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 10,
  },
  goText: {
    color: "#ffffff",
    fontWeight: "bold",
    letterSpacing: 1.5,
  },
});
