
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// Request notification permission
export async function requestNotificationPermission() {
  try {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync(
        "assignment-reminders",
        {
          name: "Assignment Reminders",
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
        }
      );
    }

    const existingPermission =
      await Notifications.getPermissionsAsync();

    let finalStatus = existingPermission.status;

    if (finalStatus !== "granted") {
      const requestedPermission =
        await Notifications.requestPermissionsAsync();

      finalStatus = requestedPermission.status;
    }

    return finalStatus === "granted";
  } catch (error) {
    console.error("Notification permission error:", error);
    return false;
  }
}
function parseAssignmentDueDate(value) {
  if (!value) return null;

  // Handle YYYY-MM-DD
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  // Handle dates such as November 25, 2026
  const namedMatch = /^([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})$/.exec(value);

  if (namedMatch) {
    const [, monthName, day, year] = namedMatch;

    const months = [
      "january", "february", "march", "april",
      "may", "june", "july", "august",
      "september", "october", "november", "december",
    ];

    const month = months.indexOf(monthName.toLowerCase());

    if (month !== -1) {
      return new Date(Number(year), month, Number(day));
    }
  }

  return null;
}
// Schedule an assignment reminder one day before the deadline
export async function scheduleAssignmentReminder(task) {
  try {
    const hasPermission = await requestNotificationPermission();

    if (!hasPermission) {
      return null;
    }

    const dueDate = parseAssignmentDueDate(task.dueDate);

    if (!dueDate || Number.isNaN(dueDate.getTime())) {
        throw new Error(
            `Invalid assignment due date: ${task.dueDate}`
        );
}

    const reminderDate = new Date(dueDate);

    reminderDate.setDate(reminderDate.getDate() - 1);
    reminderDate.setHours(9, 0, 0, 0);

    // Don't schedule notifications in the past
    if (reminderDate.getTime() <= Date.now()) {
      return null;
    }

    const notificationId =
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Assignment Reminder 📚",
          body: `${task.title} is due tomorrow. Don't forget to submit it!`,
          data: {
            taskId: task.id,
            type: "assignment-reminder",
          },
          sound: true,
        },

        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: reminderDate,
          ...(Platform.OS === "android" && {
            channelId: "assignment-reminders",
          }),
        },
      });

    return notificationId;
  } catch (error) {
    console.error("Could not schedule reminder:", error);
    return null;
  }
}

// Schedule a test notification after five seconds
export async function scheduleTestNotification() {
  const hasPermission = await requestNotificationPermission();

  if (!hasPermission) {
    return null;
  }

  return Notifications.scheduleNotificationAsync({
    content: {
      title: "Welcome to UniFlow! 🎓",
      body: "Your local notification system is working successfully.",
      data: {
        type: "test-notification",
      },
      sound: true,
    },

    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 5,
      ...(Platform.OS === "android" && {
        channelId: "assignment-reminders",
      }),
    },
  });
}

// Get all scheduled notifications
export async function getScheduledNotifications() {
  return Notifications.getAllScheduledNotificationsAsync();
}

// Cancel a scheduled notification
export async function cancelNotification(notificationId) {
  return Notifications.cancelScheduledNotificationAsync(
    notificationId
  );
}
