import { Link } from "wouter";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { FaArrowLeft, FaTrash, FaPlus } from "react-icons/fa";
import { useState, useEffect } from "react";
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

const Cart = () => {
  const { items, subtotal, addToCart, removeFromCart, clearCart } = useCart();
  const { toast } = useToast();
  const { user, isAuthenticated, getToken } = useAuth();

  const [checkoutOpen, setCheckoutOpen] = useState(false);

  useEffect(() => {
    if (items.length === 0) {
      setCheckoutOpen(false);
    }
  }, [items.length]);

  const handleCheckoutClick = () => {
    if (items.length === 0) return;
    setCheckoutOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/" className="text-primary hover:underline flex items-center gap-2">
          <FaArrowLeft /> Back to Products
        </Link>
        <h1 className="text-2xl font-bold text-foreground ml-auto">Your Cart</h1>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-8 text-center">
          <p className="text-foreground mb-4">Your cart is empty.</p>
          <Link href="/" className="text-primary font-medium hover:underline">
            Continue shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items list */}
          <div className="lg:col-span-2 bg-green-950 rounded-xl shadow p-4 divide-y">
            {items.map(({ product, quantity }) => (
              <div key={product.productId} className="py-4 flex items-center gap-4">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-20 h-20 object-contain bg-muted rounded border"
                />
                <div className="flex-1">
                  <p className="font-medium text-foreground line-clamp-1">{product.name}</p>
                  <p className="text-sm text-foreground">${product.price.toFixed(2)}</p>
                  <p className="text-sm text-foreground mt-1">Qty: <span className="font-medium text-foreground">{quantity}</span></p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="px-3 py-2 rounded bg-primary text-white hover:bg-green-500 flex items-center gap-2"
                    onClick={() => addToCart(product, 1)}
                    aria-label="Add one more"
                  >
                    <FaPlus /> Add one
                  </button>
                  <button
                    className="px-3 py-2 rounded bg-rose-700 text-white hover:bg-rose-500 flex items-center gap-2"
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
          <div className="bg-green-950 rounded-xl shadow p-6 h-fit">
            <h2 className="text-lg font-semibold text-foreground mb-4">Order Summary</h2>
            <div className="flex justify-between mb-2">
              <span className="text-foreground">Subtotal</span>
              <span className="font-semibold text-foreground">${subtotal.toFixed(2)}</span>
            </div>
            <p className="text-sm text-foreground mb-4">Shipping and taxes calculated at checkout.</p>

            {!checkoutOpen && (
              <button
                className="w-full bg-green-800 hover:bg-green-500 text-white font-medium py-3 rounded-lg"
                onClick={handleCheckoutClick}
              >
                Place Order
              </button>
            )}

            {checkoutOpen && (
              <Elements stripe={stripePromise}>
                <CheckoutForm
                  items={items}
                  subtotal={subtotal}
                  clearCart={clearCart}
                  toast={toast}
                  setCheckoutOpen={setCheckoutOpen}
                  token={token}
                  user={user}
                  isAuthenticated={isAuthenticated}
                />
              </Elements>
            )}

            <button
              className="w-full mt-3 bg-red-900 hover:bg-red-500 text-foreground font-medium py-3 rounded-lg"
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

const CheckoutForm = ({ items, subtotal, clearCart, toast, setCheckoutOpen, token, user, isAuthenticated }) => {
  const [paymentMethod, setPaymentMethod] = useState<"card" | "mobile" | "cash">("card");
  const [deliver, setDeliver] = useState(true);
  const [location, setLocation] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ fullName: "", phone: "", email: "", location: "" });

  const stripe = useStripe();
  const elements = useElements();

  useEffect(() => {
    if (isAuthenticated && user) {
      setFullName(user.username);
      setEmail(user.email);
    }
  }, [isAuthenticated, user]);

  const handleConfirmOrder = async () => {
    const newErrors = {};

    if (fullName.trim().length < 3) newErrors.fullName = "Please enter your full name (min 3 chars).";
    if (!/^(\+?\d[\d\s-]{6,}\d)$/.test(phone.trim())) newErrors.phone = "Enter a valid phone number.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) newErrors.email = "Enter a valid email address.";
    if (deliver && location.trim().length < 5) newErrors.location = "Please enter your delivery location (min 5 chars).";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);

    try {
      if (paymentMethod === 'card') {
        if (!stripe || !elements) {
          throw new Error('Stripe.js has not loaded.');
        }

        const authToken = await getToken();
        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
          },
          body: JSON.stringify({ amount: subtotal }),
        });

        if (!response.ok) {
          const { message } = await response.json();
          throw new Error(message || 'Failed to create payment intent');
        }

        const { clientSecret } = await response.json();

        const { error } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: {
              name: fullName,
              email: email,
              phone: phone,
            },
          },
        });

        if (error) {
          throw new Error(error.message || 'Payment failed');
        }
      }

      const body = {
        items: items.map(({ product, quantity }) => ({
          productId: product.productId,
          name: product.name,
          price: product.price,
          quantity,
        })),
        subtotal,
        paymentMethod,
        deliver,
        ...(deliver && { location }),
        fullName,
        phone,
        email,
        ...(notes && { notes }),
        ...(isAuthenticated && user && { userId: user.id }),
      };

      const authToken = await getToken();
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify(body),
      });

      if (!orderResponse.ok) {
        const { message } = await orderResponse.json();
        throw new Error(message || 'Failed to place order');
      }

      toast({
        title: "Order placed successfully",
        description: `Payment method: ${paymentMethod}. ${deliver ? `Delivery to: ${location}` : 'Pickup at store'}.`,
      });

      clearCart();
      setCheckoutOpen(false);
    } catch (error) {
      toast({
        title: "Order failed",
        description: error.message || 'Something went wrong',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 border-t pt-4 space-y-4">
      <h3 className="font-semibold text-foreground">Checkout Details</h3>

      {/* Customer details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Full Name</label>
          <input
            type="text"
            className={`w-full border rounded-lg px-3 py-2 text-neutral-900 ${errors.fullName ? 'border-rose-500' : ''}`}
            placeholder="John Doe"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          {errors.fullName && <p className="text-rose-600 text-xs mt-1">{errors.fullName}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Phone</label>
          <input
            type="tel"
            className={`w-full border rounded-lg px-3 py-2 text-neutral-900 ${errors.phone ? 'border-rose-500' : ''}`}
            placeholder="+123 456 7890"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          {errors.phone && <p className="text-rose-600 text-xs mt-1">{errors.phone}</p>}
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-foreground mb-1">Email</label>
          <input
            type="email"
            className={`w-full border rounded-lg px-3 py-2 text-neutral-900 ${errors.email ? 'border-rose-500' : ''}`}
            placeholder="john@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {errors.email && <p className="text-rose-600 text-xs mt-1">{errors.email}</p>}
        </div>
      </div>

      {/* Payment Method */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Payment Method</label>
        <select
          className="w-full border rounded-lg px-3 py-2 text-neutral-900"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value as "card" | "mobile" | "cash")}
        >
          <option value="card">Credit/Debit Card</option>
          <option value="mobile">Mobile Money</option>
          <option value="cash">Cash on Delivery</option>
        </select>
      </div>

      {paymentMethod === "card" && (
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Card Details</label>
          <div className="p-3 border rounded-lg bg-muted">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      )}

      {/* Delivery preference */}
      <div className="flex items-center gap-2">
        <input
          id="deliver"
          type="checkbox"
          checked={deliver}
          onChange={(e) => setDeliver(e.target.checked)}
          className="h-4 w-4"
        />
        <label htmlFor="deliver" className="text-sm text-foreground">Deliver to me</label>
      </div>

      {/* Location */}
      {deliver && (
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Delivery Location</label>
          <input
            type="text"
            className={`w-full border rounded-lg px-3 py-2 text-neutral-900 ${errors.location ? 'border-rose-500' : ''}`}
            placeholder="City, area, street..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          {errors.location && <p className="text-rose-600 text-xs mt-1">{errors.location}</p>}
        </div>
      )}

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Notes (optional)</label>
        <textarea
          className="w-full border rounded-lg px-3 py-2 text-neutral-900"
          rows={3}
          placeholder="Any additional instructions..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          className="flex-1 bg-green-800 hover:bg-green-500 text-white font-medium py-3 rounded-lg disabled:opacity-50"
          onClick={handleConfirmOrder}
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Confirm Order'}
        </button>
        <button
          className="flex-1 bg-red-900 hover:bg-red-500 text-foreground font-medium py-3 rounded-lg"
          onClick={() => setCheckoutOpen(false)}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default Cart;