
import { View, Text, StyleSheet } from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";

export default function TaskDetailsScreen() {
  const { id } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Task Details",
          headerBackTitle: "Tasks",
        }}
      />

      <Text style={styles.title}>Task Details</Text>
      <Text style={styles.subtitle}>Task ID: {id}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F9FC",
    padding: 25,
    justifyContent: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#101D32",
  },
  subtitle: {
    color: "#36B58A",
    marginTop: 12,
  },
});
