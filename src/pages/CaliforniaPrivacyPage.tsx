import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { SEO } from '../components/common/SEO';

export const CaliforniaPrivacyPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <SEO
        title="California Privacy Notice | National Benefit Alliance"
        description="California residents: view your privacy rights and data usage disclosures under applicable law."
        canonical="https://nationalbenefitalliance.com/california-privacy"
        robots="index, follow"
      />
      <Header />
      <main className="flex-1 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-md p-8 md:p-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
              California Privacy Act of 2018
            </h1>
            <div className="prose prose-gray max-w-none text-left space-y-6">
              <p className="text-gray-700 leading-relaxed">
                The California Consumer Privacy Act (CCPA) provides California residents with specific rights regarding their personal information. This notice explains these rights and how to exercise them.
              </p>

              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Right to Know</h2>
              <p className="text-gray-700 leading-relaxed">
                You have the right to request that we disclose certain information to you about our collection and use of your personal information over the past 12 months, including:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>The categories of personal information we collected about you</li>
                <li>The categories of sources for the personal information we collected about you</li>
                <li>Our business or commercial purpose for collecting that personal information</li>
                <li>The categories of third parties with whom we share that personal information</li>
                <li>The specific pieces of personal information we collected about you</li>
              </ul>

              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Right to Delete</h2>
              <p className="text-gray-700 leading-relaxed">
                You have the right to request that we delete any of your personal information that we collected from you and retained, subject to certain exceptions.
              </p>

              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Right to Opt-Out</h2>
              <p className="text-gray-700 leading-relaxed">
                You have the right to opt-out of the sale of your personal information. We do not sell personal information in the traditional sense, but we may share information with partners for marketing purposes. You can opt-out of these communications at any time.
              </p>

              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Right to Non-Discrimination</h2>
              <p className="text-gray-700 leading-relaxed">
                We will not discriminate against you for exercising any of your CCPA rights, including by:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Denying you goods or services</li>
                <li>Charging you different prices or rates for goods or services</li>
                <li>Providing you a different level or quality of goods or services</li>
                <li>Suggesting that you may receive a different price or rate for goods or services or a different level or quality of goods or services</li>
              </ul>

              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">How to Exercise Your Rights</h2>
              <p className="text-gray-700 leading-relaxed">
                To exercise the rights described above, please submit a verifiable consumer request to us by contacting us using the information provided in our Privacy Policy.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Only you, or a person registered with the California Secretary of State that you authorize to act on your behalf, may make a verifiable consumer request related to your personal information. You may also make a verifiable consumer request on behalf of your minor child.
              </p>

              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Verification Process</h2>
              <p className="text-gray-700 leading-relaxed">
                We cannot respond to your request or provide you with personal information if we cannot verify your identity or authority to make the request and confirm the personal information relates to you. Making a verifiable consumer request does not require you to create an account with us. We will only use personal information provided in a verifiable consumer request to verify the requestor's identity or authority to make the request.
              </p>

              <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Response Timing</h2>
              <p className="text-gray-700 leading-relaxed">
                We will respond to a verifiable consumer request within 45 days of its receipt. If we require more time, we will inform you of the reason and extension period in writing. We will deliver our written response by mail or electronically, at your option.
              </p>

              <p className="text-gray-700 leading-relaxed mt-8">
                <strong>Last Updated:</strong> This California Privacy Act notice was last updated in accordance with our Privacy Policy.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};
