import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { ProgressBar } from '../../components/form/ProgressBar';
import { Step2BasicInfo } from '../../components/form/Step2BasicInfo';
import { FormNavButtons } from '../../components/form/FormNavButtons';
import { useFormContext } from '../../contexts/FormContext';
import { RouteGuard } from '../../components/guards/RouteGuard';
import { setLastCompletedStep } from '../../utils/storage/formStorage';
import { pushFormStepComplete } from '../../utils/gtm';
import { SEO } from '../../components/common/SEO';

export const FormStep2Page = () => {
  const navigate = useNavigate();
  const { formData, updateFormData } = useFormContext();
  const [errors, setErrors] = useState<{ dob?: string; citizenship?: string }>({});

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleContinue = () => {
    const newErrors: { dob?: string; citizenship?: string } = {};

    if (!formData.dob) newErrors.dob = 'Please enter your date of birth';
    if (!formData.citizenship) newErrors.citizenship = 'Please select your citizenship status';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLastCompletedStep(2);
    pushFormStepComplete(2, 'basic_information');
    navigate('/form/3-address');
  };

  const handleBack = () => {
    setErrors({});
    navigate('/form/1-state');
  };

  return (
    <RouteGuard step={2}>
      <div className="min-h-screen bg-gray-50">
        <SEO
          title="Basic Information | National Benefit Alliance"
          description="Provide your basic information to check eligibility for benefits."
          canonical="https://nationalbenefitalliance.com/form/2-basic-info"
          robots="noindex, follow"
        />
        <Header />
        <main className="py-8 md:py-16 px-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-soft-lg p-8 md:p-10 border border-gray-100">
              <ProgressBar currentStep={2} totalSteps={5} />
              <Step2BasicInfo
                dob={formData.dob}
                citizenship={formData.citizenship}
                onDobChange={(value) => updateFormData({ dob: value })}
                onCitizenshipChange={(value) => updateFormData({ citizenship: value })}
                errors={errors}
              />
              <FormNavButtons
                currentStep={2}
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
