// services/scheduleService.ts
import { collection, getDocs, query, where, addDoc, updateDoc, doc } from "firebase/firestore";
import { db } from "../firebaseConfig";

export type Schedule = {
  id?: string;
  date: string;   // yyyy-MM-dd
  type: "study" | "exam";
  subject: string;
  classId: string;
  period: number; // tiết học
};

// Lấy lịch theo lớp và tháng
export async function getSchedules(classId?: string, month?: string): Promise<Schedule[]> {
  const q = collection(db, "schedules");
  const snapshot = await getDocs(q);

  let data = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as Schedule));

  if (classId) data = data.filter((s) => s.classId === classId);
  if (month) data = data.filter((s) => s.date.startsWith(month));

  return data;
}

// Kiểm tra lịch đã tồn tại
export async function checkScheduleExists(date: string, classId: string, period: number) {
  const q = query(
    collection(db, "schedules"),
    where("date", "==", date),
    where("classId", "==", classId),
    where("period", "==", period)
  );
  const snap = await getDocs(q);
  if (!snap.empty) {
    return { exists: true, id: snap.docs[0].id };
  }
  return { exists: false, id: null };
}

// Thêm hoặc cập nhật
export async function addOrUpdateSchedule(schedule: Schedule, docId?: string) {
  if (docId) {
    const ref = doc(db, "schedules", docId);
    await updateDoc(ref, schedule);
  } else {
    await addDoc(collection(db, "schedules"), schedule);
  }
}