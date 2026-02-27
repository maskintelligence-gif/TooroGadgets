import { Truck, Globe, Clock, AlertTriangle, ArrowLeft } from 'lucide-react';

interface ShippingPolicyProps {
  onBack: () => void;
}

export function ShippingPolicy({ onBack }: ShippingPolicyProps) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-32">
      <button
        onClick={onBack}
        className="inline-flex items-center justify-center p-2 -ml-2 text-gray-500 hover:text-gray-900 transition-colors mb-6 rounded-full hover:bg-gray-100"
        aria-label="Back"
      >
        <ArrowLeft size={24} strokeWidth={3} />
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Shipping Policy</h1>
        <p className="text-gray-500">Fast and reliable delivery for all your tech needs.</p>
      </div>

      <div className="space-y-8">
        <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Truck size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Domestic Shipping</h2>
          </div>
          <p className="text-gray-600 leading-relaxed mb-4">
            We offer free standard shipping on all orders over $50 within the continental United States. Orders are typically processed within 1-2 business days.
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600 ml-2">
            <li>Standard Shipping (3-5 business days): $5.99 (Free over $50)</li>
            <li>Express Shipping (2 business days): $12.99</li>
            <li>Overnight Shipping (1 business day): $24.99</li>
          </ul>
        </section>

        <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Globe size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">International Shipping</h2>
          </div>
          <p className="text-gray-600 leading-relaxed mb-4">
            We ship to over 50 countries worldwide. International shipping rates are calculated at checkout based on the destination and weight of the package.
          </p>
          <p className="text-gray-500 text-sm italic">
            Note: International customers are responsible for any customs duties or import taxes that may apply.
          </p>
        </section>

        <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Clock size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Order Tracking</h2>
          </div>
          <p className="text-gray-600 leading-relaxed">
            Once your order ships, you will receive a confirmation email with a tracking number. You can track your package directly on our website or through the carrier's portal.
          </p>
        </section>

        <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
              <AlertTriangle size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Lost or Damaged Packages</h2>
          </div>
          <p className="text-gray-600 leading-relaxed">
            If your package is lost or arrives damaged, please contact our support team within 48 hours of delivery. We will work with the carrier to resolve the issue and ensure you receive your order.
          </p>
        </section>
      </div>
    </div>
  );
}
