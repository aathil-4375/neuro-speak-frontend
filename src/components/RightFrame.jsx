// frontend/src/components/RightFrame.jsx
import React, { useState } from 'react'
import FormField from './FormField.jsx'
import { useNavigate } from "react-router-dom"
import SquareButton from './SquareButton.jsx';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

const RightFrame = () => {
    const [slmcID, setSlmcID] = useState('')
    const [password, setPassword] = useState('')
    const navigate = useNavigate()
    const { login } = useAuth();
    const { showSuccess, showError } = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        console.log('Attempting login with:', { slmcID, password });
        
        try {
            await login(slmcID, password);
            console.log('Login successful, navigating to home');
            showSuccess('Login successful!');
            navigate('/home');
        } catch (err) {
            console.error('Login error details:', err.response?.data || err);
            showError(err.response?.data?.detail || 'Invalid credentials. Please try again.');
        }
    };

    return (
        <div className="flex items-center h-full w-full">
            <form className="flex-auto p-6" onSubmit={handleSubmit}>
                <FormField 
                    label="Sri Lanka Medical Council ID" 
                    value={slmcID} 
                    onChange={(e) => setSlmcID(e.target.value)} 
                    placeholder="Sri Lanka Medical Council ID"
                />
                <FormField 
                    label="Password" 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    placeholder="Password"
                />
                <div className="flex-1 border-b border-custom-blue mb-10 mt-10"></div>
                <SquareButton
                    text="Log In" 
                    type="submit"
                    className="relative mt-12 mb-6 w-full h-12 py-2.5 px-6 text-sm border border-custom-blue bg-custom-blue 
                                text-white rounded-lg cursor-pointer font-semibold text-center shadow-xs transition-all duration-500 
                                hover:bg-white hover:text-custom-blue"
                />
                <SquareButton
                    text="Sign Up" 
                    type="button"
                    onClick={() => navigate('/signup')} 
                    className="relative mb-6 w-full h-12 py-2.5 px-6 text-sm border border-custom-blue rounded-lg font-semibold 
                                text-custom-blue transition-all duration-500 hover:bg-custom-blue hover:shadow-xs hover:text-white"
                />
            </form>
        </div>
    )
}

export default RightFrame