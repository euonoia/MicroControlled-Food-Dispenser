// app/(onboarding)/get-started.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ImageBackground,
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useTheme } from "../../theme/useTheme";

// Import your background image
import KobeBackground from "../../assets/images/kobe.png";

const { width, height } = Dimensions.get("window");

export default function GetStartedScreen() {
  const theme = useTheme();

  const handleStart = async () => {
    await AsyncStorage.setItem("hasStarted", "true");
    router.replace("/(tabs)");
  };

  return (
    <ImageBackground
      source={KobeBackground}
      style={styles.background}
      resizeMode="cover"
    >
      {/* Overlay for contrast */}
      <View style={[styles.overlay, { backgroundColor: theme.background + "CC" }]}>
        <Text style={[styles.title, { color: theme.text }]}>
          Welcome to Pet Feeder 3000
        </Text>

        <Text style={[styles.subtitle, { color: theme.muted }]}>
          Feed your pet anytime, anywhere.
        </Text>

        {/* Circle button */}
        <View style={[styles.circle, { backgroundColor: theme.card }]}>
          <Pressable
            style={[styles.button, { backgroundColor: theme.primary }]}
            onPress={handleStart}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </Pressable>
        </View>
      </View>
    </ImageBackground>
  );
}

const CIRCLE_SIZE = 160;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width,
    height,
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    flex: 1,
    width,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 40,
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5, // for Android shadow
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 36,
    borderRadius: 14,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
});
