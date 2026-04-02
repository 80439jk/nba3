import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormContext } from '../../contexts/FormContext';

interface RouteGuardProps {
  step: number;
  children: ReactNode;
}

export const RouteGuard = ({ step, children }: RouteGuardProps) => {
  const { formData } = useFormContext();
  const navigate = useNavigate();

  useEffect(() => {
    const getFirstIncompleteStep = (): number => {
      if (!formData.state) return 1;
      if (!formData.dob || !formData.citizenship) return 2;
      if (!formData.streetAddress || !formData.city || !formData.zip) return 3;
      if (!formData.annualIncome || !formData.employmentStatus) return 4;
      return 5;
    };

    const firstIncompleteStep = getFirstIncompleteStep();

    if (step > firstIncompleteStep) {
      console.log(`RouteGuard: Redirecting from step ${step} to step ${firstIncompleteStep} (incomplete data)`);
      navigate(`/form/${firstIncompleteStep}-${getStepSlug(firstIncompleteStep)}`, { replace: true });
    }
  }, [step, formData, navigate]);

  return <>{children}</>;
};

const getStepSlug = (step: number): string => {
  const slugs: Record<number, string> = {
    1: 'state',
    2: 'basic-info',
    3: 'address',
    4: 'household-income',
    5: 'contact'
  };
  return slugs[step] || 'state';
};
