import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  colors?: {
    background: string;
    shimmer: string;
  };
}

const DEFAULT_COLORS = {
  background: '#E8E0D8',
  shimmer: '#F5F0EB',
};

export function Skeleton({
  width = '100%',
  height = 20,
  borderRadius = 8,
  colors = DEFAULT_COLORS,
}: SkeletonProps) {
  const shimmerPosition = useSharedValue(-1);

  React.useEffect(() => {
    shimmerPosition.value = withRepeat(
      withTiming(2, { duration: 1500 }),
      -1,
      false
    );
  }, []);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerPosition.value * 300 }],
  }));

  return (
    <View
      style={[
        styles.container,
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.background,
        },
      ]}
    >
      <Animated.View
        style={[
          styles.shimmer,
          shimmerStyle,
          {
            backgroundColor: colors.shimmer,
          },
        ]}
      />
    </View>
  );
}

// Pre-built skeleton layouts for common patterns
export function MedicationCardSkeleton() {
  return (
    <View style={cardStyles.card}>
      <View style={cardStyles.leftSection}>
        <Skeleton width={40} height={40} borderRadius={10} />
      </View>
      <View style={cardStyles.centerSection}>
        <Skeleton width="70%" height={18} borderRadius={6} />
        <View style={cardStyles.spacer} />
        <Skeleton width="50%" height={14} borderRadius={4} />
      </View>
      <View style={cardStyles.rightSection}>
        <Skeleton width={80} height={36} borderRadius={10} />
      </View>
    </View>
  );
}

export function TaskCardSkeleton() {
  return (
    <View style={cardStyles.card}>
      <View style={cardStyles.leftSection}>
        <Skeleton width={24} height={24} borderRadius={6} />
      </View>
      <View style={cardStyles.centerSection}>
        <Skeleton width="80%" height={16} borderRadius={4} />
      </View>
    </View>
  );
}

export function StatCardSkeleton() {
  return (
    <View style={statStyles.container}>
      <Skeleton width="100%" height={100} borderRadius={20} />
    </View>
  );
}

export function LogCardSkeleton() {
  return (
    <View style={cardStyles.card}>
      <View style={cardStyles.header}>
        <Skeleton width={100} height={24} borderRadius={8} />
      </View>
      <View style={cardStyles.spacer} />
      <Skeleton width="100%" height={60} borderRadius={8} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'relative',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '30%',
    opacity: 0.5,
  },
});

const cardStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E8E0D8',
  },
  leftSection: {
    marginRight: 12,
  },
  centerSection: {
    flex: 1,
  },
  rightSection: {
    marginLeft: 12,
  },
  header: {
    marginBottom: 8,
  },
  spacer: {
    height: 8,
  },
});

const statStyles = StyleSheet.create({
  container: {
    marginHorizontal: 24,
    marginBottom: 24,
  },
});
