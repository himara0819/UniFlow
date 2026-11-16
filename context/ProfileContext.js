
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";

const ProfileContext = createContext(null);

const PROFILE_STORAGE_KEY = "uniflow_student_profile";

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const savedProfile = await AsyncStorage.getItem(
          PROFILE_STORAGE_KEY
        );

        if (savedProfile) {
          setProfile(JSON.parse(savedProfile));
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const saveProfile = async (profileData) => {
    try {
      const updatedProfile = {
        name: profileData.name.trim(),
        email: profileData.email.trim(),
      };

      await AsyncStorage.setItem(
        PROFILE_STORAGE_KEY,
        JSON.stringify(updatedProfile)
      );

      setProfile(updatedProfile);

      return true;
    } catch (error) {
      console.error("Error saving profile:", error);
      return false;
    }
  };


  const logout = async () => {
  try {
    await AsyncStorage.removeItem(PROFILE_STORAGE_KEY);
    setProfile(null);
    return true;
  } catch (error) {
    console.error("Error logging out:", error);
    return false;
  }
};

  return (
    <ProfileContext.Provider
      value={{ profile, loading, saveProfile, logout }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);

  if (!context) {
    throw new Error(
      "useProfile must be used inside ProfileProvider"
    );
  }

  return context;
}
