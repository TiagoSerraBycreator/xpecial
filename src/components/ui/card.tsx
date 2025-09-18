import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  clickable?: boolean;
  onClick?: () => void;
  role?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ 
    children, 
    className = '', 
    padding = 'md', 
    shadow = 'md', 
    hover = false, 
    clickable = false, 
    onClick,
    role,
    ...ariaProps
  }, ref) => {
    const baseClasses = 'bg-white rounded-lg border border-gray-200 transition-all duration-200';
    
    const paddingClasses = {
      none: '',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6'
    };
    
    const shadowClasses = {
      none: '',
      sm: 'shadow-sm',
      md: 'shadow-md',
      lg: 'shadow-lg'
    };
    
    const interactiveClasses = clickable || onClick ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2' : '';
    const hoverClasses = hover || clickable || onClick ? 'hover:shadow-lg hover:border-gray-300' : '';
    
    const classes = `${baseClasses} ${paddingClasses[padding]} ${shadowClasses[shadow]} ${interactiveClasses} ${hoverClasses} ${className}`;
    
    const handleClick = () => {
      if (onClick) {
        onClick();
      }
    };
    
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if ((e.key === 'Enter' || e.key === ' ') && onClick) {
        e.preventDefault();
        onClick();
      }
    };
    
    return (
      <div
        ref={ref}
        className={classes}
        onClick={clickable || onClick ? handleClick : undefined}
        onKeyDown={clickable || onClick ? handleKeyDown : undefined}
        tabIndex={clickable || onClick ? 0 : undefined}
        role={role || (clickable || onClick ? 'button' : undefined)}
        {...ariaProps}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// Card Header Component
interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ children, className = '' }, ref) => {
    return (
      <div ref={ref} className={`border-b border-gray-200 pb-3 mb-4 ${className}`}>
        {children}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

// Card Title Component
interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  id?: string;
}

const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ children, className = '', as: Component = 'h3', id }, ref) => {
    const classes = `text-lg font-semibold text-gray-900 ${className}`;
    
    return (
      <Component ref={ref} className={classes} id={id}>
        {children}
      </Component>
    );
  }
);

CardTitle.displayName = 'CardTitle';

// Card Content Component
interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ children, className = '' }, ref) => {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }
);

CardContent.displayName = 'CardContent';

// Card Footer Component
interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ children, className = '' }, ref) => {
    return (
      <div ref={ref} className={`border-t border-gray-200 pt-3 mt-4 ${className}`}>
        {children}
      </div>
    );
  }
);

CardFooter.displayName = 'CardFooter';

interface CardDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ children, className = '' }, ref) => {
    return (
      <p ref={ref} className={`text-sm text-gray-600 ${className}`}>
        {children}
      </p>
    );
  }
);

CardDescription.displayName = 'CardDescription';

export { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription };