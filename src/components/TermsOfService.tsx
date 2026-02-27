import { FileText, ShoppingBag, AlertCircle, Scale, ArrowLeft } from 'lucide-react';

interface TermsOfServiceProps {
  onBack: () => void;
}

export function TermsOfService({ onBack }: TermsOfServiceProps) {
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Terms of Service</h1>
        <p className="text-gray-500 dark:text-gray-400">Last updated: February 26, 2026</p>
      </div>

      <div className="space-y-8">
        <section className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
              <FileText size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Acceptance of Terms</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            By accessing and using TOOROGADGETS, you accept and agree to be bound by the terms and provision of this agreement. In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.
          </p>
        </section>

        <section className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <ShoppingBag size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Products and Pricing</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
            We strive to ensure that all details, descriptions, and prices of products appearing on TOOROGADGETS are accurate. However, errors may occur. If we discover an error in the price of any goods which you have ordered, we will inform you of this as soon as possible.
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400 ml-2">
            <li>Prices are subject to change without notice.</li>
            <li>We reserve the right to discontinue any product at any time.</li>
            <li>We do not warrant that the quality of any products will meet your expectations.</li>
          </ul>
        </section>

        <section className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-lg">
              <AlertCircle size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Returns and Refunds</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            Our policy lasts 30 days. If 30 days have gone by since your purchase, unfortunately, we can’t offer you a refund or exchange. To be eligible for a return, your item must be unused and in the same condition that you received it. It must also be in the original packaging.
          </p>
        </section>

        <section className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
              <Scale size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Governing Law</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            These Terms shall be governed and construed in accordance with the laws of the jurisdiction in which TOOROGADGETS operates, without regard to its conflict of law provisions.
          </p>
        </section>
      </div>
    </div>
  );
}
