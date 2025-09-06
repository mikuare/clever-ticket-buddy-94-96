
import React from 'react';
import { cn } from '@/lib/utils';

interface AnimatedTextProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
  variant?: 'title' | 'subtitle' | 'body' | 'caption';
}

const AnimatedText = React.forwardRef<HTMLElement, AnimatedTextProps>(
  ({ className, children, as: Component = 'p', variant = 'body', ...props }, ref) => {
    const variantClasses = {
      title: 'font-bold tracking-tight',
      subtitle: 'text-muted-foreground',
      body: '',
      caption: 'text-sm text-muted-foreground'
    };

    return React.createElement(
      Component,
      {
        ref,
        className: cn(variantClasses[variant], className),
        ...props
      },
      children
    );
  }
);

AnimatedText.displayName = 'AnimatedText';

export { AnimatedText };
