import React, { useState } from 'react';
import { Check } from 'lucide-react';

function getOrdinalSuffix(day) {
  if (!day) return 'th';
  const j = day % 10;
  const k = day % 100;
  if (j === 1 && k !== 11) return 'st';
  if (j === 2 && k !== 12) return 'nd';
  if (j === 3 && k !== 13) return 'rd';
  return 'th';
}

export function BudgetSettings({
  initialSettings,
  onSave,
  onCancel,
}) {
  const defaultIncome = initialSettings?.monthlyIncome || initialSettings?.baseSalary || 0;
  const defaultBudget = initialSettings?.monthlyBudget || ((initialSettings?.essentialNeedsTarget || 0) + (initialSettings?.guiltFreeBudget || 0)) || 0;
  const defaultCycleDay = initialSettings?.cycleStartDay || 1;

  const [step, setStep] = useState(1);
  const [incomeStr, setIncomeStr] = useState(defaultIncome ? String(defaultIncome) : '');
  const [budgetStr, setBudgetStr] = useState(defaultBudget ? String(defaultBudget) : '');
  const [cycleDayStr, setCycleDayStr] = useState(String(defaultCycleDay));
  const [isSaved, setIsSaved] = useState(false);

  // Pure integer parsing
  const numIncome = Math.max(0, parseInt(incomeStr.replace(/[^0-9]/g, ''), 10) || 0);
  const numBudget = Math.max(0, parseInt(budgetStr.replace(/[^0-9]/g, ''), 10) || 0);
  const rawCycleDay = parseInt(cycleDayStr.replace(/[^0-9]/g, ''), 10);
  const numCycleDay = isNaN(rawCycleDay) ? 1 : Math.min(31, Math.max(1, rawCycleDay));

  // Calculations
  const projectedMonthlySavings = Math.max(0, numIncome - numBudget);
  const isOverbudget = numBudget > numIncome && numIncome > 0;
  const overbudgetAmount = isOverbudget ? numBudget - numIncome : 0;

  const spendingRate = numIncome > 0 ? Math.min(100, Math.round((numBudget / numIncome) * 100)) : 0;
  const savingsRate = Math.max(0, 100 - spendingRate);

  const handleIncomeChange = (e) => {
    const clean = e.target.value.replace(/[^0-9]/g, '');
    setIncomeStr(clean);
  };

  const handleBudgetChange = (e) => {
    const clean = e.target.value.replace(/[^0-9]/g, '');
    setBudgetStr(clean);
  };

  const handleCycleDayChange = (e) => {
    const clean = e.target.value.replace(/[^0-9]/g, '');
    if (clean === '') {
      setCycleDayStr('');
      return;
    }
    const val = parseInt(clean, 10);
    if (val > 31) {
      setCycleDayStr('31');
    } else {
      setCycleDayStr(clean);
    }
  };

  const handleQuickRatio = (ratio) => {
    if (numIncome > 0) {
      setBudgetStr(String(Math.round(numIncome * ratio)));
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (step === 1 && numIncome > 0) setStep(2);
      else if (step === 2 && numBudget > 0) setStep(3);
      else if (step === 3 && cycleDayStr && numCycleDay >= 1 && numCycleDay <= 31) setStep(4);
      else if (step === 4) handleSave();
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave({
        monthlyIncome: numIncome,
        baseSalary: numIncome,
        monthlyBudget: numBudget,
        essentialNeedsTarget: Math.round(numBudget * 0.7),
        guiltFreeBudget: Math.round(numBudget * 0.3),
        cycleStartDay: numCycleDay,
      });
      setIsSaved(true);
      setTimeout(() => {
        setIsSaved(false);
      }, 1500);
    }
  };

  const prevCycleDay = numCycleDay > 1 ? numCycleDay - 1 : 28;

  return (
    <div className="flex flex-col pb-16 max-w-md mx-auto px-1" onKeyDown={handleKeyDown}>
      {/* Sleek Minimal Progress Indicator */}
      <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
        <span className="font-medium text-slate-500">{step} of 4</span>
        {step > 1 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            className="text-slate-500 hover:text-slate-900 font-medium cursor-pointer transition-colors"
          >
            Back
          </button>
        ) : onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600 font-medium cursor-pointer transition-colors"
          >
            Cancel
          </button>
        ) : null}
      </div>

      <div className="grid grid-cols-4 gap-1.5 h-1 mb-8">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={`h-full rounded-full transition-all duration-300 ${
              s <= step ? 'bg-slate-900' : 'bg-slate-100'
            }`}
          />
        ))}
      </div>

      {/* STEP 1: MONTHLY INFLOW */}
      {step === 1 && (
        <div className="flex flex-col animate-fadeIn">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">
              How much do you take home each month?
            </h2>
            <p className="text-sm text-slate-500 mt-1.5">
              Your regular salary or monthly income.
            </p>
          </div>

          {/* Flat Hero Numeric Input */}
          <div className="flex items-center justify-center gap-1.5 py-12">
            <span className="text-3xl font-semibold text-slate-300 select-none">₹</span>
            <input
              type="text"
              autoFocus
              inputMode="numeric"
              value={incomeStr}
              onChange={handleIncomeChange}
              placeholder="0"
              className="w-64 text-5xl font-semibold text-slate-900 tracking-tight tabular-nums text-center bg-transparent focus:outline-none placeholder:text-slate-200"
            />
          </div>

          <p className="text-xs text-slate-400 text-center">
            This is your monthly take-home pay.
          </p>

          <div className="pt-10">
            <button
              type="button"
              disabled={numIncome <= 0}
              onClick={() => setStep(2)}
              className={`w-full h-12 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                numIncome > 0
                  ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: SPENDING ALLOWANCE */}
      {step === 2 && (
        <div className="flex flex-col animate-fadeIn">
          <div>
            <div className="text-xs font-semibold text-slate-400 mb-1 tabular-nums">
              Out of ₹{numIncome.toLocaleString('en-IN')}
            </div>
            <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">
              How much do you plan to spend?
            </h2>
            <p className="text-sm text-slate-500 mt-1.5">
              Your monthly allowance for rent, bills, groceries, and leisure.
            </p>
          </div>

          {/* Flat Hero Numeric Input */}
          <div className="flex items-center justify-center gap-1.5 py-10">
            <span className="text-3xl font-semibold text-slate-300 select-none">₹</span>
            <input
              type="text"
              autoFocus
              inputMode="numeric"
              value={budgetStr}
              onChange={handleBudgetChange}
              placeholder="0"
              className="w-64 text-5xl font-semibold text-slate-900 tracking-tight tabular-nums text-center bg-transparent focus:outline-none placeholder:text-slate-200"
            />
          </div>

          {/* Minimal Preset Ratio Chips */}
          {numIncome > 0 && (
            <div className="flex justify-center gap-2">
              {[
                { label: '50%', ratio: 0.5 },
                { label: '60%', ratio: 0.6 },
                { label: '70%', ratio: 0.7 },
              ].map((item) => {
                const amt = Math.round(numIncome * item.ratio);
                const isSelected = numBudget === amt;
                return (
                  <button
                    key={item.ratio}
                    type="button"
                    onClick={() => handleQuickRatio(item.ratio)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {item.label} · ₹{amt.toLocaleString('en-IN')}
                  </button>
                );
              })}
            </div>
          )}

          {/* Inline Feedback */}
          {isOverbudget ? (
            <p className="text-xs text-red-600 text-center mt-4">
              Spending exceeds income by ₹{overbudgetAmount.toLocaleString('en-IN')}
            </p>
          ) : numIncome > 0 && numBudget > 0 ? (
            <p className="text-xs text-emerald-600 font-medium text-center mt-4 tabular-nums">
              Saves ₹{projectedMonthlySavings.toLocaleString('en-IN')} ({savingsRate}%) toward your goals
            </p>
          ) : null}

          <div className="pt-8">
            <button
              type="button"
              disabled={numBudget <= 0}
              onClick={() => setStep(3)}
              className={`w-full h-12 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                numBudget > 0
                  ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: PAYDAY CYCLE */}
      {step === 3 && (
        <div className="flex flex-col animate-fadeIn">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">
              When does your salary arrive?
            </h2>
            <p className="text-sm text-slate-500 mt-1.5">
              Enter the day of the month your income credits.
            </p>
          </div>

          {/* Flat Hero Numeric Input for Day */}
          <div className="flex items-center justify-center gap-1.5 py-12">
            <input
              type="text"
              autoFocus
              inputMode="numeric"
              maxLength={2}
              value={cycleDayStr}
              onChange={handleCycleDayChange}
              placeholder="1"
              className="w-24 text-5xl font-semibold text-slate-900 tracking-tight tabular-nums text-center bg-transparent focus:outline-none placeholder:text-slate-200"
            />
            <span className="text-2xl font-semibold text-slate-400 select-none">
              {getOrdinalSuffix(numCycleDay)}
            </span>
          </div>

          <p className="text-xs text-slate-400 text-center">
            Cycle runs from the {numCycleDay}{getOrdinalSuffix(numCycleDay)} to the {prevCycleDay}{getOrdinalSuffix(prevCycleDay)} of each month.
          </p>

          <div className="pt-10">
            <button
              type="button"
              disabled={!cycleDayStr || numCycleDay < 1 || numCycleDay > 31}
              onClick={() => setStep(4)}
              className={`w-full h-12 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                cycleDayStr && numCycleDay >= 1 && numCycleDay <= 31
                  ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: REVIEW */}
      {step === 4 && (
        <div className="flex flex-col animate-fadeIn">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">
              Here’s your monthly plan
            </h2>
            <p className="text-sm text-slate-500 mt-1.5">
              You can change these numbers anytime in Settings.
            </p>
          </div>

          {/* Flat Hairline Summary List */}
          <div className="divide-y divide-slate-100 border-y border-slate-100 py-1 my-6 text-sm">
            <div className="py-3 flex items-center justify-between">
              <span className="text-slate-500">Monthly Inflow</span>
              <span className="font-semibold text-slate-900 tabular-nums">
                ₹{numIncome.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="py-3 flex items-center justify-between">
              <span className="text-slate-500">Spending Limit</span>
              <span className="font-semibold text-slate-900 tabular-nums">
                ₹{numBudget.toLocaleString('en-IN')} ({spendingRate}%)
              </span>
            </div>
            <div className="py-3 flex items-center justify-between">
              <span className="text-slate-500">Saved to Goals</span>
              <span className="font-semibold text-emerald-600 tabular-nums">
                +₹{projectedMonthlySavings.toLocaleString('en-IN')} ({savingsRate}%)
              </span>
            </div>
            <div className="py-3 flex items-center justify-between">
              <span className="text-slate-500">Cycle Reset</span>
              <span className="font-medium text-slate-900">
                {numCycleDay}{getOrdinalSuffix(numCycleDay)} of every month
              </span>
            </div>
          </div>

          {/* Minimal 2-Tone Bar */}
          <div className="flex flex-col gap-1.5 mb-6">
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>Spend {spendingRate}%</span>
              <span>Save {savingsRate}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden flex">
              <div style={{ width: `${spendingRate}%` }} className="bg-slate-900 h-full" />
              <div style={{ width: `${savingsRate}%` }} className="bg-emerald-500 h-full" />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={handleSave}
              className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
            >
              {isSaved ? (
                <>
                  <Check className="size-4 text-emerald-400" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Budget</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full py-2 text-xs text-slate-400 hover:text-slate-600 font-medium cursor-pointer text-center transition-colors"
            >
              Start over
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
