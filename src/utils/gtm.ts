declare global {
  interface Window { dataLayer: any[]; }
}

export const pushFormStepComplete = (stepNumber: number, stepName: string) => {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'form_step_complete',
    step_number: stepNumber,
    step_name: stepName
  });
};

export const pushLeadSubmit = (
  transactionId: string,
  email: string,
  phone: string,
  firstName: string,
  lastName: string
) => {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'lead_submit',
    transaction_id: transactionId,
    enhanced_conversion_data: {
      email,
      phone_number: phone,
      first_name: firstName,
      last_name: lastName
    }
  });
};

export const pushCallButtonClick = () => {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'call_button_click',
    phone_number: '18557679422'
  });
};
