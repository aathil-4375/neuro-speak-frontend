// frontend/src/components/SignUpFormField.jsx
import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const SignUpFormField = ({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  inputClassName = '',
  labelClassName = '',
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordField = type === "password";
  
  return (
    <div className="w-full">
      <label className={`block mb-2 ${labelClassName}`}>{label}</label>
      <div className="relative">
        <input
          type={isPasswordField ? (showPassword ? "text" : "password") : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`
            w-full px-4 py-2
            border border-white
            bg-transparent
            placeholder-white
            text-white
            focus:bg-white focus:text-black focus:placeholder-gray-500
            hover:bg-white hover:text-black hover:placeholder-gray-500
            transition duration-300 ease-in-out
            pr-12
            ${inputClassName}
          `}
        />
        {isPasswordField && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
    </div>
  );
};

export default SignUpFormField;