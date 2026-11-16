
import React, { useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useProfile } from "../../context/ProfileContext";

export default function ProfileScreen() {
  const { profile, loading, saveProfile, logout } = useProfile();

  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);

  const getInitials = (fullName) => {
    if (!fullName) return "?";

    return fullName
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("");
  };

  const openEditModal = () => {
    setName(profile?.name || "");
    setEmail(profile?.email || "");
    setModalVisible(true);
  };

  const handleSave = async () => {
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
      setModalVisible(false);

      Alert.alert(
        "Profile Updated",
        "Your profile information has been saved successfully."
      );
    } else {
      Alert.alert(
        "Update Failed",
        "Could not save your profile. Please try again."
      );
    }
  };

  const handleLogout = () => {
  Alert.alert(
    "Logout",
    "Are you sure you want to log out of UniFlow?",
    [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          const success = await logout();

          if (success) {
            Alert.alert(
              "Logged Out",
              "You have successfully logged out."
            );
          } else {
            Alert.alert(
              "Logout Failed",
              "Could not log out. Please try again."
            );
          }
        },
      },
    ]
  );
};

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#36B58A" />
      </View>
    );
  }

  return (
  <View style={styles.container}>
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>My Profile</Text>

        <Text style={styles.subtitle}>
          Manage your personal information.
        </Text>
      </View>

      {/* PROFILE CARD */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {getInitials(profile?.name)}
          </Text>
        </View>

        <Text style={styles.profileName}>
          {profile?.name || "Student"}
        </Text>

        <Text style={styles.profileEmail}>
          {profile?.email || "No email available"}
        </Text>

        <View style={styles.memberBadge}>
          <Ionicons
            name="school-outline"
            size={14}
            color="#36B58A"
          />

          <Text style={styles.memberBadgeText}>
            UniFlow Student
          </Text>
        </View>
      </View>

      {/* PERSONAL INFORMATION */}
      <Text style={styles.sectionTitle}>
        Personal Information
      </Text>

      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <View style={styles.infoIcon}>
            <Ionicons
              name="person-outline"
              size={20}
              color="#36B58A"
            />
          </View>

          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Full Name</Text>
            <Text style={styles.infoValue}>
              {profile?.name || "Not provided"}
            </Text>
          </View>
        </View>

        <View style={styles.separator} />

        <View style={styles.infoRow}>
          <View style={styles.infoIcon}>
            <Ionicons
              name="mail-outline"
              size={20}
              color="#36B58A"
            />
          </View>

          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Email Address</Text>
            <Text style={styles.infoValue}>
              {profile?.email || "Not provided"}
            </Text>
          </View>
        </View>
      </View>

      {/* EDIT PROFILE BUTTON */}
      <Pressable
        style={styles.editButton}
        onPress={openEditModal}
      >
        <Ionicons
          name="create-outline"
          size={20}
          color="#FFFFFF"
        />

        <Text style={styles.editButtonText}>
          Edit Profile
        </Text>
      </Pressable>

        {/* LOGOUT BUTTON */}

        <Pressable
            style={styles.logoutButton}
            onPress={handleLogout}
            >
            <Ionicons
                name="log-out-outline"
                size={20}
                color="#E05252"
            />

            <Text style={styles.logoutButtonText}>
                Logout
            </Text>
            </Pressable>
    </ScrollView>

      {/* EDIT PROFILE MODAL */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>
                  Edit Profile
                </Text>

                <Text style={styles.modalSubtitle}>
                  Update your personal details.
                </Text>
              </View>

              <Pressable
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons
                  name="close"
                  size={22}
                  color="#101D32"
                />
              </Pressable>
            </View>

            <Text style={styles.inputLabel}>Full Name</Text>

            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              placeholderTextColor="#8993A4"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />

            <Text style={styles.inputLabel}>Email Address</Text>

            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#8993A4"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Pressable
              style={[
                styles.saveButton,
                saving && styles.disabledButton,
              ]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons
                    name="save-outline"
                    size={19}
                    color="#FFFFFF"
                  />

                  <Text style={styles.saveButtonText}>
                    Save Changes
                  </Text>
                </>
              )}
            </Pressable>

            <Pressable
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>
                Cancel
              </Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F9FC",
    paddingHorizontal: 22,
    paddingTop: 70,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F7F9FC",
  },

  header: {
    marginBottom: 25,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#101D32",
  },

  subtitle: {
    fontSize: 13,
    color: "#778397",
    marginTop: 7,
  },

  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    elevation: 2,
    marginBottom: 28,
  },

  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#DDF5EA",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#36B58A",
  },

  avatarText: {
    fontSize: 29,
    fontWeight: "bold",
    color: "#258763",
  },

  profileName: {
    fontSize: 21,
    fontWeight: "bold",
    color: "#101D32",
    marginTop: 15,
    textAlign: "center",
  },

  profileEmail: {
    fontSize: 13,
    color: "#778397",
    marginTop: 6,
  },

  memberBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EAF8F1",
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 20,
    marginTop: 15,
    gap: 6,
  },

  memberBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#258763",
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#101D32",
    marginBottom: 14,
  },

  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 17,
    paddingVertical: 5,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 17,
  },

  infoIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#EAF8F1",
    justifyContent: "center",
    alignItems: "center",
  },

  infoContent: {
    flex: 1,
    marginLeft: 13,
  },

  infoLabel: {
    fontSize: 11,
    color: "#8993A4",
  },

  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#101D32",
    marginTop: 5,
  },

  separator: {
    height: 1,
    backgroundColor: "#EEF1F5",
    marginLeft: 55,
  },

  editButton: {
    backgroundColor: "#36B58A",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    borderRadius: 13,
    marginTop: 25,
    gap: 9,
  },

  editButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },

  logoutButton: {
  backgroundColor: "#FFF1F1",
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  padding: 16,
  borderRadius: 13,
  marginTop: 14,
  marginBottom: 25,
  gap: 9,
  borderWidth: 1,
  borderColor: "#FADADA",
},

logoutButtonText: {
  color: "#E05252",
  fontSize: 14,
  fontWeight: "bold",
},

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    padding: 20,
  },

  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 22,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#101D32",
  },

  modalSubtitle: {
    fontSize: 12,
    color: "#778397",
    marginTop: 5,
  },

  closeButton: {
    width: 35,
    height: 35,
    borderRadius: 10,
    backgroundColor: "#F0F3F7",
    justifyContent: "center",
    alignItems: "center",
  },

  inputLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#101D32",
    marginBottom: 8,
    marginTop: 12,
  },

  input: {
    backgroundColor: "#F7F9FC",
    borderWidth: 1,
    borderColor: "#E5EAF0",
    borderRadius: 11,
    padding: 14,
    fontSize: 13,
    color: "#101D32",
  },

  saveButton: {
    backgroundColor: "#36B58A",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
    borderRadius: 12,
    marginTop: 25,
    gap: 8,
  },

  disabledButton: {
    opacity: 0.7,
  },

  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },

  cancelButton: {
    padding: 12,
    alignItems: "center",
    marginTop: 5,
  },

  cancelButtonText: {
    color: "#778397",
    fontWeight: "600",
    fontSize: 13,
  },
});
