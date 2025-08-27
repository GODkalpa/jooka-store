import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MoreHorizontal, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import ActionButton, { ActionButtonProps } from './ActionButton';

export interface ActionItem {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  variant?: ActionButtonProps['variant'];
  disabled?: boolean;
  loading?: boolean;
  href?: string;
  separator?: boolean;
}

export interface ActionButtonGroupProps {
  primaryActions?: ActionItem[];
  secondaryActions?: ActionItem[];
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  dropdownAlign?: 'left' | 'right';
  maxPrimaryActions?: number;
  mobileCollapse?: boolean; // Collapse to dropdown on mobile
}

export default function ActionButtonGroup({
  primaryActions = [],
  secondaryActions = [],
  className,
  size = 'md',
  dropdownAlign = 'right',
  maxPrimaryActions = 2,
  mobileCollapse = false
}: ActionButtonGroupProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, right: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Calculate dropdown position relative to the specific button
  const updateDropdownPosition = () => {
    if (!buttonRef.current) return;
    
    const rect = buttonRef.current.getBoundingClientRect();
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    
    // Dropdown dimensions - responsive sizing
    const isMobile = viewportWidth < 640;
    const dropdownWidth = isMobile ? Math.min(viewportWidth - 32, 240) : 192; // Responsive width with margins
    const itemHeight = isMobile ? 48 : 44; // Larger touch targets on mobile
    const estimatedDropdownHeight = Math.min(overflowActions.length * itemHeight + 16, isMobile ? 280 : 300);
    
    // Available space calculations
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;
    const spaceRight = viewportWidth - rect.right;
    const spaceLeft = rect.left;
    
    // Determine vertical position
    let top;
    
    if (isMobile) {
      // Mobile: prefer centering vertically with safe margins
      const availableHeight = viewportHeight - 32; // 16px margin on top and bottom
      const centeredTop = scrollY + (viewportHeight - estimatedDropdownHeight) / 2;
      
      if (spaceBelow < 120) {
        // Limited space below - position above button
        top = Math.max(scrollY + 16, rect.top + scrollY - estimatedDropdownHeight - 8);
      } else {
        // Enough space - position below button but ensure it fits
        top = Math.min(centeredTop, rect.bottom + scrollY + 8);
        if (top + estimatedDropdownHeight > scrollY + viewportHeight - 16) {
          top = scrollY + viewportHeight - estimatedDropdownHeight - 16;
        }
      }
    } else if (spaceBelow < estimatedDropdownHeight && spaceAbove > estimatedDropdownHeight) {
      // Desktop: Open upward if more space above
      top = rect.top + scrollY - estimatedDropdownHeight - 8;
    } else {
      // Desktop: Default open downward
      top = rect.bottom + scrollY + 8;
      if (top + estimatedDropdownHeight > scrollY + viewportHeight) {
        top = scrollY + viewportHeight - estimatedDropdownHeight - 8;
      }
    }
    
    // Determine horizontal position
    let left = 0;
    let right = 0;
    
    if (isMobile) {
      // Mobile: Center horizontally with margins
      const horizontalMargin = 16;
      const availableWidth = viewportWidth - (2 * horizontalMargin);
      const adjustedDropdownWidth = Math.min(dropdownWidth, availableWidth);
      
      left = scrollX + (viewportWidth - adjustedDropdownWidth) / 2;
      left = Math.max(scrollX + horizontalMargin, left);
      left = Math.min(scrollX + viewportWidth - adjustedDropdownWidth - horizontalMargin, left);
    } else if (dropdownAlign === 'right') {
      // Desktop: Align right edge of dropdown with right edge of button
      right = viewportWidth - (rect.right + scrollX);
      if (rect.right - dropdownWidth < 0) {
        right = viewportWidth - dropdownWidth - 8;
      }
    } else {
      // Desktop: Align left edge of dropdown with left edge of button  
      left = rect.left + scrollX;
      if (left + dropdownWidth > viewportWidth) {
        left = viewportWidth - dropdownWidth - 8;
      }
      left = Math.max(8, left);
    }

    setDropdownPosition({ top, left, right });
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isDropdownOpen]);

  // On mobile, show fewer primary actions if mobileCollapse is enabled
  const isMobileView = typeof window !== 'undefined' && window.innerWidth < 640;
  const mobileMaxPrimary = mobileCollapse ? 0 : maxPrimaryActions; // Hide all primary actions on mobile when mobileCollapse is true
  const visiblePrimaryActions = primaryActions.slice(0, mobileCollapse && isMobileView ? mobileMaxPrimary : maxPrimaryActions);
  const overflowActions = [
    ...(mobileCollapse ? primaryActions.slice(mobileMaxPrimary) : primaryActions.slice(maxPrimaryActions)),
    ...(secondaryActions.length > 0 && primaryActions.length > 0 ? [{ separator: true } as ActionItem] : []),
    ...secondaryActions
  ];

  const hasDropdown = overflowActions.length > 0;

  // Update position when dropdown opens and on scroll/resize
  useEffect(() => {
    if (isDropdownOpen) {
      // Initial position update
      updateDropdownPosition();
      
      const handlePositionUpdate = () => {
        requestAnimationFrame(updateDropdownPosition);
      };

      window.addEventListener('scroll', handlePositionUpdate, { passive: true, capture: true });
      window.addEventListener('resize', handlePositionUpdate, { passive: true });

      return () => {
        window.removeEventListener('scroll', handlePositionUpdate, { capture: true });
        window.removeEventListener('resize', handlePositionUpdate);
      };
    }
  }, [isDropdownOpen, dropdownAlign, overflowActions.length]);

  // Handle keyboard navigation
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!isDropdownOpen) return;

      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
        buttonRef.current?.focus();
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isDropdownOpen]);


  const renderActionButton = (action: ActionItem, index: number) => {
    if (action.href) {
      return (
        <a
          key={index}
          href={action.href}
          className={cn(
            "inline-flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gold/10 hover:text-gold transition-colors",
            action.disabled && "opacity-50 cursor-not-allowed"
          )}
          onClick={action.disabled ? (e) => e.preventDefault() : undefined}
        >
          {action.icon && <action.icon className="w-4 h-4" />}
          {action.label}
        </a>
      );
    }

    return (
      <ActionButton
        key={index}
        variant={action.variant || 'secondary'}
        size={size}
        icon={action.icon as any}
        onClick={action.onClick}
        disabled={action.disabled}
        loading={action.loading}
        tooltip={action.label}
      >
        {action.label}
      </ActionButton>
    );
  };

  const renderDropdownItem = (action: ActionItem, index: number) => {
    if (action.separator) {
      return <div key={index} className="h-px bg-gold/20 my-1" />;
    }

    if (action.href) {
      return renderDropdownLinkItem(action, index);
    }

    return (
      <button
        key={index}
        onClick={() => {
          if (!action.disabled) {
            action.onClick();
            setIsDropdownOpen(false);
          }
        }}
        disabled={action.disabled}
        className={cn(
          "flex items-center gap-3 w-full text-left px-4 py-3 sm:py-2.5 text-sm sm:text-base transition-colors rounded-sm touch-manipulation min-h-[48px] sm:min-h-[auto]",
          action.variant === 'danger' 
            ? "text-red-400 hover:bg-red-900/20 hover:text-red-300 active:bg-red-900/30" 
            : "text-gray-300 hover:bg-gold/10 hover:text-gold active:bg-gold/20",
          action.disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        {action.icon && <action.icon className="w-5 h-5 sm:w-4 sm:h-4 flex-shrink-0" />}
        <span className="truncate font-medium">{action.label}</span>
        {action.loading && (
          <div className="ml-auto flex-shrink-0">
            <div className="w-3 h-3 animate-spin rounded-full border border-current border-t-transparent" />
          </div>
        )}
      </button>
    );
  };

  const renderDropdownLinkItem = (action: ActionItem, index: number) => {
    return (
      <a
        key={index}
        href={action.href}
        className={cn(
          "flex items-center gap-3 px-4 py-3 sm:py-2.5 text-sm sm:text-base text-gray-300 hover:bg-gold/10 hover:text-gold active:bg-gold/20 transition-colors rounded-sm touch-manipulation min-h-[48px] sm:min-h-[auto]",
          action.disabled && "opacity-50 cursor-not-allowed"
        )}
        onClick={() => {
          if (!action.disabled) {
            setIsDropdownOpen(false);
          }
        }}
      >
        {action.icon && <action.icon className="w-5 h-5 sm:w-4 sm:h-4 flex-shrink-0" />}
        <span className="truncate font-medium">{action.label}</span>
      </a>
    );
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {/* Primary Actions */}
      {!mobileCollapse && visiblePrimaryActions.map(renderActionButton)}

      {/* Mobile-responsive primary actions */}
      {mobileCollapse && (
        <>
          {/* Mobile: hide primary actions to save space */}
          <div className="flex sm:hidden">
            {/* No primary actions shown on mobile for cleaner layout */}
          </div>

          {/* Desktop: show all visible primary actions */}
          <div className="hidden sm:flex items-center gap-1">
            {primaryActions.slice(0, maxPrimaryActions).map(renderActionButton)}
          </div>
        </>
      )}

      {/* Dropdown for overflow actions */}
      {hasDropdown && (
        <div className="relative">
          <ActionButton
            ref={buttonRef}
            variant="ghost"
            size={size}
            icon={MoreHorizontal}
            onClick={() => {
              const newState = !isDropdownOpen;
              setIsDropdownOpen(newState);
              
              if (newState && buttonRef.current) {
                // Force immediate position update when opening
                requestAnimationFrame(() => {
                  updateDropdownPosition();
                });
              }
            }}
            tooltip="More actions"
            aria-expanded={isDropdownOpen}
            aria-haspopup="menu"
          />

          {isDropdownOpen && typeof window !== 'undefined' && createPortal(
            <div
              ref={dropdownRef}
              className="fixed w-60 sm:w-48 bg-black border border-gold/20 rounded-lg shadow-xl z-[9999] max-h-72 overflow-y-auto backdrop-blur-sm"
              style={{
                position: 'fixed',
                top: `${dropdownPosition.top}px`,
                left: dropdownAlign === 'left' ? `${dropdownPosition.left}px` : 'auto',
                right: dropdownAlign === 'right' ? `${dropdownPosition.right}px` : 'auto',
                maxHeight: typeof window !== 'undefined' && window.innerWidth < 640 ? '280px' : '300px',
                minWidth: typeof window !== 'undefined' && window.innerWidth < 640 ? '240px' : '176px',
                transform: 'translateZ(0)', // Force hardware acceleration
                willChange: 'transform'
              }}
            >
              <div className="py-1">
                {overflowActions.map(renderDropdownItem)}
              </div>
            </div>,
            document.body
          )}
        </div>
      )}
    </div>
  );
}
