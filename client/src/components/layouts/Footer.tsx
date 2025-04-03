import { FaFacebookF, FaTwitter, FaInstagram, FaYoutube } from "react-icons/fa";
import { FaLocationDot, FaPhoneFlip, FaEnvelope, FaClock } from "react-icons/fa6";

const Footer = () => {
  return (
    <footer className="bg-primary text-white">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">CC Automotive</h3>
            <p className="mb-4">
              Quality automotive parts for all your vehicle needs. We provide genuine OEM and aftermarket parts.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-secondary" aria-label="Facebook">
                <FaFacebookF />
              </a>
              <a href="#" className="hover:text-secondary" aria-label="Twitter">
                <FaTwitter />
              </a>
              <a href="#" className="hover:text-secondary" aria-label="Instagram">
                <FaInstagram />
              </a>
              <a href="#" className="hover:text-secondary" aria-label="YouTube">
                <FaYoutube />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="/" className="hover:text-secondary">Home</a></li>
              <li><a href="/about" className="hover:text-secondary">About Us</a></li>
              <li><a href="/products" className="hover:text-secondary">Products</a></li>
              <li><a href="/contact" className="hover:text-secondary">Contact</a></li>
              <li><a href="/blog" className="hover:text-secondary">Blog</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Customer Service</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-secondary">My Account</a></li>
              <li><a href="#" className="hover:text-secondary">Order History</a></li>
              <li><a href="#" className="hover:text-secondary">Shipping Policy</a></li>
              <li><a href="#" className="hover:text-secondary">Returns & Refunds</a></li>
              <li><a href="#" className="hover:text-secondary">FAQ</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <FaLocationDot className="mt-1 mr-2" />
                <span>123 Auto Street, Car City, ST 12345</span>
              </li>
              <li className="flex items-center">
                <FaPhoneFlip className="mr-2" />
                <span>(123) 456-7890</span>
              </li>
              <li className="flex items-center">
                <FaEnvelope className="mr-2" />
                <span>info@ccautomotive.com</span>
              </li>
              <li className="flex items-center">
                <FaClock className="mr-2" />
                <span>Mon-Fri: 9AM-6PM</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-primary-light mt-10 pt-6 text-center">
          <p>&copy; {new Date().getFullYear()} CC Automotive. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
