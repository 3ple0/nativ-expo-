# Architecture Documentation

This document outlines the complete folder structure, navigation flow, and component organization for the nativ-expo- application.

## Overview

**Stack**: Expo + React Native + React Navigation + Zustand  
**Backend**: Supabase Auth + NestJS API + nativPay (escrow MVP)

## Folder Structure

```
nativ-expo-/
├── app/                          # Expo Router file-based routing
│   ├── (auth)/                   # Auth flow screens
│   │   ├── _layout.tsx
│   │   ├── sign-in.tsx
│   │   └── sign-up.tsx
│   ├── (tabs)/                   # Bottom tab navigation
│   │   ├── _layout.tsx
│   │   ├── index.tsx             # Home tab
│   │   ├── profile.tsx
│   │   ├── schedule.tsx
│   │   ├── create.tsx
│   │   └── _notfound.tsx
│   ├── events/                   # Event stack
│   │   └── _layout.tsx
│   ├── fabrics/                  # Fabric discovery stack
│   │   └── _layout.tsx
│   ├── makers/                   # Maker/tailor stack
│   │   └── _layout.tsx
│   ├── orders/                   # Orders & cart stack
│   │   └── _layout.tsx
│   ├── payments/                 # Payment & escrow stack
│   │   └── _layout.tsx
│   └── _layout.tsx               # Root layout
│
├── src/
│   ├── components/               # All React components
│   │   ├── common/               # Shared UI components
│   │   │   └── index.ts
│   │   ├── events/               # Event-specific components
│   │   │   └── index.ts
│   │   ├── fabrics/              # Fabric-specific components
│   │   │   └── index.ts
│   │   ├── makers/               # Maker-specific components
│   │   │   └── index.ts
│   │   └── payments/             # Payment-specific components
│   │       └── index.ts
│   │
│   ├── context/                  # React Context providers
│   │   ├── AuthContext.ts
│   │   ├── EventContext.ts
│   │   ├── CartContext.ts
│   │   └── PaymentContext.ts
│   │
│   ├── store/                    # Zustand state management
│   │   ├── auth.store.ts         # Authentication state
│   │   ├── event.store.ts        # Events & guests state
│   │   ├── cart.store.ts         # Shopping cart state
│   │   └── escrow.store.ts       # Escrow & payment state
│   │
│   ├── api/                      # API client & endpoints
│   │   ├── client.ts             # Axios client with interceptors
│   │   ├── auth.api.ts           # Authentication endpoints
│   │   ├── events.api.ts         # Event CRUD endpoints
│   │   ├── fabrics.api.ts        # Fabric endpoints
│   │   ├── makers.api.ts         # Maker endpoints
│   │   ├── orders.api.ts         # Order & cart endpoints
│   │   └── payments.api.ts       # Payment & escrow endpoints
│   │
│   ├── models/                   # TypeScript type definitions
│   │   ├── Event.ts
│   │   ├── Fabric.ts
│   │   ├── Order.ts
│   │   ├── Escrow.ts
│   │   └── User.ts
│   │
│   ├── utils/                    # Utility functions
│   │   ├── currency.ts           # Currency formatting & calculations
│   │   ├── roles.ts              # Role-based utilities
│   │   └── guards.ts             # Auth & permission guards
│   │
│   └── theme/                    # Design tokens
│       ├── colors.ts
│       ├── spacing.ts
│       ├── typography.ts
│       └── index.ts
│
├── assets/                       # Static assets
│   └── images/
│
├── constants/                    # App constants
├── hooks/                        # Custom React hooks
├── lib/                          # External library integrations
│
├── app.json
├── package.json
├── tsconfig.json
└── README.md
```

## Navigation Flow

### Root Navigation (RootStack)

Branches into three stacks based on auth state:

```
RootStack
├── AuthStack       (when not authenticated)
├── GuestStack      (when browsing without auth)
└── AppStack        (when authenticated)
```

### AuthStack

Authentication flow before main app:

```
Splash
  → Onboarding
    → AuthChoice
      → SignIn
      → SignUp (with role selection)
```

### AppStack

Main authenticated application:

```
MainTabs (Bottom Tab Navigation)
├── Home (HomeTab)
├── Fabrics (FabricsTab)
├── Events (EventsTab)
├── Makers (MakersTab)
├── Orders (OrdersTab)
└── Profile (ProfileTab)

+ Nested Stacks:
├── EventStack (events/)
├── FabricStack (fabrics/)
├── MakerStack (makers/)
├── OrderStack (orders/)
└── PaymentStack (payments/)
```

## Screen Map (Complete Flow)

### A. AUTH & ENTRY

- **SplashScreen** - App initialization
- **OnboardingScreen** - First-time user onboarding
- **AuthChoiceScreen** - Choose sign in or sign up
- **SignInScreen** - Email/password login
- **SignUpScreen** - Email/password registration
- **RoleAwarenessGate** - Select initial role (Host, Maker, Guest)
- **UserDashboard** - Main app entry point

### B. CORE DASHBOARD (BOTTOM TABS)

- **HomeTab** - Feed/discover, trending events
- **FabricsTab** - Browse fabrics
- **EventsTab** - Manage events (host mode)
- **MakersTab** - Browse tailors/makers
- **OrdersTab** - Order history & cart
- **ProfileTab** - User settings & profile

### C. EVENT FLOW (HOST MODE)

```
EventListScreen
  → CreateEventScreen
    → EventDashboardScreen
      ├── EventOverview
      ├── EventFabrics
      │   └── FabricDiscovery
      │       └── FabricDetail
      ├── DistributionModeScreen
      │   ├── HostPays
      │   ├── GuestSelfPurchase
      │   └── MixedMode (host deposit)
      ├── GuestListScreen
      ├── InviteLinkQRScreen
      └── EventOrdersScreen
```

**Distribution Modes (Immutable)**:
- `host_purchase` - Host pays for all
- `guest_self_purchase` - Guests pay individually
- `mixed_deposit` - Host deposit refundable after completion

### D. FABRIC DISCOVERY

```
FabricDiscoveryScreen
  ├── FiltersModal
  └── FabricDetailScreen
      ├── AttachToEvent
      ├── PersonalOrder
      └── ReserveInventory (soft lock)
```

### E. MAKER FLOW

```
MakerDiscovery
  → MakerProfile
      ├── MessageMaker
      ├── BookDesign
      └── AttachToCart
```

### F. CART → PAYMENT → ESCROW

```
CartScreen
  → CheckoutScreen
    → nativPayScreen
      ├── Wallet
      ├── Card / Transfer
      └── EscrowInitiation
          → PaymentSuccess
            → FulfillmentTracker
```

## State Management (Zustand Stores + React Context)

### Core Stores

| Store | Responsibility | Key State |
|-------|---------------|-----------|
| `auth.store.ts` | Supabase session + JWT tokens | `user`, `roles`, `token`, `supabaseSession`, `tokenExpiresAt` |
| `event.store.ts` | Active event + guests + context | `activeEventContext`, `currentEvent`, `eventGuests`, `eventOrders` |
| `cart.store.ts` | Fabric + maker + fees + pricing | `cart`, `pricing`, `subtotal`, `platform_fee`, `total` |
| `escrow.store.ts` | Escrow lifecycle + payments | `escrows`, `currentPhase`, `payments`, `releases` |

### Auth Store (`auth.store.ts`)
Manages Supabase sessions and JWT lifecycle with automatic expiration checking.

**State**:
- `user: User | null` - Current user profile
- `roles: UserRole[]` - Active roles (guest, maker, host)
- `token: string | null` - JWT access token
- `refreshToken: string | null` - JWT refresh token
- `supabaseSession: SupabaseSession | null` - Supabase session
- `tokenExpiresAt: number | null` - Token expiration timestamp

**Key Actions**:
- `setUser(user)` - Update user profile
- `setToken(token, expiresIn)` - Store token with TTL
- `setSupabaseSession(session)` - Store Supabase session
- `addRole(role)` - Add role (supports multiple: guest + host)
- `hasRole(role)` - Check if user has role
- `isTokenExpired()` - Check if token needs refresh
- `logout()` - Clear all session data

### Event Store (`event.store.ts`)
Manages events and active event context for event dashboard, fabric attach, and guest payment flows.

**Active Event Context** (used across flows):
```typescript
{
  eventId: string
  distributionMode: 'host_purchase' | 'guest_self_purchase' | 'mixed_deposit'
  hostDeposit?: number                    // Host contribution amount
  hostDepositPercentage?: number          // Percentage of total
  selectedFabric?: Fabric                 // Chosen fabric for event
  guests: Array<{id, email, status}>     // Event participants
  pricingBreakdown?: {
    fabricCost: number
    tailor?: number
    shipping?: number
    platform_fee?: number
    tax?: number
    total: number
    currency: string
  }
}
```

**Key Actions**:
- `setActiveEventContext(context)` - Initialize event flow
- `updateDistributionMode(mode)` - Change payment distribution
- `setHostDeposit(amount, percentage)` - Set host contribution
- `setSelectedFabric(fabric)` - Select event fabric
- `setPricingBreakdown(breakdown)` - Update pricing
- `addGuest(guest)` - Add participant
- `updateGuestStatus(guestId, status)` - Update RSVP
- `resetActiveContext()` - Clear active event

**Context Wrapping**:
- Event Dashboard screens
- Fabric attach/discovery flow
- Guest payment flow

### Cart Store (`cart.store.ts`)
Manages shopping cart items and detailed pricing breakdown.

**Pricing Breakdown**:
```typescript
{
  subtotal: number           // Item costs only
  tailor_cost?: number       // Tailor service fee
  shipping?: number          // Shipping cost
  platform_fee: number       // Default 3% of subtotal
  tax?: number               // Sales tax
  discount?: number          // Applied discount
  total: number              // Grand total
  currency: string           // Currency code (USD, NGN, etc.)
}
```

**Key Actions**:
- `addItem(item)` - Add to cart
- `removeItem(itemId)` - Remove from cart
- `updateItem(itemId, quantity)` - Update quantity
- `clearCart()` - Empty cart
- `calculatePricing(subtotal, taxRate, feesPercent, shippingCost)` - Calculate all costs
- `applyDiscount(discountAmount)` - Apply coupon
- `getTotal()` - Get grand total
- `getSubtotal()` - Get items subtotal
- `getPlatformFee()` - Get fee amount

### Escrow Store (`escrow.store.ts`)
Manages escrow lifecycle with phase tracking and release history.

**Escrow Phases**:
- `initiated` → Escrow created, awaiting payment
- `funded` → Payment received, funds held
- `held` → Awaiting order completion
- `in_completion` → Order in final stages
- `released` → Funds released to seller
- `refunded` → Funds returned to buyer
- `disputed` → Under dispute resolution

**Key Actions**:
- `initiateEscrow(buyerId, sellerId, amount, currency, orderId)` - Create escrow
- `fundEscrow(escrowId, method)` - Mark as funded
- `holdEscrow(escrowId, reason)` - Place hold
- `releaseEscrow(escrowId, reason)` - Release to seller
- `refundEscrow(escrowId, reason)` - Refund to buyer
- `disputeEscrow(escrowId, reason)` - Start dispute
- `resolveDispute(escrowId, releasePercent)` - Resolve with split (e.g., 70% seller, 30% buyer)

## Context Providers

Wrap stores for React hook usage in components.

### Setup in `_layout.tsx`
```typescript
import { AuthProvider } from '@/src/context/AuthContext'
import { EventProvider } from '@/src/context/EventContext'
import { CartProvider } from '@/src/context/CartContext'
import { PaymentProvider } from '@/src/context/PaymentContext'

export default function RootLayout() {
  return (
    <AuthProvider>
      <EventProvider>
        <CartProvider>
          <PaymentProvider>
            {children}
          </PaymentProvider>
        </CartProvider>
      </EventProvider>
    </AuthProvider>
  )
}
```

### Context Hooks

**`useAuth()`** - User & authentication state
```typescript
const { user, isAuthenticated, token, hasRole } = useAuth()
```

**`useEventContext()`** - Event flow state
```typescript
const {
  activeEventContext,    // {eventId, distributionMode, hostDeposit, guests[], selectedFabric, pricingBreakdown}
  setDistributionMode,
  setHostDeposit,
  setSelectedFabric,
  setPricingBreakdown,
  calculateTotal,
  initializeEventContext,
  resetEventContext      // Call when exiting event flow
} = useEventContext()
```

**`useCart()`** - Shopping cart & pricing state
```typescript
const {
  cart,
  pricing,               // {subtotal, platform_fee, tax, total, ...}
  calculatePricing,      // (subtotal, taxRate, feesPercent, shippingCost)
  applyDiscount,
  getTotal,
  getSubtotal,
  getPlatformFee
} = useCart()
```

**`usePayment()`** - Escrow & payment state
```typescript
const {
  currentEscrow,
  currentPhase,
  initiateEscrow,
  fundEscrow,
  releaseEscrow,
  refundEscrow,
  disputeEscrow,
  resolveDispute
} = usePayment()
```

## API Layer

All API calls through `src/api/client.ts` (Axios with token injection & 401 handling).

**API Modules**:
- `auth.api.ts` - Sign in/up, profile, role management
- `events.api.ts` - Event CRUD, guests, orders, invites
- `fabrics.api.ts` - Fabric catalog, search, reservations
- `makers.api.ts` - Maker profiles, messaging, design booking
- `orders.api.ts` - Order history, cart management
- `payments.api.ts` - Payment initiation, escrow, wallet

## Type Definitions

### useAuthStore
- `user` - Current user
- `isAuthenticated` - Auth status
- `token` - JWT token
- Actions: `setUser`, `setToken`, `logout`, `setRole`, `hasRole`

### useEventStore
- `events` - User's events
- `currentEvent` - Selected event
- `eventGuests` - Event participants
- `eventOrders` - Event orders
- Actions: CRUD operations + guest/order management

### useCartStore
- `cart` - Shopping cart
- Actions: `addItem`, `removeItem`, `updateItem`, `clearCart`, `getTotal`, `getItemCount`

### useEscrowStore
- `escrows` - Escrow records
- `payments` - Payment records
- Actions: `initiateEscrow`, `releaseEscrow`, `refundEscrow`, `disputeEscrow`

## Type Definitions

### User.ts
```typescript
type UserRole = 'guest' | 'maker' | 'host'
interface User { id, email, name, avatar, roles, ... }
interface MakerProfile extends UserProfile { specializations, portfolio, ... }
```

### Event.ts
```typescript
type DistributionMode = 'host_purchase' | 'guest_self_purchase' | 'mixed_deposit'
interface Event { id, title, distributionMode, fabricId, ... }
interface EventGuest { id, eventId, guestId, status, ... }
interface EventOrder { id, eventId, fabricId, totalPrice, status, ... }
```

### Fabric.ts
```typescript
interface Fabric { id, name, price, images, inventory, rating, ... }
interface FabricReservation { id, fabricId, quantity, expiresAt, status, ... }
```

### Order.ts
```typescript
interface Cart { id, items, totalPrice, ... }
interface CartItem { itemId, itemType, quantity, unitPrice, ... }
interface Order { id, itemType, status, paymentStatus, ... }
```

### Escrow.ts
```typescript
interface Escrow { id, buyerId, sellerId, amount, status, ... }
interface Payment { id, amount, method, status, orderId, escrowId, ... }
```

## Utility Functions

### currency.ts
- `formatCurrency(amount, currency)` - Format with symbol
- `getCurrencySymbol(currency)` - Get currency symbol
- `applyDiscount(price, percent)` - Calculate discounted price
- `calculateTax(amount, taxRate)` - Calculate tax

### roles.ts
- `hasRole(roles, role)` - Check if user has role
- `isHost(roles)`, `isMaker(roles)`, `isGuest(roles)` - Role checks
- `getRoleLabel(role)` - Get display name

### guards.ts
- `isAuthenticated()` - Check if user logged in
- `requireAuth(isAuth)` - Guard for protected routes
- `requireRole(roles, role)` - Role-based access control
- `requireAnyRole(roles, roles[])` - Check any role
- `requireAllRoles(roles, roles[])` - Check all roles

## Theme Tokens

### colors.ts
- Primary: `#FF6B6B` (red/pink)
- Secondary: `#4ECDC4` (teal)
- Status: success, warning, error, info
- Dark mode variants

### spacing.ts
- Scale: xs, sm, md, lg, xl, 2xl, 3xl, 4xl, 5xl (4-48px)
- Radius: none, sm, md, lg, xl, 2xl, full
- Shadows: none, sm, md, lg, xl, 2xl

### typography.ts
- Font sizes: xs-5xl
- Font weights: light-extrabold
- Line heights: tight-loose
- Variants: h1-h6, body, bodySmall, caption, button

## Context API

Wraps Zustand stores for use with React Context hooks:
- `useAuth()` - Access auth context
- `useEvent()` - Access event context
- `useCart()` - Access cart context
- `usePayment()` - Access payment context

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   EXPO_PUBLIC_API_URL=http://your-nestjs-api.com/api
   EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

3. Start development:
   ```bash
   npm run dev
   ```

4. Type checking:
   ```bash
   npm run typecheck
   ```

5. Lint:
   ```bash
   npm run lint
   ```

## Component Conventions

### Folder Organization
- Feature-based folders in `src/components/`
- Each folder has an `index.ts` for re-exporting
- Common components in `src/components/common/`

### File Naming
- Components: PascalCase (e.g., `EventCard.tsx`)
- Utilities: camelCase (e.g., `formatDate.ts`)
- Types: PascalCase in `.ts` files

### Component Template
```typescript
import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@/src/theme';

interface Props {
  // Props definition
}

export const ComponentName: React.FC<Props> = ({ ...props }) => {
  return (
    <View>
      <Text>Component</Text>
    </View>
  );
};
```

## Development Workflow

1. **Create feature branch** from `main`
2. **Implement components** in `src/components/[feature]/`
3. **Update stores** in `src/store/` if state needed
4. **Create API calls** in `src/api/[feature].api.ts`
5. **Create screens** in `app/[feature]/`
6. **Test & type check** before submitting PR

## Notes

- **Guest browsing** allowed without auth (soft gate on actions)
- **Dual roles** supported (user can be Host + Guest simultaneously)
- **Escrow immutable** - distribution mode locked after event creation
- **Soft reservation** for fabrics (24-48 hour hold)
- **Token auto-refresh** handled in API client interceptor
- **Role switching** managed through auth store

---

Generated: December 14, 2025
Version: 1.0.0
