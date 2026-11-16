import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";

import {
  scheduleAssignmentReminder,
  getScheduledNotifications,
  cancelNotification,
} from "../../../services/notificationService";

import DateTimePicker from "@react-native-community/datetimepicker";

import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useTasks } from "../../../context/TaskContext";
import { router } from "expo-router";

export default function TasksScreen() {
  const {
    tasks,
    addTask,
    updateTask,
    toggleComplete,
    toggleFavorite,
    deleteTask,
    } = useTasks();

  const [modalVisible, setModalVisible] = useState(false);

  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [dueDate, setDueDate] = useState("");
    const [selectedDueDate, setSelectedDueDate] = useState(new Date());

    const [dueTime, setDueTime] = useState("9:00 AM");
    const [selectedDueTime, setSelectedDueTime] = useState(() => {
    const time = new Date();
    time.setHours(9, 0, 0, 0);
    return time;
    });

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    const [priority, setPriority] = useState("Medium");
  const [editingTask, setEditingTask] = useState(null);
  const completedCount = tasks.filter(
    (task) => task.completed
  ).length;

  const resetForm = () => {
  setTitle("");
  setSubject("");
  setDueDate("");
  setSelectedDueDate(new Date());

  setDueTime("9:00 AM");

  const defaultTime = new Date();
  defaultTime.setHours(9, 0, 0, 0);
  setSelectedDueTime(defaultTime);

  setShowDatePicker(false);
  setShowTimePicker(false);

  setPriority("Medium");
  setEditingTask(null);
};
const formatDateForInput = (dateString) => {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatDateForStorage = (dateString) => {
  const [year, month, day] = dateString.split("-").map(Number);

  const date = new Date(year, month - 1, day);

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const isValidDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
};

const formatTime = (date) => {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
};

const handleDateChange = (event, selectedDate) => {
  if (Platform.OS === "android") {
    setShowDatePicker(false);
  }

  if (selectedDate) {
    setSelectedDueDate(selectedDate);

    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const day = String(selectedDate.getDate()).padStart(2, "0");

    setDueDate(`${year}-${month}-${day}`);
  }
};

const handleTimeChange = (event, selectedTime) => {
  if (Platform.OS === "android") {
    setShowTimePicker(false);
  }

  if (selectedTime) {
    setSelectedDueTime(selectedTime);
    setDueTime(formatTime(selectedTime));
  }
};

const parseStoredTime = (timeString) => {
  const match = timeString?.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);

  const time = new Date();
  time.setSeconds(0, 0);

  if (!match) {
    time.setHours(9, 0, 0, 0);
    return time;
  }

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const period = match[3].toUpperCase();

  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;

  time.setHours(hours, minutes, 0, 0);

  return time;
};

const cancelTaskReminder = async (taskId) => {
  try {
    const scheduledNotifications =
      await getScheduledNotifications();

    const matchingNotifications = scheduledNotifications.filter(
      (notification) =>
        String(notification.content.data?.taskId) === String(taskId)
    );

    for (const notification of matchingNotifications) {
      await cancelNotification(notification.identifier);
    }
  } catch (error) {
    console.error("Could not cancel assignment reminder:", error);
  }
};

const openEditModal = (task) => {
  setEditingTask(task);
  setTitle(task.title);
  setSubject(task.subject);

  const formattedDate = formatDateForInput(task.dueDate);
  setDueDate(formattedDate);

  if (formattedDate) {
    const [year, month, day] = formattedDate.split("-").map(Number);
    setSelectedDueDate(new Date(year, month - 1, day));
  } else {
    setSelectedDueDate(new Date());
  }

  const existingTime = task.dueTime || "9:00 AM";
  setDueTime(existingTime);
  setSelectedDueTime(parseStoredTime(existingTime));

  setShowDatePicker(false);
  setShowTimePicker(false);

  setPriority(task.priority);
  setModalVisible(true);
};
const handleSaveTask = async () => {
  if (!title.trim() || !subject.trim() || !dueDate.trim()) {
    Alert.alert(
      "Missing Information",
      "Please fill in all assignment details."
    );
    return;
  }

  if (!isValidDate(dueDate.trim())) {
    Alert.alert(
      "Invalid Date",
      "Enter a valid date in YYYY-MM-DD format."
    );
    return;
  }

  const taskData = {
  title: title.trim(),
  subject: subject.trim(),
  dueDate: formatDateForStorage(dueDate.trim()),
  dueTime,
  priority,
 };
  if (editingTask) {
    const taskId = editingTask.id;

    // Cancel the previous reminder first.
    await cancelTaskReminder(taskId);

    // Update the existing assignment.
    updateTask(taskId, taskData);

    // Schedule a reminder using the updated details.
    const updatedTask = {
      ...editingTask,
      ...taskData,
    };

    const notificationId =
      await scheduleAssignmentReminder(updatedTask);

    resetForm();
    setModalVisible(false);

    Alert.alert(
      "Assignment Updated! 🎉",
      notificationId
        ? "Your assignment and its new reminder have been updated."
        : "Your assignment was updated, but a new reminder could not be scheduled."
    );
  } else {
    const newTask = addTask(taskData);

    resetForm();
    setModalVisible(false);

    const notificationId =
      await scheduleAssignmentReminder(newTask);

    Alert.alert(
      "Assignment Added! 🎉",
      notificationId
        ? "Your assignment was added and its reminder was scheduled."
        : "Your assignment was added, but a reminder could not be scheduled."
    );
  }
};
const handleDeleteTask = (task) => {
  Alert.alert(
    "Delete Assignment",
    `Are you sure you want to delete "${task.title}"?`,
    [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await cancelTaskReminder(task.id);
          deleteTask(task.id);

          Alert.alert(
            "Deleted",
            "The assignment has been deleted successfully."
          );
        },
      },
    ]
  );
};


const renderRightActions = (task) => (
  <View style={styles.swipeActions}>
    <Pressable
      style={styles.editAction}
      onPress={() => openEditModal(task)}
    >
      <Ionicons name="create-outline" size={22} color="#FFFFFF" />
      <Text style={styles.actionText}>Edit</Text>
    </Pressable>

    <Pressable
      style={styles.deleteAction}
      onPress={() => handleDeleteTask(task)}
    >
      <Ionicons name="trash-outline" size={22} color="#FFFFFF" />
      <Text style={styles.actionText}>Delete</Text>
    </Pressable>
  </View>
);

  
const renderTask = ({ item }) => (
  <Swipeable
    renderRightActions={() => renderRightActions(item)}
    overshootRight={false}
    rightThreshold={40}
  >
    <View style={styles.taskCard}>
      {/* COMPLETE BUTTON */}
      <Pressable
        style={styles.checkButton}
        onPress={() => toggleComplete(item.id)}
      >
        <Ionicons
          name={
            item.completed
              ? "checkmark-circle"
              : "ellipse-outline"
          }
          size={25}
          color={item.completed ? "#36B58A" : "#8993A4"}
        />
      </Pressable>

      {/* TASK INFORMATION */}
      <Pressable
        style={styles.taskInfo}
        onPress={() => router.push(`/tasks/${item.id}`)}
      >
        <Text
          style={[
            styles.taskTitle,
            item.completed && styles.completedText,
          ]}
        >
          {item.title}
        </Text>

        <Text style={styles.subject}>
          {item.subject}
        </Text>

        <Text style={styles.deadline}>
          Due: {item.dueDate}
        </Text>

        <View style={styles.statusRow}>
          <Text
            style={[
              styles.priority,
              item.priority === "High" && styles.highPriority,
              item.priority === "Medium" && styles.mediumPriority,
              item.priority === "Low" && styles.lowPriority,
            ]}
          >
            {item.priority} Priority
          </Text>

          <Text style={styles.status}>
            {item.completed ? "Completed" : "Pending"}
          </Text>
        </View>
      </Pressable>

      {/* FAVORITE BUTTON */}
      <Pressable
        style={styles.favoriteButton}
        onPress={() => toggleFavorite(item.id)}
      >
        <Ionicons
          name={
            item.isFavorite
              ? "bookmark"
              : "bookmark-outline"
          }
          size={23}
          color={item.isFavorite ? "#36B58A" : "#8993A4"}
        />
      </Pressable>
    </View>
  </Swipeable>
);


return (
  <View style={styles.container}>
    <FlatList
      style={{ flex: 1 }}
      data={tasks}
      renderItem={renderTask}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 40 }}

      ListHeaderComponent={
        <View>
          {/* HEADER */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>My Tasks</Text>
              <Text style={styles.subtitle}>
                Stay organized and achieve your goals.
              </Text>
            </View>

            <Pressable
              style={styles.addButton}
              onPress={() => {
                resetForm();
                setModalVisible(true);
              }}
            >
              <Ionicons name="add" size={26} color="#FFFFFF" />
            </Pressable>
          </View>

          {/* ACADEMIC PROGRESS */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>
              Academic Progress
            </Text>

            <Text style={styles.summaryNumber}>
              {completedCount} / {tasks.length}
            </Text>

            <Text style={styles.summarySubtitle}>
              Tasks completed
            </Text>

            <View style={styles.progressBackground}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${
                      tasks.length
                        ? (completedCount / tasks.length) * 100
                        : 0
                    }%`,
                  },
                ]}
              />
            </View>
          </View>

          {/* ASSIGNMENT HEADING */}
          <Text style={styles.sectionTitle}>
            All Assignments
          </Text>
        </View>
      }

      ListEmptyComponent={
        <Text style={styles.emptyText}>
          No assignments available. Add your first task!
        </Text>
      }
    />

    {/* KEEP YOUR EXISTING ADD / EDIT ASSIGNMENT MODAL BELOW */}


    {/* ADD / EDIT ASSIGNMENT MODAL */}
    <Modal
      visible={modalVisible}
      transparent
      animationType="slide"
      onRequestClose={() => {
        resetForm();
        setModalVisible(false);
      }}
    >
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>
                {editingTask ? "Edit Assignment" : "New Assignment"}
              </Text>

              <Text style={styles.modalSubtitle}>
                {editingTask
                  ? "Update your assignment details."
                  : "Add a new academic task."}
              </Text>
            </View>

            <Pressable
              onPress={() => {
                resetForm();
                setModalVisible(false);
              }}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={23} color="#101D32" />
            </Pressable>
          </View>

          <Text style={styles.inputLabel}>Assignment Title</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter assignment title"
            placeholderTextColor="#8993A4"
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.inputLabel}>Subject</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter subject name"
            placeholderTextColor="#8993A4"
            value={subject}
            onChangeText={setSubject}
          />

          <Text style={styles.inputLabel}>Deadline Date</Text>

<Pressable
  style={styles.pickerButton}
  onPress={() => {
    setShowDatePicker(!showDatePicker);
    setShowTimePicker(false);
  }}
>
  <Ionicons name="calendar-outline" size={20} color="#36B58A" />

  <Text style={styles.pickerButtonText}>
    {selectedDueDate.toLocaleDateString("en-US", {
      weekday: "short",
      day: "numeric",
      month: "long",
      year: "numeric",
    })}
  </Text>

  <Ionicons name="chevron-down" size={18} color="#8993A4" />
</Pressable>

{showDatePicker && (
  <View style={styles.pickerContainer}>
    <DateTimePicker
      value={selectedDueDate}
      mode="date"
      display={Platform.OS === "ios" ? "spinner" : "default"}
      onChange={handleDateChange}
      minimumDate={new Date(2020, 0, 1)}
      accentColor="#36B58A"
      textColor="#172B25"
      themeVariant="light"
    />

    {Platform.OS === "ios" && (
      <Pressable
        style={styles.pickerDoneButton}
        onPress={() => setShowDatePicker(false)}
      >
        <Text style={styles.pickerDoneText}>Done</Text>
      </Pressable>
    )}
  </View>
)}

<Text style={styles.inputLabel}>Deadline Time</Text>

<Pressable
  style={styles.pickerButton}
  onPress={() => {
    setShowTimePicker(!showTimePicker);
    setShowDatePicker(false);
  }}
>
  <Ionicons name="time-outline" size={20} color="#36B58A" />

  <Text style={styles.pickerButtonText}>
    {dueTime}
  </Text>

  <Ionicons name="chevron-down" size={18} color="#8993A4" />
</Pressable>

{showTimePicker && (
  <View style={styles.pickerContainer}>
    <DateTimePicker
      value={selectedDueTime}
      mode="time"
      display={Platform.OS === "ios" ? "spinner" : "default"}
      onChange={handleTimeChange}
      is24Hour={false}
      accentColor="#36B58A"
      textColor="#172B25"
      themeVariant="light"
    />

    {Platform.OS === "ios" && (
      <Pressable
        style={styles.pickerDoneButton}
        onPress={() => setShowTimePicker(false)}
      >
        <Text style={styles.pickerDoneText}>Done</Text>
      </Pressable>
    )}
  </View>
)}

          <Text style={styles.inputLabel}>Priority Level</Text>

          <View style={styles.priorityContainer}>
            {["Low", "Medium", "High"].map((level) => (
              <Pressable
                key={level}
                onPress={() => setPriority(level)}
                style={[
                  styles.priorityOption,
                  priority === level && styles.selectedPriority,
                ]}
              >
                <Text
                  style={[
                    styles.priorityOptionText,
                    priority === level && styles.selectedPriorityText,
                  ]}
                >
                  {level}
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            style={styles.saveButton}
            onPress={handleSaveTask}
          >
            <Ionicons
              name={editingTask ? "save-outline" : "add-circle-outline"}
              size={20}
              color="#FFFFFF"
            />

            <Text style={styles.saveButtonText}>
              {editingTask ? "Save Changes" : "Add Assignment"}
            </Text>
          </Pressable>

          <Pressable
            style={styles.cancelButton}
            onPress={() => {
              resetForm();
              setModalVisible(false);
            }}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
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
    paddingHorizontal: 20,
    paddingTop: 65,
  },
  swipeActions: {
    flexDirection: "row",
    marginBottom: 12,
    marginLeft: 8,
    flex: 1,
 },

 editAction: {
  width: 75,
  backgroundColor: "#3B82F6",
  justifyContent: "center",
  alignItems: "center",
  borderTopLeftRadius: 15,
  borderBottomLeftRadius: 15,
},

deleteAction: {
  width: 75,
  backgroundColor: "#EF4444",
  justifyContent: "center",
  alignItems: "center",
  borderTopRightRadius: 15,
  borderBottomRightRadius: 15,
},

actionText: {
  color: "#FFFFFF",
  fontSize: 11,
  fontWeight: "bold",
  marginTop: 5,
},
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 22,
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

  addButton: {
    backgroundColor: "#36B58A",
    width: 45,
    height: 45,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },

  summaryCard: {
    backgroundColor: "#101D32",
    padding: 20,
    borderRadius: 18,
    marginBottom: 25,
  },

  summaryTitle: {
    color: "#B9F5D0",
    fontSize: 14,
    fontWeight: "600",
  },

  summaryNumber: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "bold",
    marginTop: 12,
  },

  summarySubtitle: {
    color: "#B8C3D3",
    fontSize: 12,
    marginTop: 3,
  },

  progressBackground: {
    height: 7,
    backgroundColor: "#34465B",
    borderRadius: 10,
    marginTop: 17,
    overflow: "hidden",
  },

  progressFill: {
    height: 7,
    backgroundColor: "#36B58A",
    borderRadius: 10,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#101D32",
    marginBottom: 14,
  },

  taskCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 14,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },

  checkButton: {
    paddingRight: 10,
  },

  taskInfo: {
    flex: 1,
  },

  taskTitle: {
    color: "#101D32",
    fontSize: 13,
    fontWeight: "bold",
  },

  completedText: {
    textDecorationLine: "line-through",
    color: "#8993A4",
  },

  subject: {
    color: "#778397",
    fontSize: 11,
    marginTop: 5,
  },

  deadline: {
    color: "#D38C43",
    fontSize: 11,
    marginTop: 5,
  },

  statusRow: {
    flexDirection: "row",
    marginTop: 9,
    alignItems: "center",
  },

  priority: {
    fontSize: 10,
    fontWeight: "bold",
    padding: 5,
    borderRadius: 6,
    overflow: "hidden",
  },

  highPriority: {
    color: "#C75C50",
    backgroundColor: "#FCEBE8",
  },

  mediumPriority: {
    color: "#B47A2D",
    backgroundColor: "#FFF3DC",
  },

  lowPriority: {
    color: "#398B68",
    backgroundColor: "#E6F5EC",
  },

  status: {
    fontSize: 10,
    color: "#778397",
    marginLeft: 8,
  },

  favoriteButton: {
    padding: 7,
  },

  emptyText: {
    textAlign: "center",
    color: "#8993A4",
    marginTop: 30,
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
    color: "#778397",
    fontSize: 12,
    marginTop: 5,
  },

  closeButton: {
    backgroundColor: "#F0F3F7",
    width: 35,
    height: 35,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  inputLabel: {
    color: "#101D32",
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 8,
    marginTop: 12,
  },

  input: {
    backgroundColor: "#F7F9FC",
    borderWidth: 1,
    borderColor: "#E5EAF0",
    borderRadius: 11,
    padding: 13,
    fontSize: 13,
    color: "#101D32",
  },


  pickerButton: {
  backgroundColor: "#F7F9FC",
  borderWidth: 1,
  borderColor: "#E5EAF0",
  borderRadius: 11,
  padding: 13,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 5,
},

pickerButtonText: {
  flex: 1,
  marginLeft: 12,
  color: "#101D32",
  fontSize: 13,
  fontWeight: "500",
},

pickerContainer: {
  backgroundColor: "#F7F9FC",
  borderRadius: 12,
  marginTop: 8,
  marginBottom: 12,
  padding: 8,
  alignItems: "center",
},

pickerDoneButton: {
  alignSelf: "flex-end",
  backgroundColor: "#36B58A",
  paddingHorizontal: 18,
  paddingVertical: 8,
  borderRadius: 8,
  marginTop: 8,
},

pickerDoneText: {
  color: "#FFFFFF",
  fontWeight: "bold",
  fontSize: 12,
},

  priorityContainer: {
    flexDirection: "row",
    gap: 10,
  },

  priorityOption: {
    flex: 1,
    padding: 12,
    backgroundColor: "#F0F3F7",
    borderRadius: 10,
    alignItems: "center",
  },

  selectedPriority: {
    backgroundColor: "#36B58A",
  },

  priorityOptionText: {
    fontSize: 12,
    color: "#778397",
    fontWeight: "600",
  },

  selectedPriorityText: {
    color: "#FFFFFF",
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
