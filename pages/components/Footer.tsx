import React from "react";
import Link from "next/link";
import {
  Home,
  ShoppingBag,
  Disc,
  ShoppingCart,
  User,
  Facebook,
  Twitter,
  Instagram,
  Phone,
  Mail,
} from "lucide-react";
import { FaTiktok } from 'react-icons/fa';


const FooterLink: React.FC<{ href: string; children: React.ReactNode }> = ({
  href,
  children,
}) => (
  <li>
    <Link
      href={href}
      className="text-brown-800 hover:text-gray-500 transition-colors duration-100"
    >
      {children}
    </Link>
  </li>
);

const Footer: React.FC = () => {
  return (
    <footer className="text-brown-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo Section */}
          <div className="flex flex-col items-center md:items-start">
            <h2 className="text-3xl font-serif italic mb-4">Tempora</h2>
            <p className="text-md text-brown-800">The Seasons of Life.</p>
          </div>

          {/* About Us Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4 border-b border-brown-700 pb-2">
              Get to know us
            </h3>
            <p className="text-sm leading-relaxed text-brown-800">
              Tempora is your destination for timeless elegance. We curate
              exquisite products and create unforgettable memories, bringing
              beauty and sophistication to every aspect of your life. Our
              passion for excellence drives us to deliver unparalleled
              experiences that stand the test of time.
            </p>
          </div>

          {/* Quick Links Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4 border-b border-brown-700 pb-2">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <FooterLink href="/">
                <Home className="inline-block w-4 h-4 mr-2" />
                Home
              </FooterLink>
              <FooterLink href="/products">
                <ShoppingBag className="inline-block w-4 h-4 mr-2" />
                Products
              </FooterLink>
              <FooterLink href="/memories">
                <Disc className="inline-block w-4 h-4 mr-2" />
                Memories
              </FooterLink>
              <FooterLink href="/cart">
                <ShoppingCart className="inline-block w-4 h-4 mr-2" />
                Cart
              </FooterLink>
            </ul>
          </div>

          {/* Follow Us Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4 border-b border-brown-700 pb-2">
              Follow Us
            </h3>
            <div className="flex space-x-6">
              <Link
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brown-800 hover:text-gray-500"
              >
                <Facebook className="w-6 h-6" />
              </Link>
              <Link
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brown-800 hover:text-gray-500"
              >
                <Twitter className="w-6 h-6" />
              </Link>
              <Link
                href="https://www.instagram.com/tempora.life/profilecard/?igsh=N243azFseGpudGw5"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brown-800 hover:text-gray-500"
              >
                <Instagram className="w-6 h-6" />
              </Link>
              <Link
                href="https://www.tiktok.com/@yourprofile"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brown-800 hover:text-gray-500"
              >
                <FaTiktok className="w-6 h-6" />
              </Link>
            </div>

            {/* Contact Us Section */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4 border-b border-brown-700 pb-2">
                Contact Us
              </h3>
              <div className="flex flex-col space-y-4">
                {/* Phone Contact */}
                <div className="flex items-center">
                  <Phone className="w-6 h-6 text-brown-800 mr-2" />
                  <p className="text-brown-800">+1 234 567 8900</p>
                </div>
                {/* Email Contact */}
                <div className="flex items-center">
                  <Mail className="w-6 h-6 text-brown-800 mr-2" />
                  <p className="text-brown-800">info@tempora.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-brown-700 text-center text-sm text-brown-800">
          <p>&copy; {new Date().getFullYear()} Tempora. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
