// Fixed NavBar.jsx - removed unused scrolled variable
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Home, LogOut, Menu, X, User, ChevronDown } from 'lucide-react';

const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  // Check if route is active for highlighting
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  // Format user's name with Dr. title
  const getUserDisplayName = () => {
    if (!user) return 'Dr.';
    
    const firstName = user.first_name || '';
    const lastName = user.last_name || '';
    
    if (!firstName && !lastName) return 'Dr.';
    return `Dr. ${firstName} ${lastName}`;
  };

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-custom-blue to-indigo-600 transition-all duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-custom-blue">
                <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
              </svg>
            </div>
            <span className="ml-3 text-xl font-bold text-white">NeuroSpeak</span>
          </div>
          
          {/* Right Side Actions */}
          <div className="flex items-center">
            {/* User Profile Dropdown (Desktop) */}
            <div className="hidden sm:block relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`flex items-center space-x-3 ${
                  isDropdownOpen 
                    ? 'bg-indigo-700 bg-opacity-50' 
                    : 'hover:bg-indigo-700 hover:bg-opacity-30'
                } px-4 py-2 rounded-lg transition-all duration-300 focus:outline-none`}
              >
                <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-custom-blue" />
                </div>
                <div className="text-left pr-1">
                  <p className="text-sm font-semibold text-white flex items-center">
                    {getUserDisplayName()}
                    <ChevronDown className={`ml-2 w-4 h-4 transition-transform duration-300 text-white ${isDropdownOpen ? 'transform rotate-180' : ''}`} />
                  </p>
                  <p className="text-xs text-indigo-100">Speech Therapist</p>
                </div>
              </button>
              
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg py-2 z-10 transform origin-top-right transition-all duration-200 ease-out">
                  <div className="px-4 py-2 bg-indigo-50">
                    <p className="text-xs font-medium text-indigo-600">Signed in as</p>
                    <p className="text-sm font-semibold text-gray-800">{getUserDisplayName()}</p>
                  </div>
                  
                  <Link 
                    to="/home"
                    className={`flex items-center px-4 py-3 text-sm ${
                      isActive('/home') 
                        ? 'bg-indigo-100 text-custom-blue font-medium' 
                        : 'text-gray-700 hover:bg-indigo-50 hover:text-custom-blue'
                    } transition-colors duration-200`}
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <Home className="w-4 h-4 mr-3" />
                    Dashboard
                  </Link>
                  
                  <div className="my-1 bg-gray-100 h-px"></div>
                  
                  <button 
                    onClick={() => {
                      setIsDropdownOpen(false);
                      handleLogout();
                    }}
                    className="w-full text-left flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Logout
                  </button>
                </div>
              )}
            </div>
            
            {/* Mobile Menu Button */}
            <div className="flex items-center sm:hidden">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`inline-flex items-center justify-center p-2 rounded-lg ${
                  isMenuOpen 
                    ? 'bg-indigo-700 bg-opacity-50 text-white' 
                    : 'text-white hover:bg-indigo-700 hover:bg-opacity-30'
                } transition-colors duration-200 focus:outline-none`}
              >
                <span className="sr-only">Open main menu</span>
                {isMenuOpen ? (
                  <X className="block h-6 w-6" />
                ) : (
                  <Menu className="block h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="sm:hidden bg-indigo-800 animate-fadeIn">
          {/* Mobile User Profile */}
          <div className="pt-5 pb-4 px-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-custom-blue" />
                </div>
              </div>
              <div className="ml-4">
                <div className="text-base font-semibold text-white">{getUserDisplayName()}</div>
                <div className="text-sm font-medium text-indigo-200">Speech Therapist</div>
              </div>
            </div>
          </div>

          {/* Mobile Menu Links */}
          <div className="pt-2 pb-4 bg-indigo-700">
            <Link 
              to="/home" 
              className={`flex items-center mx-4 px-4 py-3 text-base font-medium rounded-lg ${
                isActive('/home') 
                  ? 'bg-indigo-600 text-white' 
                  : 'text-indigo-100 hover:bg-indigo-600 hover:text-white'
              } transition-colors duration-200`}
              onClick={() => setIsMenuOpen(false)}
            >
              <Home className="w-5 h-5 mr-3" /> Dashboard
            </Link>
            
            <button 
              onClick={handleLogout}
              className="flex items-center w-full mx-4 px-4 py-3 mt-2 text-base font-medium text-indigo-100 hover:bg-indigo-900 hover:text-white rounded-lg transition-colors duration-200"
            >
              <LogOut className="w-5 h-5 mr-3" /> Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

// Add this to your CSS or create a new class in your Tailwind config
const styleTag = document.createElement('style');
styleTag.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fadeIn {
    animation: fadeIn 0.2s ease-out forwards;
  }
`;
document.head.appendChild(styleTag);

export default NavBar;