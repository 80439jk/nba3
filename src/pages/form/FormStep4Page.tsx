import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { ProgressBar } from '../../components/form/ProgressBar';
import { Step4Income } from '../../components/form/Step4Income';
import { FormNavButtons } from '../../components/form/FormNavButtons';
import { useFormContext } from '../../contexts/FormContext';
import { RouteGuard } from '../../components/guards/RouteGuard';
import { setLastCompletedStep } from '../../utils/storage/formStorage';
import { pushFormStepComplete } from '../../utils/gtm';
import { SEO } from '../../components/common/SEO';

export const FormStep4Page = () => {
  const navigate = useNavigate();
  const { formData, updateFormData } = useFormContext();
  const [errors, setErrors] = useState<{ annualIncome?: string; employmentStatus?: string }>({});

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleContinue = () => {
    const newErrors: { annualIncome?: string; employmentStatus?: string } = {};

    if (!formData.annualIncome) newErrors.annualIncome = 'Please select your annual income';
    if (!formData.employmentStatus) newErrors.employmentStatus = 'Please select your employment status';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLastCompletedStep(4);
    pushFormStepComplete(4, 'income_employment');
    navigate('/form/5-contact');
  };

  const handleBack = () => {
    setErrors({});
    navigate('/form/3-address');
  };

  return (
    <RouteGuard step={4}>
      <div className="min-h-screen bg-gray-50">
        <SEO
          title="Income Information | National Benefit Alliance"
          description="Provide your income information to check eligibility for benefits."
          canonical="https://nationalbenefitalliance.com/form/4-household-income"
          robots="noindex, follow"
        />
        <Header />
        <main className="py-8 md:py-16 px-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-soft-lg p-8 md:p-10 border border-gray-100">
              <ProgressBar currentStep={4} totalSteps={5} />
              <Step4Income
                annualIncome={formData.annualIncome}
                employmentStatus={formData.employmentStatus}
                onAnnualIncomeChange={(value) => updateFormData({ annualIncome: value })}
                onEmploymentStatusChange={(value) => updateFormData({ employmentStatus: value })}
                errors={errors}
              />
              <FormNavButtons
                currentStep={4}
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
