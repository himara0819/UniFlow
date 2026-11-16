
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { AppState } from "react-native";

const AppStateContext = createContext(null);

export function AppStateProvider({ children }) {
  const currentState = useRef(AppState.currentState);

  const [appState, setAppState] = useState(
    AppState.currentState
  );

  const [lastRefreshedAt, setLastRefreshedAt] = useState(
    new Date()
  );

  const [resumeCount, setResumeCount] = useState(0);

  const [showWelcomeBack, setShowWelcomeBack] = useState(false);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      (nextState) => {
        const previousState = currentState.current;

        setAppState(nextState);

        // Detect when the app returns to foreground
        if (
          previousState.match(/inactive|background/) &&
          nextState === "active"
        ) {
          setLastRefreshedAt(new Date());

          setResumeCount((count) => count + 1);

          setShowWelcomeBack(true);
        }

        currentState.current = nextState;
      }
    );

    return () => {
      subscription.remove();
    };
  }, []);

  const dismissWelcomeBack = () => {
    setShowWelcomeBack(false);
  };

  return (
    <AppStateContext.Provider
      value={{
        appState,
        lastRefreshedAt,
        resumeCount,
        showWelcomeBack,
        dismissWelcomeBack,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppLifecycle() {
  const context = useContext(AppStateContext);

  if (!context) {
    throw new Error(
      "useAppLifecycle must be used inside AppStateProvider"
    );
  }

  return context;
}
