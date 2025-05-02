import { Stack } from "expo-router";

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="avatar"
        options={{
          title: "Choose Avatar",
        }}
      />
      <Stack.Screen
        name="genres"
        options={{
          title: "Select Genres",
        }}
      />
      <Stack.Screen
        name="artists"
        options={{
          title: "Favorite Artists",
        }}
      />
      <Stack.Screen
        name="records"
        options={{
          title: "Liked Records",
        }}
      />
      <Stack.Screen
        name="collection"
        options={{
          title: "Your Collection",
        }}
      />
    </Stack>
  );
}
