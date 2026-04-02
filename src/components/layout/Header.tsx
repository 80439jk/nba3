import { Link } from 'react-router-dom';

export const Header = () => {
  return (
    <header className="bg-navy-900 border-b border-navy-800 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-5">
        <Link to="/" className="text-xl font-bold text-white hover:text-amber-400 transition-colors">
          National Benefit Alliance
        </Link>
      </div>
    </header>
  );
};
