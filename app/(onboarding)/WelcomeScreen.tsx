import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";

export default function WelcomeScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to the App!</Text>
      <Text style={styles.subtitle}>Let's get you started with a quick tour.</Text>
      <Button title="Next" onPress={() => navigation.navigate("Info")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 10 },
  subtitle: { fontSize: 16, textAlign: "center", marginBottom: 20 },
});
