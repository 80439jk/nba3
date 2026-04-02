import { CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ProgramsList = () => {
  const navigate = useNavigate();

  const handleCheckEligibility = () => {
    navigate('/form/1-state');
  };

  const programs = [
    'Utilities',
    'Car payments',
    'Medical expenses',
    'Education costs',
    'Health insurance discounts'
  ];

  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-soft-lg p-8 md:p-12 border border-gray-100">
          <p className="text-lg text-gray-700 leading-relaxed mb-8">
            Whether you're struggling with bills, facing a health challenge, or just trying to make ends meet, there are programs available to help. Many people qualify and don't even know it.
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-navy-900 mb-8">
            Get Matched To Programs In One Quick Call
          </h2>
          <div className="space-y-4 mb-10">
            {programs.map((program) => (
              <div key={program} className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-1" />
                <span className="text-lg text-gray-700">{program}</span>
              </div>
            ))}
          </div>
          <div className="text-center">
            <button
              onClick={handleCheckEligibility}
              className="bg-amber-500 hover:bg-amber-600 text-white text-xl px-12 py-5 rounded-lg font-bold transition-all shadow-lg hover:shadow-xl"
            >
              Check Your Eligibility
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
