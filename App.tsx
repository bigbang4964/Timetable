// App.tsx
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "./src/screens/HomeScreen";
import ViewScheduleScreen from "./src/screens/ViewScheduleScreen";
import AddScheduleScreen from "./src/screens/AddScheduleScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: "Trang chính" }} />
        <Stack.Screen name="ViewSchedule" component={ViewScheduleScreen} options={{ title: "Xem thời khóa biểu" }} />
        <Stack.Screen name="AddSchedule" component={AddScheduleScreen} options={{ title: "Nhập thời khóa biểu" }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
