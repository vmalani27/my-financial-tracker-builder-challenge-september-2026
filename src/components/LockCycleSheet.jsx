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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-xs animate-fadeIn">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-[390px] bg-white rounded-t-3xl p-6 z-10 transform transition-transform duration-200 ease-out translate-y-0 flex flex-col gap-4 max-h-[90vh] overflow-y-auto border-t border-slate-200 shadow-xl">
        <div className="w-8 h-1 bg-slate-200 rounded-full mx-auto -mt-2 mb-1" />

        {/* Modal Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-slate-100 border border-slate-200/60 text-slate-700 flex items-center justify-center shrink-0">
              <CalendarCheck className="size-4" />
            </div>
            <div>
              <div className="text-base font-semibold text-slate-900 tracking-tight">Settle & Lock Month</div>
              <div className="text-xs text-slate-400">{cycle?.cycleLabel}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-slate-400 font-medium hover:text-slate-700 cursor-pointer p-1 transition-colors"
          >
            Cancel
          </button>
        </div>

        {/* 1. Prompt & Pending Spends Checklist */}
        <div className="bg-slate-50/70 rounded-2xl p-4 border border-slate-200/80 flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Check for Unrecorded Expenses
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Life happens fast and you don't always log things instantly. Before wrapping up this cycle, take a quick second to make sure you didn't miss any major spends:
            </p>
          </div>

          <div className="flex flex-col gap-1 pt-0.5">
            {[
              { id: 'rent', label: 'Rent, maintenance, or flatmate shares' },
              { id: 'bills', label: 'Electricity, water, WiFi, or mobile bills' },
              { id: 'cards', label: 'Credit card payments or active subscriptions' },
              { id: 'large', label: 'Major shopping, dining out, or ATM cash withdrawals' },
            ].map((item) => {
              const isChecked = checkedItems[item.id];
              return (
                <div
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  className="flex items-center gap-2.5 cursor-pointer py-1.5 text-xs text-slate-800 select-none hover:text-slate-950 transition-colors"
                >
                  {isChecked ? (
                    <CheckSquare className="size-4 text-emerald-600 shrink-0" />
                  ) : (
                    <Square className="size-4 text-slate-300 shrink-0" />
                  )}
                  <span className={isChecked ? 'line-through text-slate-400' : ''}>
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
              className="mt-1 w-full py-2.5 px-3 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <Plus className="size-3.5 text-slate-500" />
              <span>Log a Missed Spend First</span>
            </button>
          )}
        </div>

        {/* 2. Month Financial Summary */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col gap-3">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Cycle Summary
          </div>

          <div className="grid grid-cols-2 divide-x divide-slate-100">
            <div className="flex flex-col pr-3">
              <span className="text-[11px] font-medium text-slate-400">Total Spent</span>
              <span className="text-base font-semibold text-slate-900 tracking-tight tabular-nums mt-0.5">
                ₹{needsSpent.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-slate-400 tabular-nums">
                of ₹{monthlyBudget.toLocaleString('en-IN')} budget
              </span>
            </div>

            <div className="flex flex-col items-end pl-3 text-right">
              <span className="text-[11px] font-medium text-slate-400">
                {isOverBudget ? 'Budget Overspend' : 'Remaining Allowance'}
              </span>
              <span className={`text-base font-semibold tracking-tight tabular-nums mt-0.5 ${isOverBudget ? 'text-red-600' : 'text-emerald-600'}`}>
                {isOverBudget
                  ? `-₹${Math.abs(budgetRemaining).toLocaleString('en-IN')}`
                  : `₹${budgetRemaining.toLocaleString('en-IN')}`}
              </span>
              <span className="text-[10px] text-slate-400">
                {isOverBudget ? 'Reduced corpus addition' : 'Banks toward corpus'}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Friendly Lockdown Explanation */}
        <div className="text-xs text-slate-500 leading-relaxed px-1">
          Locking this month wraps up your current cycle, banks your leftover allowance toward your corpus, and starts fresh for the next month.
        </div>

        {/* 4. Action Buttons */}
        <div className="flex flex-col gap-2 pt-1">
          <button
            type="button"
            onClick={handleLockdown}
            className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs"
          >
            <ShieldCheck className="size-4" />
            <span>Lock Month & Start Next Cycle</span>
          </button>
        </div>
      </div>
    </div>
  );
}
