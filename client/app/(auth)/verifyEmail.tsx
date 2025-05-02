import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { API_URL } from "../config/api";

const VerifyEmail = () => {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const { email } = useLocalSearchParams();
  const inputRefs = useRef<TextInput[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleCodeChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    // Move to next input if value is entered
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Move to previous input on backspace if current input is empty
    if (e.nativeEvent.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerification = async () => {
    const verificationCode = code.join("");
    if (!verificationCode || verificationCode.length !== 6) {
      Alert.alert("Error", "Please enter a valid 6-digit code");
      return;
    }

    setIsLoading(true);
    try {
      console.log("Making request to:", `${API_URL}/users/verify-email`);
      console.log("Verification code:", verificationCode);
      console.log("Email:", email);
      const response = await fetch(`${API_URL}/users/verify-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          code: verificationCode.padStart(6, "0"), // Ensure 6 digits with leading zeros
        }),
      });

      const data = await response.json();
      console.log("Verification response:", data);

      if (data.success) {
        Alert.alert("Success", "Email verified successfully", [
          { text: "OK", onPress: () => router.push("/login") },
        ]);
      } else {
        Alert.alert("Error", data.message || "Verification failed");
      }
    } catch (error) {
      console.error("Verification error:", error);
      Alert.alert("Error", "Failed to verify email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      const response = await fetch(`${API_URL}/users/resend-verification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        Alert.alert("Success", "Verification code resent successfully");
        // Reset code input
        setCode(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      } else {
        Alert.alert("Error", data.message || "Failed to resend code");
      }
    } catch (error) {
      console.error("Resend code error:", error);
      Alert.alert("Error", "Failed to resend code. Please try again.");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === "ios" ? 50 : 0}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Image
            source={require("../../assets/images/phono-logo.png")}
            style={styles.logo}
          />
        </View>

        <Text style={styles.title}>Verify Email</Text>
        <Text style={styles.subtitle}>
          Please enter the 6-digit code sent to your email address
        </Text>

        <View style={styles.form}>
          <View style={styles.codeContainer}>
            {code.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputRefs.current[index] = ref as TextInput)}
                style={styles.codeInput}
                value={digit}
                onChangeText={(text) =>
                  handleCodeChange(text.replace(/[^0-9]/g, ""), index)
                }
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                onKeyPress={(e) => handleKeyPress(e, index)}
                editable={!isLoading}
                placeholderTextColor="#666"
                autoFocus={index === 0}
              />
            ))}
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleVerification}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? "Verifying..." : "Verify Email"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.resendButton}
            onPress={handleResendCode}
            disabled={isLoading}
          >
            <Text style={styles.resendText}>Didn't receive the code?</Text>
            <Text style={styles.resendLink}>Resend Code</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default VerifyEmail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0e0f0e",
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 50,
  },
  header: {
    flexDirection: "row",
    paddingLeft: 20,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  logo: {
    width: 100,
    height: 100,
  },
  title: {
    fontSize: 34,
    fontWeight: "bold",
    textAlign: "left",
    color: "white",
    marginHorizontal: 20,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "left",
    color: "lightgray",
    marginHorizontal: 20,
  },
  form: {
    marginHorizontal: 20,
    flex: 1,
  },
  codeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  codeInput: {
    width: 45,
    height: 55,
    borderWidth: 1,
    borderColor: "#666",
    borderRadius: 8,
    color: "white",
    fontSize: 24,
    textAlign: "center",
    backgroundColor: "#1a1a1a",
  },
  button: {
    backgroundColor: "#e54545",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: "#8b2828",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  resendButton: {
    alignItems: "center",
  },
  resendText: {
    color: "lightgray",
    fontSize: 14,
    marginBottom: 5,
  },
  resendLink: {
    color: "#e54545",
    fontSize: 16,
    fontWeight: "500",
  },
});
