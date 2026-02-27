import { Truck, Globe, Clock, AlertTriangle, ArrowLeft } from 'lucide-react';

interface ShippingPolicyProps {
  onBack: () => void;
}

export function ShippingPolicy({ onBack }: ShippingPolicyProps) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-32">
      <button
        onClick={onBack}
        className="inline-flex items-center justify-center p-2 -ml-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors mb-6 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
        aria-label="Back"
      >
        <ArrowLeft size={24} strokeWidth={3} />
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Shipping Policy</h1>
        <p className="text-gray-500 dark:text-gray-400">Fast and reliable delivery for all your tech needs.</p>
      </div>

      <div className="space-y-8">
        <section className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
              <Truck size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Domestic Shipping</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
            We offer free standard shipping on all orders over UGX 200,000 within the continental United States. Orders are typically processed within 1-2 business days.
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400 ml-2">
            <li>Standard Shipping (3-5 business days): UGX 20,000 (Free over UGX 200,000)</li>
            <li>Express Shipping (2 business days): UGX 45,000</li>
            <li>Overnight Shipping (1 business day): UGX 90,000</li>
          </ul>
        </section>

        <section className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <Globe size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">International Shipping</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
            We ship to over 50 countries worldwide. International shipping rates are calculated at checkout based on the destination and weight of the package.
          </p>
          <p className="text-gray-500 dark:text-gray-500 text-sm italic">
            Note: International customers are responsible for any customs duties or import taxes that may apply.
          </p>
        </section>

        <section className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg">
              <Clock size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Order Tracking</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            Once your order ships, you will receive a confirmation email with a tracking number. You can track your package directly on our website or through the carrier's portal.
          </p>
        </section>

        <section className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-lg">
              <AlertTriangle size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Lost or Damaged Packages</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            If your package is lost or arrives damaged, please contact our support team within 48 hours of delivery. We will work with the carrier to resolve the issue and ensure you receive your order.
          </p>
        </section>
      </div>
    </div>
  );
}
