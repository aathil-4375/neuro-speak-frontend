// NeuroSpeak Login Page (Completely Redesigned)
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { Eye, EyeOff, LogIn as LoginIcon, UserPlus } from 'lucide-react'

const LogInPage = () => {
  // State for form fields
  const [slmcID, setSlmcID] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  
  // Hooks for navigation, authentication and toast
  const navigate = useNavigate()
  const { login } = useAuth()
  const { showSuccess, showError } = useToast()

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate form fields
    if (!slmcID || !password) {
      showError('Please fill in all fields')
      return
    }
    
    try {
      // Use your existing authentication method
      await login(slmcID, password)
      showSuccess('Login successful!')
      navigate('/home')
    } catch (err) {
      console.error('Login error details:', err.response?.data || err)
      showError(err.response?.data?.detail || 'Invalid credentials. Please try again.')
    }
  }

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
            Welcome to NeuroSpeak
          </h1>
          
          <p className="text-xl text-white/80 mb-12">
            Access powerful tools designed to help speech therapists provide better care and track patient progress effectively.
          </p>
          
          {/* Feature Highlights */}
          <div className="space-y-6">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white">
                  <path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM1.5 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM17.25 19.128l-.001.144a2.25 2.25 0 01-.233.96 10.088 10.088 0 005.06-1.01.75.75 0 00.42-.643 4.875 4.875 0 00-6.957-4.611 8.586 8.586 0 011.71 5.157v.003z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-white">Patient Management</h3>
                <p className="text-white/70">Easily organize patient records, appointments, and treatment plans in one place.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white">
                  <path fillRule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 00-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 00-2.282.819l-.922 1.597a1.875 1.875 0 00.432 2.385l.84.692c.095.078.17.229.154.43a7.598 7.598 0 000 1.139c.015.2-.059.352-.153.43l-.841.692a1.875 1.875 0 00-.432 2.385l.922 1.597a1.875 1.875 0 002.282.818l1.019-.382c.115-.043.283-.031.45.082.312.214.641.405.985.57.182.088.277.228.297.35l.178 1.071c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.114-.26.297-.349.344-.165.673-.356.985-.57.167-.114.335-.125.45-.082l1.02.382a1.875 1.875 0 002.28-.819l.923-1.597a1.875 1.875 0 00-.432-2.385l-.84-.692c-.095-.078-.17-.229-.154-.43a7.614 7.614 0 000-1.139c-.016-.2.059-.352.153-.43l.84-.692c.708-.582.891-1.59.433-2.385l-.922-1.597a1.875 1.875 0 00-2.282-.818l-1.02.382c-.114.043-.282.031-.449-.083a7.49 7.49 0 00-.985-.57c-.183-.087-.277-.227-.297-.348l-.179-1.072a1.875 1.875 0 00-1.85-1.567h-1.843zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-white">Advanced Settings</h3>
                <p className="text-white/70">Customize your workflow with powerful configuration options.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white">
                  <path fillRule="evenodd" d="M2.25 13.5a8.25 8.25 0 018.25-8.25.75.75 0 01.75.75v6.75H18a.75.75 0 01.75.75 8.25 8.25 0 01-16.5 0z" clipRule="evenodd" />
                  <path fillRule="evenodd" d="M12.75 3a.75.75 0 01.75-.75 8.25 8.25 0 018.25 8.25.75.75 0 01-.75.75h-7.5a.75.75 0 01-.75-.75V3z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-white">Analytics Dashboard</h3>
                <p className="text-white/70">Track therapy progress with insightful analytics and visualizations.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right Section - Login Form */}
      <div className="md:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-10">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to NeuroSpeak</h2>
            <p className="text-gray-600">Sign in to continue to your dashboard</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
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
                  placeholder="Enter your password"
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
            
            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-custom-blue focus:ring-custom-blue border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>
              
              <div className="text-sm">
                <button
                  type="button"
                  className="font-medium text-custom-blue hover:text-indigo-700"
                >
                  Forgot password?
                </button>
              </div>
            </div>
            
            {/* Login Button */}
            <button
              type="submit"
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl 
                      shadow-sm text-base font-medium text-white bg-gradient-to-r from-custom-blue to-indigo-600 
                      hover:from-indigo-600 hover:to-custom-blue focus:outline-none focus:ring-2 
                      focus:ring-offset-2 focus:ring-custom-blue transition-all duration-300"
            >
              <LoginIcon className="w-5 h-5 mr-2" /> Sign In
            </button>
            
            {/* Divider */}
            <div className="relative mt-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>
            
            {/* Create Account */}
            <div className="mt-6">
              <button
                type="button"
                onClick={() => navigate('/signup')}
                className="w-full flex justify-center items-center py-3 px-4 border border-custom-blue 
                         rounded-xl text-base font-medium text-custom-blue bg-white hover:bg-custom-blue 
                         hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 
                         focus:ring-custom-blue transition-all duration-300"
              >
                <UserPlus className="w-5 h-5 mr-2" /> Create Account
              </button>
            </div>
          </form>
          
          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              By signing in, you agree to our{' '}
              <button
                type="button"
                onClick={() => {/* Handle terms click */}}
                className="font-medium text-custom-blue hover:text-indigo-700 focus:outline-none"
              >
                Terms of Service
              </button>{' '}
              and{' '}
              <button
                type="button"
                onClick={() => {/* Handle privacy click */}}
                className="font-medium text-custom-blue hover:text-indigo-700 focus:outline-none"
              >
                Privacy Policy
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LogInPage