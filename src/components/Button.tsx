import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'icon';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  active?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  active = false,
  className = '', 
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-white dark:ring-offset-gray-950";
  
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 focus:ring-indigo-500",
    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700 focus:ring-gray-500",
    ghost: "hover:bg-gray-100 text-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 focus:ring-gray-500",
    icon: "p-2 hover:bg-gray-100 text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 focus:ring-gray-500 rounded-full"
  };

  const sizes: Record<string, string> = {
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-4 py-2 text-sm",
    lg: "h-12 px-6 text-base",
    icon: ""
  };

  const activeStyles = active ? "bg-gray-200 dark:bg-gray-700 text-indigo-600 dark:text-indigo-400" : "";

  // Icon variant or size overrides normal sizing
  const finalSize = variant === 'icon' || size === 'icon' ? '' : sizes[size];

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${finalSize} ${activeStyles} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
};
