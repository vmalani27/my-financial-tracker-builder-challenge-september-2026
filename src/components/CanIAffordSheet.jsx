import React, { useState } from 'react';

export function CanIAffordSheet({
  isOpen,
  onClose,
  onEvaluate,
  onLogPurchase,
}) {
  const [type, setType] = useState('need'); // 'need' | 'leisure'
  const [amount, setAmount] = useState('2500');
  const [category, setCategory] = useState('Groceries');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const numAmount = Number(amount) || 0;
  const sim = onEvaluate({ amount: numAmount, type, category });
  const isOverspend = sim.status === 'danger';

  const needCategories = ['Rent', 'Groceries', 'Gym', 'Electricity', 'Fuel/Travel', 'Maintenance', 'Other'];
  const leisureCategories = ['Dining Out', 'Shopping', 'Weekend Fun', 'Gadget/Tech', 'Coffee', 'Other'];

  const handleTypeChange = (newType) => {
    setType(newType);
    setCategory(newType === 'need' ? 'Groceries' : 'Dining Out');
    setError('');
  };

  const handleConfirmPurchase = () => {
    setError('');
    if (numAmount <= 0) return;

    const res = onLogPurchase({
      amount: numAmount,
      type,
      category,
      note: note.trim() || `Evaluated ${type === 'need' ? 'need' : 'leisure'} spend`,
    });

    if (res && !res.success) {
      setError(res.error || 'Cannot log spend');
      return;
    }
    onClose();
  };

  const presets = type === 'need' ? [1000, 2500, 5000, 10000] : [500, 1000, 2500, 5000];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-[390px] bg-white rounded-t-2xl p-6 z-10 transform transition-transform duration-200 ease-out translate-y-0 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        {/* Handle */}
        <div className="w-8 h-1 bg-[#E5E5E5] rounded-full mx-auto -mt-2 mb-1" />

        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold text-[#1A1A1A]">
            Can I afford this?
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-[#6B7280] font-medium"
          >
            Cancel
          </button>
        </div>

        {/* 2-Mode Segmented Switch: Need vs Leisure */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-[#F5F5F5] rounded-xl border border-[#E5E5E5]">
          <button
            type="button"
            onClick={() => handleTypeChange('need')}
            className={`py-2 text-xs font-medium rounded-lg transition-none text-center ${
              type === 'need'
                ? 'bg-white text-[#1A1A1A] shadow-sm'
                : 'text-[#6B7280]'
            }`}
          >
            Essential Need 🛡️
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('leisure')}
            className={`py-2 text-xs font-medium rounded-lg transition-none text-center ${
              type === 'leisure'
                ? 'bg-white text-[#1A1A1A] shadow-sm'
                : 'text-[#6B7280]'
            }`}
          >
            Guilt-Free Leisure ☕
          </button>
        </div>

        {/* Amount Input */}
        <div className="flex flex-col items-center py-1">
          <div className="text-xs text-[#6B7280] mb-1">
            {type === 'need' ? 'Enter Proposed Basic Need' : 'Enter Proposed Leisure Spend'}
          </div>
          <div className="flex items-center justify-center w-full">
            <span className="text-3xl font-bold text-[#1A1A1A] mr-1">₹</span>
            <input
              type="number"
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              autoFocus
              className="w-48 text-center text-3xl font-bold text-[#1A1A1A] border-b-2 border-[#2563EB] focus:outline-none bg-transparent"
            />
          </div>

          {/* Quick presets */}
          <div className="flex gap-2 mt-3">
            {presets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setAmount(preset.toString())}
                className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#F5F5F5] text-[#1A1A1A] border border-[#E5E5E5]"
              >
                +₹{preset.toLocaleString('en-IN')}
              </button>
            ))}
          </div>
        </div>

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
            {(type === 'need' ? needCategories : leisureCategories).map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Note / Item Input */}
        <div>
          <div className="text-xs font-medium text-[#6B7280] uppercase tracking-wide mb-1.5">
            What is this for?
          </div>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={
              type === 'need'
                ? 'e.g. Gym fee, bulk provisions, rent deposit'
                : 'e.g. Swiggy meal, shoes, movie tickets'
            }
            className="w-full text-sm text-[#1A1A1A] bg-white border border-[#E5E5E5] rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#2563EB]"
          />
        </div>

        {/* Real-Time Impact Evaluation */}
        <div className="bg-[#F5F5F5] rounded-xl p-3.5 flex flex-col gap-2.5 border border-[#E5E5E5]">
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-[#6B7280]">Monthly Spending Budget</span>
            <span className="text-sm font-medium text-[#1A1A1A]">
              ₹{(sim.monthlyBudget || sim.needsBudget || 0).toLocaleString('en-IN')}
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <span className="text-xs text-[#6B7280]">Total Spent (With this purchase)</span>
            <span className="text-sm font-medium text-[#1A1A1A]">
              ₹{(sim.newSpent || sim.newNeeds || 0).toLocaleString('en-IN')}
            </span>
          </div>

          <div className="flex items-baseline justify-between pt-1 border-t border-[#E5E5E5]">
            <span className="text-xs text-[#6B7280]">
              {(sim.newBudgetRemaining !== undefined ? sim.newBudgetRemaining : sim.needsHeadroom) >= 0
                ? 'Remaining in Monthly Budget'
                : 'Over Monthly Budget'}
            </span>
            <span
              className={`text-sm font-semibold ${
                (sim.newBudgetRemaining !== undefined ? sim.newBudgetRemaining : sim.needsHeadroom) >= 0
                  ? 'text-[#16A34A]'
                  : 'text-[#DC2626]'
              }`}
            >
              {(sim.newBudgetRemaining !== undefined ? sim.newBudgetRemaining : sim.needsHeadroom) >= 0
                ? `₹${(sim.newBudgetRemaining !== undefined ? sim.newBudgetRemaining : sim.needsHeadroom).toLocaleString('en-IN')} left`
                : `₹${Math.abs(sim.newBudgetRemaining !== undefined ? sim.newBudgetRemaining : -sim.needsOverspend).toLocaleString('en-IN')} over`}
            </span>
          </div>

          <div className="flex items-baseline justify-between text-xs text-[#6B7280]">
            <span>Adding to Corpus at Month End</span>
            <span className="font-semibold text-[#16A34A]">
              +₹{(sim.newProjectedSavings || 0).toLocaleString('en-IN')}
            </span>
          </div>

          <div className="flex items-baseline justify-between text-xs text-[#6B7280]">
            <span>Available Cash in Hand</span>
            <span className="font-medium text-[#1A1A1A]">
              ₹{(sim.newAvailableCash !== undefined ? sim.newAvailableCash : sim.newSavings || 0).toLocaleString('en-IN')}
            </span>
          </div>

          {/* Verdict text */}
          <div
            className={`text-xs mt-1 font-medium leading-relaxed ${
              sim.status === 'safe'
                ? 'text-[#16A34A]'
                : sim.status === 'warning'
                ? 'text-[#6B7280]'
                : 'text-[#DC2626]'
            }`}
          >
            {sim.message}
          </div>
        </div>

        {error && (
          <div className="text-xs text-[#DC2626] font-medium text-center">{error}</div>
        )}

        {/* CTA */}
        <button
          type="button"
          onClick={handleConfirmPurchase}
          disabled={numAmount <= 0 || isOverspend}
          className="w-full h-12 bg-[#2563EB] disabled:opacity-40 text-white rounded-xl text-sm font-medium flex items-center justify-center cursor-pointer mt-1"
        >
          {isOverspend
            ? 'Cannot Afford (Exceeds Available Cash)'
            : 'Confirm & Log Expense'}
        </button>
      </div>
    </div>
  );
}
