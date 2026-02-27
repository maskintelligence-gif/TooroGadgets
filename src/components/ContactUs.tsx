import { Mail, Phone, MapPin, Clock, ArrowLeft } from 'lucide-react';

interface ContactUsProps {
  onBack: () => void;
}

export function ContactUs({ onBack }: ContactUsProps) {
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Contact Us</h1>
        <p className="text-gray-500">We're here to help! Reach out to us through any of these channels.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-12">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Mail size={24} />
            </div>
            <h3 className="font-bold text-gray-900">Email Support</h3>
          </div>
          <p className="text-gray-600 mb-2">For general inquiries and support:</p>
          <a href="mailto:support@toorogadgets.com" className="text-blue-600 font-medium hover:underline">
            support@toorogadgets.com
          </a>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Phone size={24} />
            </div>
            <h3 className="font-bold text-gray-900">Phone Support</h3>
          </div>
          <p className="text-gray-600 mb-2">Mon-Fri from 9am to 6pm EST:</p>
          <a href="tel:+15551234567" className="text-blue-600 font-medium hover:underline">
            +1 (555) 123-4567
          </a>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
            <MapPin size={24} />
          </div>
          <h3 className="font-bold text-gray-900">Our Location</h3>
        </div>
        <div className="aspect-video w-full bg-gray-100 rounded-xl mb-4 flex items-center justify-center text-gray-400">
          [Map Placeholder]
        </div>
        <p className="text-gray-600">
          123 Tech Avenue<br />
          Silicon Valley, CA 94025<br />
          United States
        </p>
      </div>

      <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
        <div className="flex items-center gap-3 mb-2">
          <Clock size={20} className="text-blue-600" />
          <h3 className="font-bold text-gray-900">Business Hours</h3>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <p className="font-medium">Monday - Friday</p>
            <p>9:00 AM - 6:00 PM</p>
          </div>
          <div>
            <p className="font-medium">Saturday</p>
            <p>10:00 AM - 4:00 PM</p>
          </div>
          <div>
            <p className="font-medium">Sunday</p>
            <p>Closed</p>
          </div>
        </div>
      </div>
    </div>
  );
}
