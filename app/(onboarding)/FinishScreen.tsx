import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function FinishScreen({ onFinish }: { onFinish: () => void }) {
  const handleGetStarted = async () => {
    try {
      await AsyncStorage.setItem("@first_launch", "false");
      onFinish();
    } catch (error) {
      console.error(error);
      onFinish();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>You're Ready!</Text>
      <Text style={styles.subtitle}>Start using the app now.</Text>
      <Button title="Get Started" onPress={handleGetStarted} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 10 },
  subtitle: { fontSize: 16, textAlign: "center", marginBottom: 20 },
});
