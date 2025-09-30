import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { Plus, TrendingUp, Calendar as CalendarIcon, Zap } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { supabase } from '@/lib/supabase';

export default function HomeScreen() {
  const { user } = useUser();
  const router = useRouter();
  const [stats, setStats] = useState({
    connectedAccounts: 0,
    scheduledPosts: 0,
    activeWorkflows: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const userId = user?.id;
      if (!userId) return;

      const [accountsRes, postsRes, workflowsRes] = await Promise.all([
        supabase
          .from('connected_accounts')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('status', 'active'),
        supabase
          .from('scheduled_posts')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('status', 'pending'),
        supabase
          .from('workflows')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('is_active', true),
      ]);

      setStats({
        connectedAccounts: accountsRes.count || 0,
        scheduledPosts: postsRes.count || 0,
        activeWorkflows: workflowsRes.count || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.firstName || 'User'}</Text>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: theme.colors.primary[100] }]}>
            <TrendingUp color={theme.colors.primary[600]} size={24} />
          </View>
          <Text style={styles.statValue}>{stats.connectedAccounts}</Text>
          <Text style={styles.statLabel}>Connected Accounts</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: theme.colors.secondary[100] }]}>
            <CalendarIcon color={theme.colors.secondary[600]} size={24} />
          </View>
          <Text style={styles.statValue}>{stats.scheduledPosts}</Text>
          <Text style={styles.statLabel}>Scheduled Posts</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: theme.colors.warning[100] }]}>
            <Zap color={theme.colors.warning[600]} size={24} />
          </View>
          <Text style={styles.statValue}>{stats.activeWorkflows}</Text>
          <Text style={styles.statLabel}>Active Workflows</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push('/(tabs)/create')}
        >
          <View style={styles.actionIcon}>
            <Plus color={theme.colors.primary[600]} size={24} />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Create New Post</Text>
            <Text style={styles.actionDescription}>
              Use AI to generate engaging content for your social media
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push('/(tabs)/schedule')}
        >
          <View style={styles.actionIcon}>
            <CalendarIcon color={theme.colors.primary[600]} size={24} />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>View Schedule</Text>
            <Text style={styles.actionDescription}>
              Manage your upcoming posts and publishing timeline
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {stats.connectedAccounts === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateTitle}>Get Started</Text>
          <Text style={styles.emptyStateDescription}>
            Connect your social media accounts to start automating your content
          </Text>
          <TouchableOpacity
            style={styles.emptyStateButton}
            onPress={() => router.push('/(tabs)/profile')}
          >
            <Text style={styles.emptyStateButtonText}>Connect Accounts</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.neutral[50],
  },
  contentContainer: {
    padding: theme.spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 60 : theme.spacing.xl,
  },
  header: {
    marginBottom: theme.spacing.xl,
  },
  greeting: {
    fontSize: theme.fontSize.base,
    color: theme.colors.neutral[600],
  },
  userName: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.neutral[900],
  },
  statsContainer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  statValue: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.neutral[900],
  },
  statLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.neutral[600],
    textAlign: 'center',
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.neutral[900],
    marginBottom: theme.spacing.md,
  },
  actionCard: {
    backgroundColor: '#fff',
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.neutral[900],
    marginBottom: theme.spacing.xs,
  },
  actionDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.neutral[600],
  },
  emptyState: {
    backgroundColor: '#fff',
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  emptyStateTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.neutral[900],
    marginBottom: theme.spacing.sm,
  },
  emptyStateDescription: {
    fontSize: theme.fontSize.base,
    color: theme.colors.neutral[600],
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  emptyStateButton: {
    backgroundColor: theme.colors.primary[600],
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.md,
  },
  emptyStateButtonText: {
    color: '#fff',
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.semibold,
  },
});
