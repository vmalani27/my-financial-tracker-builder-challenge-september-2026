import React from 'react';
import { Target } from 'lucide-react';

export function EmptyState({
  icon: Icon = Target,
  title = 'No items found',
  subtitle = 'Items you add will appear here.',
  actionText,
  onAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-10 px-4">
      <Icon className="size-8 text-gray-300 stroke-1 mb-2" />
      <div className="text-sm font-medium text-[#1A1A1A] mb-1">
        {title}
      </div>
      <div className="text-xs text-[#6B7280] max-w-[240px] mb-3">
        {subtitle}
      </div>
      {actionText && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="text-sm text-[#2563EB] font-medium transition-none hover:underline cursor-pointer"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
