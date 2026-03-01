# Checkout

The checkout screen (`app/checkout.tsx`) collects shipping details, payment method, optional promo code and order notes, then submits the order via the API.

## Route

- **Path**: `/checkout`
- **Access**: Typically from Bag tab → "Proceed to Checkout", or deep link `genosys://checkout`.

## Empty State

If the cart is empty, the screen shows a header and an empty state message ("Your bag is empty") instead of the form.

## Sections (Top to Bottom)

| Section | Description |
|---------|-------------|
| **Order Summary** | GlassCard listing each cart item with name × quantity and line total (AED). |
| **Shipping Address** | Full name *, Phone *, Address *, Emirate (picker). Pre-filled from `user` when logged in. |
| **Payment Method** | COD (Cash on Delivery) or Credit/Debit Card; radio selection with descriptions. |
| **Promo Code** | Single text input for promo code (optional). |
| **Order Notes** | Multiline text input for special instructions (optional). Wrapped in its own GlassCard with bottom margin so it does not overlap the Total block. |
| **Total** | GlassCard with Subtotal, Shipping (by emirate, FREE over threshold), divider, Total, VAT note. |
| **Place Order** | GoldButton "Place Order"; shows ActivityIndicator when submitting. |

## Layout and Overlap Fix

- **Order Notes** is in a wrapper with `styles.notesSection` (`marginBottom: spacing.md`) so the notes block does not overlap the Subtotal/Total block below.
- The notes input is inside a **GlassCard** for visual consistency with other sections.

## Shipping and Totals

- **Shipping rates**: Fetched via `fetchShippingRates()` on mount; includes `freeShippingThreshold` and per-emirate `shippingCost`.
- **Shipping cost**: Zero when `subtotal >= freeShippingThreshold`; otherwise the cost for the selected emirate (default 45 AED if not found).
- **VAT**: Uses `shippingRates.vatRate` (e.g. 5%); display-only in the VAT note.
- **Total**: `subtotal + shippingCost`.

## Emirate Picker

- Modal with list of UAE emirates: Dubai, Abu Dhabi, Sharjah, Ajman, Ras Al Khaimah, Fujairah, Umm Al Quwain.
- Tap to select; selected row highlighted with gold styling and checkmark.
- Tap overlay to close.

## Place Order

1. **Validation**: Full name, phone, and address must be non-empty; user must be signed in (token).
2. **Submit**: `createOrder(token, { items, shippingAddress, paymentMethod, promoCode?, notes? })`.
3. **Success**: Cart cleared, alert "Order Placed!" with option "View Orders" → `/profile/orders`.
4. **Error**: Alert with message; submitting state reset.

## Key Styles

- `sectionTitle` — uppercase label above each block (e.g. "Order Summary", "Shipping Address").
- `notesSection` — wrapper for Order Notes with bottom margin.
- `notesInner` — multiline input inside GlassCard (minHeight 72, `textAlignVertical: 'top'`).
