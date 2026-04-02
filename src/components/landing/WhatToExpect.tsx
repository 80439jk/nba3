import { CheckCircle } from 'lucide-react';

export const WhatToExpect = () => {
  const expectations = [
    'Introduction to your case manager',
    'A short, guided prescreening (just a couple minutes)',
    'Immediate feedback on potential eligibility',
    'Step by step help with enrollment in the programs that fit your situation'
  ];

  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-navy-900 text-center mb-16">
          What To Expect On Your Call
        </h2>

        <div className="bg-white rounded-xl shadow-soft-lg p-8 md:p-12 mb-10 border border-gray-100">
          <div className="space-y-5">
            {expectations.map((item, index) => (
              <div key={index} className="flex items-start gap-4">
                <CheckCircle className="w-7 h-7 text-amber-500 flex-shrink-0 mt-1" />
                <span className="text-lg text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-navy-50 border-2 border-navy-200 rounded-xl p-8 text-center">
          <p className="text-xl font-bold text-navy-900 mb-2">
            It's completely free to apply.
          </p>
          <p className="text-lg text-gray-700">
            No hidden fees. No obligation.
          </p>
        </div>
      </div>
    </section>
  );
};
