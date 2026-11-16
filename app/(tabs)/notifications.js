
import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";

import {
  getScheduledNotifications,
  cancelNotification,
  scheduleTestNotification,
} from "../../services/notificationService";

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);

  const loadNotifications = useCallback(async () => {
    try {
      const scheduled = await getScheduledNotifications();
      setNotifications(scheduled || []);
    } catch (error) {
      console.error("Could not load notifications:", error);
      Alert.alert(
        "Error",
        "Unable to load scheduled reminders."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, [loadNotifications])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadNotifications();
  };

  const getScheduledDate = (trigger) => {
    if (!trigger) return null;

    const value =
      trigger.date ??
      trigger.value ??
      null;

    if (!value) return null;

    const date =
      value instanceof Date
        ? value
        : new Date(value);

    if (Number.isNaN(date.getTime())) return null;

    return date.toLocaleString([], {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleCancelReminder = (notification) => {
    Alert.alert(
      "Cancel Reminder",
      "Are you sure you want to cancel this scheduled reminder?",
      [
        {
          text: "Keep",
          style: "cancel",
        },
        {
          text: "Cancel Reminder",
          style: "destructive",
          onPress: async () => {
            try {
              await cancelNotification(
                notification.identifier
              );

              await loadNotifications();

              Alert.alert(
                "Cancelled",
                "The reminder has been cancelled."
              );
            } catch (error) {
              console.error(
                "Could not cancel reminder:",
                error
              );

              Alert.alert(
                "Error",
                "Unable to cancel this reminder."
              );
            }
          },
        },
      ]
    );
  };

  const handleTestNotification = async () => {
    try {
      setSendingTest(true);

      const result = await scheduleTestNotification();

      if (result) {
        Alert.alert(
          "Test Notification Scheduled",
          "You should receive a test notification in approximately 5 seconds."
        );
      } else {
        Alert.alert(
          "Permission Required",
          "Please enable notification permissions to receive notifications."
        );
      }

      await loadNotifications();
    } catch (error) {
      console.error("Test notification error:", error);

      Alert.alert(
        "Error",
        "Could not schedule the test notification."
      );
    } finally {
      setSendingTest(false);
    }
  };

  const renderNotification = ({ item }) => {
    const content = item.content || {};
    const isTest =
      content.data?.type === "test-notification";

    const scheduledDate = getScheduledDate(
      item.trigger
    );

    return (
      <View style={styles.notificationCard}>
        <View style={styles.cardTop}>
          <View style={styles.iconContainer}>
            <Ionicons
              name={isTest ? "notifications" : "book"}
              size={22}
              color="#36B58A"
            />
          </View>

          <View style={styles.notificationInfo}>
            <Text style={styles.notificationTitle}>
              {content.title || "Scheduled Reminder"}
            </Text>

            <Text style={styles.notificationDescription}>
              {content.body || "You have a scheduled notification."}
            </Text>
          </View>
        </View>

        <View style={styles.cardBottom}>
          <View style={styles.dateContainer}>
            <Ionicons
              name="time-outline"
              size={15}
              color="#8993A4"
            />

            <Text style={styles.dateText}>
              {scheduledDate || "Scheduled reminder"}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => handleCancelReminder(item)}
            activeOpacity={0.7}
          >
            <Ionicons
              name="trash-outline"
              size={16}
              color="#E05B5B"
            />
            <Text style={styles.cancelButtonText}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIcon}>
        <Ionicons
          name="notifications-off-outline"
          size={42}
          color="#36B58A"
        />
      </View>

      <Text style={styles.emptyTitle}>
        No Scheduled Reminders
      </Text>

      <Text style={styles.emptyDescription}>
        Your assignment reminders will appear here
        when they are scheduled.
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F6F8FA"
      />

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.identifier}
        renderItem={renderNotification}
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <View>
                <Text style={styles.headerTitle}>
                  Notifications
                </Text>
                <Text style={styles.headerSubtitle}>
                  Stay updated with your reminders
                </Text>
              </View>

              <View style={styles.headerIcon}>
                <Ionicons
                  name="notifications-outline"
                  size={25}
                  color="#36B58A"
                />
              </View>
            </View>

            <View style={styles.summaryCard}>
              <View style={styles.summaryIcon}>
                <Ionicons
                  name="alarm-outline"
                  size={25}
                  color="#FFFFFF"
                />
              </View>

              <View style={styles.summaryInfo}>
                <Text style={styles.summaryNumber}>
                  {notifications.length}
                </Text>
                <Text style={styles.summaryLabel}>
                  Scheduled Reminders
                </Text>
              </View>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Upcoming Reminders
              </Text>

              <TouchableOpacity
                onPress={handleRefresh}
                style={styles.refreshButton}
              >
                <Ionicons
                  name="refresh-outline"
                  size={19}
                  color="#36B58A"
                />
              </TouchableOpacity>
            </View>
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator
                size="large"
                color="#36B58A"
              />
              <Text style={styles.loadingText}>
                Loading reminders...
              </Text>
            </View>
          ) : (
            renderEmptyState()
          )
        }
        ListFooterComponent={
          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.testButton,
                sendingTest && styles.disabledButton,
              ]}
              onPress={handleTestNotification}
              disabled={sendingTest}
              activeOpacity={0.8}
            >
              {sendingTest ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons
                    name="paper-plane-outline"
                    size={19}
                    color="#FFFFFF"
                  />

                  <Text style={styles.testButtonText}>
                    Send Test Notification
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <Text style={styles.footerNote}>
              UniFlow will remind you about assignments
              before their deadlines.
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={true}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#36B58A"
            colors={["#36B58A"]}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F8FA",
  },

  listContent: {
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 35,
    flexGrow: 1,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },

  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#172B25",
  },

  headerSubtitle: {
    fontSize: 13,
    color: "#8993A4",
    marginTop: 6,
  },

  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#E7F7F0",
    alignItems: "center",
    justifyContent: "center",
  },

  summaryCard: {
    backgroundColor: "#36B58A",
    borderRadius: 20,
    padding: 22,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 28,
  },

  summaryIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },

  summaryInfo: {
    flex: 1,
  },

  summaryNumber: {
    color: "#FFFFFF",
    fontSize: 27,
    fontWeight: "800",
  },

  summaryLabel: {
    color: "#E9FFF6",
    fontSize: 13,
    marginTop: 3,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#172B25",
  },

  refreshButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#E7F7F0",
    alignItems: "center",
    justifyContent: "center",
  },

  notificationCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    padding: 17,
    marginBottom: 13,
    borderWidth: 1,
    borderColor: "#E8EDF2",
  },

  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#E7F7F0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  notificationInfo: {
    flex: 1,
  },

  notificationTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#172B25",
    marginBottom: 6,
  },

  notificationDescription: {
    fontSize: 12,
    lineHeight: 19,
    color: "#8993A4",
  },

  cardBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#F0F2F4",
    marginTop: 15,
    paddingTop: 13,
  },

  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },

  dateText: {
    color: "#8993A4",
    fontSize: 11,
    marginLeft: 6,
  },

  cancelButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 7,
  },

  cancelButtonText: {
    color: "#E05B5B",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 5,
  },

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 45,
    paddingHorizontal: 25,
  },

  emptyIcon: {
    width: 85,
    height: 85,
    borderRadius: 28,
    backgroundColor: "#E7F7F0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#172B25",
    marginBottom: 8,
  },

  emptyDescription: {
    fontSize: 13,
    color: "#8993A4",
    textAlign: "center",
    lineHeight: 21,
  },

  loadingContainer: {
    paddingVertical: 45,
    alignItems: "center",
  },

  loadingText: {
    color: "#8993A4",
    fontSize: 13,
    marginTop: 12,
  },

  footer: {
    marginTop: 15,
    alignItems: "center",
  },

  testButton: {
    backgroundColor: "#36B58A",
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 20,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  disabledButton: {
    opacity: 0.6,
  },

  testButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 9,
  },

  footerNote: {
    fontSize: 11,
    color: "#8993A4",
    textAlign: "center",
    marginTop: 15,
    lineHeight: 18,
  },
});
