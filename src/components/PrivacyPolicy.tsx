import { Shield, Lock, Eye, Mail, ArrowLeft } from 'lucide-react';

interface PrivacyPolicyProps {
  onBack: () => void;
}

export function PrivacyPolicy({ onBack }: PrivacyPolicyProps) {
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Privacy Policy</h1>
        <p className="text-gray-500 dark:text-gray-400">Last updated: February 26, 2026</p>
      </div>

      <div className="space-y-8">
        <section className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
              <Shield size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Information We Collect</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
            At TOOROGADGETS, we collect information to provide better services to all our users. This includes:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400 ml-2">
            <li>Personal information (Name, Email, Phone Number) when you create an account or place an order.</li>
            <li>Shipping and billing addresses for order fulfillment.</li>
            <li>Payment information (processed securely by our payment partners).</li>
            <li>Device information and browsing data to improve your experience.</li>
          </ul>
        </section>

        <section className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <Eye size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">How We Use Your Information</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
            We use the information we collect for the following purposes:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400 ml-2">
            <li>To process and deliver your orders.</li>
            <li>To communicate with you about your orders, products, and services.</li>
            <li>To improve our store layout and product offerings.</li>
            <li>To detect and prevent fraud and abuse.</li>
          </ul>
        </section>

        <section className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
              <Lock size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Data Security</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            We implement a variety of security measures to maintain the safety of your personal information. Your personal information is contained behind secured networks and is only accessible by a limited number of persons who have special access rights to such systems, and are required to keep the information confidential.
          </p>
        </section>

        <section className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg">
              <Mail size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Contact Us</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
            If you have any questions regarding this privacy policy, you may contact us using the information below:
          </p>
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
            <p className="font-medium text-gray-900 dark:text-white">TOOROGADGETS Support</p>
            <p className="text-gray-600 dark:text-gray-400">Email: support@toorogadgets.com</p>
            <p className="text-gray-600 dark:text-gray-400">Phone: +1 (555) 123-4567</p>
          </div>
        </section>
      </div>
    </div>
  );
}
