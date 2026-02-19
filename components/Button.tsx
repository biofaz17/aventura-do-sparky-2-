import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  ...props 
}) => {
  const baseStyles = "font-heading font-bold rounded-2xl shadow-[0_6px_0_rgba(0,0,0,0.15)] active:shadow-none active:translate-y-[6px] transition-all flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-blue-500 text-white hover:bg-blue-400 border-b-4 border-blue-700",
    secondary: "bg-purple-500 text-white hover:bg-purple-400 border-b-4 border-purple-700",
    danger: "bg-red-500 text-white hover:bg-red-400 border-b-4 border-red-700",
    success: "bg-green-500 text-white hover:bg-green-400 border-b-4 border-green-700",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-lg",
    lg: "px-8 py-4 text-2xl w-full sm:w-auto",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};