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

  // Reliable dropdown positioning using viewport coordinates
  const updateDropdownPosition = () => {
    if (!buttonRef.current) return;
    
    const rect = buttonRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    
    const isMobile = viewportWidth < 640;
    const dropdownWidth = isMobile ? 200 : 180;
    const dropdownHeight = Math.min(overflowActions.length * 44 + 16, 300);
    
    // Use viewport coordinates directly (no scroll offset needed for fixed positioning)
    let top = rect.bottom + 4;
    let left = rect.right - dropdownWidth;
    
    // Ensure dropdown stays within viewport horizontally
    if (left < 8) {
      left = 8;
    }
    if (left + dropdownWidth > viewportWidth - 8) {
      left = viewportWidth - dropdownWidth - 8;
    }
    
    // Ensure dropdown stays within viewport vertically
    if (top + dropdownHeight > viewportHeight - 8) {
      top = rect.top - dropdownHeight - 4;
      if (top < 8) {
        top = 8;
      }
    }
    
    setDropdownPosition({ top, left, right: 0 });
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

  // Simplified mobile action handling
  const isMobileView = typeof window !== 'undefined' && window.innerWidth < 640;
  const visiblePrimaryActions = mobileCollapse && isMobileView ? [] : primaryActions.slice(0, maxPrimaryActions);
  const overflowActions = [
    ...(mobileCollapse && isMobileView ? primaryActions : primaryActions.slice(maxPrimaryActions)),
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
          "flex items-center gap-3 w-full text-left px-3 py-3 text-sm transition-colors rounded-sm min-h-[44px]",
          action.variant === 'danger' 
            ? "text-red-400 hover:bg-red-900/20 hover:text-red-300" 
            : "text-gray-300 hover:bg-gold/10 hover:text-gold",
          action.disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        {action.icon && <action.icon className="w-4 h-4 flex-shrink-0" />}
        <span className="truncate">{action.label}</span>
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
          "flex items-center gap-3 px-3 py-3 text-sm text-gray-300 hover:bg-gold/10 hover:text-gold transition-colors rounded-sm min-h-[44px]",
          action.disabled && "opacity-50 cursor-not-allowed"
        )}
        onClick={() => {
          if (!action.disabled) {
            setIsDropdownOpen(false);
          }
        }}
      >
        {action.icon && <action.icon className="w-4 h-4 flex-shrink-0" />}
        <span className="truncate">{action.label}</span>
      </a>
    );
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {/* Primary Actions */}
      {!mobileCollapse && visiblePrimaryActions.map(renderActionButton)}

      {/* Desktop primary actions when mobile collapse is enabled */}
      {mobileCollapse && (
        <div className="hidden sm:flex items-center gap-1">
          {primaryActions.slice(0, maxPrimaryActions).map(renderActionButton)}
        </div>
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
              className="fixed bg-black border border-gold/20 rounded-lg shadow-xl z-[10000] max-h-80 overflow-y-auto"
              style={{
                position: 'fixed',
                top: `${dropdownPosition.top}px`,
                left: `${dropdownPosition.left}px`,
                width: typeof window !== 'undefined' && window.innerWidth < 640 ? '200px' : '180px'
              }}
            >
              <div className="py-2">
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
