
import React from "react";

import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { useAppLifecycle } from "../../context/AppStateContext";

export default function HomeScreen() {

  // AppState information
  const {
    appState,
    lastRefreshedAt,
    resumeCount,
    showWelcomeBack,
    dismissWelcomeBack,
  } = useAppLifecycle();

  return (
    <View style={styles.container}>

      {/* BRAND */}
      <Text style={styles.brand}>
        UniFlow
      </Text>

      {/* WELCOME MESSAGE */}
      <Text style={styles.title}>
        Welcome! 👋
      </Text>

      <Text style={styles.subtitle}>
        Organize your university life in one flow.
      </Text>

      {/* APPSTATE WELCOME BACK MESSAGE */}
      {showWelcomeBack && (
        <View style={styles.welcomeBackCard}>

          <View style={{ flex: 1 }}>
            <Text style={styles.welcomeBackTitle}>
              Welcome! 👋
            </Text>

            <Text style={styles.welcomeBackText}>
              Your academic dashboard has been refreshed.
            </Text>

            <Text style={styles.welcomeBackText}>
              Last refreshed:{" "}
              {lastRefreshedAt.toLocaleTimeString()}
            </Text>
          </View>

          <Pressable onPress={dismissWelcomeBack}>
            <Ionicons
              name="close-circle-outline"
              size={24}
              color="#36B58A"
            />
          </Pressable>

        </View>
      )}

      {/* APPLICATION LIFECYCLE STATUS */}
      <View style={styles.lifecycleCard}>

        <View style={styles.lifecycleHeader}>
          <Ionicons
            name="pulse-outline"
            size={19}
            color="#36B58A"
          />

          <Text style={styles.lifecycleTitle}>
            Application Status
          </Text>
        </View>

        <Text style={styles.lifecycleValue}>
          {appState === "active" ? "Active" : appState}
        </Text>

        <Text style={styles.lifecycleText}>
          Foreground returns: {resumeCount}
        </Text>

      </View>

      {/* DASHBOARD CARD */}
      <View style={styles.card}>

        <Text style={styles.cardTitle}>
          Your dashboard is ready!
        </Text>

        <Text style={styles.cardText}>
          Your lectures, assignments and academic
          activities will appear here.
        </Text>

      </View>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F7F9FC",
    padding: 24,
    paddingTop: 75,
  },

  brand: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#36B58A",
    marginBottom: 35,
  },

  title: {
    fontSize: 27,
    fontWeight: "bold",
    color: "#101D32",
  },

  subtitle: {
    fontSize: 14,
    color: "#778397",
    marginTop: 10,
  },

  welcomeBackCard: {
    backgroundColor: "#E8F8F0",
    borderRadius: 15,
    padding: 16,
    marginTop: 20,
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
  },

  welcomeBackTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#167A59",
  },

  welcomeBackText: {
    fontSize: 11,
    color: "#4F7568",
    marginTop: 5,
  },

  lifecycleCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 15,
    marginTop: 25,
    marginBottom: 18,
  },

  lifecycleHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  lifecycleTitle: {
    color: "#101D32",
    fontSize: 13,
    fontWeight: "bold",
  },

  lifecycleValue: {
    color: "#36B58A",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 10,
    textTransform: "capitalize",
  },

  lifecycleText: {
    color: "#778397",
    fontSize: 11,
    marginTop: 5,
  },

  card: {
    backgroundColor: "#101D32",
    padding: 22,
    borderRadius: 18,
    marginTop: 10,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#B9F5D0",
  },

  cardText: {
    fontSize: 13,
    color: "#FFFFFF",
    marginTop: 10,
    lineHeight: 21,
  },

});
