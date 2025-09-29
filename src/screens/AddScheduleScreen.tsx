// screens/AddScheduleScreen.tsx
import React, { useState } from "react";
import { View, Text, Button, Alert, StyleSheet } from "react-native";
import { Calendar } from "react-native-calendars";
import { Picker } from "@react-native-picker/picker";
import Checkbox from "expo-checkbox";
import { addOrUpdateSchedule, checkScheduleExists } from "../services/scheduleService";

export default function AddScheduleScreen() {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [classId, setClassId] = useState<string>("A1");
  const [subject, setSubject] = useState<string>("Toán");
  const [period, setPeriod] = useState<number>(1);
  const [isExam, setIsExam] = useState<boolean>(false);

  const handleSave = async () => {
    if (!selectedDate) {
      Alert.alert("Lỗi", "Bạn chưa chọn ngày!");
      return;
    }

    const { exists, id } = await checkScheduleExists(selectedDate, classId, period);

    const schedule = {
      date: selectedDate,
      classId,
      subject,
      period,
      type: isExam ? "exam" : "study" as "exam" | "study", // ép kiểu
    };

    if (exists) {
      Alert.alert(
        "Xác nhận",
        `Lớp ${classId} đã có tiết ${period} ngày ${selectedDate}. Bạn có muốn cập nhật không?`,
        [
          { text: "Hủy" },
          {
            text: "Đồng ý",
            onPress: async () => {
              await addOrUpdateSchedule(schedule, id!);
              Alert.alert("Thành công", "Đã cập nhật lịch học!");
            },
          },
        ]
      );
    } else {
      await addOrUpdateSchedule(schedule);
      Alert.alert("Thành công", "Đã thêm lịch học!");
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Calendar
        onDayPress={(day) => setSelectedDate(day.dateString)}
        markedDates={
          selectedDate ? { [selectedDate]: { selected: true, selectedColor: "#00adf5" } } : {}
        }
      />

      <View style={styles.form}>
        <Text>Chọn lớp:</Text>
        <Picker selectedValue={classId} onValueChange={setClassId}>
          <Picker.Item label="Lớp A1" value="A1" />
          <Picker.Item label="Lớp B1" value="B1" />
        </Picker>

        <Text>Chọn môn học:</Text>
        <Picker selectedValue={subject} onValueChange={setSubject}>
          <Picker.Item label="Toán" value="Toán" />
          <Picker.Item label="Văn" value="Văn" />
          <Picker.Item label="Anh" value="Anh" />
        </Picker>

        <Text>Chọn tiết học:</Text>
        <Picker selectedValue={period} onValueChange={(val) => setPeriod(Number(val))}>
          <Picker.Item label="Tiết 1" value={1} />
          <Picker.Item label="Tiết 2" value={2} />
          <Picker.Item label="Tiết 3" value={3} />
          <Picker.Item label="Tiết 4" value={4} />
          <Picker.Item label="Tiết 5" value={5} />
        </Picker>

        <View style={{ flexDirection: "row", alignItems: "center", marginVertical: 10 }}>
          <Checkbox value={isExam} onValueChange={setIsExam} />
          <Text style={{ marginLeft: 8 }}>{isExam ? "Buổi thi" : "Buổi học"}</Text>
        </View>

        <Button title="Cập nhật" onPress={handleSave} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  form: { padding: 16 },
});
