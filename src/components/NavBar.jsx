// frontend/src/components/NavBar.jsx
import React from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const NavBar = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <nav className="bg-custom-blue p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="hidden md:flex space-x-4 ml-auto">
          <Link to="/home" className="text-gray-300 hover:text-white">
            Home
          </Link>
          <Link to="/services" className="text-gray-300 hover:text-white">
            About
          </Link>
          <button 
            onClick={handleLogout}
            className="bg-white text-custom-blue rounded-lg px-4 py-1 hover:bg-gray-300"
          >
            Log Out
          </button>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;