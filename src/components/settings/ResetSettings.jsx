import React, { useState } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';

export function ResetSettings({
  goals = [],
  spends = [],
  accounts = [],
  onClearData,
  onBack,
}) {
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [clearInput, setClearInput] = useState('');

  const handleClear = () => {
    if (clearInput.trim().toUpperCase() !== 'CLEAR') return;
    onClearData();
    setConfirmClearOpen(false);
    if (onBack) onBack();
  };

  return (
    <div className="flex flex-col gap-4 pb-20">
      {/* Current State Stats */}
      <div className="bg-white rounded-2xl p-4 border border-[#E5E5E5] flex flex-col gap-3 shadow-sm">
        <div className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">
          Current Data
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="p-2.5 rounded-xl bg-[#F5F5F5] text-center">
            <div className="text-[11px] text-[#6B7280]">Goals</div>
            <div className="text-sm font-semibold text-[#1A1A1A]">{goals.length}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-[#F5F5F5] text-center">
            <div className="text-[11px] text-[#6B7280]">Expenses</div>
            <div className="text-sm font-semibold text-[#1A1A1A]">{spends.length}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-[#F5F5F5] text-center">
            <div className="text-[11px] text-[#6B7280]">Accounts</div>
            <div className="text-sm font-semibold text-[#1A1A1A]">{accounts.length}</div>
          </div>
        </div>
      </div>

      {/* Action Cards */}
      <div className="flex flex-col gap-3">

        {/* Clear all data */}
        <div className="bg-white rounded-2xl p-4 border border-red-200 flex flex-col gap-3 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-[#DC2626] flex items-center justify-center shrink-0">
              <AlertTriangle className="size-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-[#DC2626]">Clear All Data</h3>
              <p className="text-xs text-[#6B7280] mt-0.5 leading-relaxed">
                Delete all financial data. This action cannot be undone.
              </p>
            </div>
          </div>

          {!confirmClearOpen ? (
            <button
              type="button"
              onClick={() => setConfirmClearOpen(true)}
              className="w-full h-10 mt-1 bg-red-50 hover:bg-red-100 text-[#DC2626] text-xs font-semibold rounded-xl border border-red-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Trash2 className="size-3.5" />
              Delete All Data
            </button>
          ) : (
            <div className="mt-2 p-3 bg-red-50/70 rounded-xl border border-red-200 flex flex-col gap-2.5 animate-fadeIn">
              <div className="text-xs font-medium text-red-700">
                To confirm permanent deletion, type <span className="font-bold underline">CLEAR</span> below:
              </div>
              <input
                type="text"
                value={clearInput}
                onChange={(e) => setClearInput(e.target.value)}
                placeholder='Type "CLEAR"'
                className="w-full text-xs font-mono text-[#1A1A1A] bg-white border border-red-300 rounded-lg px-3 py-2 focus:outline-none focus:border-[#DC2626]"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setConfirmClearOpen(false);
                    setClearInput('');
                  }}
                  className="flex-1 h-8 bg-white border border-[#E5E5E5] text-xs text-[#6B7280] font-medium rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={clearInput.trim().toUpperCase() !== 'CLEAR'}
                  onClick={handleClear}
                  className={`flex-1 h-8 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 text-white transition-opacity ${
                    clearInput.trim().toUpperCase() === 'CLEAR'
                      ? 'bg-[#DC2626] cursor-pointer hover:bg-red-700'
                      : 'bg-red-300 cursor-not-allowed'
                  }`}
                >
                  <Trash2 className="size-3" />
                  Delete Everything
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
