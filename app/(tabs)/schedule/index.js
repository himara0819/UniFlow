
import React, { useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useTasks } from "../../../context/TaskContext";

const GREEN = "#36B58A";
const EVENTS_STORAGE_KEY = "uniflow_schedule_events";

const EVENT_TYPES = [
  { label: "Lecture", value: "Lecture", icon: "book-outline" },
  { label: "Class", value: "Class", icon: "school-outline" },
  { label: "Exam", value: "Exam", icon: "document-text-outline" },
  { label: "Other", value: "Other", icon: "calendar-outline" },
];

const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseDate(value) {
  if (!value) return null;

  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

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

function getMonday(date) {
  const result = new Date(date);
  const day = result.getDay();
  const difference = day === 0 ? -6 : 1 - day;

  result.setDate(result.getDate() + difference);
  result.setHours(0, 0, 0, 0);

  return result;
}

function displayDate(date) {
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
  });
}

export default function ScheduleScreen() {
  const { tasks = [] } = useTasks();

  const [events, setEvents] = useState([]);
  const [eventsLoaded, setEventsLoaded] = useState(false);
  useEffect(() => {
  const loadEvents = async () => {
    try {
      const savedEvents = await AsyncStorage.getItem(
        EVENTS_STORAGE_KEY
      );

      if (savedEvents) {
        const parsedEvents = JSON.parse(savedEvents);

        if (Array.isArray(parsedEvents)) {
          setEvents(parsedEvents);
        }
      }
    } catch (error) {
      console.error("Error loading schedule events:", error);
    } finally {
      setEventsLoaded(true);
    }
  };

  loadEvents();
}, []);

useEffect(() => {
  if (!eventsLoaded) {
    return;
  }

  const saveEvents = async () => {
    try {
      await AsyncStorage.setItem(
        EVENTS_STORAGE_KEY,
        JSON.stringify(events)
      );
    } catch (error) {
      console.error("Error saving schedule events:", error);
    }
  };

  saveEvents();
}, [events, eventsLoaded]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [modalVisible, setModalVisible] = useState(false);

  const [title, setTitle] = useState("");
  const [eventType, setEventType] = useState("Lecture");
  const [eventDate, setEventDate] = useState(formatDate(new Date()));
  const [startTime, setStartTime] = useState("09:00 AM");
  const [endTime, setEndTime] = useState("10:00 AM");
  const [location, setLocation] = useState("");

  const [showDatePicker, setShowDatePicker] = useState(false);
    const [showStartTimePicker, setShowStartTimePicker] = useState(false);
    const [showEndTimePicker, setShowEndTimePicker] = useState(false);

    const [selectedEventDate, setSelectedEventDate] = useState(new Date());
    const [selectedStartTime, setSelectedStartTime] = useState(() => {
    const date = new Date();
    date.setHours(9, 0, 0, 0);
    return date;
    });
    const [selectedEndTime, setSelectedEndTime] = useState(() => {
    const date = new Date();
    date.setHours(10, 0, 0, 0);
    return date;
    });

  const weekStart = useMemo(
    () => getMonday(selectedDate),
    [selectedDate]
  );

  const weekDays = useMemo(() => {
    return WEEKDAYS.map((name, index) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + index);

      return {
        name,
        date,
        key: formatDate(date),
      };
    });
  }, [weekStart]);

  const selectedDateString = formatDate(selectedDate);

  const selectedDayEvents = events
  .filter((event) => event.date === selectedDateString)
  .sort((a, b) => a.startTime.localeCompare(b.startTime));

const selectedDayTasks = tasks.filter((task) => {
  const taskDate = parseDate(task.dueDate);

  return (
    taskDate &&
    formatDate(taskDate) === selectedDateString
  );
});
  const upcomingEvents = events
    .filter((event) => {
      const date = parseDate(event.date);
      return date && date >= new Date(new Date().setHours(0, 0, 0, 0));
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  const assignmentDeadlines = tasks
    .filter((task) => {
      const date = parseDate(task.dueDate);
      return date && !task.completed &&
        date >= new Date(new Date().setHours(0, 0, 0, 0));
    })
    .sort((a, b) => {
      return parseDate(a.dueDate) - parseDate(b.dueDate);
    });


    const formatTime = (date) => {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const handleDateChange = (event, date) => {
  if (Platform.OS === "android") {
    setShowDatePicker(false);
  }

  if (date) {
    setSelectedEventDate(date);
    setEventDate(formatDate(date));
  }
};

const handleStartTimeChange = (event, date) => {
  if (Platform.OS === "android") {
    setShowStartTimePicker(false);
  }

  if (date) {
    setSelectedStartTime(date);
    setStartTime(formatTime(date));
  }
};

const handleEndTimeChange = (event, date) => {
  if (Platform.OS === "android") {
    setShowEndTimePicker(false);
  }

  if (date) {
    setSelectedEndTime(date);
    setEndTime(formatTime(date));
  }
};

  const resetForm = () => {
  const defaultDate = new Date();

  const defaultStart = new Date();
  defaultStart.setHours(9, 0, 0, 0);

  const defaultEnd = new Date();
  defaultEnd.setHours(10, 0, 0, 0);

  setTitle("");
  setEventType("Lecture");
  setEventDate(formatDate(selectedDate));
  setSelectedEventDate(selectedDate);
  setStartTime("09:00 AM");
  setEndTime("10:00 AM");
  setSelectedStartTime(defaultStart);
  setSelectedEndTime(defaultEnd);
  setLocation("");

  setShowDatePicker(false);
  setShowStartTimePicker(false);
  setShowEndTimePicker(false);
};

  const openAddModal = () => {
    resetForm();
    setModalVisible(true);
  };

  
const handleAddEvent = () => {
  if (!title.trim()) {
    Alert.alert("Missing Information", "Please enter an event title.");
    return;
  }

  const date = selectedEventDate;

  if (!date || Number.isNaN(date.getTime())) {
    Alert.alert("Invalid Date", "Please select a valid event date.");
    return;
  }

  const startMinutes =
    selectedStartTime.getHours() * 60 +
    selectedStartTime.getMinutes();

  const endMinutes =
    selectedEndTime.getHours() * 60 +
    selectedEndTime.getMinutes();

  if (endMinutes <= startMinutes) {
    Alert.alert(
      "Invalid Time",
      "The end time must be later than the start time."
    );
    return;
  }

  const newEvent = {
    id: Date.now().toString(),
    title: title.trim(),
    type: eventType,
    date: formatDate(date),
    startTime: formatTime(selectedStartTime),
    endTime: formatTime(selectedEndTime),
    location: location.trim(),
  };

  setEvents((previous) => [...previous, newEvent]);
  setSelectedDate(date);
  setModalVisible(false);
  resetForm();

  Alert.alert(
    "Event Added",
    "Your event has been added to the schedule."
  );
};

const handleDeleteEvent = (eventId) => {
  Alert.alert(
    "Delete Event",
    "Are you sure you want to delete this event?",
    [
      { text: "Keep", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          setEvents((previous) =>
            previous.filter((event) => event.id !== eventId)
          );
        },
      },
    ]
  );
};


  const changeWeek = (direction) => {
    const nextDate = new Date(selectedDate);
    nextDate.setDate(nextDate.getDate() + direction * 7);
    setSelectedDate(nextDate);
  };

  const getEventIcon = (type) => {
    const match = EVENT_TYPES.find((item) => item.value === type);
    return match?.icon || "calendar-outline";
  };

  const getEventColor = (type) => {
    if (type === "Exam") return "#E69A42";
    if (type === "Class") return "#5687D8";
    if (type === "Other") return "#9B7ACB";
    return GREEN;
  };

  const renderEvent = (event) => (
    <View key={event.id} style={styles.eventCard}>
      <View
        style={[
          styles.eventColorLine,
          { backgroundColor: getEventColor(event.type) },
        ]}
      />

      <View style={styles.eventContent}>
        <View style={styles.eventTop}>
          <Text style={styles.eventTitle}>{event.title}</Text>

          <TouchableOpacity
            onPress={() => handleDeleteEvent(event.id)}
            style={styles.deleteIcon}
          >
            <Ionicons
              name="trash-outline"
              size={17}
              color="#E05B5B"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.eventDetail}>
          <Ionicons
            name="time-outline"
            size={14}
            color="#8993A4"
          />
          <Text style={styles.eventDetailText}>
            {event.startTime}
            {event.endTime ? ` - ${event.endTime}` : ""}
          </Text>
        </View>

        {event.location ? (
          <View style={styles.eventDetail}>
            <Ionicons
              name="location-outline"
              size={14}
              color="#8993A4"
            />
            <Text style={styles.eventDetailText}>
              {event.location}
            </Text>
          </View>
        ) : null}

        <View
          style={[
            styles.eventTypeBadge,
            { backgroundColor: `${getEventColor(event.type)}18` },
          ]}
        >
          <Text
            style={[
              styles.eventTypeText,
              { color: getEventColor(event.type) },
            ]}
          >
            {event.type}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F6F8FA" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>My Schedule</Text>
            <Text style={styles.headerSubtitle}>
              Organize your academic life
            </Text>
          </View>

          <TouchableOpacity
            style={styles.addButton}
            onPress={openAddModal}
          >
            <Ionicons name="add" size={25} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Weekly timetable */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Weekly Timetable</Text>
            <Text style={styles.sectionSubtitle}>
              Your lectures and academic activities
            </Text>
          </View>
        </View>

        <View style={styles.weekCard}>
          <View style={styles.weekNavigation}>
            <TouchableOpacity onPress={() => changeWeek(-1)}>
              <Ionicons
                name="chevron-back"
                size={21}
                color="#172B25"
              />
            </TouchableOpacity>

            <Text style={styles.weekTitle}>
              {weekStart.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </Text>

            <TouchableOpacity onPress={() => changeWeek(1)}>
              <Ionicons
                name="chevron-forward"
                size={21}
                color="#172B25"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.daysContainer}>
            {weekDays.map((day) => {
              const isSelected =
                day.key === selectedDateString;

              const isToday =
                day.key === formatDate(new Date());

              return (
                <TouchableOpacity
                  key={day.key}
                  style={[
                    styles.dayButton,
                    isSelected && styles.selectedDayButton,
                  ]}
                  onPress={() => setSelectedDate(day.date)}
                >
                  <Text
                    style={[
                      styles.dayName,
                      isSelected && styles.selectedDayText,
                    ]}
                  >
                    {day.name.substring(0, 3)}
                  </Text>

                  <Text
                    style={[
                      styles.dayNumber,
                      isSelected && styles.selectedDayText,
                    ]}
                  >
                    {day.date.getDate()}
                  </Text>

                  {(() => {
  const hasEvents = events.some(
    (event) => event.date === day.key
  );

  const hasTasks = tasks.some((task) => {
    const taskDate = parseDate(task.dueDate);

    return taskDate && formatDate(taskDate) === day.key;
  });

  const hasScheduleItems = hasEvents || hasTasks;

  return (isToday || hasScheduleItems) ? (
    <View
      style={[
        styles.todayDot,
        isSelected && styles.selectedTodayDot,
        !isToday && styles.eventDot,
      ]}
    />
  ) : null;
})()}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Selected day schedule */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              Daily Schedule
            </Text>
            <Text style={styles.sectionSubtitle}>
              {selectedDate.toLocaleDateString("en-US", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </Text>
          </View>
        </View>

        {selectedDayEvents.length > 0 || selectedDayTasks.length > 0 ? (
  <>
    {selectedDayEvents.map(renderEvent)}

    {selectedDayTasks.map((task) => (
      <View key={`task-${task.id}`} style={styles.eventCard}>
        <View style={styles.eventContent}>
          <View style={styles.eventHeader}>
            <Text style={styles.eventTitle}>{task.title}</Text>
            <Text style={styles.eventType}>Assignment</Text>
          </View>

          <Text style={styles.eventSubtitle}>{task.subject}</Text>

          <View style={styles.eventDetails}>
            <Text style={styles.eventDetailText}>
              <Ionicons name="calendar-outline" size={14} /> Due today
            </Text>

            <Text style={styles.eventDetailText}>
              {task.completed ? "Completed" : `${task.priority} Priority`}
            </Text>
          </View>
        </View>
      </View>
    ))}
  </>
) : (
  <View style={styles.emptyCard}>
    {/* Keep your existing empty-state content here unchanged */}
  </View>
)}
          <View style={styles.emptyCard}>
            <Ionicons
              name="calendar-clear-outline"
              size={35}
              color={GREEN}
            />
            <Text style={styles.emptyTitle}>
              No events scheduled
            </Text>
            <Text style={styles.emptyDescription}>
              Add a lecture, class or other academic activity.
            </Text>

            <TouchableOpacity
              style={styles.emptyAddButton}
              onPress={openAddModal}
            >
              <Ionicons name="add" size={17} color="#FFFFFF" />
              <Text style={styles.emptyAddText}>Add Event</Text>
            </TouchableOpacity>
          </View>
        

        {/* Upcoming events */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              Upcoming Events
            </Text>
            <Text style={styles.sectionSubtitle}>
              Your scheduled academic activities
            </Text>
          </View>
        </View>

        {upcomingEvents.length > 0 ? (
          upcomingEvents.slice(0, 5).map((event) => (
            <View key={`upcoming-${event.id}`} style={styles.upcomingCard}>
              <View style={styles.upcomingDate}>
                <Text style={styles.upcomingDateDay}>
                  {parseDate(event.date).getDate()}
                </Text>
                <Text style={styles.upcomingDateMonth}>
                  {parseDate(event.date).toLocaleDateString("en-US", {
                    month: "short",
                  })}
                </Text>
              </View>

              <View style={styles.upcomingInfo}>
                <Text style={styles.upcomingTitle}>
                  {event.title}
                </Text>
                <Text style={styles.upcomingSubtitle}>
                  {event.type} · {event.startTime}
                </Text>
              </View>

              <Ionicons
                name={getEventIcon(event.type)}
                size={21}
                color={getEventColor(event.type)}
              />
            </View>
          ))
        ) : (
          <Text style={styles.noItemsText}>
            No upcoming events. Add your academic activities above.
          </Text>
        )}

        {/* Assignment deadlines */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              Assignment Deadlines
            </Text>
            <Text style={styles.sectionSubtitle}>
              Deadlines from your Tasks section
            </Text>
          </View>

          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>
              {assignmentDeadlines.length}
            </Text>
          </View>
        </View>

        {assignmentDeadlines.length > 0 ? (
          assignmentDeadlines.slice(0, 5).map((task) => {
            const date = parseDate(task.dueDate);

            return (
              <View
                key={`task-${task.id}`}
                style={styles.deadlineCard}
              >
                <View style={styles.deadlineIcon}>
                  <Ionicons
                    name="document-text-outline"
                    size={21}
                    color="#E69A42"
                  />
                </View>

                <View style={styles.deadlineInfo}>
                  <Text style={styles.deadlineTitle}>
                    {task.title}
                  </Text>

                  <Text style={styles.deadlineSubtitle}>
                    {task.subject || "Assignment"} · Due {displayDate(date)}
                  </Text>
                </View>

                <Ionicons
                  name="alert-circle-outline"
                  size={19}
                  color="#E69A42"
                />
              </View>
            );
          })
        ) : (
          <View style={styles.smallEmptyCard}>
            <Ionicons
              name="checkmark-circle-outline"
              size={22}
              color={GREEN}
            />
            <Text style={styles.noItemsText}>
              No upcoming assignment deadlines.
            </Text>
          </View>
        )}

        {/* Upcoming examinations */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              Examinations
            </Text>
            <Text style={styles.sectionSubtitle}>
              Your scheduled examination dates
            </Text>
          </View>
        </View>

        {upcomingEvents.filter((event) => event.type === "Exam").length > 0 ? (
          upcomingEvents
            .filter((event) => event.type === "Exam")
            .slice(0, 5)
            .map((event) => (
              <View key={`exam-${event.id}`} style={styles.examCard}>
                <View style={styles.examIcon}>
                  <Ionicons
                    name="school-outline"
                    size={22}
                    color="#E69A42"
                  />
                </View>

                <View style={styles.examInfo}>
                  <Text style={styles.examTitle}>
                    {event.title}
                  </Text>
                  <Text style={styles.examSubtitle}>
                    {displayDate(parseDate(event.date))} · {event.startTime}
                  </Text>
                </View>
              </View>
            ))
        ) : (
          <Text style={styles.noItemsText}>
            No examinations scheduled yet.
          </Text>
        )}
      </ScrollView>

     
    {/* Add event modal */}
    <Modal
    visible={modalVisible}
    animationType="slide"
    transparent
    onRequestClose={() => setModalVisible(false)}
    >
  <KeyboardAvoidingView
    style={styles.modalOverlay}
    behavior={Platform.OS === "ios" ? "padding" : "height"}
  >
    <View style={styles.modalContainer}>
      <ScrollView
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={styles.modalScrollContent}
      >
        {/* Modal Header */}
        <View style={styles.modalHeader}>
          <View>
            <Text style={styles.modalTitle}>
              Add Schedule Event
            </Text>
            <Text style={styles.modalSubtitle}>
              Add an academic activity
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => setModalVisible(false)}
            style={styles.closeButton}
          >
            <Ionicons
              name="close"
              size={23}
              color="#172B25"
            />
          </TouchableOpacity>
        </View>

        {/* Event Title */}
        <Text style={styles.inputLabel}>Event Title</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Mathematics Lecture"
          placeholderTextColor="#A0A8B3"
          value={title}
          onChangeText={setTitle}
        />

        {/* Event Type */}
        <Text style={styles.inputLabel}>Event Type</Text>
        <View style={styles.typeContainer}>
          {EVENT_TYPES.map((type) => (
            <TouchableOpacity
              key={type.value}
              style={[
                styles.typeButton,
                eventType === type.value &&
                  styles.selectedTypeButton,
              ]}
              onPress={() => setEventType(type.value)}
            >
              <Ionicons
                name={type.icon}
                size={17}
                color={
                  eventType === type.value
                    ? "#FFFFFF"
                    : GREEN
                }
              />
              <Text
                style={[
                  styles.typeButtonText,
                  eventType === type.value &&
                    styles.selectedTypeText,
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Event Date */}
        <Text style={styles.inputLabel}>Event Date</Text>

        <TouchableOpacity
          style={styles.pickerButton}
          onPress={() => {
            setShowDatePicker(!showDatePicker);
            setShowStartTimePicker(false);
            setShowEndTimePicker(false);
          }}
        >
          <Ionicons
            name="calendar-outline"
            size={20}
            color={GREEN}
          />
          <Text style={styles.pickerButtonText}>
            {selectedEventDate.toLocaleDateString("en-US", {
              weekday: "short",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </Text>
          <Ionicons
            name="chevron-down"
            size={18}
            color="#8993A4"
          />
        </TouchableOpacity>

        {showDatePicker && (
          <View style={styles.pickerContainer}>
            <DateTimePicker
                value={selectedEventDate}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={handleDateChange}
                minimumDate={new Date(2020, 0, 1)}
                accentColor={GREEN}
                textColor="#172B25"
                themeVariant="light"
                />

            {Platform.OS === "ios" && (
              <TouchableOpacity
                style={styles.pickerDoneButton}
                onPress={() => setShowDatePicker(false)}
              >
                <Text style={styles.pickerDoneText}>Done</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Start Time */}
        <Text style={styles.inputLabel}>Start Time</Text>

        <TouchableOpacity
          style={styles.pickerButton}
          onPress={() => {
            setShowStartTimePicker(!showStartTimePicker);
            setShowDatePicker(false);
            setShowEndTimePicker(false);
          }}
        >
          <Ionicons
            name="time-outline"
            size={20}
            color={GREEN}
          />
          <Text style={styles.pickerButtonText}>
            {startTime}
          </Text>
          <Ionicons
            name="chevron-down"
            size={18}
            color="#8993A4"
          />
        </TouchableOpacity>

        {showStartTimePicker && (
          <View style={styles.pickerContainer}>
            <DateTimePicker
              value={selectedStartTime}
              mode="time"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={handleStartTimeChange}
              is24Hour={false}
              accentColor={GREEN}
              textColor="#172B25"
              themeVariant="light"
            />

            {Platform.OS === "ios" && (
              <TouchableOpacity
                style={styles.pickerDoneButton}
                onPress={() => setShowStartTimePicker(false)}
              >
                <Text style={styles.pickerDoneText}>Done</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* End Time */}
        <Text style={styles.inputLabel}>End Time</Text>

        <TouchableOpacity
          style={styles.pickerButton}
          onPress={() => {
            setShowEndTimePicker(!showEndTimePicker);
            setShowDatePicker(false);
            setShowStartTimePicker(false);
          }}
        >
          <Ionicons
            name="time-outline"
            size={20}
            color={GREEN}
          />
          <Text style={styles.pickerButtonText}>
            {endTime}
          </Text>
          <Ionicons
            name="chevron-down"
            size={18}
            color="#8993A4"
          />
        </TouchableOpacity>

        {showEndTimePicker && (
          <View style={styles.pickerContainer}>
            <DateTimePicker
                value={selectedEndTime}
                mode="time"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={handleEndTimeChange}
                is24Hour={false}
                accentColor={GREEN}
                textColor="#172B25"
                themeVariant="light"
                />

            {Platform.OS === "ios" && (
              <TouchableOpacity
                style={styles.pickerDoneButton}
                onPress={() => setShowEndTimePicker(false)}
              >
                <Text style={styles.pickerDoneText}>Done</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Location */}
        <Text style={styles.inputLabel}>
          Location (Optional)
        </Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Lecture Hall 02"
          placeholderTextColor="#A0A8B3"
          value={location}
          onChangeText={setLocation}
        />

        {/* Save Event */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleAddEvent}
        >
          <Ionicons
            name="checkmark-circle-outline"
            size={20}
            color="#FFFFFF"
          />
          <Text style={styles.saveButtonText}>
            Save Event
          </Text>
        </TouchableOpacity>

        {/* Cancel */}
        <TouchableOpacity
          style={styles.cancelModalButton}
          onPress={() => setModalVisible(false)}
        >
          <Text style={styles.cancelModalText}>
            Cancel
          </Text>
          </TouchableOpacity>
        </ScrollView>
    </View>
  </KeyboardAvoidingView>
    </Modal>
    </View>
    );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F8FA",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 35,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  headerTitle: {
    fontSize: 27,
    fontWeight: "800",
    color: "#172B25",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#8993A4",
    marginTop: 5,
  },
  addButton: {
    width: 47,
    height: 47,
    borderRadius: 15,
    backgroundColor: GREEN,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 25,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#172B25",
  },
  sectionSubtitle: {
    fontSize: 12,
    color: "#8993A4",
    marginTop: 5,
  },
  weekCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 17,
    borderWidth: 1,
    borderColor: "#E8EDF2",
  },
  weekNavigation: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 19,
  },
  weekTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#172B25",
  },
  daysContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dayButton: {
    width: "13.5%",
    paddingVertical: 10,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedDayButton: {
    backgroundColor: GREEN,
  },
  dayName: {
    color: "#8993A4",
    fontSize: 10,
    fontWeight: "600",
  },
  dayNumber: {
    color: "#172B25",
    fontSize: 15,
    fontWeight: "700",
    marginTop: 8,
  },
  selectedDayText: {
    color: "#FFFFFF",
  },
  todayDot: {
  width: 4,
  height: 4,
  borderRadius: 2,
  backgroundColor: GREEN,
  marginTop: 5,
},
eventDot: {
  backgroundColor: "#F0A43A",
},
selectedTodayDot: {
  backgroundColor: "#FFFFFF",
},
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 25,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E8EDF2",
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#172B25",
    marginTop: 12,
  },
  emptyDescription: {
    fontSize: 12,
    color: "#8993A4",
    textAlign: "center",
    lineHeight: 19,
    marginTop: 6,
  },
  emptyAddButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: GREEN,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 11,
    marginTop: 17,
  },
  emptyAddText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 12,
    marginLeft: 5,
  },
  eventCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E8EDF2",
  },
  eventColorLine: {
    width: 5,
  },
  eventContent: {
    flex: 1,
    padding: 15,
  },
  eventTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  eventTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: "#172B25",
  },
  deleteIcon: {
    padding: 5,
  },
  eventDetail: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  eventDetailText: {
    color: "#8993A4",
    fontSize: 12,
    marginLeft: 7,
  },
  eventTypeBadge: {
    alignSelf: "flex-start",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: 10,
  },
  eventTypeText: {
    fontSize: 10,
    fontWeight: "700",
  },
  upcomingCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 13,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E8EDF2",
  },
  upcomingDate: {
    width: 48,
    height: 50,
    backgroundColor: "#E7F7F0",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  upcomingDateDay: {
    fontSize: 18,
    fontWeight: "800",
    color: GREEN,
  },
  upcomingDateMonth: {
    fontSize: 10,
    color: GREEN,
    fontWeight: "600",
  },
  upcomingInfo: {
    flex: 1,
  },
  upcomingTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#172B25",
  },
  upcomingSubtitle: {
    fontSize: 11,
    color: "#8993A4",
    marginTop: 5,
  },
  countBadge: {
    minWidth: 27,
    height: 27,
    borderRadius: 9,
    backgroundColor: "#E7F7F0",
    alignItems: "center",
    justifyContent: "center",
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: GREEN,
  },
  deadlineCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 13,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E8EDF2",
  },
  deadlineIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: "#FFF4E6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  deadlineInfo: {
    flex: 1,
  },
  deadlineTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#172B25",
  },
  deadlineSubtitle: {
    fontSize: 11,
    color: "#8993A4",
    marginTop: 5,
  },
  smallEmptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  noItemsText: {
    color: "#8993A4",
    fontSize: 12,
    lineHeight: 19,
  },
  examCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E8EDF2",
  },
  examIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: "#FFF4E6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  examInfo: {
    flex: 1,
  },
  examTitle: {
    color: "#172B25",
    fontSize: 14,
    fontWeight: "700",
  },
  examSubtitle: {
    color: "#8993A4",
    fontSize: 11,
    marginTop: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingHorizontal: 22,
    paddingTop: 25,
    paddingBottom: 30,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 23,
  },
  modalTitle: {
    fontSize: 21,
    fontWeight: "800",
    color: "#172B25",
  },
  modalSubtitle: {
    fontSize: 12,
    color: "#8993A4",
    marginTop: 5,
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#F1F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#172B25",
    marginBottom: 9,
    marginTop: 14,
  },
  input: {
    backgroundColor: "#F6F8FA",
    borderWidth: 1,
    borderColor: "#E8EDF2",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    color: "#172B25",
    fontSize: 13,
  },
  typeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  typeButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#DDE5E1",
    gap: 6,
  },
  selectedTypeButton: {
    backgroundColor: GREEN,
    borderColor: GREEN,
  },
  typeButtonText: {
    color: "#53645D",
    fontSize: 11,
    fontWeight: "600",
  },
  selectedTypeText: {
    color: "#FFFFFF",
  },
  saveButton: {
    flexDirection: "row",
    backgroundColor: GREEN,
    borderRadius: 13,
    paddingVertical: 15,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 25,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
    marginLeft: 8,
  },

    pickerButton: {
    backgroundColor: "#F6F8FA",
    borderWidth: 1,
    borderColor: "#E8EDF2",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  pickerButtonText: {
    flex: 1,
    color: "#172B25",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 12,
  },

  pickerContainer: {
  backgroundColor: "#F1F4F6",
  borderRadius: 14,
  marginTop: 10,
  padding: 8,
  alignItems: "center",
  overflow: "hidden",
},

  pickerDoneButton: {
    alignSelf: "flex-end",
    paddingHorizontal: 18,
    paddingVertical: 10,
  },

  pickerDoneText: {
    color: "#36B58A",
    fontSize: 14,
    fontWeight: "700",
  },

  modalScrollContent: {
    paddingBottom: 25,
  },

  cancelModalButton: {
    alignItems: "center",
    paddingVertical: 15,
  },
  cancelModalText: {
    color: "#8993A4",
    fontSize: 13,
    fontWeight: "600",
  },
});
