import * as React from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useUser } from "@clerk/clerk-expo";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { medicationQueries } from "../../features/medications/queries";
import { medicationMutations } from "../../features/medications/mutations";
import type { Medication } from "../../features/medications/types";

export default function HomePage() {
  const { user } = useUser();
  const queryClient = useQueryClient();

  const { data: medications = [], isLoading, refetch, isRefetching } = useQuery(medicationQueries.today());
  const logMutation = useMutation(medicationMutations.log(queryClient));

  const handleLogMedication = (medicationId: string, status: "taken" | "skipped") => {
    logMutation.mutate({ id: medicationId, status });
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

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#F6E3B9", justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#4A90A4" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F6E3B9" }}>
      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />
        }
      >
        {/* Header */}
        <View style={{ paddingHorizontal: 20, paddingVertical: 16 }}>
          <Text style={{ color: "#6e6e6e", fontSize: 16 }}>{getGreeting()}</Text>
          <Text style={{ fontSize: 24, fontWeight: "bold", color: "#111111" }}>{firstName}</Text>
        </View>

        {/* Progress Card */}
        {totalCount > 0 && (
          <View style={{ marginHorizontal: 20, backgroundColor: "#FFFFFF", borderRadius: 16, padding: 20, marginBottom: 16 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <Text style={{ fontSize: 18, fontWeight: "600", color: "#111111" }}>
                Today's Progress
              </Text>
              <Text style={{ color: "#4A90A4", fontWeight: "600" }}>
                {takenCount}/{totalCount}
              </Text>
            </View>
            <View style={{ height: 12, backgroundColor: "#F3F3F3", borderRadius: 6, overflow: "hidden" }}>
              <View
                style={{ height: "100%", backgroundColor: "#4A90A4", borderRadius: 6, width: `${progress}%` }}
              />
            </View>
            {takenCount === totalCount && totalCount > 0 && (
              <View style={{ flexDirection: "row", alignItems: "center", marginTop: 12 }}>
                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                <Text style={{ color: "#4CAF50", marginLeft: 8, fontWeight: "500" }}>
                  All medications taken!
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Today's Medications */}
        <View style={{ paddingHorizontal: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: "600", color: "#111111", marginBottom: 12 }}>
            Today's Medications
          </Text>

          {medications.length === 0 ? (
            <View style={{ backgroundColor: "#FFFFFF", borderRadius: 16, padding: 24, alignItems: "center" }}>
              <Ionicons name="medical-outline" size={48} color="#9A9A9A" />
              <Text style={{ color: "#6e6e6e", textAlign: "center", marginTop: 16 }}>
                No medications for today
              </Text>
              <Text style={{ color: "#6e6e6e", textAlign: "center", fontSize: 14, marginTop: 4 }}>
                Add medications in the Medications tab
              </Text>
            </View>
          ) : (
            medications.map((medication) => (
              <View
                key={medication.id}
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 12,
                  borderWidth: medication.todayStatus === "taken" ? 2 : 0,
                  borderColor: medication.todayStatus === "taken" ? "#4CAF50" : "transparent",
                  opacity: medication.todayStatus === "skipped" ? 0.5 : 1,
                }}
              >
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 18, fontWeight: "600", color: "#111111" }}>
                      {medication.name}
                    </Text>
                    {medication.dosage && (
                      <Text style={{ color: "#6e6e6e", marginTop: 4 }}>
                        {medication.dosage}
                      </Text>
                    )}
                    <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}>
                      {medication.time && (
                        <View style={{ backgroundColor: "#F3F3F3", paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, marginRight: 8 }}>
                          <Text style={{ color: "#6e6e6e", fontSize: 14 }}>
                            {medication.time}
                          </Text>
                        </View>
                      )}
                      {medication.timeLabel && (
                        <View style={{ backgroundColor: "#F3F3F3", paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 }}>
                          <Text style={{ color: "#6e6e6e", fontSize: 14 }}>
                            {medication.timeLabel}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Action Buttons */}
                  {logMutation.isPending && logMutation.variables?.id === medication.id ? (
                    <ActivityIndicator size="small" color="#4A90A4" />
                  ) : medication.todayStatus ? (
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      {medication.todayStatus === "taken" ? (
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                          <Ionicons
                            name="checkmark-circle"
                            size={28}
                            color="#4CAF50"
                          />
                          <Text style={{ color: "#4CAF50", marginLeft: 8, fontSize: 14 }}>
                            Taken
                          </Text>
                        </View>
                      ) : (
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                          <Ionicons
                            name="close-circle"
                            size={28}
                            color="#9A9A9A"
                          />
                          <Text style={{ color: "#6e6e6e", marginLeft: 8, fontSize: 14 }}>
                            Skipped
                          </Text>
                        </View>
                      )}
                    </View>
                  ) : (
                    <View style={{ flexDirection: "row" }}>
                      <Pressable
                        style={{ backgroundColor: "#4CAF50", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8 }}
                        onPress={() => handleLogMedication(medication.id, "taken")}
                        disabled={logMutation.isPending}
                      >
                        <Text style={{ color: "#FFFFFF", fontWeight: "500" }}>Take</Text>
                      </Pressable>
                      <Pressable
                        style={{ backgroundColor: "#F3F3F3", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 }}
                        onPress={() => handleLogMedication(medication.id, "skipped")}
                        disabled={logMutation.isPending}
                      >
                        <Text style={{ color: "#6e6e6e", fontWeight: "500" }}>Skip</Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              </View>
            ))
          )}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
