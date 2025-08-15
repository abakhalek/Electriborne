import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95';
  
  const variantClasses = {
    primary: 'bg-primary-500 hover:bg-primary-600 text-white focus:ring-primary-500 shadow-lg hover:shadow-xl',
    secondary: 'bg-secondary-500 hover:bg-secondary-600 text-white focus:ring-secondary-500 shadow-lg hover:shadow-xl',
    success: 'bg-success-500 hover:bg-success-600 text-white focus:ring-success-500 shadow-lg hover:shadow-xl',
    warning: 'bg-warning-500 hover:bg-warning-600 text-white focus:ring-warning-500 shadow-lg hover:shadow-xl',
    error: 'bg-error-500 hover:bg-error-600 text-white focus:ring-error-500 shadow-lg hover:shadow-xl',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 focus:ring-gray-500 border border-gray-300 hover:border-gray-400',
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </button>
  );
};

export default Button;