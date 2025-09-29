// screens/HomeScreen.tsx
import React from "react";
// View: container layout
// Button: nút bấm
// StyleSheet: để định nghĩa CSS style trong React Native
import { View, Button, StyleSheet } from "react-native";

// NativeStackNavigationProp: kiểu type cho navigation khi dùng Native Stack Navigator
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

// Định nghĩa Props cho component, trong đó có navigation (dùng để điều hướng màn hình)
type Props = {
  navigation: NativeStackNavigationProp<any>;
};

// Component chính của HomeScreen
export default function HomeScreen({ navigation }: Props) {
  return (
    // View gốc bao toàn màn hình, áp dụng style container
    <View style={styles.container}>
      {/* Nút chuyển sang màn hình xem thời khóa biểu */}
      <Button 
        title="Xem thời khóa biểu" 
        onPress={() => navigation.navigate("ViewSchedule")} 
      />

      {/* Khoảng cách giữa 2 nút */}
      <View style={{ height: 20 }} />

      {/* Nút chuyển sang màn hình nhập thời khóa biểu */}
      <Button 
        title="Nhập thời khóa biểu" 
        onPress={() => navigation.navigate("AddSchedule")} 
      />
    </View>
  );
}

// Style cho màn hình
const styles = StyleSheet.create({
  container: { 
    flex: 1,                  // chiếm toàn bộ chiều cao màn hình
    justifyContent: "center", // căn giữa theo chiều dọc
    padding: 20               // padding đều 20px
  },
});
