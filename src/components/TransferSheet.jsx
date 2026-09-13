import React, { useState, useEffect } from 'react';

export function TransferSheet({
  isOpen,
  onClose,
  accounts = [],
  onTransfer,
}) {
  const [fromAccountId, setFromAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && accounts.length >= 2) {
      const primary = accounts.find((a) => a.isPrimary) || accounts[0];
      const secondary = accounts.find((a) => a.id !== primary.id) || accounts[1];
      setFromAccountId(primary?.id || '');
      setToAccountId(secondary?.id || '');
      setAmount('');
      setNote('');
      setError('');
    }
  }, [isOpen, accounts]);

  if (!isOpen) return null;

  const sourceAccount = accounts.find((a) => a.id === fromAccountId);
  const destAccount = accounts.find((a) => a.id === toAccountId);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const numAmount = Number(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (fromAccountId === toAccountId) {
      setError('Source and destination accounts must be different');
      return;
    }

    const res = onTransfer({
      fromAccountId,
      toAccountId,
      amount: numAmount,
      note: note.trim(),
    });

    if (res && !res.success) {
      setError(res.error || 'Transfer failed');
      return;
    }

    onClose();
  };

  const presets = [1000, 2500, 5000, 10000];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-[390px] bg-white rounded-t-2xl p-6 z-10 transform transition-transform duration-200 ease-out translate-y-0 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        <div className="w-8 h-1 bg-[#E5E5E5] rounded-full mx-auto -mt-2 mb-1" />

        <div className="flex items-center justify-between">
          <div>
            <div className="text-base font-bold text-[#1A1A1A]">
              Self Transfer
            </div>
            <div className="text-xs text-[#6B7280]">
              Move money between your accounts / wallets
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
            <div className="text-xs text-[#6B7280] mb-1 font-medium">Enter Transfer Amount</div>
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

            {/* Presets */}
            <div className="flex gap-2 mt-3">
              {presets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(preset.toString())}
                  className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#F5F5F5] text-[#1A1A1A] border border-[#E5E5E5] cursor-pointer"
                >
                  +₹{preset.toLocaleString('en-IN')}
                </button>
              ))}
            </div>
          </div>

          {/* Source Account */}
          <div>
            <div className="text-xs font-medium text-[#6B7280] uppercase tracking-wide mb-1.5">
              From Account (Debit)
            </div>
            <select
              value={fromAccountId}
              onChange={(e) => setFromAccountId(e.target.value)}
              className="w-full text-sm text-[#1A1A1A] bg-white border border-[#E5E5E5] rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#2563EB]"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} (Balance: ₹{(acc.balance || 0).toLocaleString('en-IN')})
                </option>
              ))}
            </select>
          </div>

          {/* Destination Account */}
          <div>
            <div className="text-xs font-medium text-[#6B7280] uppercase tracking-wide mb-1.5">
              To Account (Credit)
            </div>
            <select
              value={toAccountId}
              onChange={(e) => setToAccountId(e.target.value)}
              className="w-full text-sm text-[#1A1A1A] bg-white border border-[#E5E5E5] rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#2563EB]"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} (Balance: ₹{(acc.balance || 0).toLocaleString('en-IN')})
                </option>
              ))}
            </select>
          </div>

          {/* Note */}
          <div>
            <div className="text-xs font-medium text-[#6B7280] uppercase tracking-wide mb-1.5">
              Reason / Note (Optional)
            </div>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Moved to emergency fund, liquid buffer"
              className="w-full text-sm text-[#1A1A1A] bg-white border border-[#E5E5E5] rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#2563EB]"
            />
          </div>

          {error && (
            <div className="text-xs text-[#DC2626] font-medium text-center">{error}</div>
          )}

          {/* CTA */}
          <button
            type="submit"
            className="w-full h-12 bg-[#2563EB] text-white rounded-xl text-sm font-medium flex items-center justify-center cursor-pointer mt-1"
          >
            Confirm Internal Transfer
          </button>
        </form>
      </div>
    </div>
  );
}
