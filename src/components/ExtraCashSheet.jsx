import React, { useState, useEffect } from 'react';

export function ExtraCashSheet({
  isOpen,
  onClose,
  goals = [],
  onAddExtraCash,
}) {
  const [amount, setAmount] = useState('5000');
  const [source, setSource] = useState('gift');
  const [note, setNote] = useState('');
  const [splits, setSplits] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      const initialSplits = {};
      goals.forEach((g) => {
        initialSplits[g.id] = g.splitPercentage || 25;
      });
      setSplits(initialSplits);
      setAmount('5000');
      setNote('');
      setError('');
    }
  }, [isOpen, goals]);

  if (!isOpen) return null;

  const numAmount = Number(amount) || 0;

  const handleSlider = (goalId, val) => {
    setSplits((prev) => ({ ...prev, [goalId]: Number(val) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (numAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    const res = onAddExtraCash({
      amount: numAmount,
      source,
      note: note.trim() || `${source} inflow`,
      splits,
    });

    if (res && !res.success) {
      setError(res.error || 'Failed to distribute');
      return;
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-[390px] bg-white rounded-t-2xl p-6 z-10 transform transition-transform duration-200 ease-out translate-y-0 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        <div className="w-8 h-1 bg-[#E5E5E5] rounded-full mx-auto -mt-2 mb-1" />

        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold text-[#1A1A1A]">
            Add Gift or Extra Cash
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-[#6B7280] font-medium"
          >
            Cancel
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Amount Input */}
          <div className="flex flex-col items-center py-2">
            <div className="text-xs text-[#6B7280] mb-1">Enter Cash Received</div>
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
            {error && (
              <div className="text-xs text-[#DC2626] mt-1 text-center">{error}</div>
            )}
          </div>

          {/* Source Selector */}
          <div>
            <div className="text-xs font-medium text-[#6B7280] uppercase tracking-wide mb-2">
              Source
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {[
                { id: 'gift', label: 'Gift' },
                { id: 'pocket_money', label: 'Pocket Money' },
                { id: 'bonus', label: 'Bonus' },
                { id: 'freelance', label: 'Freelance' },
                { id: 'other', label: 'Other' },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSource(s.id)}
                  className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium border transition-none ${
                    source === s.id
                      ? 'bg-[#2563EB] text-white border-[#2563EB]'
                      : 'bg-[#F5F5F5] text-[#1A1A1A] border-[#E5E5E5]'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Split Preview into Goals */}
          <div>
            <div className="text-xs font-medium text-[#6B7280] uppercase tracking-wide mb-2">
              Goal Split Distribution
            </div>
            <div className="bg-[#F5F5F5] rounded-xl p-3 border border-[#E5E5E5] flex flex-col gap-3">
              {goals.map((g) => {
                const pct = splits[g.id] ?? g.splitPercentage ?? 25;
                const share = Math.round((numAmount * pct) / 100);

                return (
                  <div key={g.id} className="flex flex-col gap-1">
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="font-medium text-[#1A1A1A] truncate max-w-[180px]">
                        {g.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[#1A1A1A]">
                          ₹{share.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[#6B7280] w-8 text-right">{pct}%</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={pct}
                      onChange={(e) => handleSlider(g.id, e.target.value)}
                      className="w-full accent-[#2563EB] h-1.5 bg-[#E5E5E5] rounded-lg cursor-pointer"
                    />
                  </div>
                );
              })}
            </div>
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
              placeholder="e.g. Birthday gift from relatives"
              className="w-full text-sm text-[#1A1A1A] bg-white border border-[#E5E5E5] rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#2563EB]"
            />
          </div>

          {/* CTA */}
          <button
            type="submit"
            disabled={numAmount <= 0}
            className="w-full h-12 bg-[#2563EB] disabled:opacity-40 text-white rounded-xl text-sm font-medium flex items-center justify-center cursor-pointer mt-1"
          >
            Distribute to Goals
          </button>
        </form>
      </div>
    </div>
  );
}
