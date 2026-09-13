import React from 'react';
import { Landmark, Shield, TrendingUp, ArrowLeftRight, Wallet } from 'lucide-react';

export function CorpusSummary({
  accounts = [],
  totalCorpus = 0,
  totalNetWorth = 0,
  onOpenTransfer,
}) {
  const displayCorpus = totalCorpus || totalNetWorth || 0;

  const getAccountIcon = (type) => {
    switch (type) {
      case 'primary':
        return (
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0">
            <Landmark className="size-4" />
          </div>
        );
      case 'savings':
        return (
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#16A34A] flex items-center justify-center shrink-0">
            <Shield className="size-4" />
          </div>
        );
      case 'investment':
        return (
          <div className="w-9 h-9 rounded-xl bg-violet-50 text-[#7C3AED] flex items-center justify-center shrink-0">
            <TrendingUp className="size-4" />
          </div>
        );
      default:
        return (
          <div className="w-9 h-9 rounded-xl bg-gray-100 text-[#6B7280] flex items-center justify-center shrink-0">
            <Wallet className="size-4" />
          </div>
        );
    }
  };

  const getAccountTypeName = (type) => {
    switch (type) {
      case 'primary':
        return 'Everyday UPI';
      case 'savings':
        return 'Liquid Savings';
      case 'investment':
        return 'Investments';
      default:
        return 'Cash & Other';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
      {/* Header: Total Corpus & Quick Transfer Action */}
      <div className="p-4 flex items-center justify-between">
        <div>
          <span className="text-[11px] font-medium tracking-wider text-slate-400 uppercase">
            Total Corpus
          </span>
          <div className="text-xl font-semibold text-slate-900 tracking-tight tabular-nums mt-0.5">
            ₹{displayCorpus.toLocaleString('en-IN')}
          </div>
        </div>

        {onOpenTransfer && (
          <button
            type="button"
            onClick={onOpenTransfer}
            className="text-xs font-medium text-[#2563EB] hover:text-blue-700 bg-blue-50/60 hover:bg-blue-50 border border-blue-100 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <ArrowLeftRight className="size-3.5" />
            <span>Transfer</span>
          </button>
        )}
      </div>

      {/* Flat List of Accounts separated by hairline dividers (No nested cards) */}
      <div className="divide-y divide-slate-100 border-t border-slate-100">
        {accounts.map((acc) => {
          const balance = Number(acc.balance) || 0;
          const pct = displayCorpus > 0 ? Math.round((balance / displayCorpus) * 100) : 0;

          return (
            <div
              key={acc.id}
              className="flex items-center justify-between px-4 py-3 hover:bg-slate-50/50 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                {getAccountIcon(acc.type)}
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-800 flex items-center gap-1.5 truncate">
                    <span className="truncate">{acc.name}</span>
                    {acc.isPrimary && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-50 text-[#2563EB] font-medium border border-blue-200/60 shrink-0">
                        Primary
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {getAccountTypeName(acc.type)}
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-xs font-semibold text-slate-900 tabular-nums">
                  ₹{balance.toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-slate-400 tabular-nums mt-0.5">
                  {pct}% share
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Alias for backwards compatibility
export const VaultsSummary = CorpusSummary;

