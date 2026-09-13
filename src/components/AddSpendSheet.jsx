import React, { useState, useEffect } from 'react';
import { ArrowUpRight } from 'lucide-react';

export function AddSpendSheet({
  isOpen,
  onClose,
  monthlySavingsPool = 0,
  needsSpent = 0,
  needsBudget = 0,
  budgetRemaining = 0,
  onAddSpend,
}) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Groceries');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const categories = [
    'Groceries',
    'Food & Dining',
    'Rent & Utilities',
    'Commute & Fuel',
    'Shopping',
    'Entertainment',
    'Health & Medical',
    'Personal Care',
    'Other',
  ];

  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setCategory('Groceries');
      setNote('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const numAmount = Number(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (numAmount > monthlySavingsPool) {
      setError(`Cannot spend more than available cash (₹${monthlySavingsPool.toLocaleString('en-IN')} available)`);
      return;
    }

    const result = onAddSpend({
      amount: numAmount,
      type: 'expense',
      category,
      note: note.trim(),
    });

    if (result && !result.success) {
      setError(result.error || 'Failed to add spend');
      return;
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-[390px] bg-white rounded-t-2xl p-6 z-10 transform transition-transform duration-200 ease-out translate-y-0 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        <div className="w-8 h-1 bg-[#E5E5E5] rounded-full mx-auto -mt-2 mb-1" />

        {/* Title & Cancel */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-red-50 text-[#DC2626] flex items-center justify-center">
              <ArrowUpRight className="size-4" />
            </div>
            <div>
              <div className="text-base font-bold text-[#1A1A1A]">Pay / Out</div>
              <div className="text-xs text-[#6B7280]">Log an everyday expense</div>
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

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Amount input */}
          <div className="flex flex-col items-center py-2">
            <div className="text-xs text-[#6B7280] mb-1 font-medium">
              Enter Amount Paid
            </div>
            <div className="flex items-center justify-center w-full">
              <span className="text-3xl font-bold text-[#1A1A1A] mr-1">₹</span>
              <input
                type="number"
                inputMode="decimal"
                min="0"
                step="any"
                value={amount}
                onWheel={(e) => e.target.blur()}
                onKeyDown={(e) => {
                  if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '+') {
                    e.preventDefault();
                  }
                }}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '' || (!val.includes('-') && Number(val) >= 0)) {
                    setAmount(val);
                  }
                }}
                placeholder="0"
                autoFocus
                className="w-48 text-center text-3xl font-bold text-[#1A1A1A] border-b-2 border-[#2563EB] focus:outline-none bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>

            {/* Live cash indicator & overspend warning */}
            <div className="text-xs text-[#6B7280] mt-1.5 text-center">
              Available cash in hand: <strong className="text-[#1A1A1A]">₹{monthlySavingsPool.toLocaleString('en-IN')}</strong>
            </div>

            {Number(amount) > monthlySavingsPool && (
              <div className="text-xs text-[#DC2626] mt-1 text-center font-medium">
                Exceeds available cash by ₹{(Number(amount) - monthlySavingsPool).toLocaleString('en-IN')}
              </div>
            )}

            {error && (
              <div className="text-xs text-[#DC2626] mt-1 text-center font-medium">{error}</div>
            )}
          </div>

          {/* Real-time Monthly Budget Feedback */}
          {needsBudget > 0 && Number(amount) > 0 && (
            <div className="text-xs px-3.5 py-2.5 rounded-xl bg-[#F9FAFB] border border-[#E5E5E5] leading-relaxed">
              {needsSpent + Number(amount) > needsBudget ? (
                <span className="text-[#DC2626] font-medium">
                  Note: This will bring monthly spending to ₹{(needsSpent + Number(amount)).toLocaleString('en-IN')}, exceeding your budget of ₹{needsBudget.toLocaleString('en-IN')} by ₹{((needsSpent + Number(amount)) - needsBudget).toLocaleString('en-IN')}. This reduces your corpus savings.
                </span>
              ) : (
                <span className="text-[#16A34A] font-medium">
                  Fits within your monthly budget! Leaves ₹{(needsBudget - (needsSpent + Number(amount))).toLocaleString('en-IN')} remaining.
                </span>
              )}
            </div>
          )}

          {/* Category Dropdown */}
          <div>
            <div className="text-xs font-medium text-[#6B7280] uppercase tracking-wide mb-1.5">
              Category
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full text-sm text-[#1A1A1A] bg-white border border-[#E5E5E5] rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#2563EB]"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Note Input */}
          <div>
            <div className="text-xs font-medium text-[#6B7280] uppercase tracking-wide mb-1.5">
              Note (Optional)
            </div>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Swiggy order, grocery bill, fuel"
              className="w-full text-sm text-[#1A1A1A] bg-white border border-[#E5E5E5] rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#2563EB]"
            />
          </div>

          {/* CTA */}
          <button
            type="submit"
            className="w-full h-12 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl text-sm font-semibold flex items-center justify-center cursor-pointer mt-1 transition-colors"
          >
            Confirm Pay / Out
          </button>
        </form>
      </div>
    </div>
  );
}
