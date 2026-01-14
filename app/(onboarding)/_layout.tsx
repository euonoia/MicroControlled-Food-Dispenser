import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import WelcomeScreen from "./WelcomeScreen";
import InfoScreen from "./InfoScreen";
import FinishScreen from "./FinishScreen";

const Stack = createNativeStackNavigator();

export default function OnboardingLayout({ onFinish }: { onFinish: () => void }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Info" component={InfoScreen} />
      <Stack.Screen
        name="Finish"
        children={(props) => <FinishScreen {...props} onFinish={onFinish} />}
      />
    </Stack.Navigator>
  );
}
