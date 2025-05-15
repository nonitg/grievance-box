'use client';

import React, { useState, useEffect, useRef } from 'react';

interface Option {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
  error?: string;
  className?: string;
  label?: string;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Select an option...',
  id,
  error,
  className = '',
  label
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputId = id || 'searchable-select';

  const selectedOption = options.find(option => option.value === value);
  const displayValue = selectedOption ? selectedOption.label : '';

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelectOption = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="mb-4" ref={containerRef}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      
      <div className="relative">
        <div
          className={`flex items-center justify-between cursor-pointer w-full rounded-lg border-2 shadow-sm py-3 px-4 text-gray-900 bg-white ${
            error ? 'border-rose-500' : 'border-teal-200'
          } ${className}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="truncate text-gray-900">{displayValue || placeholder}</div>
          <div className="text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isOpen ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}></path>
            </svg>
          </div>
        </div>

        {isOpen && (
          <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
            <div className="p-2 border-b">
              <input
                id={inputId}
                type="text"
                className="w-full p-2 border border-gray-200 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-400"
                placeholder="Search..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                onClick={e => e.stopPropagation()}
              />
            </div>
            
            <div className="max-h-60 overflow-y-auto">
              {filteredOptions.length === 0 ? (
                <div className="p-3 text-gray-500 text-center">No options found</div>
              ) : (
                <ul className="text-gray-900">
                  {filteredOptions.map(option => (
                    <li
                      key={option.value}
                      onClick={() => handleSelectOption(option.value)}
                      className={`px-4 py-2 hover:bg-teal-50 cursor-pointer transition-colors text-gray-900 ${
                        option.value === value ? 'bg-teal-100 font-medium' : ''
                      }`}
                    >
                      {option.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600 font-medium flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
          {error}
        </p>
      )}
    </div>
  );
} 