import { Stack } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '@/constants/theme';

/**
 * HOST STACK LAYOUT
 *
 * Navigation structure for host mode.
 * Screens:
 * - index: My Events dashboard
 * - create: Create new event
 * - [eventId]: Event overview/control center
 * - [eventId]/participants: RSVP management
 * - [eventId]/payments: Payment tracking
 * - [eventId]/settings: Event settings & lifecycle
 */
export default function HostLayout() {
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.neutral[50],
        },
        headerTintColor: theme.colors.neutral[900],
        headerTitleStyle: {
          fontWeight: '600',
        },
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()} style={{ paddingLeft: 16 }}>
            <ChevronLeft color={theme.colors.neutral[900]} size={24} />
          </TouchableOpacity>
        ),
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'My Events',
          headerLeft: undefined, // No back button on main host screen
        }}
      />

      <Stack.Screen
        name="create"
        options={{
          title: 'Create Event',
        }}
      />

      <Stack.Screen
        name="[eventId]/index"
        options={{
          title: 'Event Overview',
        }}
      />

      <Stack.Screen
        name="[eventId]/participants"
        options={{
          title: 'Participants',
        }}
      />

      <Stack.Screen
        name="[eventId]/payments"
        options={{
          title: 'Payments',
        }}
      />

      <Stack.Screen
        name="[eventId]/settings"
        options={{
          title: 'Event Settings',
        }}
      />
    </Stack>
  );
}
