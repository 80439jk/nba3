import { CheckCircle, Phone } from 'lucide-react';
import { pushCallButtonClick } from '../../utils/gtm';

interface ConfirmationCardProps {
  firstName: string;
  email: string;
}

export const ConfirmationCard = ({ firstName, email }: ConfirmationCardProps) => {
  const handleCallClick = () => {
    pushCallButtonClick();
  };

  return (
    <div className="bg-white rounded-xl shadow-soft-lg p-8 md:p-10 text-center border border-gray-100">
      <div className="mb-6 flex justify-center">
        <div className="relative">
          <div className="absolute inset-0 bg-amber-100 rounded-full animate-pulse" />
          <CheckCircle className="w-20 h-20 text-amber-500 relative" />
        </div>
      </div>

      <h1 className="text-4xl md:text-5xl font-bold text-navy-900 mb-6">
        Congratulations!
      </h1>

      <p className="text-base font-semibold text-navy-900 mb-6">
        Your Reference Number: 60223
      </p>

      <div className="bg-navy-50 border-2 border-navy-200 rounded-xl p-8 mb-8">
        <h2 className="text-2xl font-bold text-navy-900 mb-4">
          Action Needed
        </h2>
        <p className="text-gray-700 mb-6 text-base leading-relaxed">
          A case manager has been assigned to you. Please call the number below to verify your identity and release your available benefits to you. This call is completely free and can connect you to assistance that may help right away.
        </p>
        <a
          href="tel:18557679422"
          onClick={handleCallClick}
          className="inline-flex items-center gap-3 bg-amber-500 hover:bg-amber-600 text-white text-xl px-12 py-6 rounded-lg font-bold transition-all shadow-lg hover:shadow-xl mb-4"
        >
          <Phone className="w-6 h-6" />
          Call Now to Get Started
        </a>
        <p className="text-navy-900 font-bold text-2xl mb-2">
          1-855-767-9422
        </p>
        <p className="text-sm text-gray-700 mb-5">
          No answer? Text us or we'll call you back.
        </p>
        <p className="text-xs text-gray-600 mt-5">
          Your Reference Number will expire in 30 Minutes so please call before expiration or you may need to resubmit an application.
        </p>
      </div>

      <p className="text-lg font-semibold text-navy-900 mb-8">
        National Benefit Alliance has helped more than 2 million U.S. residents receive benefits and resources
      </p>

      <div className="space-y-5 mb-10 text-left">
        <div className="flex items-start gap-4">
          <CheckCircle className="w-7 h-7 text-amber-500 flex-shrink-0 mt-1" />
          <div>
            <p className="font-bold text-navy-900 mb-1">Over 100 Programs Available</p>
            <p className="text-gray-700 text-sm">Based on your information, you may qualify for multiple assistance programs</p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <CheckCircle className="w-7 h-7 text-amber-500 flex-shrink-0 mt-1" />
          <div>
            <p className="font-bold text-navy-900 mb-1">Personal Guidance</p>
            <p className="text-gray-700 text-sm">A specialist will help with enrollment and answer all your questions</p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <CheckCircle className="w-7 h-7 text-amber-500 flex-shrink-0 mt-1" />
          <div>
            <p className="font-bold text-navy-900 mb-1">100% Free Service</p>
            <p className="text-gray-700 text-sm">No hidden fees. No charges. No obligation.</p>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-200">
        <p className="text-sm font-semibold text-gray-600 mb-3">Your Information</p>
        <p className="text-navy-900 font-bold text-lg">{firstName}</p>
        <p className="text-gray-700">{email}</p>
      </div>

      <p className="text-sm text-gray-600 leading-relaxed">
        We'll use your contact information to connect you with a benefits specialist and provide updates about programs you may qualify for. You can manage your preferences anytime.
      </p>
    </div>
  );
};
