import React, { forwardRef } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  children?: React.ReactNode;
  tooltip?: string;
}

const ActionButton = forwardRef<HTMLButtonElement, ActionButtonProps>(
  ({ 
    className, 
    variant = 'secondary', 
    size = 'md', 
    icon: Icon, 
    iconPosition = 'left',
    loading = false,
    children,
    tooltip,
    disabled,
    ...props 
  }, ref) => {
    const baseClasses = "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed";
    
    const variants = {
      primary: "bg-gold text-black hover:bg-gold/90 focus:ring-gold/50 shadow-sm",
      secondary: "bg-charcoal border border-gold/20 text-gray-300 hover:bg-gold/10 hover:text-gold hover:border-gold/40 focus:ring-gold/50",
      danger: "bg-red-900/20 border border-red-500/20 text-red-400 hover:bg-red-900/30 hover:border-red-500/40 focus:ring-red-500/50",
      ghost: "text-gray-400 hover:text-gold hover:bg-gold/10 focus:ring-gold/50"
    };

    const sizes = {
      sm: "h-8 px-3 text-xs rounded-md gap-1.5 min-w-[2rem] touch-manipulation",
      md: "h-10 px-4 text-sm rounded-lg gap-2 min-w-[2.5rem] touch-manipulation",
      lg: "h-12 px-6 text-base rounded-lg gap-2.5 min-w-[3rem] touch-manipulation"
    };

    const iconSizes = {
      sm: "w-3 h-3",
      md: "w-4 h-4", 
      lg: "w-5 h-5"
    };

    const isIconOnly = !children;
    const buttonClasses = cn(
      baseClasses,
      variants[variant],
      sizes[size],
      isIconOnly && "aspect-square p-0",
      // Mobile-specific improvements
      "active:scale-95 sm:active:scale-100",
      // Ensure minimum touch target size on mobile (44px)
      isIconOnly && size === 'sm' && "min-h-[44px] min-w-[44px] sm:min-h-[2rem] sm:min-w-[2rem]",
      className
    );

    const iconElement = Icon && (
      <Icon 
        className={cn(
          iconSizes[size],
          loading && "animate-spin",
          children && iconPosition === 'right' && "order-1"
        )} 
      />
    );

    return (
      <button
        ref={ref}
        className={buttonClasses}
        disabled={disabled || loading}
        title={tooltip}
        aria-label={tooltip || (typeof children === 'string' ? children : undefined)}
        {...props}
      >
        {iconElement}
        {children && (
          <span className={cn(loading && "opacity-0")}>
            {children}
          </span>
        )}
        {loading && !Icon && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={cn("animate-spin rounded-full border-2 border-current border-t-transparent", {
              "w-3 h-3": size === 'sm',
              "w-4 h-4": size === 'md',
              "w-5 h-5": size === 'lg'
            })} />
          </div>
        )}
      </button>
    );
  }
);

ActionButton.displayName = "ActionButton";

export default ActionButton;
