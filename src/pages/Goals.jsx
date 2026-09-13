import React, { useState } from 'react';
import { Target, Plus, Trash2 } from 'lucide-react';
import { GoalCard } from '../components/GoalCard';
import { EmptyState } from '../components/EmptyState';

export function Goals({
  goals = [],
  accounts = [],
  totalSplitPercentage = 100,
  unallocatedSplit = 0,
  splitStatus = 'balanced',
  onAddGoal,
  onDeleteGoal,
  onOpenDepositGoal,
  onOpenAddSpend,
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [accountId, setAccountId] = useState('');
  const [error, setError] = useState('');

  const defaultVault =
    accounts.find((a) => a.type === 'investment')?.id ||
    accounts[1]?.id ||
    accounts[0]?.id ||
    '';

  const handleCreate = (e) => {
    e.preventDefault();
    setError('');

    const res = onAddGoal({
      name,
      targetAmount,
      splitPercentage: 0,
      accountId: accountId || defaultVault,
    });

    if (res && !res.success) {
      setError(res.error || 'Failed to save target');
      return;
    }

    setName('');
    setTargetAmount('');
    setAccountId('');
    setIsAdding(false);
  };

  return (
    <div className="flex flex-col gap-4 pb-20">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-[#1A1A1A]">Goals</h1>
        <button
          type="button"
          onClick={() => setIsAdding(!isAdding)}
          className="text-sm font-medium text-[#2563EB] flex items-center gap-1 cursor-pointer"
        >
          {isAdding ? (
            'Cancel'
          ) : (
            <>
              <Plus className="size-4" />
              <span>Add</span>
            </>
          )}
        </button>
      </div>

      {/* Add Form (Inline Card) */}
      {isAdding && (
        <form
          onSubmit={handleCreate}
          className="bg-white rounded-xl p-4 border border-[#E5E5E5] flex flex-col gap-3"
        >
          <div className="text-xs font-medium text-[#6B7280] uppercase tracking-wide">
            New Target
          </div>

          <div>
            <div className="text-xs text-[#6B7280] mb-1">Name</div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Dream Car, MacBook, Emergency Fund"
              className="w-full text-sm text-[#1A1A1A] bg-white border border-[#E5E5E5] rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#2563EB]"
              autoFocus
            />
          </div>

          <div>
            <div className="text-xs text-[#6B7280] mb-1">Target Amount (₹)</div>
            <input
              type="number"
              inputMode="numeric"
              min="0"
              value={targetAmount}
              onWheel={(e) => e.target.blur()}
              onKeyDown={(e) => {
                if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '+') {
                  e.preventDefault();
                }
              }}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '' || (!val.includes('-') && Number(val) >= 0)) {
                  setTargetAmount(val);
                }
              }}
              placeholder="50000"
              className="w-full text-sm text-[#1A1A1A] bg-white border border-[#E5E5E5] rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#2563EB]"
            />
          </div>

          {/* Stored in Account / Corpus */}
          <div>
            <div className="text-xs font-medium text-[#6B7280] uppercase tracking-wide mb-1.5">
              Backed by Corpus Account
            </div>
            <select
              value={accountId || defaultVault}
              onChange={(e) => setAccountId(e.target.value)}
              className="w-full text-sm text-[#1A1A1A] bg-white border border-[#E5E5E5] rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#2563EB]"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.type})
                </option>
              ))}
            </select>
            <div className="text-[11px] text-[#6B7280] mt-1">
              At month end, settlement funds will be transferred to this account.
            </div>
          </div>

          {error && <div className="text-xs text-[#DC2626]">{error}</div>}

          <button
            type="submit"
            className="w-full h-12 bg-[#2563EB] text-white rounded-xl text-sm font-medium flex items-center justify-center cursor-pointer mt-1"
          >
            Save Target
          </button>
        </form>
      )}

      {/* Targets List */}
      <div className="flex flex-col gap-2">
        <div className="text-xs font-medium text-[#6B7280] uppercase tracking-wide">
          Active ({goals.length})
        </div>

        {goals.length === 0 ? (
          <EmptyState
            icon={Target}
            title="No targets set yet"
            subtitle="Create milestones for major purchases or emergency funds."
            actionText="Add your first target"
            onAction={() => setIsAdding(true)}
          />
        ) : (
          <div className="flex flex-col gap-3">
            {goals.map((goal) => (
              <div key={goal.id} className="relative group">
                <GoalCard
                  goal={goal}
                  accounts={accounts}
                  onSelectGoal={() => (onOpenDepositGoal ? onOpenDepositGoal(goal) : onOpenAddSpend(goal.id))}
                  onDeposit={() => (onOpenDepositGoal ? onOpenDepositGoal(goal) : onOpenAddSpend(goal.id))}
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`Delete "${goal.name}"?`)) {
                      onDeleteGoal(goal.id);
                    }
                  }}
                  className="absolute top-4 right-3 text-gray-300 hover:text-[#DC2626] transition-none p-1"
                  title="Delete"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
