import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface Props {
  online: boolean;
  lastSeen?: number;
}

export default function ConnectionBadge({ online, lastSeen }: Props) {
  return (
    <View style={[styles.container, online ? styles.onlineBg : styles.offlineBg]}>
      <Text style={styles.text}>
        {online ? "🟢 Connected" : "🔴 Offline"}
      </Text>
      {!online && lastSeen && (
        <Text style={styles.subText}>
          Last seen: {new Date(lastSeen * 1000).toLocaleTimeString()}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 20,
    width: "100%",
  },
  onlineBg: { backgroundColor: "#e6fffa", borderColor: "#38b2ac", borderWidth: 1 },
  offlineBg: { backgroundColor: "#fff5f5", borderColor: "#f56565", borderWidth: 1 },
  text: { fontWeight: "bold", fontSize: 16, color: "#2d3748" },
  subText: { fontSize: 12, color: "#718096", marginTop: 4 },
});