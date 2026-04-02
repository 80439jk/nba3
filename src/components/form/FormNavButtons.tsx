import { ChevronLeft } from 'lucide-react';

interface FormNavButtonsProps {
  currentStep: number;
  totalSteps: number;
  isLastStep: boolean;
  isSubmitting: boolean;
  onBack: () => void;
  onContinue: () => void;
}

export const FormNavButtons = ({
  currentStep,
  isLastStep,
  isSubmitting,
  onBack,
  onContinue
}: FormNavButtonsProps) => {
  return (
    <div className="mt-10">
      <div className="flex gap-4">
        {currentStep > 1 && (
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 px-6 py-3.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold transition-all border border-gray-300"
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>
        )}
        <button
          type="button"
          onClick={onContinue}
          disabled={isSubmitting}
          className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white px-8 py-3.5 rounded-lg font-bold transition-all shadow-md hover:shadow-lg"
        >
          {isSubmitting ? 'Processing...' : isLastStep ? 'Complete & Get Matched' : 'Continue'}
        </button>
      </div>

      {isLastStep && (
        <p className="text-center text-sm text-gray-600 mt-5">
          Do not close browser while processing — this may take up to 30 seconds.
        </p>
      )}

      <p className="text-center text-sm text-gray-600 mt-6">
        Your information is secure and will only be used to match you with relevant programs.
      </p>
    </div>
  );
};
