import { StyleSheet, Text, View, ScrollView, Platform } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { theme } from '@/constants/theme';

export default function CreateScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Sparkles color={theme.colors.primary[600]} size={28} />
        </View>
        <Text style={styles.title}>AI Content Generator</Text>
        <Text style={styles.subtitle}>
          Create engaging social media posts powered by AI
        </Text>
      </View>

      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>
          Content generation features coming soon
        </Text>
        <Text style={styles.placeholderSubtext}>
          This will include AI-powered content creation with Google Gemini
        </Text>
      </View>
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
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.neutral[900],
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.fontSize.base,
    color: theme.colors.neutral[600],
    textAlign: 'center',
  },
  placeholder: {
    backgroundColor: '#fff',
    padding: theme.spacing.xxl,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  placeholderText: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.neutral[900],
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  placeholderSubtext: {
    fontSize: theme.fontSize.base,
    color: theme.colors.neutral[600],
    textAlign: 'center',
  },
});
