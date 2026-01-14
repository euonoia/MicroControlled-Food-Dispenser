import { View, Text, Button, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../../theme/useTheme";

export default function WelcomeScreen() {
  const theme = useTheme();
  const router = useRouter();

  const handleNext = () => {
    router.push("./provisioning"); // Relative path to provisioning.tsx
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.primary }]}>
        Welcome!
      </Text>
      <Text style={[styles.subtitle, { color: theme.muted }]}>
        Thank you for using our product. Let’s get started with your ESP32 setup.
      </Text>
      <Button title="Next" onPress={handleNext} color={theme.secondary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 12 },
  subtitle: { fontSize: 16, textAlign: "center", marginBottom: 24 },
});
