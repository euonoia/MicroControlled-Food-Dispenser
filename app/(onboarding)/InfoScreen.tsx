import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";

export default function InfoScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Features Overview</Text>
      <Text style={styles.subtitle}>
        Here you can explain the main features of your app to the user.
      </Text>
      <Button title="Next" onPress={() => navigation.navigate("Finish")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 10 },
  subtitle: { fontSize: 16, textAlign: "center", marginBottom: 20 },
});
