import * as React from "react";
import {
  View,
  Text,
  Pressable,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from "react-native";
import { useUser } from "@clerk/clerk-expo";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { medicationQueries } from "../../features/medications/queries";
import { medicationMutations } from "../../features/medications/mutations";
import type { Medication } from "../../features/medications/types";

const GREEN = "#16A34A";
const GREEN_LIGHT = "#DCFCE7";
const SLATE_50 = "#F8FAFC";
const SLATE_100 = "#F1F5F9";
const SLATE_200 = "#E2E8F0";
const SLATE_500 = "#64748B";
const SLATE_800 = "#1E293B";

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
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={GREEN} />
      </SafeAreaView>
    );
  }

  const renderMedicationItem = ({ item: medication }: { item: Medication }) => (
    <View
      style={[
        styles.medicationCard,
        medication.todayStatus === "taken" && styles.medicationCardTaken,
        medication.todayStatus === "skipped" && styles.medicationCardSkipped,
      ]}
    >
      <View style={styles.medicationRow}>
        <View style={styles.medicationInfo}>
          <Text style={styles.medicationName}>{medication.name}</Text>
          {medication.dosage && (
            <Text style={styles.medicationDosage}>{medication.dosage}</Text>
          )}
          <View style={styles.chipsRow}>
            {medication.time && (
              <View style={styles.chip}>
                <Text style={styles.chipText}>{medication.time}</Text>
              </View>
            )}
            {medication.timeLabel && (
              <View style={styles.chip}>
                <Text style={styles.chipText}>{medication.timeLabel}</Text>
              </View>
            )}
          </View>
        </View>

        {logMutation.isPending && logMutation.variables?.id === medication.id ? (
          <ActivityIndicator size="small" color={GREEN} />
        ) : medication.todayStatus ? (
          <View style={styles.statusBadge}>
            {medication.todayStatus === "taken" ? (
              <>
                <Ionicons name="checkmark-circle" size={20} color={GREEN} />
                <Text style={[styles.statusText, { color: GREEN }]}>Taken</Text>
              </>
            ) : (
              <>
                <Ionicons name="close-circle" size={20} color={SLATE_500} />
                <Text style={[styles.statusText, { color: SLATE_500 }]}>Skipped</Text>
              </>
            )}
          </View>
        ) : (
          <View style={styles.buttonsRow}>
            <Pressable
              style={styles.takeButton}
              onPress={() => handleLogMedication(medication.id, "taken")}
              disabled={logMutation.isPending}
            >
              <Text style={styles.takeButtonText}>Take</Text>
            </Pressable>
            <Pressable
              style={styles.skipButton}
              onPress={() => handleLogMedication(medication.id, "skipped")}
              disabled={logMutation.isPending}
            >
              <Text style={styles.skipButtonText}>Skip</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconWrapper}>
        <Ionicons name="medical-outline" size={32} color={GREEN} />
      </View>
      <Text style={styles.emptyTitle}>No medications for today</Text>
      <Text style={styles.emptySubtitle}>Your schedule is clear.</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>{getGreeting()}</Text>
        <Text style={styles.userName}>{firstName}</Text>
      </View>

      {totalCount > 0 && (
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Daily Progress</Text>
            <Text style={styles.progressPercent}>{Math.round(progress)}%</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressSubtext}>
            {takenCount} of {totalCount} completed
          </Text>
        </View>
      )}

      <View style={styles.listContainer}>
        <Text style={styles.sectionTitle}>Today's Schedule</Text>
        <FlatList
          data={medications}
          renderItem={renderMedicationItem}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} tintColor={GREEN} />
          }
          contentContainerStyle={{ paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SLATE_50,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: SLATE_50,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: SLATE_100,
  },
  greeting: {
    fontSize: 14,
    fontWeight: "600",
    color: SLATE_500,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  userName: {
    fontSize: 28,
    fontWeight: "bold",
    color: SLATE_800,
  },
  progressCard: {
    marginHorizontal: 24,
    marginTop: 16,
    backgroundColor: GREEN,
    borderRadius: 20,
    padding: 20,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  progressPercent: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  progressBarBg: {
    height: 8,
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 4,
  },
  progressSubtext: {
    marginTop: 12,
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 24,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: SLATE_800,
    marginBottom: 16,
  },
  medicationCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: SLATE_200,
  },
  medicationCardTaken: {
    borderColor: GREEN,
    backgroundColor: GREEN_LIGHT,
  },
  medicationCardSkipped: {
    opacity: 0.6,
  },
  medicationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  medicationInfo: {
    flex: 1,
  },
  medicationName: {
    fontSize: 16,
    fontWeight: "bold",
    color: SLATE_800,
  },
  medicationDosage: {
    fontSize: 14,
    color: SLATE_500,
    marginTop: 4,
  },
  chipsRow: {
    flexDirection: "row",
    marginTop: 8,
  },
  chip: {
    backgroundColor: SLATE_100,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
    color: SLATE_500,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: GREEN_LIGHT,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "bold",
  },
  buttonsRow: {
    flexDirection: "row",
  },
  takeButton: {
    backgroundColor: GREEN,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    marginRight: 8,
  },
  takeButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  skipButton: {
    backgroundColor: SLATE_100,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  skipButtonText: {
    color: SLATE_500,
    fontWeight: "bold",
    fontSize: 14,
  },
  emptyState: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    borderWidth: 1,
    borderColor: SLATE_200,
    borderStyle: "dashed",
  },
  emptyIconWrapper: {
    backgroundColor: GREEN_LIGHT,
    padding: 16,
    borderRadius: 999,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: SLATE_800,
  },
  emptySubtitle: {
    fontSize: 14,
    color: SLATE_500,
    marginTop: 4,
  },
});
