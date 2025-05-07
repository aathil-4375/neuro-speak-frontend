// Enhanced SignUp.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';
import { useToast } from '../contexts/ToastContext';
import { Eye, EyeOff, ArrowLeft, UserPlus } from 'lucide-react';

const SignUp = () => {
  // State for form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [slmcID, setSlmcID] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Hooks for navigation and toast notifications
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  // Handle form submission
  const handleSignUp = async (e) => {
    e.preventDefault();

    // Form validation
    if (!firstName || !lastName || !slmcID || !password || !confirmPassword) {
      showError('Please fill in all required fields');
      return;
    }

    if (password !== confirmPassword) {
      showError('Passwords do not match!');
      return;
    }

    // Prepare user data for registration
    const userData = {
      username: slmcID,
      first_name: firstName,
      last_name: lastName,
      slmc_id: slmcID,
      password: password,
      password2: confirmPassword
    };

    console.log('Sending registration data:', userData);
    setIsLoading(true);

    try {
      const response = await authService.register(userData);
      console.log('Registration response:', response);
      showSuccess('Sign-up successful! Please log in.');
      setTimeout(() => {
        navigate('/');
      }, 1500); // Small delay to allow user to see the success message
    } catch (error) {
      console.error('Registration error:', error.response?.data || error);
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.username?.[0] || 
                          error.response?.data?.password?.[0] || 
                          'Registration failed. Please try again.';
      showError(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-custom-blue to-indigo-800">
      {/* Left Section - Branding and Info */}
      <div className="md:w-1/2 flex items-center justify-center p-8 md:p-16">
        <div className="max-w-lg">
          {/* Logo/Brand */}
          <div className="mb-8 flex items-center">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-custom-blue">
                <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
              </svg>
            </div>
            <span className="ml-4 text-3xl font-bold text-white">NeuroSpeak</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Join NeuroSpeak
          </h1>
          
          <p className="text-xl text-white/80 mb-12">
            Create an account to access our comprehensive platform for speech therapists, designed to help you provide better care and track patient progress effectively.
          </p>
          
          {/* Feature Highlights */}
          <div className="space-y-6">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white">
                  <path d="M16.5 7.5h-9v9h9v-9z" />
                  <path fillRule="evenodd" d="M8.25 2.25A.75.75 0 019 3v.75h2.25V3a.75.75 0 011.5 0v.75H15V3a.75.75 0 011.5 0v.75h.75a3 3 0 013 3v.75H21A.75.75 0 0121 9h-.75v2.25H21a.75.75 0 010 1.5h-.75V15H21a.75.75 0 010 1.5h-.75v.75a3 3 0 01-3 3h-.75V21a.75.75 0 01-1.5 0v-.75h-2.25V21a.75.75 0 01-1.5 0v-.75H9V21a.75.75 0 01-1.5 0v-.75h-.75a3 3 0 01-3-3v-.75H3A.75.75 0 013 15h.75v-2.25H3a.75.75 0 010-1.5h.75V9H3a.75.75 0 010-1.5h.75v-.75a3 3 0 013-3h.75V3a.75.75 0 01.75-.75zM6 6.75A.75.75 0 016.75 6h10.5a.75.75 0 01.75.75v10.5a.75.75 0 01-.75.75H6.75a.75.75 0 01-.75-.75V6.75z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-white">Scheduling</h3>
                <p className="text-white/70">Manage patient appointments and schedules effortlessly.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white">
                  <path d="M18.375 2.25c-1.035 0-1.875.84-1.875 1.875v15.75c0 1.035.84 1.875 1.875 1.875h.75c1.035 0 1.875-.84 1.875-1.875V4.125c0-1.036-.84-1.875-1.875-1.875h-.75zM9.75 8.625c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-.75a1.875 1.875 0 01-1.875-1.875V8.625zM3 13.125c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v6.75c0 1.035-.84 1.875-1.875 1.875h-.75A1.875 1.875 0 013 19.875v-6.75z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-white">Progress Tracking</h3>
                <p className="text-white/70">Track therapy progress with detailed reports and visualizations.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white">
                  <path fillRule="evenodd" d="M12 1.5a.75.75 0 01.75.75V4.5a.75.75 0 01-1.5 0V2.25A.75.75 0 0112 1.5zM5.636 4.136a.75.75 0 011.06 0l1.592 1.591a.75.75 0 01-1.061 1.06l-1.591-1.59a.75.75 0 010-1.061zm12.728 0a.75.75 0 010 1.06l-1.591 1.592a.75.75 0 01-1.06-1.061l1.59-1.591a.75.75 0 011.061 0zm-6.816 4.496a.75.75 0 01.82.311l5.228 7.917a.75.75 0 01-.777 1.148l-2.097-.43 1.045 3.9a.75.75 0 01-1.45.388l-1.044-3.899-1.601 1.42a.75.75 0 01-1.247-.606l.569-9.47a.75.75 0 01.554-.679zM3 10.5a.75.75 0 01.75-.75H6a.75.75 0 010 1.5H3.75A.75.75 0 013 10.5zm14.25 0a.75.75 0 01.75-.75h2.25a.75.75 0 010 1.5H18a.75.75 0 01-.75-.75zm-8.962 3.712a.75.75 0 010 1.061l-1.591 1.591a.75.75 0 11-1.061-1.06l1.591-1.592a.75.75 0 011.06 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-white">Treatment Tools</h3>
                <p className="text-white/70">Access specialized exercises and interactive modules for comprehensive therapy.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right Section - Registration Form */}
      <div className="md:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-10">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Your Account</h2>
            <p className="text-gray-600">Fill in your details to get started</p>
          </div>
          
          <form onSubmit={handleSignUp} className="space-y-6">
            {/* First Name Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                First Name
              </label>
              <div className="relative rounded-lg shadow-sm">
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="block w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-300 rounded-xl 
                            text-gray-900 focus:ring-2 focus:ring-custom-blue focus:border-custom-blue transition-all"
                  placeholder="Enter your first name"
                  required
                />
              </div>
            </div>
            
            {/* Last Name Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Last Name
              </label>
              <div className="relative rounded-lg shadow-sm">
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="block w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-300 rounded-xl 
                            text-gray-900 focus:ring-2 focus:ring-custom-blue focus:border-custom-blue transition-all"
                  placeholder="Enter your last name"
                  required
                />
              </div>
            </div>
            
            {/* SLMC ID Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Sri Lanka Medical Council ID
              </label>
              <div className="relative rounded-lg shadow-sm">
                <input
                  type="text"
                  value={slmcID}
                  onChange={(e) => setSlmcID(e.target.value)}
                  className="block w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-300 rounded-xl 
                            text-gray-900 focus:ring-2 focus:ring-custom-blue focus:border-custom-blue transition-all"
                  placeholder="Enter your SLMC ID"
                  required
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-gray-400">
                    <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative rounded-lg shadow-sm">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-300 rounded-xl 
                            text-gray-900 focus:ring-2 focus:ring-custom-blue focus:border-custom-blue transition-all"
                  placeholder="Create a strong password"
                  required
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
            
            {/* Confirm Password Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="relative rounded-lg shadow-sm">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-300 rounded-xl 
                            text-gray-900 focus:ring-2 focus:ring-custom-blue focus:border-custom-blue transition-all"
                  placeholder="Confirm your password"
                  required
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
            
            {/* Sign Up Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl 
                        shadow-sm text-base font-medium text-white bg-gradient-to-r from-custom-blue to-indigo-600 
                        hover:from-indigo-600 hover:to-custom-blue focus:outline-none focus:ring-2 
                        focus:ring-offset-2 focus:ring-custom-blue transition-all duration-300
                        ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <UserPlus className="w-5 h-5 mr-2" /> 
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
            
            {/* Back to Login */}
            <div className="mt-6">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="w-full flex justify-center items-center py-3 px-4 border border-custom-blue 
                         rounded-xl text-base font-medium text-custom-blue bg-white hover:bg-gray-50 
                         focus:outline-none focus:ring-2 focus:ring-offset-2 
                         focus:ring-custom-blue transition-all duration-300"
              >
                <ArrowLeft className="w-5 h-5 mr-2" /> Back to Login
              </button>
            </div>
          </form>
          
          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              By creating an account, you agree to our{' '}
              <button
                type="button"
                className="font-medium text-custom-blue hover:text-indigo-700 focus:outline-none"
              >
                Terms of Service
              </button>{' '}
              and{' '}
              <button
                type="button"
                className="font-medium text-custom-blue hover:text-indigo-700 focus:outline-none"
              >
                Privacy Policy
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;