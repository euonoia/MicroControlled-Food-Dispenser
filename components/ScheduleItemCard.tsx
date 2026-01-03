import { View, Text, StyleSheet, Switch, Pressable } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useEffect, useState } from "react";

type Props = {
  id: string;
  time: string;
  angle: number;
  active: boolean;
  onSave: (data: {
    time: string;
    angle: number;
    active: boolean;
  }) => void;
};

export default function ScheduleItemCard({
  id,
  time,
  angle,
  active,
  onSave
}: Props) {
  // Local mirror of Firebase state
  const [enabled, setEnabled] = useState(active);
  const [currentTime, setCurrentTime] = useState(time);
  const [currentAngle, setCurrentAngle] = useState(angle);
  const [pickerOpen, setPickerOpen] = useState(false);

  // 🔴 CRITICAL: re-sync when Firebase updates
  useEffect(() => {
    setEnabled(active);
    setCurrentTime(time);
    setCurrentAngle(angle);
  }, [active, time, angle]);

  const save = (next: {
    time?: string;
    angle?: number;
    active?: boolean;
  }) => {
    onSave({
      time: next.time ?? currentTime,
      angle: next.angle ?? currentAngle,
      active: next.active ?? enabled
    });
  };

  const handleToggle = (value: boolean) => {
    setEnabled(value);
    save({ active: value });
  };

  const handleTimeChange = (_: any, date?: Date) => {
    setPickerOpen(false);
    if (!date) return;

    const hh = date.getHours().toString().padStart(2, "0");
    const mm = date.getMinutes().toString().padStart(2, "0");
    const formatted = `${hh}:${mm}`;

    setCurrentTime(formatted);
    save({ time: formatted });
  };

  const handlePortion = (value: number) => {
    setCurrentAngle(value);
    save({ angle: value });
  };

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.title}>{id.toUpperCase()}</Text>
        <Switch value={enabled} onValueChange={handleToggle} />
      </View>

      <Pressable onPress={() => setPickerOpen(true)}>
        <Text style={styles.time}>Time: {currentTime}</Text>
      </Pressable>

      <View style={styles.portions}>
        <Pressable onPress={() => handlePortion(45)}>
          <Text style={styles.btn}>Small</Text>
        </Pressable>
        <Pressable onPress={() => handlePortion(90)}>
          <Text style={styles.btn}>Large</Text>
        </Pressable>
      </View>

      {pickerOpen && (
        <DateTimePicker
          mode="time"
          value={new Date()}
          is24Hour
          display="default"
          onChange={handleTimeChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#edf2f7",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10
  },
  title: { fontSize: 16, fontWeight: "bold" },
  time: { fontSize: 16, marginBottom: 10 },
  portions: { flexDirection: "row", gap: 10 },
  btn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#cbd5e0",
    borderRadius: 8
  }
});
