// frontend/src/components/SignUpForm.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SignUpFormField from './SignUpFormField';
import SquareButton from './SquareButton';
import { authService } from '../services/auth';
import { useToast } from '../contexts/ToastContext';

const SignUpForm = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [slmcID, setSlmcID] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (!firstName || !lastName || !slmcID || !password || !confirmPassword) {
      showError('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      showError('Passwords do not match!');
      return;
    }

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
      }, 1000); // Small delay to allow user to see the success message
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
    <div
      className="w-full flex justify-center items-center min-h-screen bg-cover bg-center px-4"
      style={{ backgroundImage: 'url(/path-to-your-background.jpg)' }}
    >
      <form
        className="w-full max-w-xl bg-black/30 backdrop-blur-sm rounded-xl px-10 py-12 space-y-6"
        onSubmit={handleSignUp}
      >
        <h2 className="text-3xl font-bold text-white text-center mb-4">Create Your Account</h2>

        <SignUpFormField
          label="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="First Name"
          inputClassName="rounded-full text-base py-3"
          labelClassName="text-white text-sm"
        />

        <SignUpFormField
          label="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder="Last Name"
          inputClassName="rounded-full text-base py-3"
          labelClassName="text-white text-sm"
        />

        <SignUpFormField
          label="Sri Lanka Medical Council ID"
          value={slmcID}
          onChange={(e) => setSlmcID(e.target.value)}
          placeholder="SLMC ID"
          inputClassName="rounded-full text-base py-3"
          labelClassName="text-white text-sm"
        />

        <SignUpFormField
          label="New Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          inputClassName="rounded-full text-base py-3"
          labelClassName="text-white text-sm"
        />

        <SignUpFormField
          label="Re-Enter Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm Password"
          inputClassName="rounded-full text-base py-3"
          labelClassName="text-white text-sm"
        />

        <div className="flex justify-end pt-2">
          <SquareButton
            text={isLoading ? "Signing Up..." : "Sign Up"}
            type="submit"
            disabled={isLoading}
            className={`px-10 py-4 text-base rounded-md bg-white text-black font-semibold transition
              ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'}`}
          />
        </div>
      </form>
    </div>
  );
};

export default SignUpForm;