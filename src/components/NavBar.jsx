// frontend/src/components/NavBar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Home, 
  Users, 
  FileText, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Bell,
  User
} from 'lucide-react';

const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll event to add shadow on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Mock notifications - in a real app, these would come from an API
  useEffect(() => {
    setNotifications([
      { id: 1, text: "New patient record added", time: "5 min ago", read: false },
      { id: 2, text: "Upcoming appointment reminder", time: "1 hour ago", read: false },
      { id: 3, text: "Weekly progress report available", time: "Yesterday", read: true }
    ]);
  }, []);
  
  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  // Check if route is active for highlighting
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <nav className={`sticky top-0 z-50 bg-white border-b ${scrolled ? 'shadow-md' : ''} transition-shadow duration-300`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Desktop Navigation */}
          <div className="flex">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-custom-blue to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white">
                  <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                </svg>
              </div>
              <span className="ml-2 text-xl font-bold text-custom-blue">NeuroSpeak</span>
            </div>
            
            {/* Desktop Nav Links */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link 
                to="/home" 
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/home') && !isActive('/home/patient') 
                    ? 'border-custom-blue text-custom-blue' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Home className="w-4 h-4 mr-1" /> Dashboard
              </Link>
              
              <Link 
                to="/patients" 
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/home/patient') 
                    ? 'border-custom-blue text-custom-blue' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Users className="w-4 h-4 mr-1" /> Patients
              </Link>
              
              <Link 
                to="/reports" 
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/reports') 
                    ? 'border-custom-blue text-custom-blue' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FileText className="w-4 h-4 mr-1" /> Reports
              </Link>
              
              <Link 
                to="/settings" 
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/settings') 
                    ? 'border-custom-blue text-custom-blue' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Settings className="w-4 h-4 mr-1" /> Settings
              </Link>
            </div>
          </div>
          
          {/* Right Side Actions */}
          <div className="flex items-center">
            {/* Notifications */}
            <div className="relative ml-3">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-full text-gray-500 hover:text-custom-blue hover:bg-gray-100 focus:outline-none"
              >
                <span className="sr-only">View notifications</span>
                <div className="relative">
                  <Bell className="h-6 w-6" />
                  {notifications.some(n => !n.read) && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 border-2 border-white"></span>
                  )}
                </div>
              </button>
              
              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-2 px-3 border-b border-gray-100">
                    <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                      <div className="py-2">
                        {notifications.map((notification) => (
                          <div 
                            key={notification.id}
                            className={`px-4 py-3 hover:bg-gray-50 transition ${!notification.read ? 'bg-blue-50' : ''}`}
                          >
                            <p className="text-sm font-medium text-gray-900">{notification.text}</p>
                            <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="px-4 py-6 text-center text-gray-500">
                        <p>No new notifications</p>
                      </div>
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <div className="py-2 px-3 border-t border-gray-100 text-center">
                      <button className="text-xs font-medium text-custom-blue hover:text-indigo-700">
                        Mark all as read
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* User Profile */}
            <div className="hidden sm:ml-3 sm:flex sm:items-center">
              <div className="relative">
                <button
                  className="flex items-center space-x-3 bg-gray-50 hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-lg transition"
                >
                  <div className="w-8 h-8 bg-custom-blue rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">{user?.first_name || 'User'}</p>
                    <p className="text-xs text-gray-500">Speech Therapist</p>
                  </div>
                </button>

                {/* User dropdown menu would go here */}
              </div>
            </div>
            
            {/* Logout Button */}
            <div className="hidden sm:ml-4 sm:flex">
              <button 
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-custom-blue hover:bg-indigo-700 transition-all"
              >
                <LogOut className="w-4 h-4 mr-2" /> Logout
              </button>
            </div>
            
            {/* Mobile Menu Button */}
            <div className="flex items-center sm:hidden">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-custom-blue hover:bg-gray-100 focus:outline-none"
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
        <div className="sm:hidden bg-white border-t border-gray-100">
          <div className="pt-2 pb-3 space-y-1">
            <Link 
              to="/home" 
              className={`flex items-center px-4 py-3 text-base font-medium ${
                isActive('/home') && !isActive('/home/patient') 
                  ? 'text-custom-blue bg-indigo-50' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-custom-blue'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              <Home className="w-5 h-5 mr-3" /> Dashboard
            </Link>
            
            <Link 
              to="/patients" 
              className={`flex items-center px-4 py-3 text-base font-medium ${
                isActive('/home/patient') 
                  ? 'text-custom-blue bg-indigo-50' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-custom-blue'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              <Users className="w-5 h-5 mr-3" /> Patients
            </Link>
            
            <Link 
              to="/reports" 
              className={`flex items-center px-4 py-3 text-base font-medium ${
                isActive('/reports') 
                  ? 'text-custom-blue bg-indigo-50' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-custom-blue'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              <FileText className="w-5 h-5 mr-3" /> Reports
            </Link>
            
            <Link 
              to="/settings" 
              className={`flex items-center px-4 py-3 text-base font-medium ${
                isActive('/settings') 
                  ? 'text-custom-blue bg-indigo-50' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-custom-blue'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              <Settings className="w-5 h-5 mr-3" /> Settings
            </Link>
          </div>
          
          {/* Mobile User Profile & Logout */}
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-custom-blue rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800">{user?.first_name || 'User'}</div>
                <div className="text-sm font-medium text-gray-500">Speech Therapist</div>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <button 
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-3 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-custom-blue transition-all"
              >
                <LogOut className="w-5 h-5 mr-3" /> Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar;