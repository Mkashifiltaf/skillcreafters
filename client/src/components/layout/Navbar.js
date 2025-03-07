import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-black/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold gradient-text">SkillCrafters</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/courses"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/courses')
                  ? 'text-white bg-blue-600'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              Courses
            </Link>
            <Link
              to="/roadmap"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/roadmap')
                  ? 'text-white bg-blue-600'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              AI Roadmap
            </Link>
            <Link
              to="/practice"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/practice')
                  ? 'text-white bg-blue-600'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              Practice
            </Link>
            <Link
              to="/community"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/community')
                  ? 'text-white bg-blue-600'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              Community
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/signin"
              className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Sign Up
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              <i className={`fas fa-${isOpen ? 'times' : 'bars'}`}></i>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1">
          <Link
            to="/courses"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive('/courses')
                ? 'text-white bg-blue-600'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            Courses
          </Link>
          <Link
            to="/roadmap"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive('/roadmap')
                ? 'text-white bg-blue-600'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            AI Roadmap
          </Link>
          <Link
            to="/practice"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive('/practice')
                ? 'text-white bg-blue-600'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            Practice
          </Link>
          <Link
            to="/community"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive('/community')
                ? 'text-white bg-blue-600'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            Community
          </Link>
          <div className="pt-4 pb-3 border-t border-gray-700">
            <Link
              to="/signin"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
