import React, { useState } from 'react';
import { Check, ArrowRight, ArrowLeft, Shield, Coffee, Target, Sparkles, AlertCircle } from 'lucide-react';

export function CalibrationWizard({
  initialSettings,
  onSave,
  onCancel,
}) {
  const [step, setStep] = useState(1); // 1 | 2 | 3 | 4

  // Step 1: Inflow / Stipend
  const [salary, setSalary] = useState(initialSettings?.baseSalary || 75000);

  // Step 2: Living Needs & Sponsorship Builder
  const [needsItems, setNeedsItems] = useState([
    { id: 'rent', name: 'Rent / PG Accommodation', amount: 12000, sponsored: true },
    { id: 'groceries', name: 'Food & Daily Groceries', amount: 8000, sponsored: false },
    { id: 'utilities', name: 'Electricity & Wifi Bills', amount: 2500, sponsored: true },
    { id: 'commute', name: 'Travel & Commute', amount: 2000, sponsored: false },
    { id: 'other', name: 'Personal Maintenance & Health', amount: 1500, sponsored: false },
  ]);

  // Step 3: Guilt-Free Leisure Buffer
  const [leisurePct, setLeisurePct] = useState(() => {
    const defaultAmt = initialSettings?.guiltFreeBudget || 15000;
    const base = initialSettings?.baseSalary || 75000;
    return Math.min(35, Math.max(10, Math.round((defaultAmt / Math.max(1, base)) * 100))) || 20;
  });

  // Step 4: Cycle Anchor Day
  const [cycleDay, setCycleDay] = useState(initialSettings?.cycleStartDay || 9);

  // Calculations
  const totalLivingCost = needsItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const outOfPocketNeeds = needsItems
    .filter((item) => !item.sponsored)
    .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const sponsoredNeeds = totalLivingCost - outOfPocketNeeds;

  const guiltFreeAmount = Math.round((salary * leisurePct) / 100);
  const weekendMicroBudget = Math.round(guiltFreeAmount / 4);

  const projectedGoalSavings = Math.max(0, salary - outOfPocketNeeds - guiltFreeAmount);
  const savingsRate = salary > 0 ? Math.round((projectedGoalSavings / salary) * 100) : 0;
  const needsRate = salary > 0 ? Math.round((outOfPocketNeeds / salary) * 100) : 0;

  const handleUpdateItemAmount = (id, newAmount) => {
    const num = Math.max(0, Number(newAmount) || 0);
    setNeedsItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, amount: num } : item))
    );
  };

  const handleToggleSponsorship = (id) => {
    setNeedsItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, sponsored: !item.sponsored } : item))
    );
  };

  const handleFinish = () => {
    onSave({
      baseSalary: Number(salary) || 75000,
      essentialNeedsTarget: totalLivingCost || 30000,
      guiltFreeBudget: guiltFreeAmount || 15000,
      cycleStartDay: Number(cycleDay) || 9,
    });
  };

  const stipendPresets = [
    { label: '₹8,000 Stipend', value: 8000 },
    { label: '₹15,000 Intern', value: 15000 },
    { label: '₹35,000 Junior', value: 35000 },
    { label: '₹75,000 Professional', value: 75000 },
  ];

  const cycleDays = [1, 5, 9, 15, 25];

  return (
    <div className="flex flex-col gap-4">
      {/* Wizard Progress Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-[#1A1A1A]">
            Step {step} of 4: {step === 1 ? 'Monthly Income' : step === 2 ? 'Living Expenses' : step === 3 ? 'Fun & Leisure' : 'Summary'}
          </span>
          <button
            type="button"
            onClick={onCancel}
            className="text-xs text-[#6B7280] hover:text-[#1A1A1A] cursor-pointer"
          >
            Cancel
          </button>
        </div>

        {/* 4-Step Progress Bar */}
        <div className="grid grid-cols-4 gap-1.5">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-colors ${
                s <= step ? 'bg-[#2563EB]' : 'bg-[#E5E5E5]'
              }`}
            />
          ))}
        </div>
      </div>

      {/* STEP 1: MONTHLY INCOME */}
      {step === 1 && (
        <div className="bg-white rounded-2xl p-5 border border-[#E5E5E5] flex flex-col gap-4 shadow-sm">
          <div>
            <div className="text-base font-semibold text-[#1A1A1A]">
              What is your monthly income?
            </div>
            <div className="text-xs text-[#6B7280] mt-1 leading-relaxed">
              Enter your monthly stipend or take-home salary. If your parents help cover rent or bills, you can set that in the next step.
            </div>
          </div>

          <div className="flex flex-col items-center py-3 bg-[#F5F5F5] rounded-xl border border-[#E5E5E5]">
            <span className="text-xs text-[#6B7280] mb-1">Monthly Income / Stipend</span>
            <div className="flex items-center">
              <span className="text-2xl font-bold text-[#1A1A1A] mr-1">₹</span>
              <input
                type="number"
                inputMode="numeric"
                value={salary}
                onChange={(e) => setSalary(Math.max(0, Number(e.target.value) || 0))}
                className="w-40 text-2xl font-bold text-[#1A1A1A] bg-transparent text-center border-b-2 border-[#2563EB] focus:outline-none"
                autoFocus
              />
            </div>
          </div>

          {/* Presets */}
          <div>
            <div className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-2">
              Quick Options
            </div>
            <div className="grid grid-cols-2 gap-2">
              {stipendPresets.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => setSalary(preset.value)}
                  className={`p-2.5 rounded-xl text-xs font-medium border text-center transition-none cursor-pointer ${
                    salary === preset.value
                      ? 'bg-blue-50 text-[#2563EB] border-[#2563EB]'
                      : 'bg-white text-[#1A1A1A] border-[#E5E5E5] hover:bg-gray-50'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setStep(2)}
            className="w-full h-11 bg-[#2563EB] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer hover:bg-blue-700 transition-colors mt-2"
          >
            <span>Continue to Expenses</span>
            <ArrowRight className="size-4" />
          </button>
        </div>
      )}

      {/* STEP 2: LIVING NEEDS & SPONSORSHIP BUILDER */}
      {/* STEP 2: LIVING EXPENSES */}
      {step === 2 && (
        <div className="bg-white rounded-2xl p-5 border border-[#E5E5E5] flex flex-col gap-4 shadow-sm">
          <div>
            <div className="text-base font-semibold text-[#1A1A1A]">
              Living Expenses
            </div>
            <div className="text-xs text-[#6B7280] mt-1 leading-relaxed">
              Estimate your monthly living costs. If your parents pay for things like rent or electricity, tap <strong className="text-[#16A34A]">"Paid by Parents"</strong> so your personal savings stay intact.
            </div>
          </div>

          {/* Itemized List */}
          <div className="flex flex-col gap-2.5">
            {needsItems.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl border border-[#E5E5E5] bg-[#F5F5F5] flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#1A1A1A]">{item.name}</span>
                  <button
                    type="button"
                    onClick={() => handleToggleSponsorship(item.id)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg font-medium border cursor-pointer ${
                      item.sponsored
                        ? 'bg-green-100 text-[#16A34A] border-green-300'
                        : 'bg-white text-[#6B7280] border-[#E5E5E5]'
                    }`}
                  >
                    {item.sponsored ? '🤝 Paid by Parents' : '👤 I Pay This'}
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-[#6B7280]">
                    {item.sponsored ? 'Paid for you (Free)' : 'Deducted from your income'}
                  </span>
                  <div className="flex items-center">
                    <span className="text-xs text-[#6B7280] mr-1">₹</span>
                    <input
                      type="number"
                      inputMode="numeric"
                      value={item.amount}
                      onChange={(e) => handleUpdateItemAmount(item.id, e.target.value)}
                      className="w-24 text-xs font-semibold text-[#1A1A1A] bg-white border border-[#E5E5E5] rounded-lg px-2 py-1 text-right focus:outline-none focus:border-[#2563EB]"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="bg-blue-50/60 p-3.5 rounded-xl border border-blue-200 flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#6B7280]">Total Living Cost:</span>
              <strong className="text-[#1A1A1A]">₹{totalLivingCost.toLocaleString('en-IN')}</strong>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#16A34A]">Paid by Parents:</span>
              <strong className="text-[#16A34A]">₹{sponsoredNeeds.toLocaleString('en-IN')}</strong>
            </div>
            <div className="flex items-center justify-between text-xs pt-1 border-t border-blue-200 font-medium">
              <span className="text-[#2563EB]">You Pay:</span>
              <span className="text-[#2563EB] font-bold">₹{outOfPocketNeeds.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-1">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="h-11 px-4 rounded-xl border border-[#E5E5E5] text-[#1A1A1A] text-xs font-semibold flex items-center gap-1 cursor-pointer hover:bg-gray-50"
            >
              <ArrowLeft className="size-4" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="flex-1 h-11 bg-[#2563EB] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer hover:bg-blue-700 transition-colors"
            >
              <span>Continue to Fun & Leisure</span>
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: FUN & LEISURE */}
      {step === 3 && (
        <div className="bg-white rounded-2xl p-5 border border-[#E5E5E5] flex flex-col gap-4 shadow-sm">
          <div>
            <div className="text-base font-semibold text-[#1A1A1A]">
              Fun & Leisure Budget
            </div>
            <div className="text-xs text-[#6B7280] mt-1 leading-relaxed">
              Set aside money for weekend outings, movies, dining, and hobbies so you can enjoy yourself without guilt.
            </div>
          </div>

          {/* Interactive Slider */}
          <div className="flex flex-col gap-3 py-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">
                Share of Income
              </span>
              <span className="text-lg font-bold text-[#2563EB]">{leisurePct}%</span>
            </div>

            <input
              type="range"
              min="5"
              max="40"
              step="5"
              value={leisurePct}
              onChange={(e) => setLeisurePct(Number(e.target.value))}
              className="w-full accent-[#2563EB] cursor-pointer"
            />

            <div className="flex justify-between text-[10px] text-[#6B7280]">
              <span>5% (Frugal)</span>
              <span>20% (Recommended)</span>
              <span>40% (Relaxed)</span>
            </div>
          </div>

          {/* Insight Card */}
          <div className="bg-[#F5F5F5] rounded-xl p-4 border border-[#E5E5E5] flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[#2563EB] font-medium text-xs">
              <Coffee className="size-4" />
              <span>Your Monthly Fun Budget</span>
            </div>
            <div className="text-2xl font-bold text-[#1A1A1A]">
              ₹{guiltFreeAmount.toLocaleString('en-IN')}{' '}
              <span className="text-xs text-[#6B7280] font-normal">/ month</span>
            </div>
            <div className="text-xs text-[#6B7280] leading-relaxed pt-1 border-t border-[#E5E5E5]">
              That gives you <strong className="text-[#1A1A1A]">~₹{weekendMicroBudget.toLocaleString('en-IN')}</strong> per weekend. Staying within this budget protects your goal savings.
            </div>
          </div>

          <div className="flex items-center gap-2 mt-1">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="h-11 px-4 rounded-xl border border-[#E5E5E5] text-[#1A1A1A] text-xs font-semibold flex items-center gap-1 cursor-pointer hover:bg-gray-50"
            >
              <ArrowLeft className="size-4" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={() => setStep(4)}
              className="flex-1 h-11 bg-[#2563EB] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer hover:bg-blue-700 transition-colors"
            >
              <span>Review Summary</span>
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: SALARY DATE & SUMMARY */}
      {step === 4 && (
        <div className="bg-white rounded-2xl p-5 border border-[#E5E5E5] flex flex-col gap-4 shadow-sm">
          <div>
            <div className="text-base font-semibold text-[#1A1A1A]">
              Salary Date & Summary
            </div>
            <div className="text-xs text-[#6B7280] mt-1 leading-relaxed">
              Choose the day of the month your income arrives. Your monthly budget resets on this day.
            </div>
          </div>

          {/* Cycle Day Picker */}
          <div>
            <div className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-2">
              Salary Arrival Day
            </div>
            <div className="grid grid-cols-5 gap-1.5">
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
            <div className="text-[11px] text-[#6B7280] mt-1.5">
              Month runs from the {cycleDay}th to the {Number(cycleDay) - 1 || 28}th.
            </div>
          </div>

          {/* Budget Breakdown */}
          <div className="bg-[#F5F5F5] rounded-xl p-4 border border-[#E5E5E5] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">
                Monthly Breakdown
              </span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                  savingsRate >= 40
                    ? 'bg-green-100 text-[#16A34A] border border-green-300'
                    : 'bg-blue-100 text-[#2563EB] border border-blue-300'
                }`}
              >
                {savingsRate >= 40 ? 'Great Savings Rate' : 'Balanced Budget'}
              </span>
            </div>

            {/* 3-Way Proportional Bar */}
            <div className="w-full h-3 rounded-full bg-[#E5E5E5] overflow-hidden flex">
              <div
                style={{ width: `${Math.min(100, needsRate)}%` }}
                className="bg-[#1A1A1A] h-full"
                title={`Expenses: ${needsRate}%`}
              />
              <div
                style={{ width: `${Math.min(100, leisurePct)}%` }}
                className="bg-[#2563EB] h-full"
                title={`Leisure: ${leisurePct}%`}
              />
              <div
                style={{ width: `${Math.min(100, savingsRate)}%` }}
                className="bg-[#16A34A] h-full"
                title={`Savings: ${savingsRate}%`}
              />
            </div>

            {/* Legend */}
            <div className="grid grid-cols-3 gap-1 pt-1 text-center">
              <div>
                <div className="text-[10px] text-[#6B7280]">You Pay</div>
                <div className="text-xs font-semibold text-[#1A1A1A]">₹{outOfPocketNeeds.toLocaleString('en-IN')}</div>
                <div className="text-[10px] text-[#6B7280]">({needsRate}%)</div>
              </div>
              <div>
                <div className="text-[10px] text-[#6B7280]">Fun Budget</div>
                <div className="text-xs font-semibold text-[#2563EB]">₹{guiltFreeAmount.toLocaleString('en-IN')}</div>
                <div className="text-[10px] text-[#6B7280]">({leisurePct}%)</div>
              </div>
              <div>
                <div className="text-[10px] text-[#6B7280]">Goal Savings</div>
                <div className="text-xs font-bold text-[#16A34A]">₹{projectedGoalSavings.toLocaleString('en-IN')}</div>
                <div className="text-[10px] text-[#16A34A] font-semibold">({savingsRate}%)</div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-1">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="h-11 px-4 rounded-xl border border-[#E5E5E5] text-[#1A1A1A] text-xs font-semibold flex items-center gap-1 cursor-pointer hover:bg-gray-50"
            >
              <ArrowLeft className="size-4" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={handleFinish}
              className="flex-1 h-11 bg-[#2563EB] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer hover:bg-blue-700 transition-colors"
            >
              <Check className="size-4" />
              <span>Save Budget</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
