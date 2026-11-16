
import React, { useState } from "react";

import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";

import { Redirect, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useProfile } from "../context/ProfileContext";

export default function Index() {
  const { profile, loading, saveProfile } = useProfile();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);

  const handleContinue = async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert(
        "Missing Information",
        "Please enter your name and email address."
      );
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email.trim())) {
      Alert.alert(
        "Invalid Email",
        "Please enter a valid email address."
      );
      return;
    }

    setSaving(true);

    const success = await saveProfile({ name, email });

    setSaving(false);

    if (success) {
      router.replace("/(tabs)");
    } else {
      Alert.alert(
        "Something went wrong",
        "Your profile could not be saved. Please try again."
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#36B58A" />
      </View>
    );
  }

  if (profile) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Ionicons
              name="school"
              size={38}
              color="#FFFFFF"
            />
          </View>

          <Text style={styles.appName}>UniFlow</Text>
          <Text style={styles.tagline}>
            Your university life, organized.
          </Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.heading}>
            Welcome to UniFlow!
          </Text>

          <Text style={styles.description}>
            Let's set up your student profile to get started.
          </Text>

          <Text style={styles.label}>Full Name</Text>

          <View style={styles.inputContainer}>
            <Ionicons
              name="person-outline"
              size={20}
              color="#8993A4"
            />

            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              placeholderTextColor="#8993A4"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>

          <Text style={styles.label}>Email Address</Text>

          <View style={styles.inputContainer}>
            <Ionicons
              name="mail-outline"
              size={20}
              color="#8993A4"
            />

            <TextInput
              style={styles.input}
              placeholder="Enter your email address"
              placeholderTextColor="#8993A4"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <Pressable
            style={[
              styles.continueButton,
              saving && styles.disabledButton,
            ]}
            onPress={handleContinue}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.buttonText}>
                  Get Started
                </Text>

                <Ionicons
                  name="arrow-forward"
                  size={20}
                  color="#FFFFFF"
                />
              </>
            )}
          </Pressable>

          <Text style={styles.footerText}>
            Your information will be saved on this device.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F9FC",
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 25,
    paddingVertical: 50,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F7F9FC",
  },

  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },

  logoCircle: {
    width: 75,
    height: 75,
    borderRadius: 24,
    backgroundColor: "#36B58A",
    justifyContent: "center",
    alignItems: "center",
  },

  appName: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#101D32",
    marginTop: 15,
  },

  tagline: {
    fontSize: 13,
    color: "#778397",
    marginTop: 5,
  },

  formContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 22,
    elevation: 3,
  },

  heading: {
    fontSize: 23,
    fontWeight: "bold",
    color: "#101D32",
  },

  description: {
    fontSize: 13,
    color: "#778397",
    marginTop: 8,
    marginBottom: 25,
    lineHeight: 20,
  },

  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#101D32",
    marginBottom: 9,
    marginTop: 12,
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7F9FC",
    borderWidth: 1,
    borderColor: "#E5EAF0",
    borderRadius: 12,
    paddingHorizontal: 14,
  },

  input: {
    flex: 1,
    padding: 14,
    fontSize: 13,
    color: "#101D32",
  },

  continueButton: {
    backgroundColor: "#36B58A",
    borderRadius: 12,
    padding: 16,
    marginTop: 28,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },

  disabledButton: {
    opacity: 0.7,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
  },

  footerText: {
    textAlign: "center",
    color: "#8993A4",
    fontSize: 11,
    marginTop: 18,
  },
});
