import React from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';

// Form Group Component
interface FormGroupProps {
  children: React.ReactNode;
  className?: string;
}

const FormGroup = React.forwardRef<HTMLDivElement, FormGroupProps>(
  ({ children, className = '' }, ref) => {
    return (
      <div ref={ref} className={`space-y-2 ${className}`}>
        {children}
      </div>
    );
  }
);

FormGroup.displayName = 'FormGroup';

// Label Component
interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
  required?: boolean;
  className?: string;
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ children, required = false, className = '', ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={`block text-sm font-medium text-gray-700 ${className}`}
        {...props}
      >
        {children}
        {required && (
          <span className="text-red-500 ml-1" aria-label="campo obrigatório">
            *
          </span>
        )}
      </label>
    );
  }
);

Label.displayName = 'Label';

// Input Component
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  success?: boolean;
  helpText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className = '', 
    error, 
    success = false, 
    helpText, 
    leftIcon, 
    rightIcon, 
    id,
    'aria-describedby': ariaDescribedBy,
    ...props 
  }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = error ? `${inputId}-error` : undefined;
    const helpId = helpText ? `${inputId}-help` : undefined;
    
    const describedBy = [
      ariaDescribedBy,
      errorId,
      helpId
    ].filter(Boolean).join(' ') || undefined;
    
    const baseClasses = 'block w-full rounded-md border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
    
    const stateClasses = error 
      ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500'
      : success
      ? 'border-green-300 text-green-900 focus:border-green-500 focus:ring-green-500'
      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500';
    
    const paddingClasses = leftIcon && rightIcon 
      ? 'pl-10 pr-10 py-2'
      : leftIcon 
      ? 'pl-10 pr-3 py-2'
      : rightIcon 
      ? 'pl-3 pr-10 py-2'
      : 'px-3 py-2';
    
    const classes = `${baseClasses} ${stateClasses} ${paddingClasses} ${className}`;
    
    return (
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <div className={`h-5 w-5 ${error ? 'text-red-400' : success ? 'text-green-400' : 'text-gray-400'}`}>
              {leftIcon}
            </div>
          </div>
        )}
        
        <input
          ref={ref}
          id={inputId}
          className={classes}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={describedBy}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <div className={`h-5 w-5 ${error ? 'text-red-400' : success ? 'text-green-400' : 'text-gray-400'}`}>
              {rightIcon}
            </div>
          </div>
        )}
        
        {(error || success) && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            {error ? (
              <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
            ) : (
              <CheckCircle className="h-5 w-5 text-green-400" aria-hidden="true" />
            )}
          </div>
        )}
        
        {error && (
          <p id={errorId} className="mt-1 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        
        {helpText && !error && (
          <p id={helpId} className="mt-1 text-sm text-gray-500">
            {helpText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// Textarea Component
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  helpText?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ 
    className = '', 
    error, 
    helpText, 
    id,
    'aria-describedby': ariaDescribedBy,
    ...props 
  }, ref) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = error ? `${textareaId}-error` : undefined;
    const helpId = helpText ? `${textareaId}-help` : undefined;
    
    const describedBy = [
      ariaDescribedBy,
      errorId,
      helpId
    ].filter(Boolean).join(' ') || undefined;
    
    const baseClasses = 'block w-full rounded-md border px-3 py-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
    
    const stateClasses = error 
      ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500'
      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500';
    
    const classes = `${baseClasses} ${stateClasses} ${className}`;
    
    return (
      <div>
        <textarea
          ref={ref}
          id={textareaId}
          className={classes}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={describedBy}
          {...props}
        />
        
        {error && (
          <p id={errorId} className="mt-1 text-sm text-red-600 flex items-center" role="alert">
            <AlertCircle className="h-4 w-4 mr-1" aria-hidden="true" />
            {error}
          </p>
        )}
        
        {helpText && !error && (
          <p id={helpId} className="mt-1 text-sm text-gray-500">
            {helpText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

// Select Component
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  helpText?: string;
  placeholder?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ 
    className = '', 
    error, 
    helpText, 
    placeholder,
    children,
    id,
    'aria-describedby': ariaDescribedBy,
    ...props 
  }, ref) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = error ? `${selectId}-error` : undefined;
    const helpId = helpText ? `${selectId}-help` : undefined;
    
    const describedBy = [
      ariaDescribedBy,
      errorId,
      helpId
    ].filter(Boolean).join(' ') || undefined;
    
    const baseClasses = 'block w-full rounded-md border px-3 py-2 bg-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
    
    const stateClasses = error 
      ? 'border-red-300 text-red-900 focus:border-red-500 focus:ring-red-500'
      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500';
    
    const classes = `${baseClasses} ${stateClasses} ${className}`;
    
    return (
      <div>
        <select
          ref={ref}
          id={selectId}
          className={classes}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={describedBy}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {children}
        </select>
        
        {error && (
          <p id={errorId} className="mt-1 text-sm text-red-600 flex items-center" role="alert">
            <AlertCircle className="h-4 w-4 mr-1" aria-hidden="true" />
            {error}
          </p>
        )}
        
        {helpText && !error && (
          <p id={helpId} className="mt-1 text-sm text-gray-500">
            {helpText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export { FormGroup, Label, Input, Textarea, Select };