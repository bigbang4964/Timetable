// screens/ViewScheduleScreen.tsx
// Màn hình hiển thị Calendar (multi-dot) + bộ lọc lớp + danh sách các buổi học/thi theo ngày.
// Ghi chú: file này dùng các helper từ ../services/scheduleService:
// - getClasses(): trả về danh sách lớp dạng ClassItem { id, name }
// - getSchedules(classId, month): trả về mảng Schedule cho lớp và tháng
// - Schedule có ít nhất fields: id, date (yyyy-MM-dd), subject, type ("study"|"exam")

import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, Text, FlatList, StyleSheet } from "react-native";
// Calendar component (react-native-calendars) hỗ trợ nhiều kiểu marking, ở đây dùng multi-dot
import { Calendar } from "react-native-calendars";
// Picker để chọn lớp
import { Picker } from "@react-native-picker/picker";
// Service để lấy dữ liệu và kiểu dữ liệu
import { getSchedules, getClasses, Schedule, ClassItem } from "../services/scheduleService";

/* --- Kiểu cho dot/mapped markedDates
   react-native-calendars với markingType="multi-dot" cần cấu trúc:
   markedDates = {
     "2025-09-30": { dots: [{key: 'k1', color: 'blue'}, {key:'k2', color:'orange'}], selected: true }
   }
*/
type Dot = { key: string; color: string };
type MarkedDates = {
  [date: string]: {
    dots: Dot[];
    selected?: boolean;
    selectedColor?: string;
  };
};

export default function App() {
  // trạng thái chung
  const [loading, setLoading] = useState(true); // loading khi lấy dữ liệu schedules
  const [markedDates, setMarkedDates] = useState<MarkedDates>({}); // dữ liệu đánh dấu cho Calendar
  const [schedules, setSchedules] = useState<Schedule[]>([]); // tất cả schedules đã load (theo lớp + tháng)
  const [selectedDate, setSelectedDate] = useState<string>(""); // ngày đang chọn trên Calendar (yyyy-MM-dd)

  // danh sách lớp (lấy từ Firestore)
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>(""); // classId đang chọn (vd "A1")

  // Để load schedules theo tháng hiện tại (nếu bạn muốn hiển thị theo tháng khác, thay đổi logic này)
  const currentMonth = new Date().toISOString().slice(0, 7); // "yyyy-MM"

  /* ---------------------------
     useEffect 1: lấy danh sách lớp từ Firestore khi component mount
     - getClasses() nên trả về mảng ClassItem { id, name } theo cấu trúc bạn yêu cầu.
     - setSelectedClass mặc định bằng phần tử đầu nếu có (để trigger lần fetchSchedules tiếp theo).
  --------------------------- */
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const data = await getClasses();
        setClasses(data);
        if (data.length > 0) {
          setSelectedClass(data[0].id); // chọn mặc định lớp đầu tiên
        }
      } catch (err) {
        console.error("Lỗi khi load classes:", err);
        // bạn có thể hiện Alert ở đây nếu muốn
      }
    };
    fetchClasses();
  }, []);

  /* ---------------------------
     useEffect 2: load schedules khi selectedClass thay đổi
     - Gọi getSchedules(selectedClass, currentMonth)
     - Build cấu trúc markedDates cho multi-dot:
         marks[date].dots = [{ key, color }, ...]
       Lưu ý: key phải unique cho mỗi dot (dùng id-doc + type là ok).
     - Sau khi build, setSchedules & setMarkedDates
     - setLoading quản lý UI spinner
     - IMPORTANT: date trong Firestore phải là chuỗi "yyyy-MM-dd" (VD "2025-09-30")
       nếu lưu khác (Timestamp hoặc format khác) thì cần convert trước khi dùng làm key.
  --------------------------- */
  useEffect(() => {
    if (!selectedClass) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        // lấy dữ liệu schedules từ service (lọc theo lớp + tháng hiện tại)
        const data: Schedule[] = await getSchedules(selectedClass, currentMonth);

        // build marks cho calendar (multi-dot)
        const marks: MarkedDates = {};
        data.forEach((item) => {
          // đảm bảo có object cho ngày đó
          if (!marks[item.date]) {
            marks[item.date] = { dots: [] };
          }

          // thêm dot vào list. key cần unique -> xài `${id}-${type}` là hợp lý
          marks[item.date].dots.push({
            key: `${item.id ?? item.date}-${item.type}`, // fallback nếu item.id không có
            color: item.type === "study" ? "blue" : "orange",
          });
        });

        setSchedules(data);
        setMarkedDates(marks);
      } catch (err) {
        console.error("Lỗi khi load schedules:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedClass]);

  // Lọc ra các event đúng ngày selectedDate (để render list bên dưới)
  const eventsOfDay = selectedDate ? schedules.filter((s) => s.date === selectedDate) : [];

  // Nếu đang loading (lần đầu) thì show spinner
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  /* ---------------------------
     Render UI:
     - Picker: chọn lớp (dữ liệu dynamic từ Firestore)
     - Calendar: markingType="multi-dot", hợp nhất markedDates + selectedDate (giữ lại dots)
       * Khi tô selectedDate, ta merge object hiện tại để không mất thông tin dots:
         { ...(markedDates[selectedDate] || { dots: [] }), selected: true, selectedColor: "#00adf5" }
     - FlatList: hiển thị danh sách buổi trong ngày
  --------------------------- */
  return (
    <View style={{ flex: 1 }}>
      {/* Bộ lọc lớp */}
      <View style={{ flexDirection: "row", padding: 10 }}>
        <Text style={{ marginRight: 8 }}>Chọn lớp:</Text>

        {/* Picker: render danh sách lớp từ Firestore */}
        <Picker
          selectedValue={selectedClass}
          style={{ flex: 1 }}
          onValueChange={(val) => setSelectedClass(val)}
        >
          {classes.map((c) => (
            // label hiển thị name (ví dụ "Lớp A1"), value sử dụng id (ví dụ "A1")
            <Picker.Item key={c.id} label={c.name} value={c.id} />
          ))}
        </Picker>
      </View>

      {/* Calendar multi-dot
          - merged markedDates giữ lại dots cho ngày đã có event
          - khi selectedDate có dots, chúng ta giữ dots rồi thêm selected:true để highlight
      */}
      <Calendar
        monthFormat={"MMMM yyyy"}
        markedDates={{
          ...markedDates,
          ...(selectedDate
            ? {
                [selectedDate]: {
                  // giữ các dots nếu có, hoặc tạo mới mảng dots rỗng nếu chưa có
                  ...(markedDates[selectedDate] || { dots: [] }),
                  // highlight ngày đã chọn
                  selected: true,
                  selectedColor: "#00adf5",
                },
              }
            : {}),
        }}
        markingType={"multi-dot"}
        onDayPress={(day) => setSelectedDate(day.dateString)}
      />

      {/* Danh sách sự kiện trong ngày */}
      <View style={{ flex: 1, padding: 16 }}>
        {selectedDate === "" ? (
          <Text style={styles.info}>Chọn ngày để xem chi tiết</Text>
        ) : eventsOfDay.length === 0 ? (
          <Text style={styles.info}>Không có buổi học hoặc thi</Text>
        ) : (
          <FlatList
            data={eventsOfDay}
            keyExtractor={(item) => item.id ?? `${item.date}-${item.period}`} // cố gắng dùng id nếu có
            renderItem={({ item }) => (
              <View
                style={[
                  styles.item,
                  { borderLeftColor: item.type === "study" ? "blue" : "orange" },
                ]}
              >
                {/* subject + loại (study/exam) */}
                <Text style={styles.subject}>{item.subject}</Text>
                <Text style={{ color: "#555" }}>
                  {item.type === "study" ? "Buổi học" : "Buổi thi"}
                </Text>

                {/* Nếu muốn hiển thị thêm: period, giáo viên, ghi chú => thêm vào Schedule và render ở đây */}
              </View>
            )}
          />
        )}
      </View>
    </View>
  );
}

/* ---------- Styles ---------- */
const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  item: {
    padding: 12,
    marginBottom: 8,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    borderLeftWidth: 6, // thanh màu bên trái để phân biệt study/exam
  },
  subject: { fontSize: 16, fontWeight: "bold" },
  info: { fontSize: 16, textAlign: "center", marginTop: 20, color: "#666" },
});
