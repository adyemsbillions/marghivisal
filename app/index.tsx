// screens/WelcomeScreen.tsx

import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");

const GO_BUTTON_SIZE = Math.min(width * 0.32, 140);

export default function WelcomeScreen() {
  const navigation = useNavigation<any>();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const flagsAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Optional: later check if user is logged in → navigation.replace("dashboard")

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.12,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 48,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(flagsAnim, {
        toValue: 1,
        duration: 1400,
        delay: 400,
        useNativeDriver: true,
      }),
    ]).start();

    pulse.start();

    return () => pulse.stop();
  }, []);

  const handleGoPress = () => {
    navigation.navigate("log"); // ← Changed to go to login/signup first
    // Or "dashboard" if you implement auth check above
  };

  const flags = [
    { uri: "https://flagcdn.com/w320/ng.png", style: styles.flag1 },
    { uri: "https://flagcdn.com/w320/us.png", style: styles.flag2 },
    { uri: "https://flagcdn.com/w320/gb.png", style: styles.flag3 },
    { uri: "https://flagcdn.com/w320/ca.png", style: styles.flag4 },
    { uri: "https://flagcdn.com/w320/de.png", style: styles.flag5 },
    { uri: "https://flagcdn.com/w320/fr.png", style: styles.flag6 },
    { uri: "https://flagcdn.com/w320/in.png", style: styles.flag7 },
    { uri: "https://flagcdn.com/w320/za.png", style: styles.flag8 },
    { uri: "https://flagcdn.com/w320/gh.png", style: styles.flag9 },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#0f0f1a", "#1a1a2e", "#0d1b2a"]}
        style={StyleSheet.absoluteFill}
      />

      {/* Updated background: subtle dark world map */}
      <Image
        source={{
          uri: "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=2000",
        }}
        style={styles.backgroundMap}
        resizeMode="cover"
      />

      <View style={styles.content}>
        {/* Animated flags cluster */}
        <Animated.View
          style={[
            styles.flagsContainer,
            {
              opacity: flagsAnim,
              transform: [{ scale: Animated.multiply(flagsAnim, 0.92) }],
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
                        outputRange: [40 + index * 5, 0],
                      }),
                    },
                    {
                      rotate: flagsAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ["-8deg", "0deg"],
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

        {/* Hero text */}
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
          <Text style={styles.tagline}>Translate Everything</Text>

          <Text style={styles.subtitle}>
            Seamless communication across{"\n"}languages & cultures
          </Text>
        </Animated.View>

        {/* GO button with pulse */}
        <Animated.View
          style={{
            marginTop: "auto",
            marginBottom: height > 800 ? 80 : 50,
            opacity: fadeAnim,
            transform: [{ scale: Animated.multiply(scaleAnim, pulseAnim) }],
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
            activeOpacity={0.75}
          >
            <LinearGradient
              colors={["#4CAF50", "#43A047", "#2E7D32"]}
              style={[
                styles.goButtonInner,
                {
                  width: GO_BUTTON_SIZE,
                  height: GO_BUTTON_SIZE,
                  borderRadius: GO_BUTTON_SIZE / 2,
                },
              ]}
            >
              <Text
                style={[styles.goText, { fontSize: GO_BUTTON_SIZE * 0.38 }]}
              >
                GET STARTED
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundMap: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.07,
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 24,
  },
  flagsContainer: {
    width: width * 0.9,
    height: width * 0.9,
    maxHeight: height * 0.42,
    position: "relative",
    marginTop: height * 0.08,
    marginBottom: 20,
  },
  flag: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.9)",
  },
  flagGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 34,
    backgroundColor: "#4CAF50",
    opacity: 0.18,
  },
  // Flag positions – slightly adjusted for better balance
  flag1: { position: "absolute", top: "8%", left: "12%" },
  flag2: { position: "absolute", top: "15%", right: "10%" },
  flag3: { position: "absolute", top: "38%", right: "5%" },
  flag4: { position: "absolute", top: "52%", right: "18%" },
  flag5: { position: "absolute", bottom: "28%", right: "14%" },
  flag6: { position: "absolute", bottom: "12%", right: "32%" },
  flag7: { position: "absolute", bottom: "8%", left: "22%" },
  flag8: { position: "absolute", top: "28%", left: "4%" },
  flag9: { position: "absolute", top: "48%", left: "8%" },

  textContainer: {
    alignItems: "center",
    marginTop: 16,
  },
  title: {
    color: "#ffffff",
    fontSize: 48,
    fontWeight: "900",
    letterSpacing: 2.2,
    textAlign: "center",
    textShadowColor: "rgba(76, 175, 80, 0.4)",
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 12,
  },
  titleUnderline: {
    width: 80,
    height: 5,
    backgroundColor: "#4CAF50",
    marginVertical: 10,
    borderRadius: 3,
  },
  tagline: {
    color: "#66BB6A",
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: 1.2,
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    color: "#b0bec5",
    fontSize: 17,
    textAlign: "center",
    lineHeight: 28,
    fontWeight: "400",
    opacity: 0.95,
  },

  goButton: {
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.55,
    shadowRadius: 20,
    elevation: 12,
  },
  goButtonInner: {
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2.5,
    borderColor: "rgba(255,255,255,0.25)",
  },
  goText: {
    color: "#ffffff",
    fontWeight: "900",
    letterSpacing: 2.5,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
});
