// screens/AddScheduleScreen.tsx
// Màn hình "Nhập thời khóa biểu"
// - Chọn ngày bằng Calendar
// - Chọn lớp (lấy dynamic từ Firestore bằng getClasses())
// - Chọn môn, tiết, loại (học/thi)
// - Khi bấm "Cập nhật": kiểm tra trùng bằng checkScheduleExists()
//   + nếu trùng -> hỏi xác nhận -> cập nhật (update)
//   + nếu không -> thêm mới (add)
import React, { useState, useEffect } from "react";
import { View, Text, Button, Alert, StyleSheet, ActivityIndicator } from "react-native";
// Calendar để chọn ngày (react-native-calendars)
import { Calendar } from "react-native-calendars";
// Picker cho dropdown (chọn lớp, môn, tiết)
import { Picker } from "@react-native-picker/picker";
// Checkbox để chọn loại buổi (expo-checkbox)
import Checkbox from "expo-checkbox";
// Service giao tiếp với Firestore
// - addOrUpdateSchedule: thêm hoặc cập nhật document
// - checkScheduleExists: kiểm tra xem lớp+ngày+tiết có tồn tại không
// - getClasses: lấy danh sách lớp dạng { id, name }
import { addOrUpdateSchedule, checkScheduleExists, getClasses, ClassItem } from "../services/scheduleService";

export default function AddScheduleScreen() {
  /* -----------------------
     State của component
     ----------------------- */
  // Ngày được chọn trên Calendar (chuỗi "yyyy-MM-dd")
  const [selectedDate, setSelectedDate] = useState<string>("");

  // id của lớp đang chọn (ví dụ "A1")
  const [classId, setClassId] = useState<string>("");

  // môn học đang chọn (mặc định "Toán")
  const [subject, setSubject] = useState<string>("Toán");

  // tiết học (số nguyên: 1..5)
  const [period, setPeriod] = useState<number>(1);

  // nếu true => loại = "exam", ngược lại = "study"
  const [isExam, setIsExam] = useState<boolean>(false);

  // danh sách lớp lấy từ Firestore (mảng ClassItem { id, name })
  const [classes, setClasses] = useState<ClassItem[]>([]);

  // trạng thái loading khi lấy danh sách lớp
  const [loadingClasses, setLoadingClasses] = useState<boolean>(true);

  /* -----------------------
     useEffect: tải danh sách lớp từ Firestore khi component mount
     - getClasses() phải trả về mảng ClassItem: [{id: "A1", name: "Lớp A1"}, ...]
     - Nếu danh sách rỗng, classId sẽ để trống và form sẽ yêu cầu người dùng chọn
       (hoặc bạn có thể disable nút lưu nếu không có lớp).
     - Bắt lỗi và set loadingClasses=false trong finally.
  ----------------------- */
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const data = await getClasses();
        setClasses(data);

        // nếu có ít nhất 1 lớp, chọn mặc định lớp đầu tiên
        if (data.length > 0) {
          setClassId(data[0].id);
        }
      } catch (err) {
        // Log lỗi để debug; bạn có thể hiện Alert nếu muốn
        console.error("Lỗi lấy danh sách lớp:", err);
        Alert.alert("Lỗi", "Không tải được danh sách lớp. Vui lòng thử lại.");
      } finally {
        setLoadingClasses(false);
      }
    };

    fetchClasses();
  }, []);

  /* -----------------------
     Hàm xử lý lưu lịch (add hoặc update)
     Luồng:
      - Validate: đã chọn ngày, đã chọn lớp
      - checkScheduleExists(date, classId, period)
         + nếu exists -> hỏi xác nhận (Alert) -> nếu đồng ý gọi addOrUpdateSchedule(schedule, docId)
         + nếu không exists -> gọi addOrUpdateSchedule(schedule)
      - schedule object phải tuân theo kiểu trong service (date, classId, subject, period, type)
      - Xử lý lỗi chung bằng try/catch
  ----------------------- */
  const handleSave = async () => {
    // Kiểm tra bắt buộc
    if (!selectedDate) {
      Alert.alert("Lỗi", "Bạn chưa chọn ngày!");
      return;
    }

    if (!classId) {
      Alert.alert("Lỗi", "Bạn chưa chọn lớp!");
      return;
    }

    try {
      // Kiểm tra trùng: trả về { exists: boolean, id: string | null }
      const { exists, id } = await checkScheduleExists(selectedDate, classId, period);

      // Tạo object schedule để gửi lên Firestore
      const schedule = {
        date: selectedDate,
        classId,
        subject,
        period,
        // ép literal type để hợp với Schedule.type ("study" | "exam")
        type: (isExam ? "exam" : "study") as "exam" | "study",
      };

      if (exists) {
        // Nếu có bản ghi trùng -> hỏi xác nhận trước khi ghi đè
        Alert.alert(
          "Xác nhận",
          `Lớp ${classId} đã có tiết ${period} ngày ${selectedDate}. Bạn có muốn cập nhật không?`,
          [
            { text: "Hủy" },
            {
              text: "Đồng ý",
              onPress: async () => {
                // Gọi addOrUpdateSchedule với id để update
                await addOrUpdateSchedule(schedule, id!);
                Alert.alert("Thành công", "Đã cập nhật lịch học!");
              },
            },
          ]
        );
      } else {
        // Thêm mới
        await addOrUpdateSchedule(schedule);
        Alert.alert("Thành công", "Đã thêm lịch học!");
      }
    } catch (error) {
      console.error("Lỗi khi lưu lịch:", error);
      Alert.alert("Lỗi", "Có lỗi xảy ra khi lưu lịch. Vui lòng thử lại.");
    }
  };

  /* -----------------------
     JSX render:
     - Calendar: chọn ngày
     - Picker lớp: hiển thị loading spinner nếu đang load danh sách lớp
     - Picker môn: hiện tại hardcode, bạn có thể load dynamic từ Firestore nếu muốn
     - Picker tiết: 1..5
     - Checkbox: chọn loại (Buổi học / Buổi thi)
     - Button Cập nhật: gọi handleSave
  ----------------------- */
  return (
    <View style={{ flex: 1 }}>
      {/* Calendar: khi chọn ngày, cập nhật selectedDate (day.dateString có format "yyyy-MM-dd") */}
      <Calendar
        onDayPress={(day) => setSelectedDate(day.dateString)}
        markedDates={
          selectedDate ? { [selectedDate]: { selected: true, selectedColor: "#00adf5" } } : {}
        }
      />

      <View style={styles.form}>
        {/* Chọn lớp */}
        <Text>Chọn lớp:</Text>
        {loadingClasses ? (
          // Hiển thị spinner nhỏ trong khi loading danh sách lớp
          <ActivityIndicator size="small" />
        ) : (
          <Picker selectedValue={classId} onValueChange={(val) => setClassId(String(val))}>
            {/* Map danh sách lớp (ClassItem) thành Picker.Item */}
            {classes.map((c) => (
              // label: hiển thị name (ví dụ "Lớp A1"), value: id (ví dụ "A1")
              <Picker.Item key={c.id} label={c.name} value={c.id} />
            ))}
          </Picker>
        )}

        {/* Chọn môn (hiện hardcode; nếu bạn có collection subjects, có thể load tương tự getClasses) */}
        <Text>Chọn môn học:</Text>
        <Picker selectedValue={subject} onValueChange={(val) => setSubject(String(val))}>
          <Picker.Item label="Toán" value="Toán" />
          <Picker.Item label="Văn" value="Văn" />
          <Picker.Item label="Anh" value="Anh" />
        </Picker>

        {/* Chọn tiết học */}
        <Text>Chọn tiết học:</Text>
        <Picker selectedValue={period} onValueChange={(val) => setPeriod(Number(val))}>
          <Picker.Item label="Tiết 1" value={1} />
          <Picker.Item label="Tiết 2" value={2} />
          <Picker.Item label="Tiết 3" value={3} />
          <Picker.Item label="Tiết 4" value={4} />
          <Picker.Item label="Tiết 5" value={5} />
        </Picker>

        {/* Checkbox cho loại (Buổi thi hay Buổi học) */}
        <View style={{ flexDirection: "row", alignItems: "center", marginVertical: 10 }}>
          <Checkbox value={isExam} onValueChange={(val) => setIsExam(Boolean(val))} />
          <Text style={{ marginLeft: 8 }}>{isExam ? "Buổi thi" : "Buổi học"}</Text>
        </View>

        {/* Nút cập nhật */}
        <Button title="Cập nhật" onPress={handleSave} />
      </View>
    </View>
  );
}

/* ---------- Styles ---------- */
const styles = StyleSheet.create({
  form: { padding: 16 },
});
