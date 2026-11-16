
import React, {
  createContext,
  useContext,
  useState,
} from "react";

const TaskContext = createContext();

const initialTasks = [
  {
    id: "1",
    title: "Mobile Application Development Assignment",
    subject: "Mobile Application Development",
    dueDate: "November 18, 2026",
    priority: "High",
    completed: false,
    isFavorite: true,
  },
  {
    id: "2",
    title: "Statistics Research Proposal",
    subject: "Applied Statistics",
    dueDate: "November 20, 2026",
    priority: "Medium",
    completed: false,
    isFavorite: false,
  },
  {
    id: "3",
    title: "Database Management Practical",
    subject: "Database Management Systems",
    dueDate: "November 22, 2026",
    priority: "High",
    completed: false,
    isFavorite: true,
  },
  {
    id: "4",
    title: "Computer Networks Revision",
    subject: "Computer Networks",
    dueDate: "November 24, 2026",
    priority: "Low",
    completed: true,
    isFavorite: false,
  },
  {
    id: "5",
    title: "Software Engineering Report",
    subject: "Software Engineering",
    dueDate: "November 27, 2026",
    priority: "Medium",
    completed: false,
    isFavorite: false,
  },
];

export function TaskProvider({ children }) {
  const [tasks, setTasks] = useState(initialTasks);

  // Add a new task
  const addTask = (newTask) => {
    const taskToAdd = {
      ...newTask,
      id: Date.now().toString(),
      completed: false,
      isFavorite: false,
    };

    setTasks((previousTasks) => [
      ...previousTasks,
      taskToAdd,
    ]);

    // Return the created task for notification scheduling
    return taskToAdd;
  };


  const updateTask = (taskId, updatedData) => {
  let updatedTask = null;

  setTasks((previousTasks) =>
    previousTasks.map((task) => {
      if (task.id === taskId) {
        updatedTask = {
          ...task,
          ...updatedData,
        };

        return updatedTask;
      }

      return task;
    })
  );

  return updatedTask;
};



  // Mark task as completed or pending
  const toggleComplete = (taskId) => {
    setTasks((previousTasks) =>
      previousTasks.map((task) =>
        task.id === taskId
          ? { ...task, completed: !task.completed }
          : task
      )
    );
  };

  // Add or remove a favorite
  const toggleFavorite = (taskId) => {
    setTasks((previousTasks) =>
      previousTasks.map((task) =>
        task.id === taskId
          ? { ...task, isFavorite: !task.isFavorite }
          : task
      )
    );
  };

  // Delete an assignment
  const deleteTask = (taskId) => {
    setTasks((previousTasks) =>
      previousTasks.filter((task) => task.id !== taskId)
    );
  };

  return (
    <TaskContext.Provider
      value={{
    tasks,
    addTask,
    updateTask,
    toggleComplete,
    toggleFavorite,
    deleteTask,
    }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TaskContext);

  if (!context) {
    throw new Error(
      "useTasks must be used inside TaskProvider"
    );
  }

  return context;
}
