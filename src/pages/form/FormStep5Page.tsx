import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { ProgressBar } from '../../components/form/ProgressBar';
import { Step5Contact } from '../../components/form/Step5Contact';
import { FormNavButtons } from '../../components/form/FormNavButtons';
import { useFormContext } from '../../contexts/FormContext';
import { RouteGuard } from '../../components/guards/RouteGuard';
import {
  setLastCompletedStep,
  isSubmissionInProgress,
  setSubmissionInProgress,
  saveConfirmation,
  clearFormData
} from '../../utils/storage/formStorage';
import { pushFormStepComplete } from '../../utils/gtm';
import { generateTransactionId } from '../../utils/generateTransactionId';
import { getTrackingParams } from '../../utils/trackingParams';
import { convertDOBToISO } from '../../utils/formatDOB';
import { SEO } from '../../components/common/SEO';

export const FormStep5Page = () => {
  const navigate = useNavigate();
  const { formData, updateFormData } = useFormContext();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName) newErrors.firstName = 'Please enter your first name';
    if (!formData.lastName) newErrors.lastName = 'Please enter your last name';
    if (!formData.email) newErrors.email = 'Please enter your email address';
    if (!formData.phone) newErrors.phone = 'Please enter your phone number';
    if (!formData.tcpaConsent) newErrors.tcpaConsent = 'You must agree to the terms to continue';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (isSubmissionInProgress()) {
      console.log('Submission already in progress, preventing duplicate');
      return;
    }

    if (formData.honeypot) {
      const transactionId = generateTransactionId();
      saveConfirmation({
        firstName: formData.firstName,
        email: formData.email,
        phone: formData.phone,
        transactionId
      });
      clearFormData();
      navigate('/thankyou');
      return;
    }

    setIsSubmitting(true);
    setSubmissionInProgress(true);
    setLastCompletedStep(5);
    pushFormStepComplete(5, 'contact_information');

    try {
      const transactionId = generateTransactionId();
      const leadidToken = (document.getElementById('leadid_token') as HTMLInputElement)?.value || '';
      const trackingParams = getTrackingParams();

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/submit-lead`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          transaction_id: transactionId,
          state: formData.state,
          dob: convertDOBToISO(formData.dob),
          citizenship: formData.citizenship,
          street_address: formData.streetAddress,
          city: formData.city,
          zip: formData.zip,
          annual_income: formData.annualIncome,
          employment_status: formData.employmentStatus,
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          tcpa_consent: formData.tcpaConsent,
          jornaya_leadid: leadidToken,
          click_id: trackingParams.gclid,
          utm_source: trackingParams.utm_source,
          utm_medium: trackingParams.utm_medium,
          utm_campaign: trackingParams.utm_campaign,
          utm_content: trackingParams.utm_content,
          utm_term: trackingParams.utm_term
        })
      });

      if (!response.ok) {
        throw new Error('Submission failed');
      }

      saveConfirmation({
        firstName: formData.firstName,
        email: formData.email,
        phone: formData.phone,
        transactionId
      });

      clearFormData();
      setSubmissionInProgress(false);
      navigate('/thankyou');
    } catch (error) {
      console.error('Submission error:', error);
      setErrors({ submit: 'Failed to submit form. Please try again.' });
      setIsSubmitting(false);
      setSubmissionInProgress(false);
    }
  };

  const handleBack = () => {
    setErrors({});
    navigate('/form/4-household-income');
  };

  return (
    <RouteGuard step={5}>
      <div className="min-h-screen bg-gray-50">
        <SEO
          title="Contact Information | National Benefit Alliance"
          description="Provide your contact information to complete your eligibility check."
          canonical="https://nationalbenefitalliance.com/form/5-contact"
          robots="noindex, follow"
        />
        <Header />
        <main className="py-8 md:py-16 px-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-soft-lg p-8 md:p-10 border border-gray-100">
              <ProgressBar currentStep={5} totalSteps={5} />

              {errors.submit && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  {errors.submit}
                </div>
              )}

              <Step5Contact
                firstName={formData.firstName}
                lastName={formData.lastName}
                email={formData.email}
                phone={formData.phone}
                tcpaConsent={formData.tcpaConsent}
                honeypot={formData.honeypot}
                onFirstNameChange={(value) => updateFormData({ firstName: value })}
                onLastNameChange={(value) => updateFormData({ lastName: value })}
                onEmailChange={(value) => updateFormData({ email: value })}
                onPhoneChange={(value) => updateFormData({ phone: value })}
                onTcpaConsentChange={(value) => updateFormData({ tcpaConsent: value })}
                onHoneypotChange={(value) => updateFormData({ honeypot: value })}
                errors={errors}
              />
              <FormNavButtons
                currentStep={5}
                totalSteps={5}
                isLastStep={true}
                isSubmitting={isSubmitting}
                onBack={handleBack}
                onContinue={handleSubmit}
              />
            </div>
          </div>
        </main>
      </div>
    </RouteGuard>
  );
};
