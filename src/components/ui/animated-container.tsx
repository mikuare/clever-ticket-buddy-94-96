
import React from 'react';
import { cn } from '@/lib/utils';

interface AnimatedContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'card' | 'page' | 'header' | 'content';
}

const AnimatedContainer = React.forwardRef<HTMLDivElement, AnimatedContainerProps>(
  ({ className, children, variant = 'content', ...props }, ref) => {
    const variantClasses = {
      card: '',
      page: '',
      header: 'backdrop-blur-sm bg-card/80 border-border/50',
      content: ''
    };

    return (
      <div
        ref={ref}
        className={cn(variantClasses[variant], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

AnimatedContainer.displayName = 'AnimatedContainer';

export { AnimatedContainer };
