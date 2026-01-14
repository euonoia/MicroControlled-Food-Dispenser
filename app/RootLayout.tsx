import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Slot } from "expo-router";

import OnboardingLayout from "./(onboarding)/_layout";
import TabsLayout from "./(tabs)/_layout";

export default function RootLayout() {
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const checkFirstLaunch = async () => {
      try {
        const value = await AsyncStorage.getItem("@first_launch");

        if (value === null) {
          setShowOnboarding(true);
        } else {
          setShowOnboarding(false);
        }
      } catch (error) {
        console.error(error);
        setShowOnboarding(false);
      } finally {
        setLoading(false);
      }
    };

    checkFirstLaunch();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return showOnboarding ? (
    <OnboardingLayout onFinish={() => setShowOnboarding(false)} />
  ) : (
    <TabsLayout />
  );
}
