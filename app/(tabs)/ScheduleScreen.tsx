import { View, Text, StyleSheet, Switch } from "react-native";
import { useTheme } from "../../theme/useTheme";
import { useSchedule } from "../../hooks/useSchedule";
import ScheduleItemCard from "../../components/ScheduleItemCard";

export default function ScheduleScreen() {
  const theme = useTheme();
  const { enabled, items, toggleSchedule, saveItem } =
    useSchedule();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.background },
      ]}
    >
      <Text
        style={[
          styles.header,
          { color: theme.text },
        ]}
      >
        Feeding Schedule
      </Text>

      {/* MASTER ENABLE */}
      <View style={styles.row}>
        <Text
          style={[
            styles.label,
            { color: theme.text },
          ]}
        >
          Enable Automatic Feeding
        </Text>

        <Switch
          value={enabled}
          onValueChange={toggleSchedule}
          trackColor={{
            false: theme.muted,
            true: theme.secondary,
          }}
          thumbColor={enabled ? theme.primary : "#ccc"}
        />
      </View>

      {/* SCHEDULE ITEMS */}
      {["morning", "evening"].map((id) => {
        const item = items[id] ?? {
          time: "07:00",
          angle: 45,
          active: false,
        };

        return (
          <ScheduleItemCard
            key={id}
            id={id}
            time={item.time}
            angle={item.angle}
            active={item.active}
            onSave={(updated) =>
              saveItem(id, {
                ...item,
                ...updated,
              })
            }
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
  },
});
