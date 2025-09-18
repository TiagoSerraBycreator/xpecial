'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface SelectContextType {
  value: string;
  onValueChange: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const SelectContext = React.createContext<SelectContextType | undefined>(undefined);

interface SelectProps {
  children: React.ReactNode;
  value?: string;
  onValueChange?: (value: string) => void;
  defaultValue?: string;
}

const Select = ({ children, value, onValueChange, defaultValue }: SelectProps) => {
  const [internalValue, setInternalValue] = useState(defaultValue || '');
  const [open, setOpen] = useState(false);
  
  const currentValue = value !== undefined ? value : internalValue;
  
  const handleValueChange = (newValue: string) => {
    if (value === undefined) {
      setInternalValue(newValue);
    }
    onValueChange?.(newValue);
    setOpen(false);
  };
  
  return (
    <SelectContext.Provider value={{ value: currentValue, onValueChange: handleValueChange, open, setOpen }}>
      <div className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  );
};

interface SelectTriggerProps {
  children: React.ReactNode;
  className?: string;
  placeholder?: string;
}

const SelectTrigger = ({ children, className = '', placeholder }: SelectTriggerProps) => {
  const context = React.useContext(SelectContext);
  if (!context) throw new Error('SelectTrigger must be used within Select');
  
  const { open, setOpen } = context;
  
  return (
    <button
      type="button"
      className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      onClick={() => setOpen(!open)}
    >
      <span className="block truncate">{children}</span>
      <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
    </button>
  );
};

interface SelectValueProps {
  placeholder?: string;
}

const SelectValue = ({ placeholder }: SelectValueProps) => {
  const context = React.useContext(SelectContext);
  if (!context) throw new Error('SelectValue must be used within Select');
  
  const { value } = context;
  
  return (
    <span className={value ? 'text-gray-900' : 'text-gray-400'}>
      {value || placeholder}
    </span>
  );
};

interface SelectContentProps {
  children: React.ReactNode;
  className?: string;
}

const SelectContent = ({ children, className = '' }: SelectContentProps) => {
  const context = React.useContext(SelectContext);
  if (!context) throw new Error('SelectContent must be used within Select');
  
  const { open, setOpen } = context;
  const contentRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open, setOpen]);
  
  if (!open) return null;
  
  return (
    <div
      ref={contentRef}
      className={`absolute top-full left-0 z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto ${className}`}
    >
      {children}
    </div>
  );
};

interface SelectItemProps {
  children: React.ReactNode;
  value: string;
  className?: string;
}

const SelectItem = ({ children, value, className = '' }: SelectItemProps) => {
  const context = React.useContext(SelectContext);
  if (!context) throw new Error('SelectItem must be used within Select');
  
  const { value: selectedValue, onValueChange } = context;
  const isSelected = selectedValue === value;
  
  return (
    <div
      className={`relative flex cursor-pointer select-none items-center py-2 pl-8 pr-2 text-sm hover:bg-gray-100 ${isSelected ? 'bg-blue-50 text-blue-600' : 'text-gray-900'} ${className}`}
      onClick={() => onValueChange(value)}
    >
      {isSelected && (
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          <Check className="h-4 w-4" />
        </span>
      )}
      {children}
    </div>
  );
};

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue };