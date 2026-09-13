import React from 'react';
import { Landmark, Shield, TrendingUp, ArrowLeftRight, Wallet } from 'lucide-react';

export function VaultsSummary({
  accounts = [],
  totalNetWorth = 0,
  onOpenTransfer,
}) {
  const getAccountIcon = (type) => {
    switch (type) {
      case 'primary':
        return <Landmark className="size-4 text-[#2563EB]" />;
      case 'savings':
        return <Shield className="size-4 text-[#16A34A]" />;
      case 'investment':
        return <TrendingUp className="size-4 text-[#2563EB]" />;
      default:
        return <Wallet className="size-4 text-[#6B7280]" />;
    }
  };

  return (
    <div className="bg-white rounded-xl p-4 border border-[#E5E5E5] flex flex-col gap-3">
      {/* Header with Net Worth & Transfer CTA */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-medium text-[#6B7280] uppercase tracking-wide">
            My Corpus & Accounts
          </div>
          <div className="text-xs text-[#6B7280] mt-0.5">
            Total Corpus: <strong className="text-[#1A1A1A]">₹{totalNetWorth.toLocaleString('en-IN')}</strong>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenTransfer}
          className="text-xs font-medium text-[#2563EB] bg-[#F5F5F5] border border-[#E5E5E5] rounded-lg px-2.5 py-1.5 flex items-center gap-1 cursor-pointer hover:bg-gray-100"
        >
          <ArrowLeftRight className="size-3" />
          <span>Transfer</span>
        </button>
      </div>

      {/* Horizontal / Grid of Accounts */}
      <div className="grid grid-cols-1 gap-2">
        {accounts.map((acc) => (
          <div
            key={acc.id}
            className="flex items-center justify-between p-2.5 rounded-lg bg-[#F5F5F5] border border-[#E5E5E5]"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-white border border-[#E5E5E5]">
                {getAccountIcon(acc.type)}
              </div>
              <div>
                <div className="text-xs font-medium text-[#1A1A1A] flex items-center gap-1">
                  {acc.name}
                  {acc.isPrimary && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-50 text-[#2563EB] font-normal border border-blue-200">
                      Primary
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-[#6B7280] capitalize">
                  {acc.type === 'primary' ? 'Operating / UPI' : acc.type}
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs font-semibold text-[#1A1A1A]">
                ₹{(acc.balance || 0).toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
