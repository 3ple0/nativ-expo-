# Authentication System Documentation

## Overview

Nativ+ implements a complete authentication system using **Supabase** for backend authentication and **Zustand** for state management. The system supports:

- **Email/password authentication**
- **Session persistence** via SecureStore
- **Role-based access control** (guest, buyer, host, maker)
- **Guest browsing** without authentication
- **Auth-gate modal** for restricting paid features
- **Async session hydration** with proper loading states

## Architecture

### Authentication Flow

```
User Action
    ↓
Auth Screen (sign-in/sign-up)
    ↓
Supabase Auth Service
    ↓
AuthContext (session listener)
    ↓
Zustand Store (state)
    ↓
Components & Navigation
```

### Key Components

#### 1. **Supabase Client** (`/lib/supabase.ts`)

React Native-compatible Supabase initialization with secure session storage.

```typescript
// Uses expo-secure-store for token persistence
storage: {
  getItem: async (key) => SecureStore.getItemAsync(key),
  setItem: async (key, value) => SecureStore.setItemAsync(key, value),
  removeItem: async (key) => SecureStore.deleteItemAsync(key),
}
```

**Why SecureStore?**
- Native secure storage for sensitive auth tokens
- Survives app reinstalls
- Encrypted by OS-level security
- Better than AsyncStorage for sensitive data

#### 2. **AuthContext** (`/src/context/AuthContext.ts`)

Bridges Supabase session state to Zustand store.

**Responsibilities:**
- Listen to Supabase auth state changes
- Fetch user profile and roles on sign-in
- Hydrate Zustand store with user data
- Manage subscription cleanup

**Key Methods:**
```typescript
useEffect(() => {
  // Check existing session
  supabase.auth.getSession().then(hydrate);
  
  // Subscribe to auth changes
  supabase.auth.onAuthStateChange((event, session) => {
    if (session) await hydrateUser(session);
    else logout();
  });
});

async function hydrateUser(session) {
  // Fetch user + roles from DB
  const userData = await supabase
    .from('users')
    .select('*, user_roles(role_name)')
    .eq('id', session.user.id)
    .single();
  
  setUser(userData);
  setRoles(userData.user_roles.map(r => r.role_name));
}
```

#### 3. **Zustand Auth Store** (`/src/store/auth.store.ts`)

Central state management for authentication.

```typescript
interface AuthStore {
  // State
  user: User | null;
  roles: UserRole[];
  token: string | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setUser: (user: User) => void;
  setRoles: (roles: UserRole[]) => void;
  setToken: (token: string) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}
```

## Authentication Screens

### 1. **Splash Screen** (`/app/(auth)/splash.tsx`)

Initial screen that:
- Checks `isLoading` state
- Waits for session hydration
- Routes based on auth status

```typescript
const { isLoading, isAuthenticated } = useAuthStore();

if (isLoading) return <LoadingIndicator />;
if (isAuthenticated) router.replace('/(tabs)');
else router.replace('/onboarding');
```

### 2. **Onboarding Screen** (`/app/(auth)/onboarding.tsx`)

Explains app features to new users before auth choice.

### 3. **Auth Choice Screen** (`/app/(auth)/auth-choice.tsx`)

Three options for users:
- **Sign In** - Login with existing account
- **Create Account** - New account signup
- **Browse as Guest** - Unauthenticated browsing

### 4. **Sign In Screen** (`/app/(auth)/sign-in.tsx`)

Email/password login with Supabase.

**Flow:**
1. User enters email + password
2. Validation (required fields)
3. `supabase.auth.signInWithPassword()`
4. On success, AuthContext listener hydrates store
5. Auto-navigate to tabs

**Error Handling:**
```typescript
const { error } = await supabase.auth.signInWithPassword({
  email: email.trim(),
  password,
});

if (error) {
  setError(error.message);
  Alert.alert('Sign In Failed', error.message);
}
```

### 5. **Sign Up Screen** (`/app/(auth)/sign-up.tsx`)

New account creation with Supabase.

**Validations:**
- All fields required
- Passwords match
- Minimum 6 characters
- Email trimmed & lowercase

**Flow:**
1. User enters email + password (x2)
2. Validation
3. `supabase.auth.signUp()`
4. Show confirmation (check email)
5. Redirect to sign-in

**Note:** Email verification required before first sign-in (Supabase default).

## Role-Based Access Control

### User Roles

```typescript
type UserRole = 'guest' | 'buyer' | 'host' | 'maker';
```

**Roles Definition:**
- **guest** - Unauthenticated user, can browse only
- **buyer** - Authenticated user, can make purchases
- **host** - Can create events and coordinate ASO-EBI
- **maker** - Can sell fabrics

### Access Guard Hooks

Located in `/src/utils/auth.guards.ts`:

#### `useHasRole(role)`
Check if user has required role(s).

```typescript
if (!useHasRole('host')) {
  router.push('/modal/auth-gate');
}
```

#### `useIsAuthenticated()`
Check if user is signed in (not guest).

```typescript
if (!useIsAuthenticated()) {
  showAuthGate();
}
```

#### `useIsGuest()`
Check if user is guest (not authenticated).

#### `useIsHost()`
Shortcut for checking host role.

```typescript
if (!useIsHost()) {
  return <UnauthorizedScreen />;
}
```

#### `useIsMaker()`
Shortcut for checking maker role.

#### `useCanPay()`
Check if user can make payments (buyer or host).

#### `useUserRoles()`
Get array of user's roles.

```typescript
const roles = useUserRoles(); // ['buyer', 'host']
```

### Protected Features

Features requiring authentication:

| Feature | Role Required | Component |
|---------|---|---|
| Browse fabrics | None | Unauthenticated |
| View makers | None | Unauthenticated |
| View events | None | Unauthenticated |
| Make purchases | buyer, host | Auth required |
| Create events | host | Auth required |
| Sell fabrics | maker | Auth required |
| Join ASO-EBI | buyer, host | Auth required |
| Save favorites | buyer | Auth required |

## Auth-Gate Modal

Modal enforced when guest users try protected features.

**Location:** `/app/modal/auth-gate.tsx`

**Non-dismissible options:**
1. **Sign In** - Navigate to sign-in screen
2. **Create Account** - Navigate to sign-up screen
3. **Continue Browsing** - Go back to previous screen

**Triggered from:**
```typescript
// In a button or action handler
if (!useIsAuthenticated()) {
  router.push('/modal/auth-gate');
}
```

## Implementation Examples

### Example 1: Protect a Button

```typescript
import { useIsAuthenticated } from '@/src/utils/auth.guards';
import { useRouter } from 'expo-router';

export function MakePaymentButton() {
  const router = useRouter();
  const isAuthenticated = useIsAuthenticated();
  
  const handlePress = () => {
    if (!isAuthenticated) {
      router.push('/modal/auth-gate');
      return;
    }
    proceedToPayment();
  };
  
  return <TouchableOpacity onPress={handlePress}>Pay Now</TouchableOpacity>;
}
```

### Example 2: Role-Based Screen Access

```typescript
import { useIsHost } from '@/src/utils/auth.guards';

export default function CreateEventScreen() {
  const isHost = useIsHost();
  
  if (!isHost) {
    return (
      <View>
        <Text>Only hosts can create events</Text>
        <Button title="Upgrade to Host" />
      </View>
    );
  }
  
  return <CreateEventForm />;
}
```

### Example 3: Conditional UI Rendering

```typescript
import { useUserRoles } from '@/src/utils/auth.guards';

export function ProfileHeader() {
  const roles = useUserRoles();
  
  return (
    <View>
      <Text>{user.name}</Text>
      {roles.includes('host') && <HostBadge />}
      {roles.includes('maker') && <MakerBadge />}
    </View>
  );
}
```

## Session Management

### Session Persistence

Sessions are stored securely via `expo-secure-store`:
- Persists across app restarts
- Encrypted by OS
- Cleared on logout

### Session Refresh

Supabase automatically refreshes expired tokens. No manual refresh needed.

### Session Cleanup

Unsubscribe from auth listeners on component unmount:

```typescript
useEffect(() => {
  const { data: authListener } = supabase.auth.onAuthStateChange(...);
  return () => authListener?.subscription.unsubscribe();
}, []);
```

## Environment Variables

Required environment variables in `.env.local` or `.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**Validation:**
```typescript
const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  throw new Error('Missing Supabase environment variables');
}
```

## Database Schema

### Users Table

```sql
CREATE TABLE users (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  email varchar UNIQUE,
  full_name varchar,
  avatar_url varchar,
  bio text,
  location varchar,
  phone_number varchar,
  created_at timestamp,
  updated_at timestamp
)
```

### User Roles Table

```sql
CREATE TABLE user_roles (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  role_name varchar,
  created_at timestamp
)
```

**Query with relationships:**
```typescript
const { data: user } = await supabase
  .from('users')
  .select('*, user_roles(role_name)')
  .eq('id', userId)
  .single();

// user.user_roles = [{ role_name: 'buyer' }, { role_name: 'host' }]
```

## Error Handling

### Authentication Errors

Common Supabase auth errors:

```typescript
const { error } = await supabase.auth.signInWithPassword({...});

if (error?.message === 'Invalid login credentials') {
  // User doesn't exist or password wrong
}
if (error?.message === 'Email not confirmed') {
  // User must verify email first
}
if (error?.message === 'Too many requests') {
  // Rate limited, show retry message
}
```

### Network Errors

```typescript
try {
  const { error } = await supabase.auth.signInWithPassword({...});
} catch (err) {
  // Network error, timeout, etc.
  console.error('Network error:', err);
  showRetryMessage();
}
```

## Testing

### Test Sign In Flow

1. Open app
2. Tap "Sign In" on auth-choice
3. Enter test credentials
4. Verify navigation to tabs
5. Check user profile loaded

### Test Guest Browsing

1. Open app
2. Tap "Browse as Guest" on auth-choice
3. Verify can browse fabrics, events, makers
4. Tap any purchase/create button
5. Verify auth-gate modal appears

### Test Session Persistence

1. Sign in with valid account
2. Force close app
3. Reopen app
4. Verify user still signed in (no login screen)

### Test Session Expiry

1. Sign in
2. Wait 1 hour or modify auth store to force expiry
3. Try to make API call
4. Verify automatic redirect to sign-in

## Troubleshooting

### User Stays on Splash Screen

**Problem:** `isLoading` never becomes false.

**Solutions:**
1. Check network connection
2. Verify Supabase credentials in `.env`
3. Check Supabase project is active
4. Look for errors in AuthContext console logs

### Sign In Fails with "Invalid login credentials"

**Problem:** User exists but sign-in rejected.

**Solutions:**
1. Verify email is correct (case-insensitive)
2. Check password is correct
3. Verify user email is confirmed (check Supabase auth)
4. Try signing up with new account

### Auth-Gate Modal Won't Open

**Problem:** Protected feature doesn't show auth-gate.

**Solutions:**
1. Verify `useIsAuthenticated()` returns false
2. Check router.push('/modal/auth-gate') is called
3. Verify auth-gate modal layout exists
4. Check console for navigation errors

### Guest User Can Access Paid Features

**Problem:** Auth guards not enforcing correctly.

**Solutions:**
1. Verify `useIsAuthenticated()` called before action
2. Check auth-gate modal is in navigation stack
3. Verify auth store `isAuthenticated` is false for guests
4. Add explicit guard: `if (!useIsAuthenticated()) return null;`

## Future Enhancements

- [ ] Two-factor authentication (2FA)
- [ ] Social login (Google, Apple)
- [ ] Biometric authentication
- [ ] Password reset flow
- [ ] Email verification reminder
- [ ] Account deletion
- [ ] Role upgrade requests
- [ ] Session management UI
- [ ] Login history
- [ ] Device trust levels

## References

- **Supabase Auth:** https://supabase.com/docs/guides/auth
- **Zustand:** https://github.com/pmndrs/zustand
- **Expo Secure Store:** https://docs.expo.dev/modules/expo-secure-store/
- **Expo Router:** https://docs.expo.dev/routing/introduction/
