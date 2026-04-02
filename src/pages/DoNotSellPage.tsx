import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';

export const DoNotSellPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-md p-8 md:p-12 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Do Not Sell My Info
            </h1>
            <p className="text-lg text-gray-700">
              Coming Soon
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};
