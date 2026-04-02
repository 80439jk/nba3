import { useNavigate } from 'react-router-dom';

export const Hero = () => {
  const navigate = useNavigate();

  const handleStartClick = () => {
    navigate('/form/1-state');
  };

  return (
    <section className="bg-gradient-to-b from-navy-900 via-navy-800 to-navy-900 py-20 md:py-28 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <p className="text-base font-semibold tracking-wide uppercase text-amber-400 mb-6 mt-2">
          REAL PEOPLE, REAL BENEFITS
        </p>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight">
          When Life Hits Hard, You Do Not Need To Navigate The System Alone
        </h1>
        <p className="text-xl md:text-2xl text-gray-200 mb-10 leading-relaxed max-w-3xl mx-auto">
          In one quick, free phone call, a benefits specialist can review your situation, see if you qualify, and match you to assistance programs that may help right away.
        </p>
        <button
          onClick={handleStartClick}
          className="bg-amber-500 hover:bg-amber-600 text-white text-xl px-12 py-5 rounded-lg font-bold transition-all shadow-lg hover:shadow-xl mx-auto inline-block"
        >
          Start Your Free Eligibility Check
        </button>
      </div>
    </section>
  );
};
