// App.tsx
import React from "react";
// NavigationContainer: bao bọc toàn bộ hệ thống navigation (router chính)
// createNativeStackNavigator: tạo Stack Navigator (chuyển màn hình theo dạng stack)
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Import các màn hình trong app
import HomeScreen from "./src/screens/HomeScreen";
import ViewScheduleScreen from "./src/screens/ViewScheduleScreen";
import AddScheduleScreen from "./src/screens/AddScheduleScreen";

// Khởi tạo Stack Navigator
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    // NavigationContainer giống như "router" chính, quản lý điều hướng trong app
    <NavigationContainer>
      {/* Stack.Navigator định nghĩa danh sách các màn hình có trong stack */}
      <Stack.Navigator initialRouteName="Home">
        {/* Màn hình Home */}
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ title: "Trang chính" }} // tiêu đề hiển thị trên header
        />

        {/* Màn hình xem thời khóa biểu */}
        <Stack.Screen 
          name="ViewSchedule" 
          component={ViewScheduleScreen} 
          options={{ title: "Xem thời khóa biểu" }} 
        />

        {/* Màn hình thêm/thay đổi lịch học */}
        <Stack.Screen 
          name="AddSchedule" 
          component={AddScheduleScreen} 
          options={{ title: "Nhập thời khóa biểu" }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

