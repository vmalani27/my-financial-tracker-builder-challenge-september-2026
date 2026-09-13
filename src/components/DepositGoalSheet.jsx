import React, { useState, useEffect } from 'react';
import { Target } from 'lucide-react';

export function DepositGoalSheet({
  isOpen,
  onClose,
  goal,
  accounts = [],
  availableCash = 0,
  onContributeToGoal,
}) {
  const [amount, setAmount] = useState('');
  const [sourceAccountId, setSourceAccountId] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const primaryAccount = accounts.find((a) => a.isPrimary) || accounts[0];

  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setNote('');
      setError('');
      setSourceAccountId(primaryAccount?.id || accounts[0]?.id || '');
    }
  }, [isOpen, primaryAccount, accounts]);

  if (!isOpen || !goal) return null;

  const selectedSourceAccount = accounts.find((a) => a.id === sourceAccountId) || primaryAccount;
  const sourceBalance = Number(selectedSourceAccount?.balance) || 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const numAmount = Number(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (numAmount > sourceBalance) {
      setError(
        `Amount exceeds ${selectedSourceAccount?.name || 'account'} balance (₹${sourceBalance.toLocaleString('en-IN')} available)`
      );
      return;
    }

    const result = onContributeToGoal({
      goalId: goal.id,
      amount: numAmount,
      fromAccountId: sourceAccountId,
      note: note.trim(),
    });

    if (result && !result.success) {
      setError(result.error || 'Failed to add funds');
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
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center">
              <Target className="size-4" />
            </div>
            <div>
              <div className="text-base font-bold text-[#1A1A1A]">Add Funds</div>
              <div className="text-xs text-[#6B7280]">To {goal.name}</div>
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
              Enter Amount
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

            {/* Selected account balance indicator */}
            <div className="text-xs text-[#6B7280] mt-1.5 text-center">
              Available in {selectedSourceAccount?.name || 'Account'}: <strong className="text-[#1A1A1A]">₹{sourceBalance.toLocaleString('en-IN')}</strong>
            </div>

            {Number(amount) > sourceBalance && (
              <div className="text-xs text-[#DC2626] mt-1 text-center font-medium">
                Exceeds account balance by ₹{(Number(amount) - sourceBalance).toLocaleString('en-IN')}
              </div>
            )}

            {error && (
              <div className="text-xs text-[#DC2626] mt-1 text-center font-medium">{error}</div>
            )}
          </div>

          {/* Source Account Dropdown */}
          <div>
            <div className="text-xs font-medium text-[#6B7280] uppercase tracking-wide mb-1.5">
              Source Account
            </div>
            <select
              value={sourceAccountId}
              onChange={(e) => setSourceAccountId(e.target.value)}
              className="w-full text-sm text-[#1A1A1A] bg-white border border-[#E5E5E5] rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#2563EB]"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} (Balance: ₹{(acc.balance || 0).toLocaleString('en-IN')})
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
              placeholder="e.g. Bonus, birthday gift, extra savings"
              className="w-full text-sm text-[#1A1A1A] bg-white border border-[#E5E5E5] rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#2563EB]"
            />
          </div>

          {/* CTA Button */}
          <button
            type="submit"
            className="w-full h-12 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl text-sm font-semibold flex items-center justify-center cursor-pointer mt-1 transition-colors"
          >
            Confirm Add Funds
          </button>
        </form>
      </div>
    </div>
  );
}
