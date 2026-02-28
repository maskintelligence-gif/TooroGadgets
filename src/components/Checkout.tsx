import { useState } from 'react';
import {
  ArrowLeft,
  Truck,
  Store,
  CheckCircle2,
  Loader2,
  ShoppingBag,
  Phone,
  MapPin,
  User,
  AlertCircle,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useCustomer } from '../hooks/useCustomer';
import { Product } from '../data/products';

interface CartItem extends Product {
  quantity: number;
}

interface CheckoutProps {
  cartItems: CartItem[];
  onBack: () => void;
  onOrderSuccess: () => void;
  onGoToHistory: () => void;
}

type Step = 'info' | 'fulfillment' | 'review' | 'success';

const DELIVERY_FEE = 50000;

export function Checkout({ cartItems, onBack, onOrderSuccess, onGoToHistory }: CheckoutProps) {
  const { customer, saveCustomer } = useCustomer();

  const [step, setStep] = useState<Step>('info');
  const [form, setForm] = useState({
    name: customer?.name || '',
    phone: customer?.phone || '',
    location: customer?.location || '',
  });
  const [fulfillment, setFulfillment] = useState<'delivery' | 'pickup'>('delivery');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placedOrderNumber, setPlacedOrderNumber] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = fulfillment === 'delivery' ? DELIVERY_FEE : 0;
  const total = subtotal + deliveryFee;

  // ─── Validation ──────────────────────────────────────────────────────────────
  const validateInfo = () => {
    const errors: Record<string, string> = {};
    if (!form.name.trim()) errors.name = 'Full name is required';
    if (!form.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^(\+256|0)7\d{8}$/.test(form.phone.replace(/\s/g, ''))) {
      errors.phone = 'Enter a valid Uganda phone number (e.g. +256701234567)';
    }
    if (!form.location.trim()) errors.location = 'Location is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ─── Order placement ─────────────────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Find or create customer
      let customerId: string;

      const cleanPhone = form.phone.replace(/\s/g, '');

      const { data: existing } = await supabase
        .from('customers')
        .select('customer_id')
        .eq('phone', cleanPhone)
        .maybeSingle();

      if (existing) {
        customerId = existing.customer_id;
        await supabase
          .from('customers')
          .update({
            name: form.name.trim(),
            location: form.location.trim(),
            updated_at: new Date().toISOString(),
          })
          .eq('customer_id', customerId);
      } else {
        const { data: newCustomer, error: createErr } = await supabase
          .from('customers')
          .insert({
            name: form.name.trim(),
            phone: cleanPhone,
            location: form.location.trim(),
          })
          .select('customer_id')
          .single();

        if (createErr) throw new Error(createErr.message);
        customerId = newCustomer.customer_id;
      }

      // 2. Generate order number
      const { count } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });

      const orderNumber = `TG-${String((count ?? 0) + 1).padStart(4, '0')}`;

      // 3. Build order items
      const orderItems = cartItems.map((item) => ({
        product_id: item.id,
        product_name: item.name,
        quantity: item.quantity,
        unit_price: item.price,
        subtotal: item.price * item.quantity,
        image: item.image,
      }));

      // 4. Insert order
      const { error: orderErr } = await supabase.from('orders').insert({
        order_number: orderNumber,
        customer_id: customerId,
        fulfillment_type: fulfillment,
        payment_method:
          fulfillment === 'delivery' ? 'cash_on_delivery' : 'cash_at_shop',
        order_items: orderItems,
        subtotal,
        delivery_fee: deliveryFee,
        total_amount: total,
        delivery_location: form.location.trim(),
        payment_status: 'pending_payment',
        order_status: 'pending_confirmation',
      });

      if (orderErr) throw new Error(orderErr.message);

      // 5. Save customer session
      saveCustomer({
        customer_id: customerId,
        name: form.name.trim(),
        phone: cleanPhone,
        location: form.location.trim(),
      });

      setPlacedOrderNumber(orderNumber);
      setStep('success');
      onOrderSuccess(); // clears cart in parent

    } catch (err) {
      setError((err as Error).message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Step progress bar ────────────────────────────────────────────────────────
  const stepIndex = { info: 0, fulfillment: 1, review: 2, success: 3 }[step];

  const ProgressBar = () => (
    <div className="flex gap-1.5 mb-6">
      {['Your Details', 'Delivery', 'Review'].map((label, i) => (
        <div key={label} className="flex-1">
          <div
            className={`h-1 rounded-full transition-all ${
              i <= stepIndex - 0 && step !== 'success'
                ? 'bg-blue-600'
                : i < stepIndex
                ? 'bg-blue-600'
                : 'bg-gray-200 dark:bg-gray-700'
            }`}
          />
          <p
            className={`text-[10px] mt-1 font-medium ${
              i < stepIndex || (i === 0 && step === 'info')
                ? 'text-blue-600'
                : 'text-gray-400'
            }`}
          >
            {label}
          </p>
        </div>
      ))}
    </div>
  );

  // ─── STEP 1: Customer info ────────────────────────────────────────────────────
  if (step === 'info') {
    return (
      <div className="max-w-lg mx-auto px-4 py-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={18} />
          <span className="text-sm">Back to Cart</span>
        </button>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Checkout</h1>
        <ProgressBar />

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              <User size={14} className="inline mr-1 mb-0.5" />
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. John Mwesigye"
              className={`w-full px-4 py-3 rounded-xl border bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors ${
                formErrors.name
                  ? 'border-rose-400 dark:border-rose-500'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            />
            {formErrors.name && (
              <p className="text-rose-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle size={12} /> {formErrors.name}
              </p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              <Phone size={14} className="inline mr-1 mb-0.5" />
              Phone Number <span className="text-rose-500">*</span>
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+256701234567"
              className={`w-full px-4 py-3 rounded-xl border bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors ${
                formErrors.phone
                  ? 'border-rose-400 dark:border-rose-500'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            />
            {formErrors.phone ? (
              <p className="text-rose-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle size={12} /> {formErrors.phone}
              </p>
            ) : (
              <p className="text-gray-400 text-xs mt-1">
                We'll call this number to confirm your order
              </p>
            )}
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              <MapPin size={14} className="inline mr-1 mb-0.5" />
              Your Location <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="e.g. Fort Portal CBD, near Total petrol station"
              className={`w-full px-4 py-3 rounded-xl border bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors ${
                formErrors.location
                  ? 'border-rose-400 dark:border-rose-500'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            />
            {formErrors.location && (
              <p className="text-rose-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle size={12} /> {formErrors.location}
              </p>
            )}
          </div>

          {/* Order mini summary */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <ShoppingBag size={16} />
              <span className="text-sm">
                {cartItems.reduce((s, i) => s + i.quantity, 0)} item
                {cartItems.reduce((s, i) => s + i.quantity, 0) !== 1 ? 's' : ''}
              </span>
            </div>
            <span className="font-bold text-gray-900 dark:text-white text-sm">
              UGX {subtotal.toLocaleString()}+
            </span>
          </div>

          <button
            onClick={() => {
              if (validateInfo()) setStep('fulfillment');
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            Continue
            <ArrowLeft size={16} className="rotate-180" />
          </button>
        </div>
      </div>
    );
  }

  // ─── STEP 2: Fulfillment ──────────────────────────────────────────────────────
  if (step === 'fulfillment') {
    return (
      <div className="max-w-lg mx-auto px-4 py-6">
        <button
          onClick={() => setStep('info')}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={18} />
          <span className="text-sm">Back</span>
        </button>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Checkout</h1>
        <ProgressBar />

        <h2 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-4">
          How would you like to receive your order?
        </h2>

        <div className="space-y-3 mb-6">
          {/* Delivery option */}
          <button
            onClick={() => setFulfillment('delivery')}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
              fulfillment === 'delivery'
                ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-blue-300'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  fulfillment === 'delivery'
                    ? 'border-blue-600 bg-blue-600'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                {fulfillment === 'delivery' && (
                  <div className="w-2 h-2 rounded-full bg-white" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Truck size={18} className="text-blue-600" />
                  <span className="font-bold text-gray-900 dark:text-white">
                    Door Delivery
                  </span>
                  <span className="ml-auto text-sm font-semibold text-gray-600 dark:text-gray-400">
                    +UGX {DELIVERY_FEE.toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Boda-boda delivers to your location. Pay cash to the rider.
                </p>
              </div>
            </div>
          </button>

          {/* Pickup option */}
          <button
            onClick={() => setFulfillment('pickup')}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
              fulfillment === 'pickup'
                ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-emerald-300'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  fulfillment === 'pickup'
                    ? 'border-emerald-600 bg-emerald-600'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                {fulfillment === 'pickup' && (
                  <div className="w-2 h-2 rounded-full bg-white" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Store size={18} className="text-emerald-600" />
                  <span className="font-bold text-gray-900 dark:text-white">
                    Pickup In-Store
                  </span>
                  <span className="ml-auto text-sm font-bold text-emerald-600">FREE</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Come to our shop and pay when you pick up. Save UGX {DELIVERY_FEE.toLocaleString()}!
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Fort Portal CBD • Mon–Sat 9 AM – 6 PM
                </p>
              </div>
            </div>
          </button>
        </div>

        <button
          onClick={() => setStep('review')}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          Continue
          <ArrowLeft size={16} className="rotate-180" />
        </button>
      </div>
    );
  }

  // ─── STEP 3: Review ───────────────────────────────────────────────────────────
  if (step === 'review') {
    return (
      <div className="max-w-lg mx-auto px-4 py-6">
        <button
          onClick={() => setStep('fulfillment')}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={18} />
          <span className="text-sm">Back</span>
        </button>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Checkout</h1>
        <ProgressBar />

        {/* Customer info summary */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 mb-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
            Your Details
          </h3>
          <div className="space-y-1.5 text-sm">
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <User size={14} className="text-gray-400" />
              {form.name}
            </div>
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <Phone size={14} className="text-gray-400" />
              {form.phone}
            </div>
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <MapPin size={14} className="text-gray-400" />
              {form.location}
            </div>
          </div>
        </div>

        {/* Order items */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 mb-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
            Order Items
          </h3>
          <div className="space-y-3">
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex-shrink-0 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-400">× {item.quantity}</p>
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                  UGX {(item.price * item.quantity).toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 dark:border-gray-800 mt-4 pt-4 space-y-2">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>Subtotal</span>
              <span>UGX {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>Delivery fee</span>
              <span
                className={
                  fulfillment === 'pickup' ? 'text-emerald-600 font-medium' : ''
                }
              >
                {fulfillment === 'pickup'
                  ? 'FREE'
                  : `UGX ${DELIVERY_FEE.toLocaleString()}`}
              </span>
            </div>
            <div className="flex justify-between text-base font-bold text-gray-900 dark:text-white pt-1 border-t border-gray-100 dark:border-gray-800">
              <span>Total to Pay</span>
              <span>UGX {total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Payment info */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-2">
            {fulfillment === 'delivery' ? (
              <Truck size={18} className="text-amber-600 mt-0.5 flex-shrink-0" />
            ) : (
              <Store size={18} className="text-amber-600 mt-0.5 flex-shrink-0" />
            )}
            <div>
              <p className="text-sm font-bold text-amber-800 dark:text-amber-300">
                {fulfillment === 'delivery'
                  ? 'Cash on Delivery'
                  : 'Cash at Pickup'}
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                {fulfillment === 'delivery'
                  ? `Pay UGX ${total.toLocaleString()} to the rider when your order arrives.`
                  : `Pay UGX ${total.toLocaleString()} when you collect from our shop.`}
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl p-4 mb-4 flex items-start gap-2">
            <AlertCircle size={16} className="text-rose-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-rose-700 dark:text-rose-400">{error}</p>
          </div>
        )}

        <button
          onClick={handlePlaceOrder}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Placing Order...
            </>
          ) : (
            <>
              <CheckCircle2 size={18} />
              Place Order
            </>
          )}
        </button>
      </div>
    );
  }

  // ─── STEP 4: Success ──────────────────────────────────────────────────────────
  return (
    <div className="max-w-lg mx-auto px-4 py-12 text-center">
      <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle2 size={40} className="text-emerald-600" />
      </div>

      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        Order Placed!
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">
        Thank you, {form.name.split(' ')[0]}! Your order has been received.
      </p>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 mb-6 text-left">
        <div className="text-center mb-4">
          <p className="text-xs uppercase tracking-widest font-bold text-gray-400 mb-1">
            Your Order ID
          </p>
          <p className="text-4xl font-black text-blue-600 tracking-tight">
            {placedOrderNumber}
          </p>
          <p className="text-xs text-gray-400 mt-1">Save this — you'll need it to track your order</p>
        </div>

        <div className="border-t border-gray-100 dark:border-gray-800 pt-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Total to pay</span>
            <span className="font-bold text-gray-900 dark:text-white">
              UGX {total.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Payment method</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {fulfillment === 'delivery' ? 'Cash to rider' : 'Cash at shop'}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Fulfillment</span>
            <span className="font-medium text-gray-900 dark:text-white capitalize">
              {fulfillment}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Phone</span>
            <span className="font-medium text-gray-900 dark:text-white">{form.phone}</span>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6 text-left">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          <strong>What happens next?</strong> We'll review your order and call you on{' '}
          <strong>{form.phone}</strong> to confirm details and{' '}
          {fulfillment === 'delivery'
            ? 'arrange delivery via boda-boda.'
            : 'let you know when to come pick up.'}
        </p>
      </div>

      <div className="space-y-3">
        <button
          onClick={onGoToHistory}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-colors"
        >
          View Order History
        </button>
        <button
          onClick={onBack}
          className="w-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-bold py-4 rounded-xl transition-colors"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
}
