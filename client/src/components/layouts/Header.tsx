import { useState } from "react";
import { Link, useLocation } from "wouter";
import { FaSearch, FaShoppingCart, FaBars } from "react-icons/fa";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const [cartCount, setCartCount] = useState(0);

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Products", path: "/products" },
  ];

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="bg-primary text-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold">
              CC Automotive
            </Link>
          </div>
          <nav className="hidden md:flex space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={
                  location === item.path
                    ? "text-secondary font-medium"
                    : "hover:text-secondary"
                }
              >
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="flex items-center space-x-4">
            <Link href="/search" className="hover:text-secondary">
              <FaSearch />
            </Link>
            <Link href="/cart" className="hover:text-secondary relative">
              <FaShoppingCart />
              <span className="absolute -top-2 -right-2 bg-secondary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cartCount}
              </span>
            </Link>
            <button
              onClick={toggleMobileMenu}
              className="md:hidden focus:outline-none"
              aria-label="Toggle mobile menu"
            >
              <FaBars />
            </button>
          </div>
        </div>
      </div>
      {/* Mobile menu */}
      <div className={`md:hidden ${mobileMenuOpen ? "block" : "hidden"} bg-primary-light`}>
        <div className="container mx-auto px-4 py-3 space-y-3">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={
                location === item.path
                  ? "block text-secondary font-medium"
                  : "block hover:text-secondary"
              }
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
};

export default Header;
