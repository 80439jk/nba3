import { useEffect, useState } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { ConfirmationCard } from '../components/confirmation/ConfirmationCard';
import { pushLeadSubmit } from '../utils/gtm';
import { getConfirmation, markGtmFired } from '../utils/storage/formStorage';
import { SEO } from '../components/common/SEO';

export const ThankYouPage = () => {
  const [confirmation, setConfirmation] = useState(() => getConfirmation());

  useEffect(() => {
    window.scrollTo(0, 0);

    const confirmationData = getConfirmation();

    if (confirmationData && !confirmationData.gtmFired) {
      pushLeadSubmit(
        confirmationData.transactionId,
        confirmationData.email,
        confirmationData.phone,
        confirmationData.firstName,
        confirmationData.firstName
      );
      markGtmFired();
    }

    setConfirmation(confirmationData);
  }, []);

  const firstName = confirmation?.firstName || 'Applicant';
  const email = confirmation?.email || '';

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <SEO
        title="Complete Your Request | Call Now | National Benefit Alliance"
        description="Call now to complete your benefits request and speak with a representative. Fast and easy next step."
        canonical="https://nationalbenefitalliance.com/thankyou"
        robots="noindex, nofollow"
      />
      <Header />
      <main className="flex-1 py-6 px-4">
        <div className="max-w-2xl mx-auto">
          <ConfirmationCard firstName={firstName} email={email} />
        </div>
      </main>
      <Footer />
    </div>
  );
};