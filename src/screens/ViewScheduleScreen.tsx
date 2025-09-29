import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, Text, FlatList, StyleSheet } from "react-native";
import { Calendar } from "react-native-calendars";
import { Picker } from "@react-native-picker/picker"; // cần cài npm install @react-native-picker/picker
import { getSchedules, Schedule } from "../services/scheduleService";

type MarkedDates = {
  [date: string]: {
    marked?: boolean;
    dotColor?: string;
    selected?: boolean;
    selectedColor?: string;
  };
};

export default function App() {
  const [loading, setLoading] = useState(true);
  const [markedDates, setMarkedDates] = useState<MarkedDates>({});
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");

  // bộ lọc
  const [selectedClass, setSelectedClass] = useState<string>("A1");
  const [selectedMonth, setSelectedMonth] = useState<string>("2025-09");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data: Schedule[] = await getSchedules(selectedClass, selectedMonth);

      const marks: MarkedDates = {};
      data.forEach((item) => {
        marks[item.date] = {
          marked: true,
          dotColor: item.type === "study" ? "blue" : "orange",
        };
      });

      setSchedules(data);
      setMarkedDates(marks);
      setLoading(false);
    };

    fetchData();
  }, [selectedClass, selectedMonth]);

  const eventsOfDay = schedules.filter((s) => s.date === selectedDate);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Đang tải thời khóa biểu...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Bộ lọc lớp */}
      <View style={{ flexDirection: "row", padding: 10 }}>
        <Text style={{ marginRight: 8 }}>Chọn lớp:</Text>
        <Picker
          selectedValue={selectedClass}
          style={{ flex: 1 }}
          onValueChange={(val) => setSelectedClass(val)}
        >
          <Picker.Item label="Lớp A1" value="A1" />
          <Picker.Item label="Lớp B1" value="B1" />
        </Picker>
      </View>

      {/* Bộ lọc tháng */}
      <View style={{ flexDirection: "row", padding: 10 }}>
        <Text style={{ marginRight: 8 }}>Chọn tháng:</Text>
        <Picker
          selectedValue={selectedMonth}
          style={{ flex: 1 }}
          onValueChange={(val) => setSelectedMonth(val)}
        >
          <Picker.Item label="Tháng 9/2025" value="2025-09" />
          <Picker.Item label="Tháng 10/2025" value="2025-10" />
        </Picker>
      </View>

      {/* Calendar */}
      <Calendar
        monthFormat={"MMMM yyyy"}
        markedDates={{
          ...markedDates,
          ...(selectedDate
            ? { [selectedDate]: { selected: true, selectedColor: "#00adf5" } }
            : {}),
        }}
        markingType={"dot"}
        onDayPress={(day) => setSelectedDate(day.dateString)}
      />

      {/* Danh sách sự kiện */}
      <View style={{ flex: 1, padding: 16 }}>
        {selectedDate === "" ? (
          <Text style={styles.info}>Chọn ngày để xem chi tiết</Text>
        ) : eventsOfDay.length === 0 ? (
          <Text style={styles.info}>Không có buổi học hoặc thi</Text>
        ) : (
          <FlatList
            data={eventsOfDay}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.item,
                  { borderLeftColor: item.type === "study" ? "blue" : "orange" },
                ]}
              >
                <Text style={styles.subject}>{item.subject}</Text>
                <Text style={{ color: "#555" }}>
                  {item.type === "study" ? "Buổi học" : "Buổi thi"}
                </Text>
              </View>
            )}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  item: {
    padding: 12,
    marginBottom: 8,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    borderLeftWidth: 6,
  },
  subject: { fontSize: 16, fontWeight: "bold" },
  info: { fontSize: 16, textAlign: "center", marginTop: 20, color: "#666" },
});
