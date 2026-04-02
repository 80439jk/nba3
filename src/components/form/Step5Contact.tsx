import { useState } from 'react';
import { formatPhone } from '../../utils/formatPhone';

interface Step5ContactProps {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  tcpaConsent: boolean;
  honeypot: string;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onTcpaConsentChange: (value: boolean) => void;
  onHoneypotChange: (value: string) => void;
  errors?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    tcpaConsent?: string;
  };
}

export const Step5Contact = ({
  firstName,
  lastName,
  email,
  phone,
  tcpaConsent,
  honeypot,
  onFirstNameChange,
  onLastNameChange,
  onEmailChange,
  onPhoneChange,
  onTcpaConsentChange,
  onHoneypotChange,
  errors
}: Step5ContactProps) => {
  const [phoneDisplay, setPhoneDisplay] = useState(phone);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const formatted = formatPhone(input);
    setPhoneDisplay(formatted);
    onPhoneChange(formatted);
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
        Contact Information
      </h2>
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              First Name
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => onFirstNameChange(e.target.value)}
              placeholder="John"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
            {errors?.firstName && (
              <p className="mt-2 text-sm text-red-600">{errors.firstName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Last Name
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => onLastNameChange(e.target.value)}
              placeholder="Doe"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
            {errors?.lastName && (
              <p className="mt-2 text-sm text-red-600">{errors.lastName}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="john@example.com"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          />
          {errors?.email && (
            <p className="mt-2 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            value={phoneDisplay}
            onChange={handlePhoneChange}
            placeholder="(555) 123-4567"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          />
          {errors?.phone && (
            <p className="mt-2 text-sm text-red-600">{errors.phone}</p>
          )}
        </div>

        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="tcpa-consent"
              checked={tcpaConsent}
              onChange={(e) => onTcpaConsentChange(e.target.checked)}
              className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-600"
            />
            <label htmlFor="tcpa-consent" className="text-sm text-gray-700 leading-relaxed">
              By checking this box and clicking the button, you confirm that this is your mobile number and that you are 18 years of age or older. You agree to the National Benefit Alliance Terms of Use and Privacy Policy and provide your express written consent to be contacted by National Benefit Alliance, its service providers, and marketing partners, and that your information may be shared with and used by such partners to contact you, via telephone calls and text messages (including SMS and MMS), including through the use of an automatic telephone dialing system, artificial or prerecorded voice, and AI-generated voice, at the number you provided, even if your number is listed on any federal or state Do Not Call registry. You understand that these communications may include marketing messages. Consent is not a condition of purchase. Message frequency varies (up to 10 messages per month). Message and data rates may apply. Reply STOP to opt out or HELP for help. You also agree to receive marketing emails from National Benefit Alliance and its affiliated brands and marketing partners. You may unsubscribe at any time by clicking the unsubscribe link in any email.
            </label>
          </div>
          {errors?.tcpaConsent && (
            <p className="mt-2 text-sm text-red-600">{errors.tcpaConsent}</p>
          )}
        </div>

        <input
          type="hidden"
          id="leadid_token"
          name="universal_leadid"
          value=""
        />

        <input
          type="text"
          name="website"
          value={honeypot}
          onChange={(e) => onHoneypotChange(e.target.value)}
          style={{ position: 'absolute', left: '-9999px', opacity: 0 }}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
        />
      </div>
    </div>
  );
};
