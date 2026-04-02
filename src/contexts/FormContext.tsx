import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  FormData,
  getFormData,
  saveFormData,
  clearFormData,
  getEmptyFormData
} from '../utils/storage/formStorage';

interface FormContextType {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
  resetFormData: () => void;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

export const useFormContext = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within FormProvider');
  }
  return context;
};

interface FormProviderProps {
  children: ReactNode;
}

export const FormProvider = ({ children }: FormProviderProps) => {
  const [formData, setFormData] = useState<FormData>(() => {
    const stored = getFormData();
    return stored || getEmptyFormData();
  });

  const updateFormData = (data: Partial<FormData>) => {
    setFormData(prev => {
      const updated = { ...prev, ...data };
      saveFormData(data);
      return updated;
    });
  };

  const resetFormData = () => {
    clearFormData();
    setFormData(getEmptyFormData());
  };

  useEffect(() => {
    const stored = getFormData();
    if (stored) {
      setFormData(stored);
    }
  }, []);

  return (
    <FormContext.Provider value={{ formData, updateFormData, resetFormData }}>
      {children}
    </FormContext.Provider>
  );
};
