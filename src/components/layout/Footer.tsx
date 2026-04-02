import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-navy-950 text-gray-300 py-12 px-4 border-t border-navy-900">
      <div className="max-w-6xl mx-auto text-center">
        <p className="font-bold text-white text-lg mb-2">National Benefit Alliance</p>
        <p className="text-sm text-gray-400 mb-6">© 2026 National Benefit Alliance. All rights reserved.</p>
        <div className="text-sm text-gray-400 mb-8">
          <Link to="/terms" className="hover:text-amber-400 transition-colors">Terms & Conditions</Link>
          <span className="mx-3">|</span>
          <Link to="/privacy" className="hover:text-amber-400 transition-colors">Privacy Policy</Link>
          <span className="mx-3">|</span>
          <Link to="/california-privacy" className="hover:text-amber-400 transition-colors">California Privacy Act</Link>
        </div>
        <div className="max-w-4xl mx-auto">
          <p className="text-xs text-gray-500 leading-relaxed">
            National Benefit Alliance is a privately held for-profit entity and has no affiliation or relationship, financial or otherwise, with any political party, government agency, or other outside group or persons. We do not submit any forms or documents on our members' behalf. All communication with any government, state, or private party will be done directly with them and all documentation submitted directly to them. Furthermore, National Benefit Alliance is not affiliated with or endorsed by the U.S. Department of Education. We urge you not to pay any third party offer for assistance that you can get for free elsewhere.
          </p>
        </div>
      </div>
    </footer>
  );
};
