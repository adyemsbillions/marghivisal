"use client";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
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

const API_URL = "https://margivial.cravii.ng/api/forget.php";

export default function ForgetScreen() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "code">("email");

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSendCode = async () => {
    if (loading) return;
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Alert.alert("Error", "Please enter a valid email");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "request_reset",
          email: email.trim().toLowerCase(),
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to send code");
      }

      Alert.alert("Code Sent", "Check your email for the 6-digit code.");
      setStep("code");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (loading) return;

    if (!code.trim() || code.length !== 6) {
      Alert.alert("Error", "Please enter the 6-digit code");
      return;
    }

    if (!password || password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reset_password",
          email: email.trim().toLowerCase(),
          code,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to reset password");
      }

      Alert.alert("Success", "Password reset successfully! Please log in.", [
        {
          text: "OK",
          onPress: () => router.replace("/log"), // or wherever your login is
        },
      ]);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#1a1a2e", "#16213e", "#0f3460"]}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.formContainer}>
              <Text style={styles.appName}>Margivasal</Text>
              <Text style={styles.tagline}>
                {step === "email" ? "Reset Password" : "Enter Code"}
              </Text>

              {step === "email" ? (
                <>
                  <Text style={styles.infoText}>
                    Enter your email address and we'll send you a 6-digit code.
                  </Text>

                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!loading}
                  />

                  <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleSendCode}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.submitButtonText}>SEND CODE</Text>
                    )}
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={styles.infoText}>
                    Enter the 6-digit code sent to {email}
                  </Text>

                  <Text style={styles.label}>Verification Code</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter 6-digit code"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    value={code}
                    onChangeText={setCode}
                    keyboardType="number-pad"
                    maxLength={6}
                    editable={!loading}
                  />

                  <Text style={styles.label}>New Password</Text>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      style={styles.passwordInput}
                      placeholder="New password"
                      placeholderTextColor="rgba(255,255,255,0.4)"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      editable={!loading}
                    />
                    <TouchableOpacity
                      style={styles.eyeIcon}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <Ionicons
                        name={showPassword ? "eye-off" : "eye"}
                        size={24}
                        color="rgba(255,255,255,0.6)"
                      />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.label}>Confirm Password</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm new password"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showPassword}
                    editable={!loading}
                  />

                  <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleResetPassword}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.submitButtonText}>
                        RESET PASSWORD
                      </Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.backLink}
                    onPress={() => setStep("email")}
                  >
                    <Text style={styles.backLinkText}>← Back to email</Text>
                  </TouchableOpacity>
                </>
              )}

              <TouchableOpacity
                style={styles.backToLogin}
                onPress={() => router.back()}
              >
                <Text style={styles.backToLoginText}>Back to Login</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
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
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 24,
    padding: 32,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  appName: {
    fontSize: 36,
    fontWeight: "900",
    color: "#fff",
    marginBottom: 8,
  },
  tagline: {
    fontSize: 20,
    color: "#4CAF50",
    fontWeight: "600",
    marginBottom: 24,
  },
  infoText: {
    color: "#ccc",
    fontSize: 15,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  label: {
    alignSelf: "flex-start",
    color: "#fff",
    fontSize: 16,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    width: "100%",
    height: 54,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 12,
    paddingHorizontal: 16,
    color: "#fff",
    fontSize: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  passwordContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  passwordInput: {
    flex: 1,
    height: 54,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingRight: 50,
    color: "#fff",
    fontSize: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  eyeIcon: {
    position: "absolute",
    right: 16,
    height: 54,
    justifyContent: "center",
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
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  backLink: {
    marginTop: 16,
  },
  backLinkText: {
    color: "#4CAF50",
    fontSize: 16,
  },
  backToLogin: {
    marginTop: 32,
  },
  backToLoginText: {
    color: "#aaa",
    fontSize: 16,
  },
});
