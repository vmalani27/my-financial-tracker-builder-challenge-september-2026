import React from 'react';
import { Target, Wallet, ArrowUpRight, CheckCircle2, AlertTriangle, Calendar, CalendarCheck, Plus, ShieldCheck, Landmark, ChevronRight } from 'lucide-react';
import { GoalCard } from '../components/GoalCard';
import { EmptyState } from '../components/EmptyState';
import { FloatingActions } from '../components/FloatingActions';

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
  onNavigateToSpends,
  onNavigateToAccounts,
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

  // Time-gate condition: Only surface during the last 4 days of the active budget cycle
  // (e.g., if cycle resets on 8th, active 4th through 8th: daysRemaining <= 4 or rollover due)
  const isLockWindowActive = Boolean(
    cycle && (cycle.isLockWindowActive ?? (cycle.daysRemaining <= 4 || cycle.isRolloverDue))
  );

  return (
    <div className="flex flex-col gap-4 pb-36">
      {/* 1. Header: Current Month & Cycle Info */}
      <div className="flex items-center justify-between px-0.5">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{currentMonthYear}</h1>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
            <span>{cycle.cycleLabel}</span>
            <span>•</span>
            <span>Day {cycle.currentDay} of {cycle.totalDays}</span>
          </div>
        </div>
      </div>

      {/* 2. Main Hero Card: Clean, High-End Mobile Financial Widget */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col gap-4">
        {/* Top: Left-aligned Allowance Left to Spend */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Allowance Left to Spend
            </span>
            {budgetUsagePct > 0 && (
              <span className="text-xs font-medium text-slate-400 tabular-nums">
                {budgetUsagePct}% used
              </span>
            )}
          </div>

          <div className={`text-4xl font-semibold tracking-tight tabular-nums mt-1 ${isOverBudget ? 'text-red-600' : 'text-slate-900'}`}>
            {isOverBudget
              ? `-₹${Math.abs(budgetRemaining).toLocaleString('en-IN')}`
              : `₹${budgetRemaining.toLocaleString('en-IN')}`}
          </div>

          {/* Minimal Hairline Progress Bar */}
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-3">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isOverBudget ? 'bg-red-500' : budgetUsagePct > 80 ? 'bg-amber-500' : 'bg-slate-900'
              }`}
              style={{ width: `${Math.min(100, (spentThisMonth / Math.max(1, monthlyBudget)) * 100)}%` }}
            />
          </div>
        </div>

        {/* Split Stats: Cash in Hand & Saved to Corpus */}
        <div className="grid grid-cols-2 divide-x divide-slate-100 pt-3 border-t border-slate-100">
          <div className="flex flex-col pr-3">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Cash in Hand</span>
            <span className="text-base font-semibold text-slate-700 tracking-tight tabular-nums mt-0.5">
              ₹{monthlySavingsPool.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="flex flex-col items-end pl-3 text-right">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Saved to Corpus</span>
            <span className="text-base font-semibold text-emerald-600 tracking-tight tabular-nums mt-0.5">
              +₹{projectedCorpusSavings.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Contextual Month-End Reminder Prompt Card (Only surfaces during the last 4 days of the active cycle) */}
      {isLockWindowActive && onOpenLockCycle && (
        <div className="bg-slate-50/90 border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-xs">
                <CalendarCheck className="size-4" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900 tracking-tight">
                  {cycle.daysRemaining === 0 ? 'Month Cycle Ends Today' : `Cycle Ends in ${cycle.daysRemaining} Days`}
                </div>
                <div className="text-[11px] text-slate-500">
                  Review & lockdown your monthly cycle
                </div>
              </div>
            </div>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/70 shrink-0">
              Cycle Ending
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Did you pay rent, utilities, credit cards, or make any large purchases that aren't recorded? Add any missing spends before wrapping up this cycle.
          </p>

          <div className="flex items-center gap-2 pt-0.5">
            <button
              type="button"
              onClick={onOpenAddSpend}
              className="flex-1 h-9 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
            >
              <Plus className="size-3.5 text-slate-500" />
              <span>Add Missing Spend</span>
            </button>
            <button
              type="button"
              onClick={onOpenLockCycle}
              className="flex-1 h-9 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
            >
              <ShieldCheck className="size-3.5" />
              <span>Settle & Lock Month</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. Recent Activity Section (On top!) */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-0.5">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Recent Activity
          </span>
          {spends.length > 0 && onNavigateToSpends && (
            <button
              type="button"
              onClick={onNavigateToSpends}
              className="text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
            >
              See all
            </button>
          )}
        </div>

        {recentSpends.length === 0 ? (
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
            <span className="text-xs text-slate-400">No spends recorded this cycle</span>
            <button
              type="button"
              onClick={onOpenAddSpend}
              className="text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Plus className="size-3" />
              <span>Log Spend</span>
            </button>
          </div>
        ) : (
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
        )}
      </div>

      {/* 5. Active Goals Section (Then goals!) */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-0.5">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Your Goals
          </span>
          {hasGoals && onNavigateToGoals && (
            <button
              type="button"
              onClick={onNavigateToGoals}
              className="text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
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

      {/* 6. Total Corpus Shortcut (Below goals as a clean, low-profile widget) */}
      <div className="flex flex-col gap-2">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1">
          Total Corpus
        </div>
        <div
          onClick={() => {
            if (onNavigateToAccounts) {
              onNavigateToAccounts();
            } else {
              window.location.href = '/settings?section=accounts';
            }
          }}
          className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between hover:bg-slate-50/70 transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-slate-100 border border-slate-200/60 text-slate-700 flex items-center justify-center shrink-0">
              <Landmark className="size-4" />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900 tracking-tight flex items-center gap-2">
                <span className="tabular-nums">₹{totalCorpus.toLocaleString('en-IN')}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-600 border border-slate-200/70">
                  {accounts.length} {accounts.length === 1 ? 'account' : 'accounts'}
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Total net worth across vaults
              </div>
            </div>
          </div>
          <ChevronRight className="size-4 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all shrink-0" />
        </div>
      </div>

      {/* Floating Action Buttons for Spend, Can I Afford, Gift/Cash, and Vault Transfer */}
      <FloatingActions
        onOpenAddSpend={onOpenAddSpend}
        onOpenCanIAfford={onOpenCanIAfford}
        onOpenExtraCash={onOpenExtraCash}
        onOpenTransfer={onOpenTransfer}
      />
    </div>
  );
}
