import { Shield, CheckCircle, Clock, Users } from 'lucide-react';

export const TrustBadges = () => {
  return (
    <section className="py-12 bg-white border-y border-gray-200">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
          <div className="flex items-center gap-3 text-navy-800">
            <Shield className="w-7 h-7 text-amber-500" />
            <span className="font-semibold text-base">BBB Accredited</span>
          </div>
          <div className="flex items-center gap-3 text-navy-800">
            <CheckCircle className="w-7 h-7 text-amber-500" />
            <span className="font-semibold text-base">100% Free to Apply</span>
          </div>
          <div className="flex items-center gap-3 text-navy-800">
            <Clock className="w-7 h-7 text-amber-500" />
            <span className="font-semibold text-base">Quick 5-Minute Call</span>
          </div>
          <div className="flex items-center gap-3 text-navy-800">
            <Users className="w-7 h-7 text-amber-500" />
            <span className="font-semibold text-base">Trusted by Thousands</span>
          </div>
        </div>
      </div>
    </section>
  );
};
