import React from 'react';

export function GoalCard({ goal, onSelectGoal, onDeposit, accounts = [] }) {
  const saved = Number(goal.savedAmount) || 0;
  const target = Number(goal.targetAmount) || 0;
  const remaining = Math.max(0, target - saved);
  const percentage = target > 0 ? Math.min(100, Math.round((saved / target) * 100)) : 0;
  const matchedAccount = accounts.find((a) => a.id === goal.accountId);

  const handleDepositClick = (e) => {
    e.stopPropagation();
    if (onDeposit) {
      onDeposit(goal);
    } else if (onSelectGoal) {
      onSelectGoal(goal);
    }
  };

  return (
    <div
      onClick={() => onSelectGoal && onSelectGoal(goal)}
      className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col gap-3 cursor-pointer hover:border-slate-300 transition-all"
    >
      {/* 1. Header: Goal Title & Percentage Badge */}
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-slate-900 truncate pr-2">
          {goal.name}
        </div>
        <span className="text-xs font-medium text-[#2563EB] bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full shrink-0 tabular-nums">
          {percentage}%
        </span>
      </div>

      {/* 2. Sleek Progress Bar */}
      <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            percentage >= 100 ? 'bg-emerald-500' : 'bg-[#2563EB]'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* 3. Amounts: Saved / Target on left, Remaining on right */}
      <div className="flex items-baseline justify-between text-xs">
        <div className="flex items-baseline gap-1">
          <span className="font-semibold text-emerald-600 text-sm tabular-nums">
            ₹{saved.toLocaleString('en-IN')}
          </span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-400 tabular-nums">
            ₹{target.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="text-right">
          {remaining > 0 ? (
            <span className="text-slate-400">
              <strong className="font-medium text-slate-800 tabular-nums">₹{remaining.toLocaleString('en-IN')}</strong> left
            </span>
          ) : (
            <span className="font-medium text-emerald-600">
              Goal Reached! 🎉
            </span>
          )}
        </div>
      </div>

      {/* 4. Metadata: Account & Quick Deposit Action */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
        <span className="truncate max-w-[60%]">
          Account: <strong className="text-slate-700 font-medium">{matchedAccount?.name || 'Primary Account'}</strong>
        </span>
        <button
          type="button"
          onClick={handleDepositClick}
          className="text-xs font-medium text-[#2563EB] bg-blue-50/60 hover:bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors cursor-pointer shrink-0"
        >
          + Deposit
        </button>
      </div>
    </div>
  );
}

