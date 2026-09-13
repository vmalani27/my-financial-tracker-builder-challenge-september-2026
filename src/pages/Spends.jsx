import React from 'react';
import { Receipt, Plus, Trash2 } from 'lucide-react';
import { EmptyState } from '../components/EmptyState';

export function Spends({
  spends = [],
  needsSpent = 0,
  leisureSpent = 0,
  goalDeposits = 0,
  selfTotalSpent = 0,
  onOpenAddSpend,
  onDeleteSpend,
}) {
  const [filter, setFilter] = React.useState('all');
  const hasSpends = spends.length > 0;

  const totalExpenses = spends
    .filter((s) => s.type === 'need' || s.type === 'leisure' || s.type === 'expense')
    .reduce((sum, s) => sum + s.amount, 0);

  const totalTransfers = spends
    .filter((s) => s.type === 'transfer')
    .reduce((sum, s) => sum + s.amount, 0);

  const filteredSpends = spends.filter((s) => {
    if (filter === 'expenses') return s.type === 'need' || s.type === 'leisure' || s.type === 'expense';
    if (filter === 'transfers') return s.type === 'transfer';
    if (filter === 'goals') return s.type === 'goal';
    return true;
  });

  return (
    <div className="flex flex-col gap-4 pb-20">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-[#1A1A1A]">Activity & Ledger</h1>
        <button
          type="button"
          onClick={() => onOpenAddSpend()}
          className="text-sm font-medium text-[#2563EB] flex items-center gap-1 cursor-pointer"
        >
          <Plus className="size-4" />
          <span>Add</span>
        </button>
      </div>

      {/* Spend Distribution Summary Card */}
      <div className="bg-white rounded-xl p-4 border border-[#E5E5E5] flex flex-col gap-2.5">
        <div className="grid grid-cols-3 gap-2">
          <div>
            <div className="text-xs text-[#6B7280]">Total Spent</div>
            <div className="text-sm font-semibold text-[#1A1A1A]">
              ₹{totalExpenses.toLocaleString('en-IN')}
            </div>
          </div>
          <div>
            <div className="text-xs text-[#6B7280]">Goal Deposits</div>
            <div className="text-sm font-semibold text-[#16A34A]">
              ₹{goalDeposits.toLocaleString('en-IN')}
            </div>
          </div>
          <div>
            <div className="text-xs text-[#6B7280]">Transfers</div>
            <div className="text-sm font-semibold text-[#2563EB]">
              ₹{totalTransfers.toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'all', label: 'All' },
          { id: 'expenses', label: 'Expenses' },
          { id: 'goals', label: 'Goal Deposits' },
          { id: 'transfers', label: 'Transfers' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilter(tab.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-none cursor-pointer whitespace-nowrap ${
              filter === tab.id
                ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                : 'bg-white text-[#6B7280] border-[#E5E5E5] hover:border-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Spends List */}
      <div className="flex flex-col gap-2">
        <div className="text-xs font-medium text-[#6B7280] uppercase tracking-wide">
          Activity Log ({filteredSpends.length})
        </div>

        {filteredSpends.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="No activity found"
            subtitle="Record money you spend on needs, leisure, or deposits to targets."
            actionText="Log an entry"
            onAction={() => onOpenAddSpend()}
          />
        ) : (
          <div className="bg-white rounded-xl border border-[#E5E5E5] divide-y divide-[#E5E5E5]">
            {filteredSpends.map((spend) => {
              const isGoal = spend.type === 'goal';
              const isNeed = spend.type === 'need';
              const isTransfer = spend.type === 'transfer';
              const isParents = spend.paidBy === 'parents';

              return (
                <div
                  key={spend.id}
                  className="p-4 flex items-center justify-between group"
                >
                  <div>
                    <div className="text-sm text-[#1A1A1A] font-medium">
                      {spend.note || (isTransfer ? `${spend.fromAccountName} ➔ ${spend.toAccountName}` : spend.category)}
                    </div>
                    <div className="text-xs text-[#6B7280] mt-0.5">
                      <span
                        className={`inline-block mr-1 font-medium ${
                          isGoal
                            ? 'text-[#16A34A]'
                            : isTransfer
                            ? 'text-[#2563EB]'
                            : 'text-[#1A1A1A]'
                        }`}
                      >
                        {isGoal ? 'Goal Deposit' : isTransfer ? 'Transfer' : 'Expense'}
                      </span>
                      • {isTransfer ? `${spend.fromAccountName} ➔ ${spend.toAccountName}` : spend.category} •{' '}
                      {new Date(spend.date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div
                      className={`text-sm font-semibold ${
                        isGoal
                          ? 'text-[#16A34A]'
                          : isTransfer
                          ? 'text-[#2563EB]'
                          : 'text-[#1A1A1A]'
                      }`}
                    >
                      {isGoal ? '+' : isTransfer ? '⇄' : '-'}₹{spend.amount.toLocaleString('en-IN')}
                    </div>
                    <button
                      type="button"
                      onClick={() => onDeleteSpend(spend.id)}
                      className="text-gray-300 hover:text-[#DC2626] transition-none p-1 cursor-pointer"
                      title="Delete entry"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
