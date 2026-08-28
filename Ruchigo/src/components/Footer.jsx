import { Link } from "react-router-dom";
import Logo from "./common/Logo";

export default function Footer() {
  return (
    <footer className="border-t border-orange-100 bg-white/90">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-8 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Logo showText={false} className="h-10 w-auto" />
          <div>
            <p className="font-semibold text-gray-900">RuchiGo</p>
            <p className="text-sm text-gray-500">Smart food delivery with premium experience.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          <Link to="/" className="transition hover:text-orange-500">Home</Link>
          <Link to="/search" className="transition hover:text-orange-500">Restaurants</Link>
          <Link to="/login" className="transition hover:text-orange-500">Login</Link>
          <Link to="/register" className="transition hover:text-orange-500">Register</Link>
        </div>
      </div>
    </footer>
  );
}
