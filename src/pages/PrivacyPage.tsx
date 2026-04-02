import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { SEO } from '../components/common/SEO';

export const PrivacyPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <SEO
        title="Privacy Policy | National Benefit Alliance"
        description="Learn how National Benefit Alliance collects, uses, and protects your personal information."
        canonical="https://nationalbenefitalliance.com/privacy"
        robots="index, follow"
      />
      <Header />
      <main className="flex-1 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-md p-8 md:p-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
              Privacy Policy
            </h1>
            <div className="prose prose-gray max-w-none text-left space-y-6">
              <p className="text-gray-700 leading-relaxed">
                At National Benefit Alliance, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our services.
              </p>

              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1. Information We Collect</h2>
              <p className="text-gray-700 leading-relaxed">
                We collect several types of information from and about users of our services:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Personal Information:</strong> Name, date of birth, address, email address, phone number, Social Security number (when required for benefit verification), income information, and employment status.</li>
                <li><strong>Technical Information:</strong> IP address, browser type, operating system, device information, and website usage data.</li>
                <li><strong>Usage Information:</strong> Pages viewed, links clicked, time spent on our website, and interactions with our services.</li>
                <li><strong>Communication Information:</strong> Records of your communications with us, including phone calls, emails, and text messages.</li>
              </ul>

              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">2. How We Collect Information</h2>
              <p className="text-gray-700 leading-relaxed">
                We collect information through:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Information you provide directly when filling out forms on our website</li>
                <li>Automated technologies such as cookies, web beacons, and analytics tools</li>
                <li>Third-party sources, including marketing partners and data providers</li>
                <li>Your interactions with our customer service representatives</li>
              </ul>

              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">3. How We Use Your Information</h2>
              <p className="text-gray-700 leading-relaxed">
                We use your information to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Evaluate your eligibility for benefit programs</li>
                <li>Connect you with appropriate benefit programs and enrollment specialists</li>
                <li>Communicate with you about programs and services</li>
                <li>Improve our website and services</li>
                <li>Send you marketing communications about related services (with your consent)</li>
                <li>Comply with legal obligations and prevent fraud</li>
                <li>Analyze website usage and user behavior to enhance user experience</li>
              </ul>

              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">4. Information Sharing and Disclosure</h2>
              <p className="text-gray-700 leading-relaxed">
                We may share your information with:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Service Providers:</strong> Third-party companies that help us provide our services, including call centers, enrollment specialists, and marketing partners.</li>
                <li><strong>Government Agencies:</strong> When necessary for benefit program applications and verifications.</li>
                <li><strong>Business Partners:</strong> Organizations that offer related services or programs that may benefit you.</li>
                <li><strong>Legal Authorities:</strong> When required by law or to protect our rights and safety.</li>
                <li><strong>Business Transfers:</strong> In connection with any merger, sale, or transfer of our business.</li>
              </ul>

              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">5. Marketing Communications</h2>
              <p className="text-gray-700 leading-relaxed">
                With your consent, we may use your contact information to send you marketing communications about benefit programs and related services. You can opt out of these communications at any time by:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Clicking the unsubscribe link in our emails</li>
                <li>Replying STOP to text messages</li>
                <li>Contacting us directly to request removal from our marketing lists</li>
              </ul>

              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">6. Cookies and Tracking Technologies</h2>
              <p className="text-gray-700 leading-relaxed">
                We use cookies and similar tracking technologies to enhance your experience on our website, analyze usage patterns, and deliver targeted advertising. You can control cookies through your browser settings, but disabling cookies may limit your ability to use certain features of our website.
              </p>

              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">7. Data Security</h2>
              <p className="text-gray-700 leading-relaxed">
                We implement reasonable security measures to protect your information from unauthorized access, disclosure, alteration, and destruction. However, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
              </p>

              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">8. Data Retention</h2>
              <p className="text-gray-700 leading-relaxed">
                We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required by law. When we no longer need your information, we will securely delete or anonymize it.
              </p>

              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">9. Your Privacy Rights</h2>
              <p className="text-gray-700 leading-relaxed">
                Depending on your location, you may have certain rights regarding your personal information, including:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>The right to access your personal information</li>
                <li>The right to correct inaccurate information</li>
                <li>The right to delete your information</li>
                <li>The right to opt out of marketing communications</li>
                <li>The right to opt out of the sale of your personal information (California residents)</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                To exercise these rights, please contact us using the information provided at the end of this policy.
              </p>

              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">10. Children's Privacy</h2>
              <p className="text-gray-700 leading-relaxed">
                Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If we learn that we have collected information from a child under 18, we will delete that information promptly.
              </p>

              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">11. Third-Party Websites</h2>
              <p className="text-gray-700 leading-relaxed">
                Our website may contain links to third-party websites. We are not responsible for the privacy practices of these websites. We encourage you to read the privacy policies of any third-party websites you visit.
              </p>

              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">12. Changes to This Privacy Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on our website and updating the "Last Updated" date. Your continued use of our services after such changes constitutes your acceptance of the updated policy.
              </p>

              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">13. California Privacy Rights</h2>
              <p className="text-gray-700 leading-relaxed">
                California residents have additional rights under the California Consumer Privacy Act (CCPA). For detailed information about these rights, please see our California Privacy Act page.
              </p>

              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">14. Contact Us</h2>
              <p className="text-gray-700 leading-relaxed">
                If you have questions or concerns about this Privacy Policy or our privacy practices, please contact us. We will respond to your inquiry within a reasonable timeframe.
              </p>

              <p className="text-gray-700 leading-relaxed mt-8">
                <strong>Last Updated:</strong> This Privacy Policy is effective as of the date of your use of our services and supersedes all prior versions.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};
