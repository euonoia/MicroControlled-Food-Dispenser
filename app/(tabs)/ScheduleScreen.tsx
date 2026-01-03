import { View, Text, StyleSheet, Switch } from "react-native";
import { useSchedule } from "../../hooks/useSchedule";
import ScheduleItemCard from "../../components/ScheduleItemCard";

export default function ScheduleScreen() {
  const { enabled, items, toggleSchedule, saveItem } = useSchedule();

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Feeding Schedule</Text>

      {/* MASTER ENABLE */}
      <View style={styles.row}>
        <Text style={styles.label}>Enable Automatic Feeding</Text>
        <Switch
          value={enabled}
          onValueChange={(v) => toggleSchedule(v)}
        />
      </View>

      {/* SCHEDULE ITEMS */}
      {["morning", "evening"].map((id) => {
        const item = items[id] ?? {
          time: "07:00",
          angle: 45,
          active: false
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
                ...updated
              })
            }
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 26, fontWeight: "bold", marginBottom: 20 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20
  },
  label: { fontSize: 16 }
});
