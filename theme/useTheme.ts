import { useColorScheme } from "react-native";
import { DarkTheme, LightTheme } from "./colors";

export function useTheme() {
  const scheme = useColorScheme();
  return scheme === "dark" ? DarkTheme : LightTheme;
}
