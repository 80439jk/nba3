import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { ProgressBar } from '../../components/form/ProgressBar';
import { Step1State } from '../../components/form/Step1State';
import { FormNavButtons } from '../../components/form/FormNavButtons';
import { useFormContext } from '../../contexts/FormContext';
import { setLastCompletedStep } from '../../utils/storage/formStorage';
import { pushFormStepComplete } from '../../utils/gtm';
import { SEO } from '../../components/common/SEO';

export const FormStep1Page = () => {
  const navigate = useNavigate();
  const { formData, updateFormData } = useFormContext();
  const [error, setError] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleContinue = () => {
    if (!formData.state) {
      setError('Please select your state');
      return;
    }

    setError('');
    setLastCompletedStep(1);
    pushFormStepComplete(1, 'state_selection');
    navigate('/form/2-basic-info');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title="Select Your State | National Benefit Alliance"
        description="Select your state to check eligibility for benefits and assistance programs."
        canonical="https://nationalbenefitalliance.com/form/1-state"
        robots="noindex, follow"
      />
      <Header />
      <main className="py-8 md:py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-soft-lg p-8 md:p-10 border border-gray-100">
            <ProgressBar currentStep={1} totalSteps={5} />
            <Step1State
              value={formData.state}
              onChange={(value) => updateFormData({ state: value })}
              error={error}
            />
            <FormNavButtons
              currentStep={1}
              totalSteps={5}
              isLastStep={false}
              isSubmitting={false}
              onBack={() => navigate('/start')}
              onContinue={handleContinue}
            />
          </div>
        </div>
      </main>
    </div>
  );
};
