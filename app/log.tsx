"use client";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
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
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [country, setCountry] = useState("Nigeria");
  const [loading, setLoading] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const countries = [
    { label: "Afghanistan", value: "Afghanistan" },
    { label: "Albania", value: "Albania" },
    { label: "Algeria", value: "Algeria" },
    { label: "Andorra", value: "Andorra" },
    { label: "Angola", value: "Angola" },
    { label: "Antigua and Barbuda", value: "Antigua and Barbuda" },
    { label: "Argentina", value: "Argentina" },
    { label: "Armenia", value: "Armenia" },
    { label: "Australia", value: "Australia" },
    { label: "Austria", value: "Austria" },
    { label: "Azerbaijan", value: "Azerbaijan" },
    { label: "Bahamas", value: "Bahamas" },
    { label: "Bahrain", value: "Bahrain" },
    { label: "Bangladesh", value: "Bangladesh" },
    { label: "Barbados", value: "Barbados" },
    { label: "Belarus", value: "Belarus" },
    { label: "Belgium", value: "Belgium" },
    { label: "Belize", value: "Belize" },
    { label: "Benin", value: "Benin" },
    { label: "Bhutan", value: "Bhutan" },
    { label: "Bolivia", value: "Bolivia" },
    { label: "Bosnia and Herzegovina", value: "Bosnia and Herzegovina" },
    { label: "Botswana", value: "Botswana" },
    { label: "Brazil", value: "Brazil" },
    { label: "Brunei", value: "Brunei" },
    { label: "Bulgaria", value: "Bulgaria" },
    { label: "Burkina Faso", value: "Burkina Faso" },
    { label: "Burundi", value: "Burundi" },
    { label: "Cabo Verde", value: "Cabo Verde" },
    { label: "Cambodia", value: "Cambodia" },
    { label: "Cameroon", value: "Cameroon" },
    { label: "Canada", value: "Canada" },
    { label: "Central African Republic", value: "Central African Republic" },
    { label: "Chad", value: "Chad" },
    { label: "Chile", value: "Chile" },
    { label: "China", value: "China" },
    { label: "Colombia", value: "Colombia" },
    { label: "Comoros", value: "Comoros" },
    { label: "Congo (Congo-Brazzaville)", value: "Congo (Congo-Brazzaville)" },
    { label: "Costa Rica", value: "Costa Rica" },
    { label: "Croatia", value: "Croatia" },
    { label: "Cuba", value: "Cuba" },
    { label: "Cyprus", value: "Cyprus" },
    { label: "Czechia (Czech Republic)", value: "Czechia (Czech Republic)" },
    { label: "Denmark", value: "Denmark" },
    { label: "Djibouti", value: "Djibouti" },
    { label: "Dominica", value: "Dominica" },
    { label: "Dominican Republic", value: "Dominican Republic" },
    { label: "Ecuador", value: "Ecuador" },
    { label: "Egypt", value: "Egypt" },
    { label: "El Salvador", value: "El Salvador" },
    { label: "Equatorial Guinea", value: "Equatorial Guinea" },
    { label: "Eritrea", value: "Eritrea" },
    { label: "Estonia", value: "Estonia" },
    { label: "Eswatini", value: "Eswatini" },
    { label: "Ethiopia", value: "Ethiopia" },
    { label: "Fiji", value: "Fiji" },
    { label: "Finland", value: "Finland" },
    { label: "France", value: "France" },
    { label: "Gabon", value: "Gabon" },
    { label: "Gambia", value: "Gambia" },
    { label: "Georgia", value: "Georgia" },
    { label: "Germany", value: "Germany" },
    { label: "Ghana", value: "Ghana" },
    { label: "Greece", value: "Greece" },
    { label: "Grenada", value: "Grenada" },
    { label: "Guatemala", value: "Guatemala" },
    { label: "Guinea", value: "Guinea" },
    { label: "Guinea-Bissau", value: "Guinea-Bissau" },
    { label: "Guyana", value: "Guyana" },
    { label: "Haiti", value: "Haiti" },
    { label: "Honduras", value: "Honduras" },
    { label: "Hungary", value: "Hungary" },
    { label: "Iceland", value: "Iceland" },
    { label: "India", value: "India" },
    { label: "Indonesia", value: "Indonesia" },
    { label: "Iran", value: "Iran" },
    { label: "Iraq", value: "Iraq" },
    { label: "Ireland", value: "Ireland" },
    { label: "Israel", value: "Israel" },
    { label: "Italy", value: "Italy" },
    { label: "Jamaica", value: "Jamaica" },
    { label: "Japan", value: "Japan" },
    { label: "Jordan", value: "Jordan" },
    { label: "Kazakhstan", value: "Kazakhstan" },
    { label: "Kenya", value: "Kenya" },
    { label: "Kiribati", value: "Kiribati" },
    { label: "Kuwait", value: "Kuwait" },
    { label: "Kyrgyzstan", value: "Kyrgyzstan" },
    { label: "Laos", value: "Laos" },
    { label: "Latvia", value: "Latvia" },
    { label: "Lebanon", value: "Lebanon" },
    { label: "Lesotho", value: "Lesotho" },
    { label: "Liberia", value: "Liberia" },
    { label: "Libya", value: "Libya" },
    { label: "Liechtenstein", value: "Liechtenstein" },
    { label: "Lithuania", value: "Lithuania" },
    { label: "Luxembourg", value: "Luxembourg" },
    { label: "Madagascar", value: "Madagascar" },
    { label: "Malawi", value: "Malawi" },
    { label: "Malaysia", value: "Malaysia" },
    { label: "Maldives", value: "Maldives" },
    { label: "Mali", value: "Mali" },
    { label: "Malta", value: "Malta" },
    { label: "Marshall Islands", value: "Marshall Islands" },
    { label: "Mauritania", value: "Mauritania" },
    { label: "Mauritius", value: "Mauritius" },
    { label: "Mexico", value: "Mexico" },
    { label: "Micronesia", value: "Micronesia" },
    { label: "Moldova", value: "Moldova" },
    { label: "Monaco", value: "Monaco" },
    { label: "Mongolia", value: "Mongolia" },
    { label: "Montenegro", value: "Montenegro" },
    { label: "Morocco", value: "Morocco" },
    { label: "Mozambique", value: "Mozambique" },
    { label: "Myanmar (Burma)", value: "Myanmar (Burma)" },
    { label: "Namibia", value: "Namibia" },
    { label: "Nauru", value: "Nauru" },
    { label: "Nepal", value: "Nepal" },
    { label: "Netherlands", value: "Netherlands" },
    { label: "New Zealand", value: "New Zealand" },
    { label: "Nicaragua", value: "Nicaragua" },
    { label: "Niger", value: "Niger" },
    { label: "Nigeria", value: "Nigeria" },
    { label: "North Korea", value: "North Korea" },
    { label: "North Macedonia", value: "North Macedonia" },
    { label: "Norway", value: "Norway" },
    { label: "Oman", value: "Oman" },
    { label: "Pakistan", value: "Pakistan" },
    { label: "Palau", value: "Palau" },
    { label: "Palestine", value: "Palestine" },
    { label: "Panama", value: "Panama" },
    { label: "Papua New Guinea", value: "Papua New Guinea" },
    { label: "Paraguay", value: "Paraguay" },
    { label: "Peru", value: "Peru" },
    { label: "Philippines", value: "Philippines" },
    { label: "Poland", value: "Poland" },
    { label: "Portugal", value: "Portugal" },
    { label: "Qatar", value: "Qatar" },
    { label: "Romania", value: "Romania" },
    { label: "Russia", value: "Russia" },
    { label: "Rwanda", value: "Rwanda" },
    { label: "Saint Kitts and Nevis", value: "Saint Kitts and Nevis" },
    { label: "Saint Lucia", value: "Saint Lucia" },
    {
      label: "Saint Vincent and the Grenadines",
      value: "Saint Vincent and the Grenadines",
    },
    { label: "Samoa", value: "Samoa" },
    { label: "San Marino", value: "San Marino" },
    { label: "Sao Tome and Principe", value: "Sao Tome and Principe" },
    { label: "Saudi Arabia", value: "Saudi Arabia" },
    { label: "Senegal", value: "Senegal" },
    { label: "Serbia", value: "Serbia" },
    { label: "Seychelles", value: "Seychelles" },
    { label: "Sierra Leone", value: "Sierra Leone" },
    { label: "Singapore", value: "Singapore" },
    { label: "Slovakia", value: "Slovakia" },
    { label: "Slovenia", value: "Slovenia" },
    { label: "Solomon Islands", value: "Solomon Islands" },
    { label: "Somalia", value: "Somalia" },
    { label: "South Africa", value: "South Africa" },
    { label: "South Korea", value: "South Korea" },
    { label: "South Sudan", value: "South Sudan" },
    { label: "Spain", value: "Spain" },
    { label: "Sri Lanka", value: "Sri Lanka" },
    { label: "Sudan", value: "Sudan" },
    { label: "Suriname", value: "Suriname" },
    { label: "Sweden", value: "Sweden" },
    { label: "Switzerland", value: "Switzerland" },
    { label: "Syria", value: "Syria" },
    { label: "Taiwan", value: "Taiwan" },
    { label: "Tajikistan", value: "Tajikistan" },
    { label: "Tanzania", value: "Tanzania" },
    { label: "Thailand", value: "Thailand" },
    { label: "Timor-Leste", value: "Timor-Leste" },
    { label: "Togo", value: "Togo" },
    { label: "Tonga", value: "Tonga" },
    { label: "Trinidad and Tobago", value: "Trinidad and Tobago" },
    { label: "Tunisia", value: "Tunisia" },
    { label: "Turkey", value: "Turkey" },
    { label: "Turkmenistan", value: "Turkmenistan" },
    { label: "Tuvalu", value: "Tuvalu" },
    { label: "Uganda", value: "Uganda" },
    { label: "Ukraine", value: "Ukraine" },
    { label: "United Arab Emirates", value: "United Arab Emirates" },
    { label: "United Kingdom", value: "United Kingdom" },
    { label: "United States", value: "United States" },
    { label: "Uruguay", value: "Uruguay" },
    { label: "Uzbekistan", value: "Uzbekistan" },
    { label: "Vanuatu", value: "Vanuatu" },
    { label: "Vatican City", value: "Vatican City" },
    { label: "Venezuela", value: "Venezuela" },
    { label: "Vietnam", value: "Vietnam" },
    { label: "Yemen", value: "Yemen" },
    { label: "Zambia", value: "Zambia" },
    { label: "Zimbabwe", value: "Zimbabwe" },
  ];

  // Check if already logged in → redirect to dashboard
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userJson = await AsyncStorage.getItem("user");
        if (userJson) {
          const user = JSON.parse(userJson);
          if (user?.email) {
            router.replace("/dashboard");
            return;
          }
        }
      } catch (err) {
        console.warn("Auth check failed", err);
      } finally {
        setAuthChecking(false);
        setLoading(false);
      }
    };
    checkAuth();
  }, [router]);

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
              router.replace("/dashboard");
            },
          },
        ],
      );

      // Clear fields
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

  if (authChecking) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={["#1a1a2e", "#16213e", "#0f3460"]}
          style={styles.gradient}
        >
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <ActivityIndicator size="large" color="#4CAF50" />
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

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
                {isLogin ? "Welcome Back" : "Create Account"}
              </Text>

              {!isLogin && (
                <>
                  <Text style={styles.label}>Full Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your full name"
                    placeholderTextColor="rgba(255, 255, 255, 0.4)"
                    value={fullName}
                    onChangeText={setFullName}
                    editable={!loading}
                  />
                </>
              )}

              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
              />

              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter your password"
                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  editable={!loading}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  <Ionicons
                    name={showPassword ? "eye-off" : "eye"}
                    size={24}
                    color="rgba(255, 255, 255, 0.6)"
                  />
                </TouchableOpacity>
              </View>

              {/* Forgot Password Link - only shown when in login mode */}
              {isLogin && (
                <TouchableOpacity
                  style={styles.forgotPasswordContainer}
                  onPress={() => router.push("/forget")}
                  disabled={loading}
                >
                  <Text style={styles.forgotPasswordText}>
                    Forgot Password?
                  </Text>
                </TouchableOpacity>
              )}

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
                        />
                      ))}
                    </Picker>
                  </View>
                </>
              )}

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  loading && styles.submitButtonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.submitButtonText}>
                    {isLogin ? "LOG IN" : "SIGN UP"}
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setIsLogin(!isLogin)}
                disabled={loading}
                style={styles.toggleContainer}
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
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
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
  passwordContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  passwordInput: {
    flex: 1,
    height: 54,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingRight: 50,
    color: "#ffffff",
    fontSize: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  eyeIcon: {
    position: "absolute",
    right: 16,
    height: 54,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  forgotPasswordContainer: {
    alignSelf: "flex-end",
    marginTop: 8,
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: "#4CAF50",
    fontSize: 15,
    fontWeight: "500",
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
    marginTop: 16,
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  submitButtonDisabled: {
    opacity: 0.7,
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
