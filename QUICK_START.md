# Quick Start Guide - Payment & Escrow Components

## 🚀 Getting Started in 5 Minutes

### 1. Import Components

```tsx
import {
  FulfillmentTracker,
  EscrowStatusBadge,
  DeliveryConfirmation,
  PaymentMethodSelector,
  DisputeResolution,
} from '@/src/components/payments';
```

### 2. Display Order Status

```tsx
<FulfillmentTracker
  payment={{status: 'held'}}
  production={{status: 'in_progress'}}
  delivery={{status: 'pending'}}
  escrow={{status: 'locked'}}
  orderId="order_123"
/>

<EscrowStatusBadge status="held" variant="large" showDescription />
```

### 3. Handle Delivery Confirmation

```tsx
<DeliveryConfirmation
  orderId="order_123"
  escrowId="escrow_456"
  amount={50000}
  currency="USD"
  onConfirm={async (proofUrl) => {
    // API call to confirm delivery
    await ordersApi.confirmDelivery(orderId, proofUrl);
  }}
/>
```

### 4. Payment Method Selection

```tsx
<PaymentMethodSelector
  amount={50000}
  currency="USD"
  walletBalance={1000}
  onSelect={async (method) => {
    // Create order with selected payment method
    const order = await ordersApi.checkoutCart(method);
  }}
/>
```

### 5. Dispute Flow

```tsx
<DisputeResolution
  orderId="order_123"
  escrowId="escrow_456"
  amount={50000}
  currency="USD"
  onInitiate={async (payload) => {
    // Submit dispute
    await paymentsApi.initiateDispute({orderId, ...payload});
  }}
/>
```

## 📋 Component Props Reference

### FulfillmentTracker
```tsx
<FulfillmentTracker
  payment={{status: string, updatedAt?: string, reason?: string}}
  production={{status: string, updatedAt?: string, reason?: string}}
  delivery={{status: string, updatedAt?: string, reason?: string}}
  escrow={{status: string, updatedAt?: string, reason?: string}}
  orderId?: string
/>
```

### EscrowStatusBadge
```tsx
<EscrowStatusBadge
  status="created" | "held" | "released" | "refunded" | "disputed"
  variant?: "small" | "medium" | "large"
  showDescription?: boolean
/>
```

### DeliveryConfirmation
```tsx
<DeliveryConfirmation
  orderId: string
  escrowId: string
  amount: number
  currency?: string // default: "USD"
  sellerName?: string
  onConfirm?: (proofUrl: string) => Promise<void>
  onCancel?: () => void
/>
```

### PaymentMethodSelector
```tsx
<PaymentMethodSelector
  amount: number
  currency?: string // default: "USD"
  onSelect?: (method: "card" | "transfer" | "wallet") => Promise<void>
  walletBalance?: number
  hideUnavailable?: boolean
/>
```

### DisputeResolution
```tsx
<DisputeResolution
  orderId: string
  escrowId: string
  amount: number
  currency?: string // default: "USD"
  sellerName?: string
  buyerName?: string
  onInitiate?: (payload) => Promise<void>
  onCancel?: () => void
/>
```

## 🔄 Common Flows

### Order Checkout Flow
```tsx
// 1. Show payment method selector
<PaymentMethodSelector
  amount={cart.total}
  onSelect={async (method) => {
    // Backend: creates order + escrow + payment
    const order = await ordersApi.checkoutCart({
      cartId: cart.id,
      paymentMethod: method,
    });
    // Navigate to order detail
    router.push(`/orders/${order.id}`);
  }}
/>

// 2. In order detail, show fulfillment tracker
<FulfillmentTracker {...order} />

// 3. When delivered and payment held, show delivery confirmation
{order.payment.status === 'held' && order.delivery.status === 'pending' && (
  <DeliveryConfirmation
    orderId={order.id}
    escrowId={escrowId}
    amount={order.total}
    onConfirm={async (proofUrl) => {
      await ordersApi.confirmDelivery({orderId, escrowId, proofUrl});
    }}
  />
)}

// 4. After release, show dispute option if within 30 days
{order.escrow.status === 'released' && (
  <TouchableOpacity onPress={() => router.push(`/payments/dispute?orderId=${orderId}`)}>
    <Text>Report Issue</Text>
  </TouchableOpacity>
)}
```

### Dispute Flow
```tsx
<DisputeResolution
  orderId={orderId}
  escrowId={escrowId}
  amount={order.total}
  onInitiate={async (payload) => {
    // Submit dispute to backend
    const dispute = await paymentsApi.initiateDispute({
      orderId,
      reason: payload.reason,
      description: payload.description,
      evidenceUrls: payload.evidenceUrls,
    });
    
    // Show confirmation
    Alert.alert('Dispute Submitted', 'We will review and contact you.');
    
    // Navigate back
    router.back();
  }}
  onCancel={() => router.back()}
/>
```

## 🎨 Styling & Customization

All components use the theme system:

```tsx
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';
import { typography } from '@/src/theme/typography';

// Colors available
colors.primary        // #FF6B6B (red)
colors.success        // #10B981 (green)
colors.warning        // #F59E0B (orange)
colors.error          // #EF4444 (red)
colors.info           // #3B82F6 (blue)

// Spacing available
spacing.xs            // 4px
spacing.sm            // 8px
spacing.md            // 12px
spacing.lg            // 16px
spacing.xl            // 24px

// Typography available
typography.fontSize.xs
typography.fontSize.sm
typography.fontSize.base
typography.fontSize.lg
typography.fontSize.xl
typography.fontWeight.normal
typography.fontWeight.semibold
typography.fontWeight.bold
```

## 🧪 Testing with Mock Data

```tsx
const mockOrder = {
  id: 'order_123',
  total: 50000,
  currency: 'USD',
  payment: { status: 'held' },
  production: { status: 'in_progress' },
  delivery: { status: 'pending' },
  escrow: { status: 'locked' },
};

render(
  <FulfillmentTracker
    payment={mockOrder.payment}
    production={mockOrder.production}
    delivery={mockOrder.delivery}
    escrow={mockOrder.escrow}
    orderId={mockOrder.id}
  />
);
```

## 📚 Documentation Links

- **Payment Flows**: See [PAYMENT_FLOW_GUIDE.ts](./src/api/PAYMENT_FLOW_GUIDE.ts)
- **Implementation**: See [IMPLEMENTATION_SUMMARY.ts](./src/api/IMPLEMENTATION_SUMMARY.ts)
- **Code Examples**: See [USAGE_EXAMPLES.ts](./src/components/payments/USAGE_EXAMPLES.ts)
- **Verification**: See [VERIFICATION_CHECKLIST.md](./VERIFICATION_CHECKLIST.md)

## ⚙️ API Integration

### Orders API
```tsx
// Create order with escrow
const order = await ordersApi.checkoutCart({
  cartId: string,
  paymentMethod: 'card' | 'transfer' | 'wallet',
});

// Confirm delivery and release escrow
const updated = await ordersApi.confirmDelivery({
  orderId: string,
  escrowId: string,
  proofUrl: string,
});

// Update fulfillment status (4 dimensions)
await ordersApi.updateFulfillmentStatus(orderId, {
  payment: {status: 'released'},
  production: {status: 'completed'},
  delivery: {status: 'delivered'},
  escrow: {status: 'released'},
});
```

### Payments API
```tsx
// Initiate dispute
const dispute = await paymentsApi.initiateDispute({
  orderId: string,
  reason: string,
  description: string,
  evidenceUrls: string[],
});
```

### nativPay Client
```tsx
// Escrow operations
const escrow = await nativPayClient.initiateEscrow({
  orderId, amount, payerId, payeeId, mode
});

const released = await nativPayClient.releaseEscrow(escrowId);

const dispute = await nativPayClient.initializeDispute({
  escrowId, reason, description, evidenceUrls
});

const resolution = await nativPayClient.resolveDispute(
  escrowId,
  payerAmount,   // Refund to buyer
  payeeAmount    // Payment to seller
);
```

## 🐛 Troubleshooting

### Component not displaying?
- Check that order data is passed correctly
- Verify status strings match expected values
- See console for TypeScript errors

### Callbacks not firing?
- Ensure onConfirm/onSelect/onInitiate callbacks are defined
- Check that API calls are successful
- Verify async operations complete before navigation

### Styling issues?
- Import colors, spacing, typography from theme
- Check that StyleSheet.create() is used
- Verify platform-specific styles if needed

## 🚀 Deployment Checklist

Before going to production:

- [ ] Replace mock data with real API calls
- [ ] Test all flows end-to-end
- [ ] Implement real image upload
- [ ] Setup error logging
- [ ] Configure push notifications
- [ ] Enable payment processing
- [ ] Implement dispute mediation
- [ ] Add security headers
- [ ] Setup monitoring & alerts
- [ ] Load test API endpoints

## 📞 Support

For questions about:
- **Component usage**: Check USAGE_EXAMPLES.ts
- **Payment flows**: Check PAYMENT_FLOW_GUIDE.ts
- **Architecture**: Check IMPLEMENTATION_SUMMARY.ts
- **Integration**: Check component JSDoc comments

---

**Ready to build!** 🎉

Start with importing the components and connecting them to your API. All components work standalone with mock data, then integrate with real API as needed.
