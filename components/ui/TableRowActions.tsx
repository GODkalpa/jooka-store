import React from 'react';
import { Edit, Eye, Trash2, Star, Package, MoreHorizontal } from 'lucide-react';
import ActionButtonGroup, { ActionItem } from './ActionButtonGroup';

export interface TableRowActionsProps {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onToggleFeatured?: () => void;
  onToggleStatus?: () => void;
  customActions?: ActionItem[];
  viewHref?: string;
  editHref?: string;
  isFeatured?: boolean;
  isActive?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabelsOnMobile?: boolean;
  className?: string;
}

export default function TableRowActions({
  onView,
  onEdit,
  onDelete,
  onToggleFeatured,
  onToggleStatus,
  customActions = [],
  viewHref,
  editHref,
  isFeatured,
  isActive,
  size = 'sm',
  showLabelsOnMobile = false,
  className
}: TableRowActionsProps) {
  const primaryActions: ActionItem[] = [];
  const secondaryActions: ActionItem[] = [];

  // View action
  if (onView || viewHref) {
    primaryActions.push({
      label: 'View',
      icon: Eye,
      onClick: onView || (() => {}),
      href: viewHref,
      variant: 'ghost'
    });
  }

  // Edit action
  if (onEdit || editHref) {
    primaryActions.push({
      label: 'Edit',
      icon: Edit,
      onClick: onEdit || (() => {}),
      href: editHref,
      variant: 'secondary'
    });
  }

  // Delete action - make it a primary action for visibility
  if (onDelete) {
    primaryActions.push({
      label: 'Delete',
      icon: Trash2,
      onClick: onDelete,
      variant: 'danger'
    });
  }

  // Custom actions
  customActions.forEach(action => {
    if (action.variant === 'primary' || primaryActions.length < 3) {
      primaryActions.push(action);
    } else {
      secondaryActions.push(action);
    }
  });

  // Featured toggle
  if (onToggleFeatured !== undefined) {
    secondaryActions.push({
      label: isFeatured ? 'Remove Featured' : 'Make Featured',
      icon: Star,
      onClick: onToggleFeatured,
      variant: 'secondary'
    });
  }

  // Status toggle
  if (onToggleStatus !== undefined) {
    secondaryActions.push({
      label: isActive ? 'Deactivate' : 'Activate',
      icon: Package,
      onClick: onToggleStatus,
      variant: 'secondary'
    });
  }

  return (
    <ActionButtonGroup
      primaryActions={primaryActions}
      secondaryActions={secondaryActions}
      size={size}
      maxPrimaryActions={3}
      dropdownAlign="right"
      mobileCollapse={true}
      className={className}
    />
  );
}
