/**
 * PAYMENT & ESCROW FLOW DOCUMENTATION
 * ====================================
 *
 * Complete guide to payment processing, escrow lifecycle, and dispute resolution
 * in the nativPay MVP.
 *
 * KEY PRINCIPLES (Non-Negotiable)
 * ==============================
 *
 * 1. ESCROW GATE: All payments go through escrow. No exceptions.
 *    - Funds locked immediately upon payment
 *    - Seller cannot receive payment until delivery confirmed
 *    - Buyer cannot recover funds without proof/dispute
 *
 * 2. DELIVERY REQUIREMENT: Escrow release requires delivery confirmation.
 *    - Photo proof mandatory
 *    - Immutable audit trail for disputes
 *    - 30-day dispute window after release
 *
 * 3. THREE MODES: Host, Guest, Mixed (for event-based orders)
 *    - Host: Single escrow, host pays all
 *    - Guest: Per-guest escrow, individual payments
 *    - Mixed: Host deposit + per-guest escrows
 *
 * 4. ROUTING: Services route to specific recipients
 *    - Fabrics: Payment to retailer
 *    - Tailoring: Payment to maker
 *    - Separate escrows per service type
 *
 * ============================================================================
 * FLOW 1: SINGLE ORDER PAYMENT (HOST MODE)
 * ============================================================================
 *
 * Step 1: ORDER CREATION
 * ----------------------
 * User creates order (fabric + tailoring from different providers)
 * Order structure:
 * ```
 * Order {
 *   id: "order_123",
 *   items: [
 *     { type: "fabric", provider: "retailer_id", amount: 15000 },
 *     { type: "tailoring", provider: "maker_id", amount: 25000 }
 *   ],
 *   total: 40000,
 *   currency: "USD",
 *   status: "pending"
 * }
 * ```
 *
 * Step 2: CART & PAYMENT PREPARATION
 * -----------------------------------
 * Components Used:
 * - `CartStore` - Aggregates items with pricing breakdown
 * - `FulfillmentTracker` - Shows initial state (all pending)
 *
 * Display:
 * ```
 * FulfillmentTracker {
 *   payment: { status: "pending", ... },
 *   production: { status: "in_progress", ... },
 *   delivery: { status: "pending", ... },
 *   escrow: { status: "locked", ... }
 * }
 * ```
 *
 * Step 3: PAYMENT METHOD SELECTION
 * --------------------------------
 * Component: `PaymentMethodSelector`
 * User selects: Card, Bank Transfer, or Wallet
 *
 * Example:
 * ```tsx
 * <PaymentMethodSelector
 *   amount={40000}
 *   currency="USD"
 *   onSelect={async (method) => {
 *     // method = 'card' | 'transfer' | 'wallet'
 *     const payment = await nativPayClient.createPayment({
 *       method,
 *       amount: 40000,
 *       escrowId: escrow.id
 *     });
 *   }}
 * />
 * ```
 *
 * Step 4: ESCROW INITIATION
 * -------------------------
 * Backend (Orders API - checkoutCart) initiates escrow:
 * ```
 * const escrow = await nativPayClient.initiateEscrow({
 *   orderId: "order_123",
 *   amount: 40000,
 *   payerId: buyerId,
 *   payeeId: [retailerId, makerId], // Multiple recipients
 *   mode: 'host',
 *   eventId: undefined // Not an event order
 * });
 *
 * // Result: escrow.status = 'created'
 * ```
 *
 * Step 5: PAYMENT PROCESSING
 * --------------------------
 * Payment client processes transaction:
 * ```
 * const payment = await nativPayClient.createPayment({
 *   orderId: "order_123",
 *   escrowId: escrow.id,
 *   amount: 40000,
 *   method: 'card'
 * });
 *
 * // Triggers webhook: payment.status = 'completed'
 * // Updates escrow: escrow.status = 'held' (funds locked)
 * ```
 *
 * State Update:
 * ```
 * FulfillmentTracker updates:
 * - payment: { status: "held", ... }  ← Payment locked in escrow
 * - production: { status: "in_progress", ... }  ← Maker starts work
 * - delivery: { status: "pending", ... }  ← Awaiting shipment
 * - escrow: { status: "locked", ... }  ← Non-negotiable
 * ```
 *
 * Step 6: PRODUCTION & SHIPMENT
 * ----------------------------
 * Makers/retailers produce and ship:
 * - Production status updates via maker dashboard
 * - Shipment tracking integrated with delivery status
 * - Estimated delivery date calculated
 *
 * Updated state:
 * ```
 * FulfillmentTracker {
 *   payment: { status: "held", ... },
 *   production: { status: "completed", ... },  ← Work done
 *   delivery: { status: "shipped", ... },  ← In transit
 *   escrow: { status: "locked", ... }  ← Still locked
 * }
 * ```
 *
 * Step 7: DELIVERY CONFIRMATION
 * ----------------------------
 * Component: `DeliveryConfirmation`
 *
 * Non-negotiable process:
 * 1. Buyer confirms item received
 * 2. Buyer uploads photo proof
 * 3. System triggers escrow release
 *
 * Implementation:
 * ```tsx
 * <DeliveryConfirmation
 *   orderId="order_123"
 *   escrowId="escrow_456"
 *   amount={40000}
 *   onConfirm={async (proofUrl) => {
 *     // Step 1: Update delivery status
 *     await ordersApi.updateFulfillmentStatus(orderId, {
 *       delivery: { status: "delivered" }
 *     });
 *
 *     // Step 2: Confirm delivery with nativPay
 *     await nativPayClient.confirmDelivery({
 *       orderId: "order_123",
 *       escrowId: "escrow_456",
 *       proofUrl: proofUrl
 *     });
 *
 *     // Step 3: Release escrow (automatic)
 *     const released = await nativPayClient.releaseEscrow(
 *       "escrow_456",
 *       "delivery_confirmed"
 *     );
 *
 *     // Step 4: Update fulfillment
 *     await ordersApi.updateFulfillmentStatus(orderId, {
 *       payment: { status: "released" },
 *       escrow: { status: "released" }
 *     });
 *   }}
 * />
 * ```
 *
 * Final State:
 * ```
 * FulfillmentTracker {
 *   payment: { status: "released", ... },  ← Seller gets paid
 *   production: { status: "completed", ... },
 *   delivery: { status: "delivered", ... },
 *   escrow: { status: "released", ... }  ← Complete
 * }
 * ```
 *
 * Step 8: PAYMENT DISTRIBUTION
 * ---------------------------
 * Backend distributes funds based on routing:
 * - Retailer receives: $15,000 (fabric payment)
 * - Maker receives: $25,000 (tailoring payment)
 * - Platform fee: deducted from escrow
 * - Tax: deducted from escrow
 *
 * ============================================================================
 * FLOW 2: EVENT-BASED PAYMENT (MIXED MODE)
 * ============================================================================
 *
 * Different from single order: Multiple buyers, event controls routing
 *
 * Example: ASO-EBI event with 10 attendees
 * - Host (event organizer) deposits initial amount
 * - Guests pay individually
 * - Separate escrows per guest
 * - Host can split with guests or subsidize
 *
 * Event Order Structure:
 * ```
 * EventOrder extends Order {
 *   eventId: "event_123",
 *   eventName: "Wedding ASO-EBI",
 *   guests: [
 *     { userId: "guest_1", role: "attending", escrowId: "escrow_1" },
 *     { userId: "guest_2", role: "attending", escrowId: "escrow_2" },
 *     { userId: "host", role: "organizer", escrowId: "escrow_host" }
 *   ],
 *   totalCost: 400000,
 *   mode: "mixed"
 * }
 * ```
 *
 * Payment Flow:
 * 1. Host initiates escrow (mode: 'mixed')
 * 2. Host deposits amount
 * 3. Individual guests create escrows
 * 4. Separate payments held per guest
 * 5. Delivery confirmed once (released to all)
 * 6. Funds distributed per escrow
 *
 * ============================================================================
 * FLOW 3: DISPUTE RESOLUTION
 * ============================================================================
 *
 * Non-negotiable dispute window: 30 days after delivery
 *
 * Step 1: ISSUE DISCOVERED
 * ----------------------
 * Buyer receives damaged/wrong item.
 * Component: `DisputeResolution`
 *
 * Step 2: GATHER EVIDENCE
 * ----------------------
 * Buyer uploads:
 * - Photos of issue
 * - Videos showing damage
 * - Any documents
 *
 * Step 3: SUBMIT DISPUTE
 * ----------------------
 * ```tsx
 * <DisputeResolution
 *   orderId="order_123"
 *   escrowId="escrow_456"
 *   amount={40000}
 *   onInitiate={async (payload) => {
 *     const dispute = await nativPayClient.initializeDispute({
 *       escrowId: "escrow_456",
 *       reason: "quality_issue",
 *       description: "Stitching is poor...",
 *       evidenceUrls: [...]
 *     });
 *     // escrow.status = 'disputed'
 *   }}
 * />
 * ```
 *
 * Step 4: SELLER RESPONSE
 * ----------------------
 * Seller has 48 hours to respond with:
 * - Acknowledgment
 * - Counter-evidence
 * - Proposed resolution
 *
 * Step 5: NEUTRAL MEDIATION
 * ----------------------
 * Platform mediator reviews:
 * - Buyer evidence
 * - Seller evidence
 * - Order history
 * - Similar cases
 *
 * Determines fair split:
 * - 100% refund: Severe issue, clear buyer fault
 * - 50/50 split: Partial issue, shared responsibility
 * - 0% refund: Buyer at fault (e.g., "changed mind")
 *
 * Step 6: RESOLUTION EXECUTION
 * ---------------------------
 * Backend splits funds:
 * ```
 * const resolution = await nativPayClient.resolveDispute(
 *   "escrow_456",
 *   payerAmount: 40000,  // Full refund to buyer
 *   payeeAmount: 0       // Nothing to seller
 * );
 *
 * // Or more commonly:
 * await nativPayClient.resolveDispute(
 *   "escrow_456",
 *   payerAmount: 20000,  // 50% refund to buyer
 *   payeeAmount: 20000   // 50% to seller
 * );
 * ```
 *
 * Final state:
 * ```
 * Escrow {
 *   status: 'released',
 *   disputeResolution: {
 *     payerAmount: 20000,
 *     payeeAmount: 20000,
 *     resolvedAt: '2025-12-14T10:00:00Z'
 *   }
 * }
 * ```
 *
 * ============================================================================
 * COMPONENT USAGE PATTERNS
 * ============================================================================
 *
 * PATTERN 1: DISPLAY CURRENT STATE
 * --------------------------------
 * ```tsx
 * import { FulfillmentTracker, EscrowStatusBadge } from '@/src/components/payments';
 *
 * function OrderDetail({ orderId }) {
 *   const { order } = useOrderStore();
 *   const { escrow } = useEscrowStore();
 *
 *   return (
 *     <View>
 *       <FulfillmentTracker
 *         payment={order.payment}
 *         production={order.production}
 *         delivery={order.delivery}
 *         escrow={order.escrow}
 *         orderId={orderId}
 *       />
 *       <EscrowStatusBadge
 *         status={escrow.status}
 *         variant="large"
 *         showDescription
 *       />
 *     </View>
 *   );
 * }
 * ```
 *
 * PATTERN 2: PAYMENT CHECKOUT
 * ---------------------------
 * ```tsx
 * import { PaymentMethodSelector } from '@/src/components/payments';
 *
 * function CheckoutScreen({ cart }) {
 *   return (
 *     <PaymentMethodSelector
 *       amount={cart.total}
 *       currency="USD"
 *       walletBalance={userWallet.balance}
 *       onSelect={async (method) => {
 *         // Create payment
 *         const payment = await paymentsApi.createPayment({
 *           orderId: cart.orderId,
 *           method,
 *           amount: cart.total
 *         });
 *
 *         // Update store
 *         usePaymentStore().setCurrentPayment(payment);
 *       }}
 *     />
 *   );
 * }
 * ```
 *
 * PATTERN 3: DELIVERY CONFIRMATION
 * --------------------------------
 * ```tsx
 * import { DeliveryConfirmation } from '@/src/components/payments';
 *
 * function OrderStatus({ orderId, escrowId, amount }) {
 *   const order = useOrderStore((s) => s.getOrder(orderId));
 *
 *   // Only show if payment held and delivery pending
 *   if (order.payment.status !== 'held' || order.delivery.status !== 'pending') {
 *     return null;
 *   }
 *
 *   return (
 *     <DeliveryConfirmation
 *       orderId={orderId}
 *       escrowId={escrowId}
 *       amount={amount}
 *       onConfirm={async (proofUrl) => {
 *         // Confirm with API
 *         await ordersApi.confirmDelivery({
 *           orderId,
 *           escrowId,
 *           proofUrl
 *         });
 *       }}
 *     />
 *   );
 * }
 * ```
 *
 * PATTERN 4: DISPUTE FLOW
 * ----------------------
 * ```tsx
 * import { DisputeResolution, EscrowStatusBadge } from '@/src/components/payments';
 *
 * function OrderOptions({ orderId, escrowId, amount }) {
 *   const escrow = useEscrowStore().getEscrow(escrowId);
 *   const [showDispute, setShowDispute] = useState(false);
 *
 *   // Show dispute button if in dispute window
 *   const daysElapsed = Math.floor(
 *     (Date.now() - new Date(escrow.releasedAt).getTime()) / (1000 * 60 * 60 * 24)
 *   );
 *
 *   if (daysElapsed > 30 || escrow.status !== 'released') {
 *     return null;
 *   }
 *
 *   if (showDispute) {
 *     return (
 *       <DisputeResolution
 *         orderId={orderId}
 *         escrowId={escrowId}
 *         amount={amount}
 *         onInitiate={async (payload) => {
 *           await paymentsApi.initiateDispute({
 *             escrowId,
 *             ...payload
 *           });
 *           setShowDispute(false);
 *         }}
 *       />
 *     );
 *   }
 *
 *   return (
 *     <TouchableOpacity onPress={() => setShowDispute(true)}>
 *       <Text>Report Issue</Text>
 *     </TouchableOpacity>
 *   );
 * }
 * ```
 *
 * ============================================================================
 * API INTEGRATION
 * ============================================================================
 *
 * All payment flows integrate with these API modules:
 *
 * 1. orders.api.ts
 *    - createOrder / createEventOrder
 *    - checkoutCart (initiates escrow + payment)
 *    - updateFulfillmentStatus (tracks all 4 dimensions)
 *    - confirmDelivery (triggers release)
 *
 * 2. payments.api.ts
 *    - createPayment (processes transaction)
 *    - getPayment (fetch status)
 *    - requestRefund (buyer-initiated)
 *
 * 3. nativpay.client.ts
 *    - initiateEscrow (non-negotiable gate)
 *    - confirmDelivery (release gate)
 *    - releaseEscrow (distributes funds)
 *    - initializeDispute (dispute entry)
 *    - resolveDispute (split execution)
 *
 * ============================================================================
 * STATE MANAGEMENT
 * ============================================================================
 *
 * Stores involved:
 *
 * useCartStore
 *   - Items with pricing breakdown
 *   - Total with fees/tax
 *
 * useOrderStore (hypothetical)
 *   - Active order
 *   - Fulfillment status across 4 dimensions
 *   - Created, production, delivery, payment events
 *
 * useEscrowStore
 *   - Current escrow
 *   - Escrow lifecycle (created → held → released)
 *   - Release audit trail
 *   - Dispute status
 *
 * useAuthStore
 *   - User ID (payer/payee context)
 *   - Role (buyer/seller/host/guest)
 *
 * Context: PaymentContext (wraps escrow store)
 *   - Exposes: initiateEscrow, fundEscrow, releaseEscrow, disputeEscrow
 *
 * ============================================================================
 * SAFETY & NON-NEGOTIABLE RULES
 * ============================================================================
 *
 * 1. NO DIRECT PAYMENT
 *    ✓ All payments must create escrow
 *    ✓ Seller cannot receive funds before delivery confirmation
 *    ✗ No direct transfers bypassing escrow
 *
 * 2. DELIVERY GATE
 *    ✓ Release only after photo proof uploaded
 *    ✓ Immutable audit trail for disputes
 *    ✗ Automatic release without confirmation
 *
 * 3. DISPUTE WINDOW
 *    ✓ 30 days after release to initiate dispute
 *    ✓ Evidence required, neutral mediator reviews
 *    ✗ No disputes after 30 days
 *
 * 4. MODE ENFORCEMENT
 *    ✓ Host mode: 1 escrow, host covers all
 *    ✓ Guest mode: per-guest escrow, individual payments
 *    ✓ Mixed mode: host deposit + per-guest escrows
 *    ✗ No mixing of modes in single order
 *
 * 5. ROUTING COMPLIANCE
 *    ✓ Fabrics route to retailer
 *    ✓ Tailoring routes to maker
 *    ✓ Separate escrows per service
 *    ✗ No cross-routing of payments\n */
