"use client";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const PAYPAL_EMAIL = "josh1dille@gmail.com";

const donationAmounts = [
  { value: 5, label: "$5" },
  { value: 10, label: "$10" },
  { value: 25, label: "$25" },
  { value: 50, label: "$50" },
  { value: 100, label: "$100" },
  { value: "custom", label: "Custom Amount" },
];

export default function DonateScreen() {
  const router = useRouter();

  const [selectedAmount, setSelectedAmount] = useState<
    number | "custom" | null
  >(null);
  const [customAmount, setCustomAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDonate = async () => {
    let amount: number;

    if (selectedAmount === "custom") {
      amount = parseFloat(customAmount);
      if (isNaN(amount) || amount <= 0) {
        Alert.alert("Invalid Amount", "Please enter a valid donation amount.");
        return;
      }
    } else if (typeof selectedAmount === "number") {
      amount = selectedAmount;
    } else {
      Alert.alert("Select Amount", "Please choose a donation amount.");
      return;
    }

    setLoading(true);

    try {
      // PayPal.me donation link
      const paypalUrl = `https://www.paypal.com/paypalme/${encodeURIComponent(PAYPAL_EMAIL)}/${amount}`;

      const canOpen = await Linking.canOpenURL(paypalUrl);
      if (canOpen) {
        await Linking.openURL(paypalUrl);
      } else {
        // Fallback: show the email and link if opening fails
        Alert.alert(
          "Couldn't open PayPal",
          `Please visit this link manually or send to:\n\n${PAYPAL_EMAIL}\n\nLink:\n${paypalUrl}`,
          [
            {
              text: "Copy Email",
              onPress: () => {
                /* you can add clipboard copy here */
              },
            },
            { text: "OK" },
          ],
        );
      }
    } catch (error) {
      console.error("Donate error:", error);
      Alert.alert(
        "Error",
        `Something went wrong.\n\nYou can still support via PayPal:\n${PAYPAL_EMAIL}`,
      );
    } finally {
      setLoading(false);
    }
  };

  const selectAmount = (value: number | "custom") => {
    setSelectedAmount(value);
    if (value !== "custom") {
      setCustomAmount("");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Support Margivasal</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.contentContainer}>
          <Text style={styles.title}>Help Keep Margivasal Alive</Text>

          <Text style={styles.subtitle}>
            Your support helps cover server costs, add more languages, and keep
            the app free for everyone.
          </Text>

          <Text style={styles.thankYou}>
            Thank you for believing in this mission ❤️
          </Text>

          {/* Donation amounts */}
          <View style={styles.amountsGrid}>
            {donationAmounts.map((item) => (
              <TouchableOpacity
                key={String(item.value)}
                style={[
                  styles.amountButton,
                  selectedAmount === item.value && styles.amountButtonSelected,
                ]}
                onPress={() => selectAmount(item.value)}
              >
                <Text
                  style={[
                    styles.amountText,
                    selectedAmount === item.value && styles.amountTextSelected,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Custom amount */}
          {selectedAmount === "custom" && (
            <View style={styles.customAmountContainer}>
              <Text style={styles.customLabel}>Enter amount (USD):</Text>
              <View style={styles.customInputWrapper}>
                <Text style={styles.dollarSign}>$</Text>
                <TextInput
                  style={styles.customInput}
                  value={customAmount}
                  onChangeText={setCustomAmount}
                  keyboardType="numeric"
                  placeholder="0.00"
                  placeholderTextColor="#777"
                />
              </View>
            </View>
          )}

          {/* Donate button */}
          <TouchableOpacity
            style={[
              styles.donateButton,
              (!selectedAmount ||
                (selectedAmount === "custom" && !customAmount.trim())) &&
                styles.donateButtonDisabled,
            ]}
            onPress={handleDonate}
            disabled={
              loading ||
              !selectedAmount ||
              (selectedAmount === "custom" && !customAmount.trim())
            }
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.donateButtonText}>Donate via PayPal</Text>
            )}
          </TouchableOpacity>

          {/* Fallback info */}
          <Text style={styles.emailFallback}>
            If the button doesn't work, you can send directly to:{"\n"}
            <Text style={styles.emailHighlight}>{PAYPAL_EMAIL}</Text>
          </Text>

          <Text style={styles.securityNote}>
            Secure payment via PayPal. You can pay as guest — no account
            required.
          </Text>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Maybe Later</Text>
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
  },

  contentContainer: {
    alignItems: "center",
    backgroundColor: "#1A1A1A",
    borderRadius: 24,
    padding: 32,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#bbb",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 24,
  },
  thankYou: {
    fontSize: 18,
    color: "#FFD700",
    marginBottom: 32,
    fontWeight: "600",
  },

  amountsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
    marginBottom: 24,
  },
  amountButton: {
    backgroundColor: "#2A2A2A",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 24,
    minWidth: 100,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#444",
  },
  amountButtonSelected: {
    backgroundColor: "#6366F1",
    borderColor: "#818CF8",
  },
  amountText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ddd",
  },
  amountTextSelected: {
    color: "#fff",
  },

  customAmountContainer: {
    width: "100%",
    marginBottom: 32,
  },
  customLabel: {
    fontSize: 16,
    color: "#ccc",
    marginBottom: 8,
  },
  customInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2A2A2A",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#444",
    paddingHorizontal: 16,
  },
  dollarSign: {
    fontSize: 24,
    color: "#bbb",
    marginRight: 8,
  },
  customInput: {
    flex: 1,
    fontSize: 24,
    color: "#fff",
    paddingVertical: 16,
  },

  donateButton: {
    backgroundColor: "#6366F1",
    borderRadius: 20,
    paddingVertical: 18,
    width: "100%",
    alignItems: "center",
    marginBottom: 16,
  },
  donateButtonDisabled: {
    backgroundColor: "#444",
    opacity: 0.6,
  },
  donateButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },

  emailFallback: {
    fontSize: 15,
    color: "#aaa",
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 22,
  },
  emailHighlight: {
    color: "#FFD700",
    fontWeight: "600",
  },

  securityNote: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 20,
  },

  backButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  backButtonText: {
    color: "#bbb",
    fontSize: 16,
    fontWeight: "600",
  },
});
