import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  return (
    <div
      className={`bg-white rounded-2xl shadow-lg border border-gray-100 ${
        onClick ? 'cursor-pointer hover:shadow-xl transition-shadow duration-200' : ''
      } ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};