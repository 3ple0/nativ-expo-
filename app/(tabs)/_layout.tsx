import { Tabs } from 'expo-router';
import { 
  Hop as Home, 
  Shirt as Fabrics, 
  Calendar as Events, 
  Hammer as Makers,
  ShoppingCart as Orders,
  User as Profile,
  Settings as HostDashboard
} from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { useAuthStore } from '@/src/store/auth.store';

/**
 * TABS LAYOUT
 *
 * Bottom tab navigation for main app.
 * Non-authenticated users redirected at app level.
 *
 * Tabs:
 * - Home: Discovery feed, quick actions
 * - Fabrics: Browse fabrics, create orders
 * - Events: Event management, ASO-EBI details
 * - Makers: Find tailors/makers
 * - Orders: Order history, fulfillment tracking
 * - Profile: User profile, settings, wallet
 */
export default function TabLayout() {
  const roles = useAuthStore((s) => s.roles);
  const isHost = roles.includes('host');
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary[600],
        tabBarInactiveTintColor: theme.colors.neutral[500],
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: theme.colors.neutral[200],
          paddingTop: 8,
          paddingBottom: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      {/* Home - Discovery Feed */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />

      {/* Fabrics - Browse & Shop */}
      <Tabs.Screen
        name="fabrics"
        options={{
          title: 'Fabrics',
          tabBarIcon: ({ color, size }) => <Fabrics color={color} size={size} />,
        }}
      />

      {/* Events - ASO-EBI Management */}
      <Tabs.Screen
        name="events"
        options={{
          title: 'Events',
          tabBarIcon: ({ color, size }) => <Events color={color} size={size} />,
        }}
      />

      {/* Makers - Find Tailors */}
      <Tabs.Screen
        name="makers"
        options={{
          title: 'Makers',
          tabBarIcon: ({ color, size }) => <Makers color={color} size={size} />,
        }}
      />

      {/* Orders - Fulfillment Tracking */}
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ color, size }) => <Orders color={color} size={size} />,
        }}
      />

      {/* Profile - Settings & Account */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <Profile color={color} size={size} />,
        }}
      />

      {/* Host Dashboard - Only visible to hosts */}
      {isHost && (
        <Tabs.Screen
          name="host"
          options={{
            title: 'Host',
            tabBarIcon: ({ color, size }) => <HostDashboard color={color} size={size} />,
          }}
        />
      )}
    </Tabs>
  );
}
