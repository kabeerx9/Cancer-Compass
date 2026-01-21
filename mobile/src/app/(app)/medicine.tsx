import { View, Text } from "react-native";

export default function MedicinePage() {
  return (
    <View className="flex-1 justify-center items-center p-5 bg-[var(--color-bg)]">
      <View className="w-full rounded-[28px] bg-[var(--color-surface)] border border-[var(--color-border)] p-6 shadow-lg">
        <Text className="text-[22px] leading-[28px] font-semibold text-[var(--color-text)]">
          Medicine
        </Text>
        <Text className="mt-2 text-[var(--color-text-muted)]">
          Track your medications here
        </Text>

        <View className="mt-6 rounded-[16px] bg-[var(--color-chip)] px-4 py-3">
          <Text className="text-[12px] text-[var(--color-text-soft)]">
            Next dose
          </Text>
          <Text className="text-[16px] text-[var(--color-text)] font-semibold mt-1">
            No reminders yet
          </Text>
        </View>
      </View>
    </View>
  );
}
