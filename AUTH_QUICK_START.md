# Authentication Quick Reference

## Using Auth Guards in Your Code

### Protect a Button/Feature

```typescript
import { useRouter } from 'expo-router';
import { useIsAuthenticated } from '@/src/utils/auth.guards';

export function PayButton() {
  const router = useRouter();
  const isAuth = useIsAuthenticated();
  
  return (
    <TouchableOpacity
      onPress={() => {
        if (!isAuth) {
          router.push('/modal/auth-gate');
          return;
        }
        // Proceed with payment
      }}
    >
      <Text>Make Payment</Text>
    </TouchableOpacity>
  );
}
```

### Check Specific Role

```typescript
import { useIsHost } from '@/src/utils/auth.guards';

export function CreateEventButton() {
  const isHost = useIsHost();
  
  if (!isHost) {
    return <Text>Upgrade to Host to create events</Text>;
  }
  
  return <TouchableOpacity><Text>Create Event</Text></TouchableOpacity>;
}
```

### Conditional UI Based on Auth

```typescript
import { useIsAuthenticated, useUserRoles } from '@/src/utils/auth.guards';

export function ProfileHeader() {
  const isAuth = useIsAuthenticated();
  const roles = useUserRoles();
  
  return (
    <View>
      <Text>{isAuth ? 'Signed In' : 'Guest User'}</Text>
      {roles.includes('host') && <HostBadge />}
      {roles.includes('maker') && <MakerBadge />}
    </View>
  );
}
```

## Available Guard Hooks

| Hook | Returns | Use Case |
|------|---------|----------|
| `useIsAuthenticated()` | boolean | Check if user is signed in |
| `useIsGuest()` | boolean | Check if user is browsing as guest |
| `useIsHost()` | boolean | Check if user has host role |
| `useIsMaker()` | boolean | Check if user has maker role |
| `useCanPay()` | boolean | Check if user can make payments |
| `useIsLoading()` | boolean | Check if auth is still hydrating |
| `useUserRoles()` | UserRole[] | Get array of user's roles |
| `useHasRole(role)` | boolean | Check for specific role(s) |

## Auth Screen Routes

| Screen | Path | Purpose |
|--------|------|---------|
| Splash | `/` (in auth group) | Initial loading & route decision |
| Onboarding | `/onboarding` | Explains app features |
| Auth Choice | `/auth-choice` | Sign in, sign up, or browse guest |
| Sign In | `/sign-in` | Login with email/password |
| Sign Up | `/sign-up` | Create new account |
| Auth-Gate Modal | `/modal/auth-gate` | Request auth for restricted feature |

## Integration Steps

### 1. Add Auth Guard to Restricted Feature

```typescript
import { useRouter } from 'expo-router';
import { useIsAuthenticated } from '@/src/utils/auth.guards';

export function RestrictedButton() {
  const router = useRouter();
  const isAuth = useIsAuthenticated();
  
  const handlePress = () => {
    if (!isAuth) {
      router.push('/modal/auth-gate');
      return;
    }
    // Do restricted action
  };
  
  return <TouchableOpacity onPress={handlePress}>...</TouchableOpacity>;
}
```

### 2. Setup Environment Variables

Create `.env.local`:
```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Test Auth Flow

1. **Guest Flow:** Tap "Browse as Guest" on auth-choice → Try to buy → See auth-gate modal
2. **Sign Up:** Tap "Create Account" → Fill form → Check email → Sign in
3. **Sign In:** Tap "Sign In" → Enter credentials → Navigate to tabs
4. **Session Persist:** Sign in → Close app → Reopen → Should still be signed in

## Zustand Store Access

If you need direct access to auth state:

```typescript
import { useAuthStore } from '@/src/store/auth.store';

export function MyComponent() {
  const { user, roles, isAuthenticated, isLoading } = useAuthStore();
  
  if (isLoading) return <LoadingScreen />;
  
  return <Text>{user?.email}</Text>;
}
```

## Debugging

### User stuck on splash screen
- Check console for hydration errors
- Verify Supabase credentials in `.env`
- Check network connectivity

### Auth-gate modal won't open
- Verify `useIsAuthenticated()` returns false
- Check router.push() is called correctly
- Verify modal layout exists in navigation

### Sign in fails with generic error
- Check user exists in Supabase auth
- Verify email is confirmed
- Check account isn't locked

## Common Patterns

### Pattern 1: Protect Entire Screen

```typescript
export default function HostOnlyScreen() {
  const router = useRouter();
  const isHost = useIsHost();
  
  useEffect(() => {
    if (!isHost) {
      router.replace('/modal/auth-gate');
    }
  }, [isHost, router]);
  
  if (!isHost) return null;
  return <HostContent />;
}
```

### Pattern 2: Lazy Load Auth-Dependent UI

```typescript
export function OptionalFeature() {
  const isAuth = useIsAuthenticated();
  
  return (
    <View>
      <BasicContent />
      {isAuth && <PremiumFeature />}
    </View>
  );
}
```

### Pattern 3: Role-Based Tab Navigation

```typescript
export function NavigationTabs() {
  const roles = useUserRoles();
  
  const tabs = [
    { name: 'Fabrics', icon: 'package' },
    { name: 'Events', icon: 'calendar' },
    roles.includes('host') && { name: 'Create', icon: 'plus' },
    roles.includes('maker') && { name: 'Store', icon: 'shop' },
  ].filter(Boolean);
  
  return <TabNavigator tabs={tabs} />;
}
```

## Error Handling

Supabase auth errors are handled automatically and displayed via Alert dialogs. For custom handling:

```typescript
const { error } = await supabase.auth.signInWithPassword({ ... });

if (error?.message === 'Invalid login credentials') {
  setError('Email or password incorrect');
} else if (error?.message === 'Email not confirmed') {
  setError('Please verify your email first');
} else if (error) {
  setError(error.message);
}
```

## Security Notes

- ✅ Tokens stored in encrypted native storage (SecureStore)
- ✅ Session auto-refresh handled by Supabase SDK
- ✅ HTTPS required for all API calls
- ✅ Passwords validated (min 6 chars)
- ✅ Email verification required before first login
- ✅ CORS configured for allowed domains

## Performance Tips

1. Use guard hooks in event handlers (not render)
2. Avoid re-renders with proper memoization
3. Load protected screens only when needed
4. Cache role checks with useMemo if needed

## Need Help?

See `/AUTHENTICATION.md` for:
- Complete architecture overview
- Implementation examples
- Database schema
- Troubleshooting guide
- Future enhancements

