import React, { useState, useEffect } from 'react';
import { Phone } from 'lucide-react';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  className?: string;
  label?: string;
  name?: string;
  disabled?: boolean;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  placeholder = "+91-9876543210",
  required = false,
  error,
  className = "",
  label,
  name,
  disabled = false
}) => {
  const [displayValue, setDisplayValue] = useState(value);

  // Format the phone number for display
  const formatPhoneNumber = (phone: string): string => {
    // Remove all non-digits
    const digits = phone.replace(/\D/g, '');
    
    // If no digits, return empty
    if (digits.length === 0) return '';
    
    // If starts with 91, remove it (we'll add it back)
    let formattedDigits = digits;
    if (digits.startsWith('91') && digits.length > 10) {
      formattedDigits = digits.substring(2);
    }
    
    // Limit to 10 digits
    formattedDigits = formattedDigits.substring(0, 10);
    
    // Format as +91-XXXXXXXXXX
    if (formattedDigits.length > 0) {
      return `+91-${formattedDigits}`;
    }
    
    return '';
  };

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Remove all non-digits from input
    const digits = inputValue.replace(/\D/g, '');
    
    // Limit to 10 digits
    const limitedDigits = digits.substring(0, 10);
    
    // Format for display
    const formatted = formatPhoneNumber(limitedDigits);
    setDisplayValue(formatted);
    
    // Pass the raw digits (without formatting) to parent component
    onChange(limitedDigits);
  };

  // Handle key press to only allow numbers
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow: backspace, delete, tab, escape, enter, and navigation keys
    if ([8, 9, 27, 13, 46, 37, 38, 39, 40].includes(e.keyCode)) {
      return;
    }
    
    // Allow only numbers
    if (!/[0-9]/.test(e.key)) {
      e.preventDefault();
    }
  };

  // Handle paste to clean the input
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const digits = pastedText.replace(/\D/g, '').substring(0, 10);
    
    if (digits.length > 0) {
      const formatted = formatPhoneNumber(digits);
      setDisplayValue(formatted);
      onChange(digits);
    }
  };

  // Update display value when prop value changes
  useEffect(() => {
    if (value !== displayValue.replace(/\D/g, '')) {
      const formatted = formatPhoneNumber(value);
      setDisplayValue(formatted);
    }
  }, [value]);

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="tel"
          name={name}
          value={displayValue}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          onPaste={handlePaste}
          disabled={disabled}
          className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            error ? 'border-red-300' : 'border-gray-300'
          } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''} ${className}`}
          placeholder={placeholder}
          maxLength={15} // +91-XXXXXXXXXX = 15 characters
          autoComplete="tel"
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
      {!error && value.length > 0 && value.length < 10 && (
        <p className="mt-1 text-sm text-amber-600">
          Phone number must be exactly 10 digits
        </p>
      )}
      {!error && value.length === 10 && (
        <p className="mt-1 text-sm text-green-600">
          ✓ Valid phone number
        </p>
      )}
    </div>
  );
}; 