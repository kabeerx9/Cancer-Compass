import * as React from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { medicationApi, Medication } from "../../lib/api";

export default function HomePage() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [medications, setMedications] = React.useState<Medication[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [loggingId, setLoggingId] = React.useState<string | null>(null);

  const fetchTodayMedications = React.useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const response = await medicationApi.getToday(token);
      if (response.success && response.data) {
        setMedications(response.data);
      }
    } catch (error) {
      console.error("Error fetching medications:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getToken]);

  React.useEffect(() => {
    fetchTodayMedications();
  }, [fetchTodayMedications]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTodayMedications();
  };

  const handleLogMedication = async (
    medicationId: string,
    status: "taken" | "skipped"
  ) => {
    setLoggingId(medicationId);
    try {
      const token = await getToken();
      if (!token) return;

      const response = await medicationApi.log(medicationId, status, token);
      if (response.success) {
        fetchTodayMedications();
      }
    } catch (error) {
      console.error("Error logging medication:", error);
    } finally {
      setLoggingId(null);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const firstName = user?.firstName || "there";

  const takenCount = medications.filter((m) => m.todayStatus === "taken").length;
  const totalCount = medications.length;
  const progress = totalCount > 0 ? (takenCount / totalCount) * 100 : 0;

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-bg justify-center items-center">
        <ActivityIndicator size="large" color="#4A90A4" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View className="px-5 py-4">
          <Text className="text-text-muted text-base">{getGreeting()}</Text>
          <Text className="text-2xl font-bold text-text">{firstName}</Text>
        </View>

        {/* Progress Card */}
        {totalCount > 0 && (
          <View className="mx-5 bg-surface rounded-2xl p-5 mb-4">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-lg font-semibold text-text">
                Today's Progress
              </Text>
              <Text className="text-cta font-semibold">
                {takenCount}/{totalCount}
              </Text>
            </View>
            <View className="h-3 bg-chip rounded-full overflow-hidden">
              <View
                className="h-full bg-cta rounded-full"
                style={{ width: `${progress}%` }}
              />
            </View>
            {takenCount === totalCount && totalCount > 0 && (
              <View className="flex-row items-center mt-3">
                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                <Text className="text-green-600 ml-2 font-medium">
                  All medications taken!
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Today's Medications */}
        <View className="px-5">
          <Text className="text-lg font-semibold text-text mb-3">
            Today's Medications
          </Text>

          {medications.length === 0 ? (
            <View className="bg-surface rounded-2xl p-6 items-center">
              <Ionicons name="medical-outline" size={48} color="#9A9A9A" />
              <Text className="text-text-muted text-center mt-4">
                No medications for today
              </Text>
              <Text className="text-text-muted text-center text-sm mt-1">
                Add medications in the Medications tab
              </Text>
            </View>
          ) : (
            medications.map((medication) => (
              <View
                key={medication.id}
                className={`bg-surface rounded-2xl p-4 mb-3 ${
                  medication.todayStatus === "taken" ? "border-2 border-green-500" : ""
                } ${medication.todayStatus === "skipped" ? "opacity-50" : ""}`}
              >
                <View className="flex-row justify-between items-start">
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-text">
                      {medication.name}
                    </Text>
                    {medication.dosage && (
                      <Text className="text-text-muted mt-1">
                        {medication.dosage}
                      </Text>
                    )}
                    <View className="flex-row items-center mt-2">
                      {medication.time && (
                        <View className="bg-chip px-3 py-1 rounded-full mr-2">
                          <Text className="text-text-soft text-sm">
                            {medication.time}
                          </Text>
                        </View>
                      )}
                      {medication.timeLabel && (
                        <View className="bg-chip px-3 py-1 rounded-full">
                          <Text className="text-text-soft text-sm">
                            {medication.timeLabel}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Action Buttons */}
                  {loggingId === medication.id ? (
                    <ActivityIndicator size="small" color="#4A90A4" />
                  ) : medication.todayStatus ? (
                    <View className="flex-row items-center">
                      {medication.todayStatus === "taken" ? (
                        <View className="flex-row items-center">
                          <Ionicons
                            name="checkmark-circle"
                            size={28}
                            color="#4CAF50"
                          />
                          <Text className="text-green-600 ml-2 text-sm">
                            Taken
                          </Text>
                        </View>
                      ) : (
                        <View className="flex-row items-center">
                          <Ionicons
                            name="close-circle"
                            size={28}
                            color="#9A9A9A"
                          />
                          <Text className="text-text-muted ml-2 text-sm">
                            Skipped
                          </Text>
                        </View>
                      )}
                    </View>
                  ) : (
                    <View className="flex-row">
                      <Pressable
                        className="bg-green-500 px-4 py-2 rounded-full mr-2"
                        onPress={() =>
                          handleLogMedication(medication.id, "taken")
                        }
                      >
                        <Text className="text-white font-medium">Take</Text>
                      </Pressable>
                      <Pressable
                        className="bg-chip px-4 py-2 rounded-full"
                        onPress={() =>
                          handleLogMedication(medication.id, "skipped")
                        }
                      >
                        <Text className="text-text-soft font-medium">Skip</Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              </View>
            ))
          )}
        </View>

        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
}
