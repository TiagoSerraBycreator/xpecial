import React from 'react';

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
  required?: boolean;
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className = '', children, required = false, ...props }, ref) => {
    const baseClasses = 'block text-sm font-medium text-gray-700';
    const classes = `${baseClasses} ${className}`;
    
    return (
      <label ref={ref} className={classes} {...props}>
        {children}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
    );
  }
);

Label.displayName = 'Label';

export { Label };
export default Label;