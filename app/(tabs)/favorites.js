
import React from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTasks } from "../../context/TaskContext";

export default function FavoritesScreen() {
  const { tasks, toggleFavorite } = useTasks();

  const favoriteTasks = tasks.filter(
    (task) => task.isFavorite
  );

  const renderFavorite = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.iconContainer}>
        <Ionicons
          name="bookmark"
          size={22}
          color="#36B58A"
        />
      </View>

      <View style={styles.info}>
        <Text style={styles.taskTitle}>
          {item.title}
        </Text>

        <Text style={styles.subject}>
          {item.subject}
        </Text>

        <Text style={styles.deadline}>
          Due: {item.dueDate}
        </Text>

        <Text style={styles.status}>
          {item.completed ? "Completed" : "Pending"}
        </Text>
      </View>

      <Pressable
        onPress={() => toggleFavorite(item.id)}
        style={styles.removeButton}
      >
        <Ionicons
          name="bookmark"
          size={22}
          color="#36B58A"
        />
      </Pressable>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Favorites</Text>

      <Text style={styles.subtitle}>
        Your important academic tasks.
      </Text>

      <FlatList
        data={favoriteTasks}
        renderItem={renderFavorite}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="bookmark-outline"
              size={45}
              color="#8993A4"
            />

            <Text style={styles.emptyTitle}>
              No Favorites Yet
            </Text>

            <Text style={styles.emptySubtitle}>
              Bookmark important assignments from your Tasks screen.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F9FC",
    padding: 20,
    paddingTop: 65,
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
    marginBottom: 22,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
    alignItems: "center",
  },
  iconContainer: {
    width: 43,
    height: 43,
    backgroundColor: "#E8F8F0",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  taskTitle: {
    color: "#101D32",
    fontSize: 13,
    fontWeight: "bold",
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
  status: {
    color: "#36B58A",
    fontSize: 10,
    marginTop: 6,
  },
  removeButton: {
    padding: 8,
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 80,
    paddingHorizontal: 25,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#101D32",
    marginTop: 15,
  },
  emptySubtitle: {
    color: "#778397",
    fontSize: 12,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 19,
  },
});
