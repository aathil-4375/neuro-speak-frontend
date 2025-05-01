// frontend/src/components/FormField.jsx
import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const FormField = ({ label, type = "text", value, onChange, placeholder }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordField = type === "password";
  
  return (
    <div className="relative mb-6">
      <label className="flex items-center mb-2 text-gray-1200 text-sm font-medium text-2xl">
        {label}
      </label>
      <div className="relative">
        <input 
          type={isPasswordField ? (showPassword ? "text" : "password") : type} 
          value={value}
          onChange={onChange}
          className="block w-full h-11 px-5 py-2.5 bg-gray-300 leading-7 text-base font-normal shadow-xs text-gray-900 bg-transparent 
                    border border-custom-blue rounded-full placeholder-gray-600 focus:outline-none pr-12"
          placeholder={placeholder} 
          required
        />
        {isPasswordField && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-900"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
    </div>
  );
};

export default FormField;