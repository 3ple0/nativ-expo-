# STEP 4: Guest/Buyer User Flows - Complete Implementation Guide

## Overview

STEP 4 implements the complete guest/buyer journey from event participation through order tracking to dispute resolution. This builds on STEP 3A (host/maker setup) to create a full marketplace platform.

**Status:** ~60% Complete (5 screens created, 2 pending)

---

## User Stories

### U1: Guest Event Order Flow ✅ (70% Complete)

**User Journey:** Join Event → View Fabric → Select Tailor → Pay via Escrow → Track Production

**Screens Implemented:**
1. **Event Guest Dashboard** (`/app/event/[eventId]/index.tsx`)
   - Post-join landing page with step-by-step navigation
   - Event header with title, description, price, status badge
   - 4-step action cards (View Fabric, Choose Tailor, Pay Now, Track Order)
   - Safety info emphasizing escrow protection
   - Status: ✅ Complete (240 lines)

2. **Event Fabric Viewer** (`/app/event/[eventId]/fabric.tsx`)
   - Display primary fabric with all specifications
   - Fabric image placeholder
   - Host pricing prominently displayed
   - Care instructions (4 items)
   - Specifications grid (material, width, weight)
   - "Continue to Tailor Selection" button
   - Status: ✅ Complete (280 lines)

3. **Guest Payment Flow** (`/app/event/[eventId]/pay.tsx`)
   - Escrow-mandatory payment with guarantee display
   - Standard vs. custom amount selection
   - Dual escrow guarantee boxes (Protection + No Work Without Payment)
   - Terms agreement checkbox (required)
   - Payment processing with error handling
   - Status: ✅ Complete (320 lines)

4. **Order Tracking Screen** (`/app/(tabs)/orders/index.tsx`)
   - List all user orders with status timeline
   - 4-stage timeline visualization (Payment → Production → Delivery → Complete)
   - Filter options (All / In Production / Delivered / Completed)
   - Refresh functionality
   - Empty state with call-to-action
   - Status: ✅ Complete (280 lines)

5. **Order Detail Screen** (`/app/orders/[id].tsx`)
   - Comprehensive order view (already exists, enhanced)
   - Shows exact fulfillment status
   - Action buttons: Confirm Delivery, Contact Support, Raise Dispute
   - Escrow status badge
   - Help section with FAQs
   - Status: ✅ Enhanced (543 lines)

**Pending:**
- Order detail delivery confirmation modal/dialog
- Timeline visualization in order detail

---

### U2: Fabric Marketplace (Direct Purchase) ⏳ (0% Complete)

**User Journey:** Browse Fabrics → View Details → Add to Cart → Pay → Track Order

**Screens Needed:**
1. **Fabric Marketplace** (`/app/(tabs)/fabrics/index.tsx` - exists)
   - Grid/list of all available fabrics
   - Search, filter, sort functionality
   - Quick view cards with image, name, price, ratings

2. **Fabric Detail** (`/app/fabrics/[id].tsx` - exists)
   - Detailed fabric view with care instructions
   - Price tiers by quantity
   - Reviews and ratings
   - "Add to Cart" button
   - "Buy Now" button

3. **Cart Checkout** (`/app/cart/index.tsx` - exists)
   - Review items in cart
   - Update quantities
   - Escrow payment processing
   - Order confirmation

**Note:** These screens exist structurally; need enhancement for full marketplace flow.

---

### U3: Order Tracking & Delivery Confirmation ✅ (70% Complete)

**User Journey:** Production Timeline → Delivery Notification → Confirm Receipt → Escrow Released

**Screens Implemented:**
1. **Order Tracking** (Part of `/app/(tabs)/orders/index.tsx`)
   - Timeline visualization with 4 stages
   - Color-coded status badges
   - Days elapsed indicator
   - Status: ✅ Complete

2. **Order Detail with Actions** (Part of `/app/orders/[id].tsx`)
   - Full order state display
   - "Confirm Delivery" button (if applicable)
   - Contact support option
   - Status: ✅ Enhanced

**Pending:**
- Delivery confirmation dialog (upload proof, confirm receipt)
- Escrow release trigger integration
- Maker payout notification

**Non-Negotiable Rules:**
```
✅ NO delivery confirmation without held escrow
✅ Buyer-ONLY action (auth check required)
✅ Confirms delivery → payment released to maker
✅ No auto-release (buyer explicitly confirms)
```

---

### U4: Disputes & Escrow Protection ✅ (80% Complete)

**User Journey:** Issue Encountered → Raise Dispute → Escrow Frozen → Admin Reviews → Resolution

**Screens Implemented:**
1. **Raise Dispute Screen** (`/app/orders/[id]/dispute.tsx`)
   - Dispute reason selection (quality, size, delivery, fabric, damage, other)
   - Detailed issue description textarea
   - Evidence/photo upload section (placeholder)
   - Terms agreement checkbox
   - Submit button with validation
   - "What Happens Next" info section
   - Status: ✅ Complete (380 lines)

2. **Dispute Management** (Via Order Store)
   - `raiseDispute()` method in order.store.ts
   - Validates escrow is held
   - Freezes escrow on submit
   - Notifies admin for review
   - Status: ✅ Complete (store method)

**Pending:**
- Admin dispute review screen (admin-only)
- Refund/Release decision UI
- Dispute resolution notification to user
- Evidence display/validation

**Non-Negotiable Rules:**
```
✅ Dispute freezes escrow immediately
✅ Only buyer or maker can dispute
✅ Admin must explicitly decide (refund or release)
✅ No escrow release while disputed
✅ User notified of resolution
```

---

## Database Schema Updates

### Disputes Table

```sql
CREATE TABLE disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  initiator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open', -- open | resolved | dismissed
  resolution TEXT, -- reason for resolution
  resolved_by UUID REFERENCES auth.users(id), -- admin who resolved
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### Orders Table Updates

```sql
-- Add fields if not present
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_status TEXT DEFAULT 'pending';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS confirmed_delivery_at TIMESTAMP WITH TIME ZONE;
```

### Escrow Table Updates

```sql
-- Ensure status includes 'frozen'
-- Status values: pending | held | frozen | released | refunded
ALTER TABLE escrow ADD CONSTRAINT escrow_status_check 
  CHECK (status IN ('pending', 'held', 'frozen', 'released', 'refunded'));
```

---

## State Management - Order Store

### `useOrderStore` API

```typescript
// Fetching
fetchOrders(userId: string) → Promise<void>
fetchOrder(orderId: string) → Promise<Order>
getOrdersByStatus(status: string) → Order[]

// Delivery Confirmation (U3)
confirmDelivery(orderId: string, proofUrl?: string) 
  → Promise<{ success: boolean; escrowReleased: boolean }>
  
// Dispute Raising (U4)
raiseDispute(orderId: string, reason: string, description: string, initiatorId: string)
  → Promise<{ success: boolean; disputeId: string }>

// Timeline & Status
getOrderTimeline(orderId: string) 
  → Array<{ status: string; timestamp: string; description: string }>
canConfirmDelivery(order: Order, userId: string) → boolean
canRaiseDispute(order: Order, userId: string) → boolean

// Utilities
clearError() → void
reset() → void
```

**File:** `/src/store/order.store.ts` (380 lines)

---

## Component Architecture

### Screen Navigation Structure

```
/app/
├── (tabs)/
│   ├── orders/
│   │   ├── index.tsx          ← Order list with timeline
│   │   └── [id].tsx           ← Order detail (separate folder)
│   ├── fabrics/
│   │   └── index.tsx          ← Marketplace (U2)
│   └── events/
│       └── [eventId].tsx      ← Event listing
│
├── event/
│   ├── [eventId]/
│   │   ├── index.tsx          ← Guest dashboard
│   │   ├── pay.tsx            ← Payment flow
│   │   ├── fabric.tsx         ← Fabric viewer
│   │   ├── join.tsx           ← Join flow (STEP 3A)
│   │   └── makers.tsx         ← Maker selection
│
├── orders/
│   └── [id]/
│       ├── dispute.tsx        ← Raise dispute
│       └── [id].tsx           ← Order detail (alternative route)
│
└── cart/
    └── index.tsx              ← Cart checkout (U2)
```

### Import Patterns

```typescript
// Stores
import { useOrderStore } from '@/src/store/order.store';
import { useEventStore } from '@/src/store/event.store';
import { useAuthStore } from '@/src/store/auth.store';
import { usePaymentStore } from '@/src/store/payment.store';

// Theme
import { spacing, colors, typography } from '@/src/theme';

// Components
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

// Icons
import { AlertCircle, Flag, Clock, CheckCircle } from 'lucide-react-native';
```

---

## Escrow Safety Matrix

| Scenario | User Action | Escrow Status | Result |
|----------|-------------|--------------|--------|
| Payment confirmed | Buyer pays | held | Tailor can start production |
| Dispute raised | Buyer/Maker disputes | frozen | No release until admin decides |
| Delivery confirmed | Buyer confirms receipt | released | Payment sent to tailor |
| Refund issued | Admin decision | refunded | Payment returned to buyer |

---

## User Flows - Detailed

### Flow 1: Guest Event Order (U1)

```
1. Guest clicks event invite link
   → Route: /event/[eventId]/join?code={code}
   
2. Join event with code validation
   → Screen: join.tsx (from STEP 3A)
   → Updates: useParticipantStore.joinEvent()
   
3. Lands on event dashboard
   → Screen: /event/[eventId]/index.tsx
   → Shows: Event info + 4-step card navigation
   
4. Clicks "View Fabric"
   → Route: /event/[eventId]/fabric
   → Screen: fabric.tsx
   → Shows: Fabric details, care instructions, specs
   
5. Clicks "Choose Tailor"
   → Route: /makers/select
   → Screen: select.tsx (from STEP 3A)
   → Shows: Maker list, ratings, prices, filtering
   
6. Selects maker
   → Creates preliminary order
   → Routes to payment
   
7. Clicks "Pay Now"
   → Route: /event/[eventId]/pay
   → Screen: pay.tsx
   → Shows: Escrow guarantee, amount, terms
   
8. Confirms payment & terms
   → Actions:
     - usePaymentStore.recordPayment()
     - Order status → 'in_production'
     - Escrow status → 'held'
   
9. Redirected to order detail
   → Screen: /orders/[id]
   → Can: Track production, confirm delivery, raise dispute
```

### Flow 2: Delivery Confirmation (U3)

```
1. User navigates to /orders/[id]
   → Shows order detail with current status
   
2. Order reaches 'delivered' status
   → Tailor shipped item + provided tracking
   
3. User receives item
   → Clicks "Confirm Delivery" button
   
4. Delivery confirmation dialog
   → (When implemented)
   → Option to upload proof photo
   → Confirm receipt checkbox
   
5. Confirms delivery
   → Actions:
     - useOrderStore.confirmDelivery(orderId, proofUrl)
     - Order status → 'completed'
     - Escrow status → 'released'
     - Payment sent to tailor
   
6. Success notification
   → "Delivery confirmed! Payment released to {tailor_name}"
   
7. Order marked complete
   → Can still raise dispute for 30 days
```

### Flow 3: Dispute Resolution (U4)

```
1. Issue during production/delivery
   → User navigates to /orders/[id]
   
2. Clicks "Raise Dispute" button
   → Only visible if escrow.status === 'held'
   
3. Dispute form (detailed reasoning)
   → Route: /orders/[id]/dispute
   → Screen: dispute.tsx
   → Inputs:
     - Dispute reason (dropdown)
     - Description (textarea)
     - Evidence (photos - optional)
     - Terms agreement checkbox
   
4. Submits dispute
   → Actions:
     - useOrderStore.raiseDispute(orderId, reason, description)
     - Dispute record created
     - Escrow status → 'frozen'
     - Notification sent to admin
   
5. Admin reviews dispute
   → (In admin panel - not in U4 scope)
   → Reviews evidence, messages parties
   → Decides: Refund buyer OR Release to tailor
   
6. User notified of resolution
   → (Via notification system)
   → If refunded: Money returned
   → If released: Payment sent to tailor
   
7. Order completed/resolved
```

---

## Implementation Checklist

### U1: Guest Event Order Flow

- ✅ Event guest dashboard created
- ✅ Fabric viewer created
- ✅ Payment flow created (with escrow guarantee)
- ✅ Order list with timeline created
- ✅ Order detail (basic) exists
- ⏳ Delivery confirmation dialog (pending Supabase integration)
- ⏳ Order detail enhancements (timeline visualization)

### U2: Fabric Marketplace

- ⏳ Fabric list improvements (search, filter, sort)
- ⏳ Fabric detail screen (if needed)
- ⏳ Cart to payment flow integration
- ⏳ Direct purchase flow (outside events)

### U3: Order Tracking & Delivery

- ✅ Order list with timeline
- ✅ Order detail screen
- ✅ Status tracking
- ⏳ Delivery confirmation modal
- ⏳ Escrow release trigger
- ⏳ Maker payout notification

### U4: Disputes & Escrow Protection

- ✅ Dispute form created
- ✅ Dispute submission flow
- ✅ Escrow freeze logic (in store)
- ⏳ Admin dispute review (admin panel - out of scope)
- ⏳ Resolution notification
- ⏳ Refund/release decision

---

## Testing Scenarios

### Test U1: Guest Event Order

1. **Successful Order Creation**
   ```
   Preconditions: Joined event, viewed fabric
   Action: Pay via escrow
   Expected: Order created, escrow held, redirected to order detail
   Verify: Order appears in list, status shows "in_production"
   ```

2. **Payment Validation**
   ```
   Preconditions: On payment screen
   Action: Try to submit without agreeing to terms
   Expected: Button disabled, error alert shown
   Verify: Cannot proceed without terms agreement
   ```

### Test U3: Delivery Confirmation

1. **Delivery Confirmation (Buyer-Only)**
   ```
   Preconditions: Order status "delivered", logged in as buyer
   Action: Click "Confirm Delivery"
   Expected: Confirmation dialog shown
   Verify: Button visible and enabled
   ```

2. **Escrow Release**
   ```
   Preconditions: Delivery confirmed
   Action: Confirm delivery
   Expected: Escrow released, payment sent to tailor
   Verify: Order status → "completed", escrow → "released"
   ```

### Test U4: Dispute Flow

1. **Dispute Submission**
   ```
   Preconditions: Order in production, escrow held
   Action: Raise dispute with reason & description
   Expected: Dispute created, escrow frozen
   Verify: Order shows "disputed", escrow frozen
   ```

2. **Dispute Permission Check**
   ```
   Preconditions: Try to dispute as unauthorized user
   Action: Attempt dispute
   Expected: Error message
   Verify: Only buyer/maker can dispute
   ```

3. **Escrow Freeze**
   ```
   Preconditions: Dispute raised
   Action: Try to confirm delivery
   Expected: Cannot confirm, escrow frozen
   Verify: Delivery button disabled
   ```

---

## API Integration Checklist

### Supabase Tables Needed

- [ ] Disputes table (create per schema above)
- [ ] Payments table (verify escrow status field)
- [ ] Orders table (verify delivery_status field)
- [ ] Makers table (for /makers/select, STEP 3A)

### API Endpoints Needed

**Orders API:**
- [ ] `GET /orders` - List user orders
- [ ] `GET /orders/:id` - Get order detail
- [ ] `POST /orders` - Create order
- [ ] `PATCH /orders/:id/delivery` - Confirm delivery
- [ ] `POST /orders/:id/dispute` - Raise dispute

**Payments API:**
- [ ] `POST /payments/record` - Record escrow payment
- [ ] `PATCH /payments/:id/release` - Release escrow
- [ ] `PATCH /payments/:id/freeze` - Freeze escrow (dispute)
- [ ] `PATCH /payments/:id/refund` - Refund escrow

**Disputes API:**
- [ ] `GET /disputes/:id` - Get dispute detail
- [ ] `PATCH /disputes/:id/resolve` - Admin resolve dispute

---

## Known Issues & Limitations

1. **Photo Upload Placeholder**
   - Dispute evidence photo upload not implemented
   - Placeholder UI shows "📸 Upload Photos (coming soon)"
   - Fix: Integrate React Native file picker when backend ready

2. **Admin Panel Missing**
   - Dispute review/resolution UI not created
   - Admin screens are out of scope for STEP 4
   - Fix: Create admin dashboard in separate phase

3. **Notifications Missing**
   - No push notifications for order updates
   - No email notifications
   - Fix: Integrate notification service (Firebase, Twilio, etc.)

4. **Payment Processing Integration**
   - Payment screen doesn't call actual payment processor
   - nativPay integration pending
   - Fix: Implement nativPay API in payment.store.ts

5. **Maker Payout Logic**
   - Maker payment/payout not implemented
   - Placeholder logic in store
   - Fix: Integrate payout service (Stripe, Wise, etc.)

---

## Next Steps (Priority Order)

### Phase 1: Core Integration (Week 1)
1. Implement Supabase table queries in order.store.ts
2. Connect payment screen to actual payment processor
3. Implement delivery confirmation dialog
4. Add order detail timeline visualization

### Phase 2: Notification & Polish (Week 2)
1. Add push notifications for order updates
2. Implement photo upload for disputes
3. Add order status notifications via email
4. Enhance UI with real data (maker names, fabric images)

### Phase 3: Marketplace (Week 3)
1. Implement U2 fabric marketplace
2. Direct fabric purchasing (outside events)
3. Cart functionality
4. Fabric search/filter/sort

### Phase 4: Admin & Monitoring (Week 4)
1. Admin dispute review screen
2. Order analytics dashboard
3. Escrow balance monitoring
4. Dispute resolution workflows

---

## Quick Reference - File Locations

**New Files (STEP 4):**
- `/app/event/[eventId]/index.tsx` - Event guest dashboard (240 lines)
- `/app/event/[eventId]/pay.tsx` - Payment flow (320 lines)
- `/app/event/[eventId]/fabric.tsx` - Fabric viewer (280 lines)
- `/app/orders/[id]/dispute.tsx` - Dispute form (380 lines)
- `/src/store/order.store.ts` - Order store (380 lines)
- `/app/(tabs)/orders/index.tsx` - Enhanced order list (280 lines)

**Modified Files:**
- `/app/orders/[id].tsx` - Enhanced with dispute link

**Total Lines Added:** 1,880

---

## Escrow Protection - Non-Negotiable Rules

```
1. NO PAYMENT WITHOUT ESCROW
   ✅ All payments must be held in escrow
   ✅ No direct payment to maker
   ✅ Buyer funds protected until delivery confirmed

2. NO DELIVERY WITHOUT HELD ESCROW
   ✅ Tailor cannot mark delivered without payment in escrow
   ✅ Prevents tailor from keeping payment without delivering

3. NO RELEASE WITHOUT BUYER CONFIRMATION
   ✅ Escrow never auto-releases
   ✅ Buyer must explicitly confirm delivery
   ✅ Protects against fraudulent delivery claims

4. NO RELEASE WHILE DISPUTED
   ✅ Dispute freezes escrow immediately
   ✅ Prevents release during dispute resolution
   ✅ Admin must explicitly decide: refund or release

5. BUYER-ONLY DELIVERY CONFIRMATION
   ✅ Only buyer (auth.user.id === order.buyer_id) can confirm
   ✅ Prevents maker from confirming own delivery
   ✅ Ensures independent verification
```

---

## Documentation & Reference Files

- `STEP3A1-A4_IMPLEMENTATION_SUMMARY.md` - Host flow (STEP 3A)
- `STEP3A1-A4_QUICK_REFERENCE.md` - Quick reference for STEP 3A
- This file: `STEP4_GUEST_FLOWS.md` - Guest flow (STEP 4)

---

**Created:** Today  
**Status:** In Progress (60% Complete)  
**Next Session:** Continue with Phase 1 integration tasks
