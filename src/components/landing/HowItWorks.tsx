export const HowItWorks = () => {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-navy-900 text-center mb-6">
          How It Works
        </h2>
        <p className="text-xl text-gray-700 text-center mb-16">
          Three simple steps to get matched with assistance:
        </p>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-navy-50 rounded-xl p-8 text-center border border-navy-100">
            <div className="w-16 h-16 bg-navy-800 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
              1
            </div>
            <h3 className="text-xl font-bold text-navy-900 mb-4">
              Answer a Few Easy Questions
            </h3>
            <p className="text-gray-700">
              Complete a quick eligibility form about your situation and needs
            </p>
          </div>

          <div className="bg-amber-50 rounded-xl p-8 text-center border border-amber-100">
            <div className="w-16 h-16 bg-amber-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
              2
            </div>
            <h3 className="text-xl font-bold text-navy-900 mb-4">
              Speak with a Case Manager
            </h3>
            <p className="text-gray-700">
              Get matched to programs you qualify for during your call
            </p>
          </div>

          <div className="bg-navy-50 rounded-xl p-8 text-center border border-navy-100">
            <div className="w-16 h-16 bg-navy-800 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
              3
            </div>
            <h3 className="text-xl font-bold text-navy-900 mb-4">
              Receive Personal Enrollment Help
            </h3>
            <p className="text-gray-700">
              Your specialist guides you through the enrollment process step by step
            </p>
          </div>
        </div>

        <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-8 text-center">
          <p className="text-2xl font-bold text-navy-900 mb-2">
            It is free to apply.
          </p>
          <p className="text-xl text-gray-700">
            There are no upfront costs and no hidden fees.
          </p>
        </div>
      </div>
    </section>
  );
};
