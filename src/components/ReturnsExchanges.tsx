import { RefreshCw, CheckCircle, XCircle, HelpCircle, ArrowLeft } from 'lucide-react';

interface ReturnsExchangesProps {
  onBack: () => void;
}

export function ReturnsExchanges({ onBack }: ReturnsExchangesProps) {
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Returns & Exchanges</h1>
        <p className="text-gray-500">Hassle-free returns within 30 days of purchase.</p>
      </div>

      <div className="space-y-8">
        <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <RefreshCw size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Return Policy</h2>
          </div>
          <p className="text-gray-600 leading-relaxed mb-4">
            We want you to be completely satisfied with your purchase. If you're not happy with your order, you can return it for a full refund or exchange within 30 days of delivery.
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600 ml-2">
            <li>Items must be unused and in original packaging.</li>
            <li>Proof of purchase (order number or receipt) is required.</li>
            <li>Return shipping is free for exchanges and store credit.</li>
          </ul>
        </section>

        <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">How to Initiate a Return</h2>
          </div>
          <ol className="list-decimal list-inside space-y-3 text-gray-600 ml-2">
            <li>Log in to your account and go to "Order History".</li>
            <li>Select the order you wish to return and click "Return Items".</li>
            <li>Follow the instructions to print your prepaid shipping label.</li>
            <li>Pack the items securely and drop off the package at any carrier location.</li>
          </ol>
        </section>

        <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
              <XCircle size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Non-Returnable Items</h2>
          </div>
          <p className="text-gray-600 leading-relaxed mb-4">
            Certain items cannot be returned for hygiene or safety reasons:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600 ml-2">
            <li>Opened software or digital downloads.</li>
            <li>Personal care items (e.g., headphones, earbuds) if opened.</li>
            <li>Gift cards.</li>
          </ul>
        </section>

        <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <HelpCircle size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Refund Process</h2>
          </div>
          <p className="text-gray-600 leading-relaxed">
            Once we receive your return, we will inspect the item and notify you of the approval or rejection of your refund. If approved, your refund will be processed, and a credit will automatically be applied to your original method of payment within 5-7 business days.
          </p>
        </section>
      </div>
    </div>
  );
}
