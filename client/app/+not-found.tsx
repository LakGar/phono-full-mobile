import { Link, router, Stack } from "expo-router";
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
} from "react-native";

const { width, height } = Dimensions.get("window");
export default function NotFoundScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Not Found</Text>
      <TouchableOpacity onPress={() => router.push("/(tabs)")}>
        <Text style={styles.link}>Go to home screen!</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#000",
    width: width,
    height: height,
  },
  text: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
    color: "lightblue",
  },
});
