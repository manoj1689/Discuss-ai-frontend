import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export const Logo: React.FC<LogoProps> = ({ className = "", size = 32 }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path 
        d="M16 2C8.26801 2 2 7.8203 2 15C2 22.1797 8.26801 28 16 28C18.6661 28 21.1276 27.2417 23.2354 25.9229L28.1641 27.6836C28.9189 27.9531 29.6836 27.1884 29.4141 26.4336L27.6534 21.5049C28.9722 19.3971 29.7305 16.9356 29.7305 14.2695C29.7305 13.5147 29.584 12.7842 29.3145 12.0938" 
        stroke="currentColor" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M10 13L16 19L22 13" 
        stroke="currentColor" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className="text-indigo-500"
      />
      <circle cx="24" cy="8" r="4" fill="#6366f1" />
    </svg>
  );
};
