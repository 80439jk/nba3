import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { SEO } from '../components/common/SEO';

export const TermsPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <SEO
        title="Terms and Conditions | National Benefit Alliance"
        description="Read the terms and conditions for using National Benefit Alliance services."
        canonical="https://nationalbenefitalliance.com/terms"
        robots="index, follow"
      />
      <Header />
      <main className="flex-1 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-md p-8 md:p-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
              Terms & Conditions
            </h1>
            <div className="prose prose-gray max-w-none text-left space-y-6">
              <p className="text-gray-700 leading-relaxed">
                Welcome to National Benefit Alliance. By accessing or using our website and services, you agree to be bound by these Terms and Conditions. Please read them carefully.
              </p>

              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                By using our services, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions, as well as our Privacy Policy. If you do not agree with any part of these terms, you must not use our services.
              </p>

              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">2. Description of Services</h2>
              <p className="text-gray-700 leading-relaxed">
                National Benefit Alliance provides information and assistance regarding various government and private benefit programs. We help users identify programs they may qualify for and connect them with resources and specialists who can assist with enrollment.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Our services include but are not limited to: pre-qualification screening, benefit program information, referrals to enrollment specialists, and general guidance about available assistance programs.
              </p>

              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">3. Eligibility</h2>
              <p className="text-gray-700 leading-relaxed">
                To use our services, you must be at least 18 years of age and a resident of the United States. By using our services, you represent and warrant that you meet these eligibility requirements.
              </p>

              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">4. No Guarantee of Benefits</h2>
              <p className="text-gray-700 leading-relaxed">
                We provide information and assistance regarding benefit programs, but we do not guarantee that you will qualify for or receive any specific benefits. Eligibility for government and private benefit programs is determined by the administering agencies and organizations, not by National Benefit Alliance.
              </p>

              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">5. Free Services</h2>
              <p className="text-gray-700 leading-relaxed">
                Our core services are provided free of charge. We do not charge fees for information, pre-qualification screening, or referrals to benefit programs. Any benefits you may receive are provided directly by government agencies or other organizations, not by National Benefit Alliance.
              </p>

              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">6. User Information</h2>
              <p className="text-gray-700 leading-relaxed">
                You agree to provide accurate, current, and complete information when using our services. You are responsible for maintaining the confidentiality of any account credentials and for all activities that occur under your account.
              </p>

              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">7. Communication Consent</h2>
              <p className="text-gray-700 leading-relaxed">
                By providing your contact information, you consent to receive communications from National Benefit Alliance and our partners via telephone, text message, and email. This includes automated calls and text messages. You may opt out of these communications at any time by following the unsubscribe instructions provided in our messages.
              </p>

              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">8. Third-Party Services</h2>
              <p className="text-gray-700 leading-relaxed">
                We may connect you with third-party service providers, including enrollment specialists, government agencies, and other organizations. We are not responsible for the actions, services, or policies of these third parties. Your interactions with third parties are solely between you and them.
              </p>

              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">9. Intellectual Property</h2>
              <p className="text-gray-700 leading-relaxed">
                All content on our website, including text, graphics, logos, and software, is the property of National Benefit Alliance or its licensors and is protected by copyright and other intellectual property laws. You may not reproduce, distribute, or create derivative works from our content without express written permission.
              </p>

              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">10. Disclaimer of Warranties</h2>
              <p className="text-gray-700 leading-relaxed">
                Our services are provided "as is" and "as available" without warranties of any kind, either express or implied. We do not warrant that our services will be uninterrupted, error-free, or secure. We disclaim all warranties, including but not limited to warranties of merchantability, fitness for a particular purpose, and non-infringement.
              </p>

              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">11. Limitation of Liability</h2>
              <p className="text-gray-700 leading-relaxed">
                To the fullest extent permitted by law, National Benefit Alliance shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or relating to your use of our services. Our total liability to you for any claims arising from your use of our services shall not exceed $100.
              </p>

              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">12. Indemnification</h2>
              <p className="text-gray-700 leading-relaxed">
                You agree to indemnify and hold harmless National Benefit Alliance and its affiliates, officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including attorneys' fees) arising out of your use of our services or violation of these Terms.
              </p>

              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">13. Modifications to Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to modify these Terms and Conditions at any time. We will notify you of any material changes by posting the new Terms on our website. Your continued use of our services after such changes constitutes your acceptance of the modified Terms.
              </p>

              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">14. Governing Law</h2>
              <p className="text-gray-700 leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of the United States and the state in which National Benefit Alliance is headquartered, without regard to its conflict of law provisions.
              </p>

              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">15. Dispute Resolution</h2>
              <p className="text-gray-700 leading-relaxed">
                Any dispute arising out of or relating to these Terms or our services shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association. You waive any right to participate in a class action lawsuit or class-wide arbitration.
              </p>

              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">16. Severability</h2>
              <p className="text-gray-700 leading-relaxed">
                If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions shall continue in full force and effect.
              </p>

              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">17. Contact Information</h2>
              <p className="text-gray-700 leading-relaxed">
                If you have any questions about these Terms and Conditions, please contact us through the information provided on our website.
              </p>

              <p className="text-gray-700 leading-relaxed mt-8">
                <strong>Last Updated:</strong> These Terms and Conditions are effective as of the date of your use of our services.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};
