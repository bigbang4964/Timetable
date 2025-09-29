// screens/HomeScreen.tsx
import React from "react";
import { View, Button, StyleSheet } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export default function HomeScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Button title="Xem thời khóa biểu" onPress={() => navigation.navigate("ViewSchedule")} />
      <View style={{ height: 20 }} />
      <Button title="Nhập thời khóa biểu" onPress={() => navigation.navigate("AddSchedule")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
});
