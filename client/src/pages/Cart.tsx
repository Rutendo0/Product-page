import { Link } from "wouter";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";
import { FaArrowLeft, FaTrash, FaPlus } from "react-icons/fa";
import { useState } from "react";

const Cart = () => {
  const { items, subtotal, addToCart, removeFromCart, clearCart } = useCart();
  const { toast } = useToast();

  // Checkout state
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "mobile" | "cash">("card");
  const [deliver, setDeliver] = useState<boolean>(true);
  const [location, setLocation] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [errors, setErrors] = useState<{ fullName?: string; phone?: string; email?: string; location?: string }>({});

  const handleCheckoutClick = () => {
    if (items.length === 0) return;
    setCheckoutOpen(true);
  };

  const handleConfirmOrder = async () => {
    if (items.length === 0) return;

    // Validation
    const newErrors: { fullName?: string; phone?: string; email?: string; location?: string } = {};

    const nameOk = fullName.trim().length >= 3;
    if (!nameOk) newErrors.fullName = "Please enter your full name (min 3 chars).";

    const phoneOk = /^(\+?\d[\d\s-]{6,}\d)$/.test(phone.trim());
    if (!phoneOk) newErrors.phone = "Enter a valid phone number (e.g., +123 456 7890).";

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (!emailOk) newErrors.email = "Enter a valid email address.";

    const locationOk = !deliver || location.trim().length >= 5;
    if (!locationOk) newErrors.location = "Please enter your delivery location (min 5 chars).";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      const resp = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(({ product, quantity }) => ({
            productId: product.productId,
            name: product.name,
            price: product.price,
            quantity,
          })),
          subtotal,
          paymentMethod,
          deliver,
          location: deliver ? location : undefined,
          fullName,
          phone,
          email,
          notes: notes || undefined,
        }),
      });

      if (!resp.ok) {
        const { message } = await resp.json().catch(() => ({ message: 'Failed to place order' }));
        throw new Error(message || 'Failed to place order');
      }

      toast({
        title: "Order placed",
        description: `We have received your order. Payment: ${paymentMethod}. ${deliver ? `Deliver to: ${location}` : "Pickup at store"}.`,
        duration: 3500,
      });

      clearCart();
      setCheckoutOpen(false);
      setLocation("");
      setPaymentMethod("card");
      setDeliver(true);
      setFullName("");
      setPhone("");
      setEmail("");
      setNotes("");
      setErrors({});
    } catch (e: any) {
      toast({ title: "Order failed", description: e?.message || 'Could not place order', variant: 'destructive', duration: 3500 });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/" className="text-primary hover:underline flex items-center gap-2">
          <FaArrowLeft /> Back to Products
        </Link>
        <h1 className="text-2xl font-bold ml-auto">Your Cart</h1>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-8 text-center">
          <p className="text-neutral-700 mb-4">Your cart is empty.</p>
          <Link href="/" className="text-primary font-medium hover:underline">
            Continue shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items list */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow p-4 divide-y">
            {items.map(({ product, quantity }) => (
              <div key={product.productId} className="py-4 flex items-center gap-4">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-20 h-20 object-contain bg-muted rounded border"
                />
                <div className="flex-1">
                  <p className="font-medium line-clamp-1">{product.name}</p>
                  <p className="text-sm text-neutral-600">${product.price.toFixed(2)}</p>
                  <p className="text-sm mt-1">Qty: <span className="font-medium">{quantity}</span></p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="px-3 py-2 rounded bg-primary text-white hover:bg-primary/90 flex items-center gap-2"
                    onClick={() => addToCart(product, 1)}
                    aria-label="Add one more"
                  >
                    <FaPlus /> Add one
                  </button>
                  <button
                    className="px-3 py-2 rounded bg-rose-600 text-white hover:bg-rose-700 flex items-center gap-2"
                    onClick={() => removeFromCart(product.productId)}
                    aria-label="Remove from cart"
                  >
                    <FaTrash /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="bg-white rounded-xl shadow p-6 h-fit">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            <div className="flex justify-between mb-2">
              <span>Subtotal</span>
              <span className="font-semibold">${subtotal.toFixed(2)}</span>
            </div>
            <p className="text-sm text-neutral-600 mb-4">Shipping and taxes calculated at checkout.</p>

            {!checkoutOpen && (
              <button
                className="w-full bg-green-700 hover:bg-green-800 text-white font-medium py-3 rounded-lg"
                onClick={handleCheckoutClick}
              >
                Place Order
              </button>
            )}

            {checkoutOpen && (
              <div className="mt-4 border-t pt-4 space-y-4">
                <h3 className="font-semibold">Checkout Details</h3>

                {/* Customer details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Full Name</label>
                    <input
                      type="text"
                      className={`w-full border rounded-lg px-3 py-2 ${errors.fullName ? 'border-rose-500' : ''}`}
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                    {errors.fullName && <p className="text-rose-600 text-xs mt-1">{errors.fullName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Phone</label>
                    <input
                      type="tel"
                      className={`w-full border rounded-lg px-3 py-2 ${errors.phone ? 'border-rose-500' : ''}`}
                      placeholder="+123 456 7890"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                    {errors.phone && <p className="text-rose-600 text-xs mt-1">{errors.phone}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                      type="email"
                      className={`w-full border rounded-lg px-3 py-2 ${errors.email ? 'border-rose-500' : ''}`}
                      placeholder="john@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    {errors.email && <p className="text-rose-600 text-xs mt-1">{errors.email}</p>}
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-medium mb-1">Payment Method</label>
                  <select
                    className="w-full border rounded-lg px-3 py-2"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                  >
                    <option value="card">Credit/Debit Card</option>
                    <option value="mobile">Mobile Money</option>
                    <option value="cash">Cash on Delivery</option>
                  </select>
                </div>

                {/* Delivery preference */}
                <div className="flex items-center gap-2">
                  <input
                    id="deliver"
                    type="checkbox"
                    checked={deliver}
                    onChange={(e) => setDeliver(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <label htmlFor="deliver" className="text-sm">Deliver to me</label>
                </div>

                {/* Location */}
                {deliver && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Delivery Location</label>
                    <input
                      type="text"
                      className={`w-full border rounded-lg px-3 py-2 ${errors.location ? 'border-rose-500' : ''}`}
                      placeholder="City, area, street..."
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                    {errors.location && <p className="text-rose-600 text-xs mt-1">{errors.location}</p>}
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium mb-1">Notes (optional)</label>
                  <textarea
                    className="w-full border rounded-lg px-3 py-2"
                    rows={3}
                    placeholder="Any additional instructions..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    className="flex-1 bg-green-700 hover:bg-green-800 text-white font-medium py-3 rounded-lg"
                    onClick={handleConfirmOrder}
                  >
                    Confirm Order
                  </button>
                  <button
                    className="flex-1 bg-muted hover:bg-muted/80 text-foreground font-medium py-3 rounded-lg"
                    onClick={() => setCheckoutOpen(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <button
              className="w-full mt-3 bg-muted hover:bg-muted/80 text-foreground font-medium py-3 rounded-lg"
              onClick={clearCart}
            >
              Clear Cart
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;