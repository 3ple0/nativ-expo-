/**
 * STATE MANAGEMENT GUIDE
 * =====================
 *
 * This file documents the complete state management architecture
 * using Zustand stores + React Context providers.
 */

/**
 * ============================================================
 * CORE STORES (Zustand)
 * ============================================================
 *
 * Stores are the single source of truth for different domains.
 * They handle state logic, calculations, and mutations.
 */

/**
 * 1. AUTH STORE (auth.store.ts)
 * =============================
 * Responsibility: User authentication + Supabase session management
 *
 * State:
 * - user: User | null              // Current user profile
 * - roles: UserRole[]              // User's active roles
 * - token: string | null           // JWT access token
 * - refreshToken: string | null    // JWT refresh token
 * - supabaseSession: Session | null // Supabase session object
 * - tokenExpiresAt: number | null  // Token expiration timestamp
 * - isAuthenticated: boolean       // Auth status flag
 *
 * Key Actions:
 * - setUser(user)                  // Update user profile
 * - setToken(token, expiresIn)     // Store access token with TTL
 * - setSupabaseSession(session)    // Store Supabase session
 * - addRole(role)                  // Add role (guest → host + guest)
 * - hasRole(role)                  // Check if user has role
 * - isTokenExpired()               // Check token validity
 * - logout()                       // Clear all auth state
 *
 * Usage:
 * import { useAuthStore } from '@/src/store/auth.store'
 * const { user, token, hasRole } = useAuthStore()
 * if (hasRole('host')) { ... }
 */

/**
 * 2. EVENT STORE (event.store.ts)
 * ===============================
 * Responsibility: Event management + active event context
 *
 * State:
 * - events: Event[]                // All user events
 * - activeEventContext: { ... }    // Current event flow data
 * - currentEvent: Event | null     // Selected event
 * - eventGuests: EventGuest[]      // Participants in event
 * - eventOrders: EventOrder[]      // Orders in event
 *
 * Active Event Context Structure:
 * {
 *   eventId: string                // Event ID
 *   distributionMode: 'host_purchase' | 'guest_self_purchase' | 'mixed_deposit'
 *   hostDeposit?: number           // Host contribution amount
 *   hostDepositPercentage?: number // % of total
 *   selectedFabric?: Fabric        // Chosen fabric
 *   pricingBreakdown: {            // Cost breakdown
 *     fabricCost: number
 *     tailor?: number
 *     shipping?: number
 *     platform_fee?: number
 *     tax?: number
 *     total: number
 *     currency: string
 *   }
 * }
 *
 * Key Actions:
 * - setActiveEventContext(context) // Initialize event flow
 * - updateDistributionMode(mode)   // Change payment distribution
 * - setHostDeposit(amount, %)      // Set host contribution
 * - setSelectedFabric(fabric)      // Select event fabric
 * - setPricingBreakdown(breakdown) // Update costs
 * - addGuest(guest)                // Add participant
 * - updateGuestStatus(guestId)     // Update RSVP status
 * - resetActiveContext()           // Clear active event
 *
 * Usage:
 * const { activeEventContext, setPricingBreakdown } = useEventStore()
 * Used in: Event Dashboard, Fabric Attach Flow, Guest Payment Flow
 */

/**
 * 3. CART STORE (cart.store.ts)
 * =============================
 * Responsibility: Shopping cart management + pricing calculations
 *
 * State:
 * - cart: Cart | null              // Cart data with items
 * - pricing: CartPricing | null    // Calculated pricing breakdown
 * - isLoading: boolean             // Loading state
 * - error: string | null           // Error messages
 *
 * Cart Pricing Structure:
 * {
 *   subtotal: number               // Sum of item costs
 *   tailor_cost?: number           // Tailor service fee
 *   shipping?: number              // Shipping cost
 *   platform_fee: number           // Platform fee (3% default)
 *   tax?: number                   // Tax amount
 *   discount?: number              // Applied discount
 *   total: number                  // Grand total
 *   currency: string               // Currency code (USD, NGN, etc)
 * }
 *
 * Key Actions:
 * - addItem(item)                  // Add item to cart
 * - removeItem(itemId)             // Remove item
 * - updateItem(itemId, quantity)   // Update quantity
 * - clearCart()                    // Empty cart
 * - calculatePricing(...)          // Compute all fees/taxes
 * - applyDiscount(amount)          // Apply coupon/discount
 * - getTotal()                     // Get grand total
 * - getSubtotal()                  // Get item subtotal
 * - getPlatformFee()               // Get fee amount
 *
 * Usage:
 * const { cart, pricing, calculatePricing } = useCartStore()
 * pricing = calculatePricing(subtotal, taxRate, 3, shippingCost)
 */

/**
 * 4. ESCROW STORE (escrow.store.ts)
 * =================================
 * Responsibility: Escrow lifecycle + payment tracking
 *
 * State:
 * - escrows: Escrow[]              // All escrow records
 * - currentEscrow: Escrow | null   // Active escrow
 * - currentPhase: EscrowPhase      // Current lifecycle phase
 * - payments: Payment[]            // Payment records
 * - releases: EscrowRelease[]      // Release/refund history
 *
 * Escrow Lifecycle Phases:
 * 'initiated'    → Escrow created, awaiting payment
 * 'funded'       → Payment received, funds held
 * 'held'         → Awaiting order completion
 * 'released'     → Funds released to seller
 * 'refunded'     → Funds returned to buyer
 * 'disputed'     → Payment disputed, under review
 *
 * Key Actions:
 * - initiateEscrow(...)            // Create new escrow
 * - fundEscrow(escrowId)           // Mark as funded
 * - holdEscrow(escrowId, reason)   // Place hold
 * - releaseEscrow(escrowId)        // Release funds to seller
 * - refundEscrow(escrowId, reason) // Return funds to buyer
 * - disputeEscrow(escrowId, reason)// Start dispute resolution
 * - resolveDispute(escrowId, %)    // Resolve with split (e.g., 70% seller)
 * - transitionPhase(escrowId, phase) // Manual phase change
 *
 * Usage:
 * const { initiateEscrow, releaseEscrow } = useEscrowStore()
 * escrow = initiateEscrow(buyerId, sellerId, 5000, 'USD')
 * escrow.status === 'released' // After seller completes
 */

/**
 * ============================================================
 * CONTEXT PROVIDERS (React Context)
 * ============================================================
 *
 * Contexts wrap stores for use with React hooks in components.
 * Use in app layout to provide global state access.
 */

/**
 * APP LAYOUT SETUP (_layout.tsx)
 * ==============================
 *
 * import { AuthProvider } from '@/src/context/AuthContext'
 * import { EventProvider } from '@/src/context/EventContext'
 * import { CartProvider } from '@/src/context/CartContext'
 * import { PaymentProvider } from '@/src/context/PaymentContext'
 *
 * export default function RootLayout() {
 *   return (
 *     <AuthProvider>
 *       <EventProvider>
 *         <CartProvider>
 *           <PaymentProvider>
 *             {children}
 *           </PaymentProvider>
 *         </CartProvider>
 *       </EventProvider>
 *     </AuthProvider>
 *   )
 * }
 */

/**
 * ============================================================
 * CONTEXT HOOKS
 * ============================================================
 */

/**
 * 1. useAuth() - From AuthContext
 * ===============================
 * Returns:
 * {
 *   user: User | null
 *   isAuthenticated: boolean
 *   isLoading: boolean
 *   error: string | null
 *   token: string | null
 * }
 *
 * Usage in components:
 * const { user, hasRole } = useAuth()
 * if (user?.id === authorId) { ... }
 */

/**
 * 2. useEventContext() - From EventContext
 * ========================================
 * Returns:
 * {
 *   activeEventContext: {
 *     eventId: string
 *     distributionMode: DistributionMode
 *     hostDeposit?: number
 *     hostDepositPercentage?: number
 *     guests: Array<{id, email, status}>
 *     selectedFabric?: Fabric
 *     pricingBreakdown?: {...}
 *   }
 *   isLoading: boolean
 *   error: string | null
 *   
 *   // Actions
 *   setDistributionMode(mode)
 *   setHostDeposit(amount, %)
 *   setSelectedFabric(fabric)
 *   setPricingBreakdown(breakdown)
 *   calculateTotal()
 *   initializeEventContext(eventId, mode)
 *   resetEventContext()
 * }
 *
 * Usage in Event Dashboard:
 * const { activeEventContext, setPricingBreakdown } = useEventContext()
 * setPricingBreakdown({ fabricCost: 5000, tax: 750 })
 *
 * Usage in Fabric Attach Flow:
 * const { setSelectedFabric } = useEventContext()
 * setSelectedFabric(fabric)
 *
 * Usage in Guest Payment Flow:
 * const { activeEventContext } = useEventContext()
 * const guestTotal = activeEventContext.pricingBreakdown.total
 */

/**
 * 3. useCart() - From CartContext
 * ==============================
 * Returns:
 * {
 *   cart: Cart | null
 *   pricing: CartPricing | null
 *   isLoading: boolean
 *   error: string | null
 *   
 *   // Actions
 *   calculatePricing(subtotal, tax, fees, shipping)
 *   applyDiscount(amount)
 *   getTotal()
 *   getSubtotal()
 *   getItemCount()
 *   getPlatformFee()
 * }
 *
 * Usage in Checkout:
 * const { cart, pricing, calculatePricing } = useCart()
 * pricing = calculatePricing(cart.totalPrice, 0.07, 3, 10)
 * Total: {pricing.total}
 */

/**
 * 4. usePayment() - From PaymentContext
 * ====================================
 * Returns:
 * {
 *   escrows: Escrow[]
 *   currentEscrow: Escrow | null
 *   currentPhase: EscrowPhase | null
 *   payments: Payment[]
 *   currentPayment: Payment | null
 *   isLoading: boolean
 *   error: string | null
 *   
 *   // Actions
 *   initiateEscrow(buyerId, sellerId, amount, currency)
 *   fundEscrow(escrowId, method)
 *   releaseEscrow(escrowId, reason)
 *   refundEscrow(escrowId, reason)
 *   disputeEscrow(escrowId, reason)
 *   resolveDispute(escrowId, releasePercent)
 *   setCurrentEscrow(escrow)
 * }
 *
 * Usage in Payment Processing:
 * const { initiateEscrow, fundEscrow } = usePayment()
 * escrow = initiateEscrow(buyer, seller, 5000, 'USD')
 * fundEscrow(escrow.id, 'card')
 *
 * Usage in Order Completion:
 * const { releaseEscrow } = usePayment()
 * releaseEscrow(escrowId, 'completion')
 */

/**
 * ============================================================
 * FLOW EXAMPLES
 * ============================================================
 */

/**
 * FLOW: Create Event → Select Fabric → Calculate Pricing
 * ======================================================
 *
 * 1. Host creates event
 *    const { setActiveEventContext } = useEventContext()
 *    setActiveEventContext({
 *      eventId: 'evt_123',
 *      distributionMode: 'mixed_deposit'
 *    })
 *
 * 2. Host selects event fabric
 *    const { setSelectedFabric } = useEventContext()
 *    setSelectedFabric(fabricData)
 *
 * 3. System calculates pricing
 *    const { setPricingBreakdown } = useEventContext()
 *    const breakdown = {
 *      fabricCost: 50 * 100,  // 50 qty × 100 per
 *      tailor: 2000,          // Tailor fee
 *      shipping: 500,         // Shipping
 *      platform_fee: 255,     // 3% of (5000 + 2000)
 *      tax: 1130.25,          // 7% of total
 *      total: 8885.25
 *    }
 *    setPricingBreakdown(breakdown)
 *
 * 4. Host sets deposit
 *    const { setHostDeposit } = useEventContext()
 *    setHostDeposit(3000, 33.75)  // $3000 = 33.75% of $8885.25
 */

/**
 * FLOW: Checkout → Payment → Escrow → Fulfillment
 * ===============================================
 *
 * 1. User views cart with calculated pricing
 *    const { cart, pricing } = useCart()
 *    Display: Subtotal ${pricing.subtotal}
 *             Platform Fee ${pricing.platform_fee}
 *             Tax ${pricing.tax}
 *             Total ${pricing.total}
 *
 * 2. User initiates payment
 *    const { initiateEscrow } = usePayment()
 *    escrow = initiateEscrow(
 *      buyerId,
 *      sellerId,
 *      pricing.total,
 *      'USD',
 *      orderId
 *    )
 *    // Status: 'initiated'
 *
 * 3. User completes payment
 *    const { fundEscrow } = usePayment()
 *    fundEscrow(escrow.id, 'card')
 *    // Status: 'funded'
 *
 * 4. Funds held during order fulfillment
 *    escrow.status === 'held'
 *    // Awaiting seller to complete work
 *
 * 5. Seller completes work, releases funds
 *    const { releaseEscrow } = usePayment()
 *    releaseEscrow(escrow.id, 'completion')
 *    // Status: 'released'
 *    // Seller receives payment
 *    // Buyer can dispute within 30 days
 */

/**
 * ============================================================
 * BEST PRACTICES
 * ============================================================
 *
 * 1. STORE ISOLATION
 *    - Only import stores when you need low-level control
 *    - Use contexts in most components
 *    - Keep derived state in stores, not contexts
 *
 * 2. CONTEXT NESTING
 *    - Order matters: Auth should be outermost
 *    - Event depends on Auth, so Event inside Auth
 *    - Cart and Payment are independent
 *
 * 3. ERROR HANDLING
 *    - Always check error in context before rendering
 *    - Show loading state while fetching
 *    - Use setError(null) after showing error
 *
 * 4. MEMORY LEAKS
 *    - Use resetEventContext() when leaving event flow
 *    - Use logout() when user leaves app
 *    - Unsubscribe from real-time listeners
 *
 * 5. TYPE SAFETY
 *    - Always type context imports
 *    - Use EventContextShape for type hints
 *    - Check null values before accessing properties
 *
 * 6. TESTING
 *    - Mock stores in tests, not contexts
 *    - Test business logic in stores
 *    - Test UI integration with contexts
 */

/**
 * ============================================================
 * TROUBLESHOOTING
 * ============================================================
 *
 * Issue: "useEventContext must be used within EventProvider"
 * Fix: Wrap component tree with EventProvider in _layout.tsx
 *
 * Issue: Data lost on screen navigation
 * Fix: Call resetEventContext() explicitly when leaving event flow
 *
 * Issue: Stale token causing 401 errors
 * Fix: useAuthStore.isTokenExpired() checks automatically
 *      API client has interceptor for token refresh
 *
 * Issue: Cart totals not updating
 * Fix: Call calculatePricing() after adding items
 *      Check if pricing object is null
 */
