
import React, { useEffect, useCallback } from "react";
import { Stack, useRouter } from "expo-router";
import * as Notifications from "expo-notifications";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { TaskProvider } from "../context/TaskContext";
import { AppStateProvider } from "../context/AppStateContext";
import { ProfileProvider } from "../context/ProfileContext";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function RootLayout() {
  const router = useRouter();

  const handleNotificationResponse = useCallback(
    async (response) => {
      const data =
        response.notification.request.content.data;

      if (
        data?.type === "assignment-reminder" &&
        data?.taskId
      ) {
        router.push({
          pathname: "/(tabs)/tasks/[id]",
          params: { id: String(data.taskId) },
        });

        await Notifications.clearLastNotificationResponseAsync();
      }
    },
    [router]
  );

  useEffect(() => {
    // Handle notification taps while the app is running
    const subscription =
      Notifications.addNotificationResponseReceivedListener(
        handleNotificationResponse
      );

    // Handle a notification tap that launched the app
    Notifications.getLastNotificationResponseAsync().then(
      (response) => {
        if (response) {
          handleNotificationResponse(response);
        }
      }
    );

    return () => subscription.remove();
  }, [handleNotificationResponse]);

  
return (
  <GestureHandlerRootView style={{ flex: 1 }}>
    <ProfileProvider>
      <AppStateProvider>
        <TaskProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </TaskProvider>
      </AppStateProvider>
    </ProfileProvider>
  </GestureHandlerRootView>
);

}
