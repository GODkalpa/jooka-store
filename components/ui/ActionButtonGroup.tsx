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

  // Calculate dropdown position
  const updateDropdownPosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;

      setDropdownPosition({
        top: rect.bottom + scrollY + 4, // 4px gap (mt-1)
        left: dropdownAlign === 'left' ? rect.left + scrollX : 0,
        right: dropdownAlign === 'right' ? window.innerWidth - rect.right - scrollX : 0
      });
    }
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

  // Update position on scroll/resize
  useEffect(() => {
    if (isDropdownOpen) {
      const handlePositionUpdate = () => updateDropdownPosition();

      window.addEventListener('scroll', handlePositionUpdate, true);
      window.addEventListener('resize', handlePositionUpdate);

      return () => {
        window.removeEventListener('scroll', handlePositionUpdate, true);
        window.removeEventListener('resize', handlePositionUpdate);
      };
    }
  }, [isDropdownOpen, dropdownAlign]);

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

  // On mobile, show fewer primary actions if mobileCollapse is enabled
  const mobileMaxPrimary = mobileCollapse ? Math.min(1, maxPrimaryActions) : maxPrimaryActions;
  const visiblePrimaryActions = primaryActions.slice(0, mobileCollapse ? mobileMaxPrimary : maxPrimaryActions);
  const overflowActions = [
    ...(mobileCollapse ? primaryActions.slice(mobileMaxPrimary) : primaryActions.slice(maxPrimaryActions)),
    ...(secondaryActions.length > 0 && primaryActions.length > 0 ? [{ separator: true } as ActionItem] : []),
    ...secondaryActions
  ];

  const hasDropdown = overflowActions.length > 0;

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
      return (
        <a
          key={index}
          href={action.href}
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gold/10 hover:text-gold transition-colors",
            action.disabled && "opacity-50 cursor-not-allowed"
          )}
          onClick={() => {
            if (!action.disabled) {
              setIsDropdownOpen(false);
            }
          }}
        >
          {action.icon && <action.icon className="w-4 h-4" />}
          {action.label}
        </a>
      );
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
          "flex items-center gap-2 w-full text-left px-4 py-2 text-sm transition-colors",
          action.variant === 'danger' 
            ? "text-red-400 hover:bg-red-900/10" 
            : "text-gray-300 hover:bg-gold/10 hover:text-gold",
          action.disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        {action.icon && <action.icon className="w-4 h-4" />}
        {action.label}
        {action.loading && (
          <div className="ml-auto">
            <div className="w-3 h-3 animate-spin rounded-full border border-current border-t-transparent" />
          </div>
        )}
      </button>
    );
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {/* Primary Actions */}
      {!mobileCollapse && visiblePrimaryActions.map(renderActionButton)}

      {/* Mobile-responsive primary actions */}
      {mobileCollapse && (
        <>
          {/* Mobile: show only first action */}
          <div className="flex sm:hidden">
            {visiblePrimaryActions.length > 0 && renderActionButton(visiblePrimaryActions[0], 0)}
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
              if (!isDropdownOpen) {
                updateDropdownPosition();
              }
              setIsDropdownOpen(!isDropdownOpen);
            }}
            tooltip="More actions"
            aria-expanded={isDropdownOpen}
            aria-haspopup="menu"
          />

          {isDropdownOpen && typeof window !== 'undefined' && createPortal(
            <div
              ref={dropdownRef}
              className="fixed w-48 bg-black border border-gold/20 rounded-lg shadow-lg z-[9999]"
              style={{
                top: dropdownPosition.top,
                left: dropdownAlign === 'left' ? dropdownPosition.left : 'auto',
                right: dropdownAlign === 'right' ? dropdownPosition.right : 'auto'
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
