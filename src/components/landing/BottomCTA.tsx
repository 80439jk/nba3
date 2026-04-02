import { useNavigate } from 'react-router-dom';

export const BottomCTA = () => {
  const navigate = useNavigate();

  const handleStartClick = () => {
    navigate('/form/1-state');
  };

  return (
    <>
      <section className="py-20 px-4 bg-gradient-to-b from-navy-900 to-navy-800 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">
            The assistance you need is out there
          </h2>
          <p className="text-2xl mb-10 text-gray-200">
            We're here to help you find it
          </p>
          <button
            onClick={handleStartClick}
            className="bg-amber-500 hover:bg-amber-600 text-white text-xl px-12 py-5 rounded-lg font-bold transition-all shadow-lg hover:shadow-xl"
          >
            Check Your Eligibility Now
          </button>
        </div>
      </section>

      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <button
            onClick={handleStartClick}
            className="bg-amber-500 hover:bg-amber-600 text-white text-2xl px-14 py-6 rounded-lg font-bold transition-all shadow-lg hover:shadow-xl mb-6"
          >
            Start Your Free Eligibility Check
          </button>
          <p className="text-lg text-gray-700">
            We help connect you to the benefits and assistance you deserve
          </p>
        </div>
      </section>
    </>
  );
};
