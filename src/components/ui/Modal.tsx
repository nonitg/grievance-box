'use client';

import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  
  // Close modal when clicking outside content
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };
  
  // Close modal when pressing Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scrolling while modal is open
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      // Re-enable scrolling when modal is closed
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);
  
  // Don't render anything if modal is closed
  if (!isOpen) return null;
  
  // Use portal to render modal outside of component hierarchy
  return createPortal(
    <div 
      ref={overlayRef}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden animate-fadeIn">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
          {title && (
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          )}
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 ml-auto"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto max-h-[calc(90vh-8rem)]">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

// Add the animation to tailwind.config.js
// extend: {
//   keyframes: {
//     fadeIn: {
//       '0%': { opacity: 0, transform: 'scale(0.95)' },
//       '100%': { opacity: 1, transform: 'scale(1)' }
//     }
//   },
//   animation: {
//     fadeIn: 'fadeIn 0.2s ease-out'
//   }
// }