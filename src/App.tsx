import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { FormProvider } from './contexts/FormContext';
import { LandingPage } from './pages/LandingPage';
import { StartPage } from './pages/StartPage';
import { RedirectToStart } from './pages/RedirectToStart';
import { FormStep1Page } from './pages/form/FormStep1Page';
import { FormStep2Page } from './pages/form/FormStep2Page';
import { FormStep3Page } from './pages/form/FormStep3Page';
import { FormStep4Page } from './pages/form/FormStep4Page';
import { FormStep5Page } from './pages/form/FormStep5Page';
import { ThankYouPage } from './pages/ThankYouPage';
import { TermsPage } from './pages/TermsPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { CaliforniaPrivacyPage } from './pages/CaliforniaPrivacyPage';
import { captureTrackingParams } from './utils/trackingParams';

function AppRoutes() {
  const location = useLocation();

  useEffect(() => {
    captureTrackingParams();
  }, [location.pathname, location.search]);

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/start" element={<StartPage />} />
      <Route path="/apply" element={<RedirectToStart />} />
      <Route
        path="/form/1-state"
        element={
          <FormProvider>
            <FormStep1Page />
          </FormProvider>
        }
      />
      <Route
        path="/form/2-basic-info"
        element={
          <FormProvider>
            <FormStep2Page />
          </FormProvider>
        }
      />
      <Route
        path="/form/3-address"
        element={
          <FormProvider>
            <FormStep3Page />
          </FormProvider>
        }
      />
      <Route
        path="/form/4-household-income"
        element={
          <FormProvider>
            <FormStep4Page />
          </FormProvider>
        }
      />
      <Route
        path="/form/5-contact"
        element={
          <FormProvider>
            <FormStep5Page />
          </FormProvider>
        }
      />
      <Route path="/thankyou" element={<ThankYouPage />} />
      <Route path="/thank-you" element={<ThankYouPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/california-privacy" element={<CaliforniaPrivacyPage />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;