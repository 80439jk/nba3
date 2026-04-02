import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { ProgressBar } from '../../components/form/ProgressBar';
import { Step3Address } from '../../components/form/Step3Address';
import { FormNavButtons } from '../../components/form/FormNavButtons';
import { useFormContext } from '../../contexts/FormContext';
import { RouteGuard } from '../../components/guards/RouteGuard';
import { setLastCompletedStep } from '../../utils/storage/formStorage';
import { pushFormStepComplete } from '../../utils/gtm';
import { SEO } from '../../components/common/SEO';

export const FormStep3Page = () => {
  const navigate = useNavigate();
  const { formData, updateFormData } = useFormContext();
  const [errors, setErrors] = useState<{ streetAddress?: string; city?: string; zip?: string }>({});

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleContinue = () => {
    const newErrors: { streetAddress?: string; city?: string; zip?: string } = {};

    if (!formData.streetAddress) newErrors.streetAddress = 'Please enter your street address';
    if (!formData.city) newErrors.city = 'Please enter your city';
    if (!formData.zip) newErrors.zip = 'Please enter your ZIP code';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLastCompletedStep(3);
    pushFormStepComplete(3, 'address');
    navigate('/form/4-household-income');
  };

  const handleBack = () => {
    setErrors({});
    navigate('/form/2-basic-info');
  };

  return (
    <RouteGuard step={3}>
      <div className="min-h-screen bg-gray-50">
        <SEO
          title="Address Information | National Benefit Alliance"
          description="Provide your address to check eligibility for benefits."
          canonical="https://nationalbenefitalliance.com/form/3-address"
          robots="noindex, follow"
        />
        <Header />
        <main className="py-8 md:py-16 px-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-soft-lg p-8 md:p-10 border border-gray-100">
              <ProgressBar currentStep={3} totalSteps={5} />
              <Step3Address
                streetAddress={formData.streetAddress}
                city={formData.city}
                zip={formData.zip}
                onStreetAddressChange={(value) => updateFormData({ streetAddress: value })}
                onCityChange={(value) => updateFormData({ city: value })}
                onZipChange={(value) => updateFormData({ zip: value })}
                errors={errors}
              />
              <FormNavButtons
                currentStep={3}
                totalSteps={5}
                isLastStep={false}
                isSubmitting={false}
                onBack={handleBack}
                onContinue={handleContinue}
              />
            </div>
          </div>
        </main>
      </div>
    </RouteGuard>
  );
};
