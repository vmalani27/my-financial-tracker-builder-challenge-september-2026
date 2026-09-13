import React from 'react';

export function ProgressSummary({ totalSaved, goalsCount }) {
  if (totalSaved <= 0 && goalsCount === 0) return null;

  return (
    <div className="mb-4">
      <div className="text-xs font-medium text-[#6B7280] uppercase tracking-wide mb-1">
        Total Saved
      </div>
      <div className="text-2xl font-bold text-[#1A1A1A]">
        ₹{totalSaved.toLocaleString('en-IN')}
      </div>
      <div className="text-xs text-[#6B7280] mt-0.5">
        across {goalsCount} {goalsCount === 1 ? 'goal' : 'goals'}
      </div>
    </div>
  );
}
