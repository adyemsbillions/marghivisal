// screens/WelcomeScreen.tsx

import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

const GO_BUTTON_SIZE = Math.min(width * 0.3, 120);

export default function WelcomeScreen() {
  const navigation = useNavigation<any>();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const flagsAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(flagsAnim, {
        toValue: 1,
        duration: 1200,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleGoPress = () => {
    console.log("GO button pressed → navigating to Dashboard");
    navigation.navigate("dashboard"); // Make sure this matches your navigator screen name
  };

  const flags = [
    { uri: "https://flagcdn.com/w320/ca.png", style: styles.flag1 },
    { uri: "https://flagcdn.com/w320/id.png", style: styles.flag2 },
    { uri: "https://flagcdn.com/w320/gb.png", style: styles.flag3 },
    { uri: "https://flagcdn.com/w320/us.png", style: styles.flag4 },
    { uri: "https://flagcdn.com/w320/ng.png", style: styles.flag5 },
    { uri: "https://flagcdn.com/w320/fr.png", style: styles.flag6 },
    { uri: "https://flagcdn.com/w320/kh.png", style: styles.flag7 },
    { uri: "https://flagcdn.com/w320/se.png", style: styles.flag8 },
    { uri: "https://flagcdn.com/w320/de.png", style: styles.flag9 },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#0a0a0a", "#1a1a2e", "#16213e"]}
        style={styles.gradient}
      />

      <Image
        source={{
          uri: "https://images.unsplash.com/photo-1521295121783-8a321d551ad2?w=800&q=80",
        }}
        style={styles.backgroundMap}
        resizeMode="cover"
      />

      <View style={styles.content}>
        {/* Flags – centered vertically but with space */}
        <Animated.View
          style={[
            styles.flagsContainer,
            {
              opacity: flagsAnim,
              transform: [{ scale: flagsAnim }],
            },
          ]}
        >
          {flags.map((flag, index) => (
            <Animated.View
              key={index}
              style={[
                flag.style,
                {
                  opacity: flagsAnim,
                  transform: [
                    {
                      translateY: flagsAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Image source={{ uri: flag.uri }} style={styles.flag} />
              <View style={styles.flagGlow} />
            </Animated.View>
          ))}
        </Animated.View>

        {/* Title & subtitle */}
        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Text style={styles.title}>Marghivasal</Text>
          <View style={styles.titleUnderline} />
          <Text style={styles.tagline}>Translate All</Text>

          <Text style={styles.subtitle}>
            Help You Communicate In{"\n"}Different Languages
          </Text>
        </Animated.View>

        {/* GO Button – pushed to bottom with safe spacing */}
        <Animated.View
          style={{
            marginTop: "auto", // ← this pushes it to the bottom
            marginBottom: 50, // breathing room above nav bar / home indicator
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }}
        >
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
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={["#4CAF50", "#45a049", "#388E3C"]}
              style={[
                styles.goButtonGradient,
                {
                  width: GO_BUTTON_SIZE,
                  height: GO_BUTTON_SIZE,
                  borderRadius: GO_BUTTON_SIZE / 2,
                },
              ]}
            >
              <Text
                style={[styles.goText, { fontSize: GO_BUTTON_SIZE * 0.35 }]}
              >
                GO
              </Text>
            </LinearGradient>
            <View style={styles.buttonPulse} />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  backgroundMap: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.08,
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 20,
    // Removed justifyContent: 'center' → using marginTop: 'auto' on button instead
  },
  flagsContainer: {
    width: width * 0.85,
    height: width * 0.85,
    position: "relative",
    marginBottom: 40, // ← reduced from 60 to give more room for text/button
  },
  flag: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: "#ffffff",
  },
  flagGlow: {
    position: "absolute",
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#4CAF50",
    opacity: 0.15,
  },
  flag1: { position: "absolute", top: "5%", left: "10%" },
  flag2: { position: "absolute", top: "8%", right: "12%" },
  flag3: { position: "absolute", top: "30%", right: "0%" },
  flag4: { position: "absolute", top: "55%", right: "15%" },
  flag5: { position: "absolute", bottom: "25%", right: "10%" },
  flag6: { position: "absolute", bottom: "10%", right: "35%" },
  flag7: { position: "absolute", bottom: "5%", left: "25%" },
  flag8: { position: "absolute", top: "25%", left: "0%" },
  flag9: { position: "absolute", top: "50%", left: "5%" },

  textContainer: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 60,
  },
  title: {
    color: "#ffffff",
    fontSize: 42,
    fontWeight: "900",
    letterSpacing: 2,
    textAlign: "center",
    textShadowColor: "rgba(76, 175, 80, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  titleUnderline: {
    width: 60,
    height: 4,
    backgroundColor: "#4CAF50",
    marginTop: 8,
    marginBottom: 4,
    borderRadius: 2,
  },
  tagline: {
    color: "#4CAF50",
    fontSize: 20,
    fontWeight: "600",
    letterSpacing: 1,
    textAlign: "center",
    marginTop: 4,
  },
  subtitle: {
    color: "#c0c0c0",
    fontSize: 16,
    marginTop: 24,
    textAlign: "center",
    lineHeight: 28,
    fontWeight: "300",
  },

  goButton: {
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 15,
  },
  goButtonGradient: {
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  buttonPulse: {
    position: "absolute",
    width: GO_BUTTON_SIZE * 1.4,
    height: GO_BUTTON_SIZE * 1.4,
    borderRadius: (GO_BUTTON_SIZE * 1.4) / 2,
    borderWidth: 2,
    borderColor: "#4CAF50",
    opacity: 0.2,
  },
  goText: {
    color: "#ffffff",
    fontWeight: "900",
    letterSpacing: 3,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
});
