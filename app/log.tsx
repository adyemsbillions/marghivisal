// screens/Log.tsx
"use client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const API_URL = "https://margivial.cravii.ng/api/log.php";

export default function LogScreen() {
  const navigation = useNavigation<any>();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [country, setCountry] = useState("Nigeria");
  const [loading, setLoading] = useState(false);

  const countries = [
    { label: "Nigeria", value: "Nigeria" },
    { label: "Ghana", value: "Ghana" },
    { label: "United States", value: "United States" },
    { label: "United Kingdom", value: "United Kingdom" },
    { label: "Canada", value: "Canada" },
    { label: "Germany", value: "Germany" },
    { label: "France", value: "France" },
    { label: "India", value: "India" },
    { label: "Kenya", value: "Kenya" },
    { label: "South Africa", value: "South Africa" },
  ];

  const handleSubmit = async () => {
    if (loading) return;

    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Email and password are required");
      return;
    }
    if (!isLogin && (!fullName.trim() || !country.trim())) {
      Alert.alert("Error", "Full name and country are required for signup");
      return;
    }

    setLoading(true);

    try {
      const payload: any = {
        action: isLogin ? "login" : "signup",
        email: email.trim().toLowerCase(),
        password,
      };

      if (!isLogin) {
        payload.full_name = fullName.trim();
        payload.country = country;
      }

      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || "Request failed");
      }

      // Save user data to AsyncStorage
      if (data.user) {
        await AsyncStorage.setItem("user", JSON.stringify(data.user));
      }

      Alert.alert(
        "Success",
        isLogin ? "Logged in successfully!" : "Account created!",
        [
          {
            text: "OK",
            onPress: () => {
              navigation.navigate("dashboard");
            },
          },
        ],
      );

      // Clear form
      setEmail("");
      setPassword("");
      if (!isLogin) {
        setFullName("");
        setCountry("Nigeria");
      }
    } catch (err: any) {
      Alert.alert("Error", err.message || "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#0a0a0a", "#1a1a2e", "#16213e"]}
        style={styles.gradient}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formContainer}>
            <Text style={styles.appName}>Marghivasal</Text>
            <Text style={styles.tagline}>
              {isLogin ? "Welcome Back" : "Create Account"}
            </Text>

            {!isLogin && (
              <>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="John Doe"
                  placeholderTextColor="#888"
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                  editable={!loading}
                />
              </>
            )}

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="your.email@example.com"
              placeholderTextColor="#888"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              editable={!loading}
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#888"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              editable={!loading}
            />

            {!isLogin && (
              <>
                <Text style={styles.label}>Country</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={country}
                    onValueChange={(itemValue) => setCountry(itemValue)}
                    style={styles.picker}
                    dropdownIconColor="#4CAF50"
                    enabled={!loading}
                  >
                    {countries.map((c) => (
                      <Picker.Item
                        key={c.value}
                        label={c.label}
                        value={c.value}
                        color="#333"
                      />
                    ))}
                  </Picker>
                </View>
              </>
            )}

            <TouchableOpacity
              style={[styles.submitButton, loading && { opacity: 0.7 }]}
              onPress={handleSubmit}
              activeOpacity={0.8}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {isLogin ? "LOG IN" : "SIGN UP"}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toggleContainer}
              onPress={() => setIsLogin(!isLogin)}
              disabled={loading}
            >
              <Text style={styles.toggleText}>
                {isLogin
                  ? "Don't have an account? "
                  : "Already have an account? "}
                <Text style={styles.toggleHighlight}>
                  {isLogin ? "Sign Up" : "Log In"}
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { ...StyleSheet.absoluteFillObject },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  formContainer: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 24,
    padding: 32,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  appName: {
    fontSize: 36,
    fontWeight: "900",
    color: "#ffffff",
    marginBottom: 8,
    letterSpacing: 1.5,
  },
  tagline: {
    fontSize: 20,
    color: "#4CAF50",
    fontWeight: "600",
    marginBottom: 32,
  },
  label: {
    alignSelf: "flex-start",
    color: "#ffffff",
    fontSize: 16,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    width: "100%",
    height: 54,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderRadius: 12,
    paddingHorizontal: 16,
    color: "#ffffff",
    fontSize: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  pickerContainer: {
    width: "100%",
    height: 54,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    marginBottom: 12,
  },
  picker: {
    color: "#ffffff",
    fontSize: 16,
  },
  submitButton: {
    width: "100%",
    height: 56,
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 32,
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  submitButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 1,
  },
  toggleContainer: {
    marginTop: 24,
  },
  toggleText: {
    color: "#cccccc",
    fontSize: 16,
  },
  toggleHighlight: {
    color: "#4CAF50",
    fontWeight: "600",
  },
});
