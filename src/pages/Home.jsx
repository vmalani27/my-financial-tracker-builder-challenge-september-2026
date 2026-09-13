import React from 'react';
import { Target, Wallet, ArrowUpRight, CheckCircle2, AlertTriangle, Calendar, CalendarCheck, Plus, ShieldCheck } from 'lucide-react';
import { GoalCard } from '../components/GoalCard';
import { EmptyState } from '../components/EmptyState';
import { FloatingActions } from '../components/FloatingActions';
import { CorpusSummary } from '../components/CorpusSummary';

export function Home({
  cycle,
  settings,
  monthlyBudget: propMonthlyBudget,
  spentThisMonth: propSpentThisMonth,
  budgetRemaining: propBudgetRemaining,
  projectedCorpusSavings: propProjectedCorpusSavings,
  totalCorpus: propTotalCorpus,
  monthlySavingsPool = 0,
  projectedSavings = 0,
  needsSpent = 0,
  totalIncome = 0,
  goals = [],
  spends = [],
  accounts = [],
  totalNetWorth = 0,
  onOpenAddSpend,
  onOpenDepositGoal,
  onOpenCanIAfford,
  onOpenExtraCash,
  onOpenTransfer,
  onOpenLockCycle,
  onNavigateToGoals,
}) {
  const hasGoals = goals.length > 0;
  const recentSpends = spends.slice(0, 3);

  // Derived budget & corpus values with fallbacks
  const monthlyIncome = Number(settings?.monthlyIncome || settings?.baseSalary) || 75000;
  const monthlyBudget = propMonthlyBudget || Number(settings?.monthlyBudget || ((settings?.essentialNeedsTarget || 0) + (settings?.guiltFreeBudget || 0))) || 35000;
  const spentThisMonth = propSpentThisMonth !== undefined ? propSpentThisMonth : needsSpent;
  const budgetRemaining = propBudgetRemaining !== undefined ? propBudgetRemaining : (monthlyBudget - spentThisMonth);
  const projectedCorpusSavings = propProjectedCorpusSavings !== undefined ? propProjectedCorpusSavings : Math.max(0, monthlyIncome - Math.max(spentThisMonth, monthlyBudget));
  const totalCorpus = propTotalCorpus || totalNetWorth;

  const isOverBudget = budgetRemaining < 0;
  const budgetUsagePct = monthlyBudget > 0 ? Math.min(100, Math.round((spentThisMonth / monthlyBudget) * 100)) : 0;
  const remainingPct = Math.max(0, 100 - budgetUsagePct);

  // Format current financial month and year (e.g. "September 2026")
  const currentMonthYear = new Date().toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  });

  const isEndOfMonth = Boolean(
    cycle && (cycle.daysRemaining <= 4 || cycle.isRolloverDue || (typeof window !== 'undefined' && window.location.search.includes('settle')))
  );

  return (
    <div className="flex flex-col gap-4 pb-36">
      {/* 1. Header: Current Month & Cycle Info */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h1 className="text-xl font-bold text-[#1A1A1A] tracking-tight">{currentMonthYear}</h1>
          <div className="flex items-center gap-1.5 text-[11px] text-[#6B7280] mt-1">
            <span className="font-medium text-[#1A1A1A]">Cycle: {cycle.cycleLabel}</span>
            <span className="text-[#9CA3AF]">•</span>
            <span>Day {cycle.currentDay} of {cycle.totalDays}</span>
            <span className="text-[#9CA3AF]">•</span>
            <span className="text-[#2563EB] font-medium">{cycle.daysRemaining}d left</span>
          </div>
        </div>
      </div>

      {/* 2. Main Hero Card: Clean, Glanceable Financial Answer */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col gap-4">
        {/* Top: Primary Answer: "How much allowance is left / can I spend?" */}
        <div className="flex flex-col items-center text-center">
          <span className="text-xs font-medium tracking-wider text-slate-400 uppercase">
            Allowance Left to Spend
          </span>
          <div className={`text-4xl font-semibold tracking-tight tabular-nums mt-1 ${isOverBudget ? 'text-red-600' : 'text-slate-900'}`}>
            {isOverBudget
              ? `-₹${Math.abs(budgetRemaining).toLocaleString('en-IN')}`
              : `₹${budgetRemaining.toLocaleString('en-IN')}`}
          </div>
          <span className="text-xs text-slate-500 tabular-nums mt-1">
            {isOverBudget
              ? `Exceeded monthly budget by ₹${Math.abs(budgetRemaining).toLocaleString('en-IN')}`
              : `₹${spentThisMonth.toLocaleString('en-IN')} spent of ₹${monthlyBudget.toLocaleString('en-IN')} budget`}
          </span>
        </div>

        {/* Minimal Hairline Progress Bar */}
        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isOverBudget ? 'bg-red-500' : budgetUsagePct > 80 ? 'bg-amber-500' : 'bg-[#2563EB]'
            }`}
            style={{ width: `${Math.min(100, (spentThisMonth / Math.max(1, monthlyBudget)) * 100)}%` }}
          />
        </div>

        {/* Minimalist Inset Row: Cash in Hand & Saved to Corpus */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
          <div className="flex flex-col">
            <span className="text-[11px] font-medium tracking-wider text-slate-400 uppercase">Cash in Hand</span>
            <span className="text-base font-semibold text-slate-800 tracking-tight tabular-nums mt-0.5">
              ₹{monthlySavingsPool.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="flex flex-col text-right">
            <span className="text-[11px] font-medium tracking-wider text-slate-400 uppercase">Saved to Corpus</span>
            <span className="text-base font-semibold text-emerald-600 tracking-tight tabular-nums mt-0.5">
              +₹{projectedCorpusSavings.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* Contextual Month-End Reminder Prompt Card (Only shows towards end of cycle) */}
      {isEndOfMonth && onOpenLockCycle && (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/90 rounded-2xl p-4 shadow-xs flex flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <CalendarCheck className="size-4" />
              </div>
              <div>
                <div className="text-sm font-bold text-[#1A1A1A]">
                  {cycle.daysRemaining === 0 ? 'Month Cycle Ends Today' : `Month Cycle Ends in ${cycle.daysRemaining} Days`}
                </div>
                <div className="text-[11px] text-amber-800 font-medium">
                  Review & lockdown your monthly logs
                </div>
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100/90 text-amber-900 border border-amber-300/80 shrink-0">
              Month-End
            </span>
          </div>

          <p className="text-xs text-[#4B5563] leading-relaxed">
            Did you pay rent, electricity, credit cards, or make any large purchases that aren't recorded? Add any missing spends before finalizing this month.
          </p>

          <div className="flex items-center gap-2 pt-0.5">
            <button
              type="button"
              onClick={onOpenAddSpend}
              className="flex-1 h-9 rounded-xl text-xs font-semibold bg-white border border-gray-200/90 text-[#1A1A1A] hover:bg-gray-50 flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-2xs"
            >
              <Plus className="size-3.5 text-[#2563EB]" />
              <span>Add Missing Spend</span>
            </button>
            <button
              type="button"
              onClick={onOpenLockCycle}
              className="flex-1 h-9 rounded-xl text-xs font-semibold bg-[#2563EB] hover:bg-blue-700 text-white flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-2xs"
            >
              <ShieldCheck className="size-3.5" />
              <span>Settle & Lock Month</span>
            </button>
          </div>
        </div>
      )}

      {/* Account Corpus Breakdown */}
      <CorpusSummary
        accounts={accounts}
        totalCorpus={totalCorpus}
        totalNetWorth={totalNetWorth}
        onOpenTransfer={onOpenTransfer}
      />

      {/* Floating Action Buttons for Spend, Can I Afford, Gift/Cash, and Vault Transfer */}
      <FloatingActions
        onOpenAddSpend={onOpenAddSpend}
        onOpenCanIAfford={onOpenCanIAfford}
        onOpenExtraCash={onOpenExtraCash}
        onOpenTransfer={onOpenTransfer}
      />

      {/* Active Goals Section */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="text-xs font-medium text-[#6B7280] uppercase tracking-wide">
            Your Goals
          </div>
          {hasGoals && (
            <button
              type="button"
              onClick={onNavigateToGoals}
              className="text-xs font-medium text-[#2563EB]"
            >
              See all
            </button>
          )}
        </div>

        {!hasGoals ? (
          <EmptyState
            icon={Target}
            title="No goals created yet"
            subtitle="Set up a goal for purchases or savings to begin tracking."
            actionText="Create Goal"
            onAction={onNavigateToGoals}
          />
        ) : (
          <div className="flex flex-col gap-3">
            {goals.slice(0, 3).map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                accounts={accounts}
                onSelectGoal={() => (onOpenDepositGoal ? onOpenDepositGoal(goal) : onOpenAddSpend(goal.id))}
                onDeposit={() => (onOpenDepositGoal ? onOpenDepositGoal(goal) : onOpenAddSpend(goal.id))}
              />
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity Section */}
      {recentSpends.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="text-[11px] font-medium tracking-wider text-slate-400 uppercase">
            Recent Activity
          </div>
          <div className="bg-white rounded-2xl border border-slate-200/80 divide-y divide-slate-100 shadow-xs overflow-hidden">
            {recentSpends.map((spend) => (
              <div key={spend.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                <div className="min-w-0 pr-2">
                  <div className="text-sm font-medium text-slate-900 truncate">
                    {spend.note || spend.category}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-medium border ${
                        spend.type === 'goal'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                          : spend.type === 'transfer'
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200/60'
                          : 'bg-slate-50 text-slate-600 border-slate-200/60'
                      }`}
                    >
                      {spend.type === 'goal' ? 'Goal Deposit' : spend.type === 'transfer' ? 'Transfer' : 'Expense'}
                    </span>
                    <span>•</span>
                    <span>{spend.category}</span>
                    <span>•</span>
                    <span>
                      {new Date(spend.date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  </div>
                </div>
                <div
                  className={`text-sm font-semibold tabular-nums shrink-0 ${
                    spend.type === 'goal'
                      ? 'text-emerald-600'
                      : 'text-slate-900'
                  }`}
                >
                  {spend.type === 'goal' ? '+' : '-'}₹{spend.amount.toLocaleString('en-IN')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
