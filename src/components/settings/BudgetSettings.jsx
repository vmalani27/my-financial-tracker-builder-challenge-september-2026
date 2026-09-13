import React, { useState } from 'react';
import { Wallet, TrendingUp, Calendar, Check } from 'lucide-react';

export function BudgetSettings({
  initialSettings,
  onSave,
  onCancel,
}) {
  const defaultIncome = initialSettings?.monthlyIncome || initialSettings?.baseSalary || 75000;
  const defaultBudget = initialSettings?.monthlyBudget || ((initialSettings?.essentialNeedsTarget || 0) + (initialSettings?.guiltFreeBudget || 0)) || 35000;
  const defaultCycleDay = initialSettings?.cycleStartDay || 9;

  const [income, setIncome] = useState(defaultIncome);
  const [budget, setBudget] = useState(defaultBudget);
  const [cycleDay, setCycleDay] = useState(defaultCycleDay);
  const [isSaved, setIsSaved] = useState(false);

  // Calculations
  const numIncome = Math.max(0, Number(income) || 0);
  const numBudget = Math.max(0, Number(budget) || 0);
  const projectedMonthlySavings = Math.max(0, numIncome - numBudget);
  const spendingRate = numIncome > 0 ? Math.min(100, Math.round((numBudget / numIncome) * 100)) : 0;
  const savingsRate = Math.max(0, 100 - spendingRate);

  const handleAdjustBudget = (delta) => {
    setBudget((prev) => Math.max(0, (Number(prev) || 0) + delta));
  };

  const handleSliderChange = (e) => {
    const pct = Number(e.target.value);
    const newBudget = Math.round((numIncome * pct) / 100);
    setBudget(newBudget);
  };

  const handleSave = () => {
    if (onSave) {
      onSave({
        monthlyIncome: numIncome,
        baseSalary: numIncome,
        monthlyBudget: numBudget,
        essentialNeedsTarget: Math.round(numBudget * 0.7),
        guiltFreeBudget: Math.round(numBudget * 0.3),
        cycleStartDay: Number(cycleDay) || 9,
      });
      setIsSaved(true);
      setTimeout(() => {
        setIsSaved(false);
      }, 1500);
    }
  };

  const incomePresets = [
    { label: '₹30k', value: 30000 },
    { label: '₹50k', value: 50000 },
    { label: '₹75k', value: 75000 },
    { label: '₹1.2L', value: 120000 },
  ];

  const cycleDays = [1, 5, 9, 15, 25];

  return (
    <div className="flex flex-col gap-4 pb-20">
      {/* 1. Monthly Budget Controller Hero Card */}
      <div className="bg-white rounded-2xl p-5 border border-[#E5E5E5] flex flex-col gap-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">
              Budget for the Month
            </div>
            <div className="text-xs text-[#6B7280] mt-0.5">
              Your designated spending allowance for all monthly expenses
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0">
            <Wallet className="size-5" />
          </div>
        </div>

        {/* Large Tactile Display & Stepper Controls */}
        <div className="flex flex-col items-center py-3 bg-[#F9FAFB] rounded-xl border border-[#E5E5E5] gap-3">
          <div className="text-xs text-[#6B7280] font-medium">Monthly Spending Limit</div>
          <div className="flex items-center justify-center gap-1">
            <span className="text-3xl font-bold text-[#1A1A1A]">₹</span>
            <input
              type="number"
              inputMode="numeric"
              value={budget}
              onChange={(e) => setBudget(Math.max(0, Number(e.target.value) || 0))}
              className="w-48 text-3xl font-bold text-[#1A1A1A] bg-transparent text-center border-b-2 border-[#2563EB] focus:outline-none"
            />
          </div>

          {/* Quick Increment/Decrement Stepper Chips */}
          <div className="flex items-center gap-1.5 flex-wrap justify-center pt-1">
            <button
              type="button"
              onClick={() => handleAdjustBudget(-5000)}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white border border-[#E5E5E5] text-[#6B7280] hover:bg-gray-100 cursor-pointer transition-colors"
            >
              -₹5,000
            </button>
            <button
              type="button"
              onClick={() => handleAdjustBudget(-1000)}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white border border-[#E5E5E5] text-[#6B7280] hover:bg-gray-100 cursor-pointer transition-colors"
            >
              -₹1,000
            </button>
            <button
              type="button"
              onClick={() => handleAdjustBudget(1000)}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white border border-[#E5E5E5] text-[#2563EB] hover:bg-blue-50 cursor-pointer transition-colors"
            >
              +₹1,000
            </button>
            <button
              type="button"
              onClick={() => handleAdjustBudget(5000)}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white border border-[#E5E5E5] text-[#2563EB] hover:bg-blue-50 cursor-pointer transition-colors"
            >
              +₹5,000
            </button>
          </div>
        </div>

        {/* Proportional Slider */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#6B7280] font-medium">Spending Share of Income:</span>
            <span className="font-bold text-[#2563EB]">{spendingRate}%</span>
          </div>
          <input
            type="range"
            min="10"
            max="90"
            step="5"
            value={spendingRate}
            onChange={handleSliderChange}
            className="w-full accent-[#2563EB] cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-[#6B7280]">
            <span>10% Frugal</span>
            <span>50% Balanced</span>
            <span>90% Relaxed</span>
          </div>
        </div>
      </div>

      {/* 2. Monthly Inflow Setup */}
      <div className="bg-white rounded-2xl p-5 border border-[#E5E5E5] flex flex-col gap-3.5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">
              Monthly Inflow
            </div>
            <div className="text-xs text-[#6B7280] mt-0.5">
              Your expected monthly earnings or salary
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#16A34A] flex items-center justify-center shrink-0">
            <TrendingUp className="size-5" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center bg-[#F9FAFB] border border-[#E5E5E5] rounded-xl px-3 py-2">
            <span className="text-sm font-bold text-[#6B7280] mr-1">₹</span>
            <input
              type="number"
              inputMode="numeric"
              value={income}
              onChange={(e) => setIncome(Math.max(0, Number(e.target.value) || 0))}
              className="w-full text-sm font-semibold text-[#1A1A1A] bg-transparent focus:outline-none"
              placeholder="75000"
            />
          </div>

          <div className="flex gap-1">
            {incomePresets.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => setIncome(preset.value)}
                className={`px-2.5 py-2 rounded-xl text-xs font-medium border cursor-pointer transition-colors ${
                  numIncome === preset.value
                    ? 'bg-green-50 text-[#16A34A] border-[#16A34A]'
                    : 'bg-white text-[#6B7280] border-[#E5E5E5] hover:bg-gray-50'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Real-Time Corpus Impact & Split Overview */}
      <div className="bg-white rounded-2xl p-5 border border-[#E5E5E5] flex flex-col gap-3.5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">
            Monthly Savings & Corpus Impact
          </div>
          <span className="text-[11px] font-semibold text-[#16A34A] bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
            {savingsRate}% Saved into Corpus
          </span>
        </div>

        {/* 2-Way Proportional Bar */}
        <div className="w-full h-3 rounded-full bg-[#E5E5E5] overflow-hidden flex">
          <div
            style={{ width: `${Math.min(100, spendingRate)}%` }}
            className="bg-[#2563EB] h-full"
            title={`Spending Budget: ${spendingRate}%`}
          />
          <div
            style={{ width: `${Math.min(100, savingsRate)}%` }}
            className="bg-[#16A34A] h-full"
            title={`Savings to Corpus: ${savingsRate}%`}
          />
        </div>

        {/* Two Metric Blocks */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100 flex flex-col">
            <span className="text-[11px] text-[#6B7280]">Budget to Spend</span>
            <span className="text-base font-bold text-[#2563EB] mt-0.5">
              ₹{numBudget.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-[#6B7280] mt-0.5">
              {spendingRate}% of monthly inflow
            </span>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 flex flex-col">
            <span className="text-[11px] text-[#6B7280]">Added to Corpus</span>
            <span className="text-base font-bold text-[#16A34A] mt-0.5">
              +₹{projectedMonthlySavings.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-[#16A34A] font-medium mt-0.5">
              {savingsRate}% saved for goals
            </span>
          </div>
        </div>

        {/* Plain-English Intuitive Explanation */}
        <div className="p-3 rounded-xl bg-[#F9FAFB] border border-[#E5E5E5] text-xs text-[#6B7280] leading-relaxed">
          💡 <strong>How this works:</strong> This budget stays in effect every month. Any unspent money at month end automatically deposits into your <strong>Corpus</strong>. If spending exceeds this budget, it reduces your corpus growth.
        </div>
      </div>

      {/* 4. Cycle Arrival Day */}
      <div className="bg-white rounded-2xl p-5 border border-[#E5E5E5] flex flex-col gap-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">
              Budget Reset Date
            </div>
            <div className="text-xs text-[#6B7280] mt-0.5">
              Day of month when income arrives and budget resets
            </div>
          </div>
          <Calendar className="size-5 text-[#6B7280]" />
        </div>

        <div className="grid grid-cols-5 gap-1.5 pt-1">
          {cycleDays.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setCycleDay(d)}
              className={`py-2 rounded-xl text-xs font-semibold border text-center cursor-pointer transition-colors ${
                cycleDay === d
                  ? 'bg-[#2563EB] text-white border-[#2563EB]'
                  : 'bg-white text-[#1A1A1A] border-[#E5E5E5] hover:bg-gray-50'
              }`}
            >
              {d}th
            </button>
          ))}
        </div>
        <div className="text-[11px] text-[#6B7280]">
          Current cycle runs from the {cycleDay}th to the {Number(cycleDay) - 1 || 28}th of each month.
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 mt-1">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="h-11 px-4 rounded-xl border border-[#E5E5E5] text-[#1A1A1A] text-xs font-semibold hover:bg-gray-50 cursor-pointer"
          >
            Cancel
          </button>
        )}
        <button
          type="button"
          onClick={handleSave}
          className="flex-1 h-11 bg-[#2563EB] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer hover:bg-blue-700 transition-colors"
        >
          {isSaved ? (
            <>
              <Check className="size-4" />
              <span>Budget Saved!</span>
            </>
          ) : (
            <span>Save Monthly Budget</span>
          )}
        </button>
      </div>
    </div>
  );
}
