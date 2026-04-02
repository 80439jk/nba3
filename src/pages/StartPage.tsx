import { useEffect } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Hero } from '../components/landing/Hero';
import { TrustBadges } from '../components/landing/TrustBadges';
import { ProgramsList } from '../components/landing/ProgramsList';
import { HowItWorks } from '../components/landing/HowItWorks';
import { WhatToExpect } from '../components/landing/WhatToExpect';
import { BottomCTA } from '../components/landing/BottomCTA';
import { captureTrackingParams } from '../utils/trackingParams';
import { SEO } from '../components/common/SEO';

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "National Benefit Alliance",
  "url": "https://nationalbenefitalliance.com"
};

export const StartPage = () => {
  useEffect(() => {
    captureTrackingParams();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Government Benefits Assistance | Check Eligibility Today | National Benefit Alliance"
        description="See if you qualify for benefits & assistance programs you may not know about. Fast and simple eligibility check. Get started now."
        canonical="https://nationalbenefitalliance.com/start"
        robots="index, follow"
        schema={organizationSchema}
      />
      <Header />
      <main className="flex-1">
        <Hero />
        <TrustBadges />
        <ProgramsList />
        <HowItWorks />
        <WhatToExpect />
        <BottomCTA />
      </main>
      <Footer />
    </div>
  );
};
