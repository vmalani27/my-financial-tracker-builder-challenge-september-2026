import React, { useState } from 'react';
import { CalendarCheck, CheckSquare, Square, Plus, ShieldCheck } from 'lucide-react';

export function LockCycleSheet({
  isOpen,
  onClose,
  cycle,
  monthlySavingsPool = 0,
  totalIncome = 0,
  needsSpent = 0,
  monthlyBudget = 0,
  onOpenAddSpend,
  executeSettlement,
}) {
  // Checklist for user to check off pending bills and major spends
  const [checkedItems, setCheckedItems] = useState({
    rent: false,
    bills: false,
    cards: false,
    large: false,
  });

  if (!isOpen) return null;

  const toggleItem = (key) => {
    setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLockdown = () => {
    if (executeSettlement) {
      executeSettlement([]);
    }
    onClose();
  };

  const budgetRemaining = monthlyBudget - needsSpent;
  const isOverBudget = budgetRemaining < 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-[390px] bg-white rounded-t-2xl p-6 z-10 transform transition-transform duration-200 ease-out translate-y-0 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        <div className="w-8 h-1 bg-[#E5E5E5] rounded-full mx-auto -mt-2 mb-1" />

        {/* Modal Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <CalendarCheck className="size-4" />
            </div>
            <div>
              <div className="text-base font-bold text-[#1A1A1A]">Settle & Lock Month</div>
              <div className="text-xs text-[#6B7280]">Cycle: {cycle?.cycleLabel}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-[#6B7280] font-semibold hover:text-[#1A1A1A] cursor-pointer"
          >
            Cancel
          </button>
        </div>

        {/* 1. Prompt & Pending Spends Checklist */}
        <div className="bg-[#F9FAFB] rounded-2xl p-4 border border-[#E5E5E5] flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <div className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wide">
              Check for Unrecorded Expenses
            </div>
            <p className="text-xs text-[#6B7280] leading-relaxed">
              We don't expect you to log everything instantly. Before locking down this month, make sure you haven't missed any big transactions:
            </p>
          </div>

          <div className="flex flex-col gap-1.5 pt-0.5">
            {[
              { id: 'rent', label: 'Rent, maintenance, or flatmate dues' },
              { id: 'bills', label: 'Electricity, water, WiFi, or mobile recharge' },
              { id: 'cards', label: 'Credit card bills or recurring subscriptions' },
              { id: 'large', label: 'Big shopping, dining out, or ATM cash spends' },
            ].map((item) => {
              const isChecked = checkedItems[item.id];
              return (
                <div
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  className="flex items-center gap-2.5 cursor-pointer py-1 text-xs text-[#1A1A1A] select-none hover:text-[#2563EB]"
                >
                  {isChecked ? (
                    <CheckSquare className="size-4 text-[#16A34A] shrink-0" />
                  ) : (
                    <Square className="size-4 text-[#9CA3AF] shrink-0" />
                  )}
                  <span className={isChecked ? 'line-through text-[#9CA3AF]' : ''}>
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Direct shortcut to log a missed spend right away */}
          {onOpenAddSpend && (
            <button
              type="button"
              onClick={onOpenAddSpend}
              className="mt-1 w-full py-2 px-3 rounded-xl bg-white border border-gray-200/90 text-xs font-semibold text-[#2563EB] hover:bg-blue-50/50 flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <Plus className="size-3.5" />
              <span>Log a Missed Spend First</span>
            </button>
          )}
        </div>

        {/* 2. Month Financial Summary */}
        <div className="bg-white rounded-2xl p-4 border border-[#E5E5E5] flex flex-col gap-3">
          <div className="text-xs font-bold text-[#6B7280] uppercase tracking-wide">
            Month Ledger Summary
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col">
              <span className="text-[11px] text-[#6B7280]">Total Spent</span>
              <span className="text-base font-bold text-[#1A1A1A] mt-0.5">
                ₹{needsSpent.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-[#9CA3AF]">
                of ₹{monthlyBudget.toLocaleString('en-IN')} budget
              </span>
            </div>

            <div className="flex flex-col text-right">
              <span className="text-[11px] text-[#6B7280]">
                {isOverBudget ? 'Budget Overspend' : 'Remaining Allowance'}
              </span>
              <span className={`text-base font-bold mt-0.5 ${isOverBudget ? 'text-[#DC2626]' : 'text-[#16A34A]'}`}>
                {isOverBudget
                  ? `-₹${Math.abs(budgetRemaining).toLocaleString('en-IN')}`
                  : `₹${budgetRemaining.toLocaleString('en-IN')}`}
              </span>
              <span className="text-[10px] text-[#9CA3AF]">
                {isOverBudget ? 'Reduced corpus addition' : 'Saved towards corpus'}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Lockdown Explanation */}
        <div className="text-[11px] text-[#6B7280] leading-relaxed px-1">
          Locking the month archives this cycle's transaction ledger and starts your new financial month with fresh spending allowance.
        </div>

        {/* 4. Action Buttons */}
        <div className="flex flex-col gap-2 pt-1">
          <button
            type="button"
            onClick={handleLockdown}
            className="w-full h-12 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-xs"
          >
            <ShieldCheck className="size-4" />
            <span>Lockdown Month & Start Next Cycle</span>
          </button>
        </div>
      </div>
    </div>
  );
}
