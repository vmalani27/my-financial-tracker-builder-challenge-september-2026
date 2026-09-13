import React, { useState } from 'react';
import { Plus, Minus, HelpCircle, X, ArrowLeftRight } from 'lucide-react';

export function FloatingActions({
  onOpenAddSpend,
  onOpenCanIAfford,
  onOpenExtraCash,
  onOpenTransfer,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const handleAction = (callback) => {
    setIsOpen(false);
    if (callback) callback();
  };

  return (
    <>
      {/* Dimmed backdrop when FAB is expanded */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Floating Container fixed above bottom nav within the 390px frame */}
      <div className="fixed bottom-20 left-0 right-0 max-w-[390px] mx-auto px-4 pointer-events-none z-40 flex flex-col items-end gap-2.5">
        {/* Speed Dial Actions */}
        {isOpen && (
          <div className="flex flex-col items-end gap-2.5 pointer-events-auto">
            {/* 1. Gift / Cash */}
            <button
              type="button"
              onClick={() => handleAction(onOpenExtraCash)}
              className="flex items-center gap-2 group cursor-pointer"
            >
              <span className="text-xs font-medium bg-white text-[#1A1A1A] px-3 py-1.5 rounded-xl shadow-sm border border-[#E5E5E5]">
                Gift / Extra Cash
              </span>
              <div className="size-11 rounded-full bg-white border border-[#E5E5E5] shadow-sm flex items-center justify-center text-[#16A34A] group-active:scale-95">
                <Plus className="size-5" />
              </div>
            </button>

            {/* 2. Transfer Between Accounts */}
            <button
              type="button"
              onClick={() => handleAction(onOpenTransfer)}
              className="flex items-center gap-2 group cursor-pointer"
            >
              <span className="text-xs font-medium bg-white text-[#1A1A1A] px-3 py-1.5 rounded-xl shadow-sm border border-[#E5E5E5]">
                Transfer Between Accounts
              </span>
              <div className="size-11 rounded-full bg-white border border-[#E5E5E5] shadow-sm flex items-center justify-center text-[#2563EB] group-active:scale-95">
                <ArrowLeftRight className="size-5" />
              </div>
            </button>

            {/* 3. Can I Afford? */}
            <button
              type="button"
              onClick={() => handleAction(onOpenCanIAfford)}
              className="flex items-center gap-2 group cursor-pointer"
            >
              <span className="text-xs font-medium bg-white text-[#1A1A1A] px-3 py-1.5 rounded-xl shadow-sm border border-[#E5E5E5]">
                Can I Afford?
              </span>
              <div className="size-11 rounded-full bg-white border border-[#E5E5E5] shadow-sm flex items-center justify-center text-[#2563EB] group-active:scale-95">
                <HelpCircle className="size-5" />
              </div>
            </button>

            {/* 4. Pay / Out */}
            <button
              type="button"
              onClick={() => handleAction(() => onOpenAddSpend())}
              className="flex items-center gap-2 group cursor-pointer"
            >
              <span className="text-xs font-semibold bg-white text-[#1A1A1A] px-3 py-1.5 rounded-xl shadow-xs border border-[#E5E5E5]">
                Pay / Out
              </span>
              <div className="size-11 rounded-full bg-white border border-[#E5E5E5] shadow-xs flex items-center justify-center text-[#DC2626] group-active:scale-95">
                <Minus className="size-5" />
              </div>
            </button>
          </div>
        )}

        {/* Main Trigger FAB */}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={`size-12 rounded-full shadow-sm flex items-center justify-center pointer-events-auto cursor-pointer transition-transform duration-200 ${
            isOpen
              ? 'bg-[#1A1A1A] text-white rotate-90'
              : 'bg-[#2563EB] text-white hover:bg-blue-700'
          }`}
          aria-label={isOpen ? 'Close quick actions' : 'Open quick actions'}
        >
          {isOpen ? <X className="size-5" /> : <Plus className="size-6" />}
        </button>
      </div>
    </>
  );
}
