import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../theme/useTheme";

export default function TabsLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.secondary,
        tabBarInactiveTintColor: theme.muted,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopWidth: 0,
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
          elevation: 12,
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: "600" },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;
          switch (route.name) {
            case "index":
              iconName = focused ? "restaurant" : "restaurant-outline";
              break;
            case "ScheduleScreen":
              iconName = focused ? "time" : "time-outline";
              break;
            default:
              iconName = "ellipse";
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="index" options={{ title: "Feed" }} />
      <Tabs.Screen name="ScheduleScreen" options={{ title: "Schedule" }} />
    </Tabs>
  );
}
