import { useState, useEffect, useRef } from 'react';
import {
  fetchVaultData,
  saveVaultData,
  exportVaultSnapshot,
  importVaultSnapshot,
  checkVaultStatus,
} from '../services/vaultStorage';

const STORAGE_KEY = 'groww_financial_goals_v2';

const DEFAULT_SETTINGS = {
  monthlyIncome: 0,
  baseSalary: 0, // alias for backwards compatibility
  monthlyBudget: 0, // designated monthly spending budget
  essentialNeedsTarget: 0,
  guiltFreeBudget: 0,
  cycleStartDay: 1,
};

export const DEFAULT_ACCOUNTS = [
  {
    id: 'acc-1',
    name: 'Primary Account (UPI)',
    type: 'primary',
    balance: 0,
    isPrimary: true,
  },
];

const INITIAL_GOALS = [];

const INITIAL_SPENDS = [];

const INITIAL_INCOME = [];

// Helper to compute 9th-to-8th cycle dates
export function computeCycle(startDay = 9, refDate = new Date()) {
  const year = refDate.getFullYear();
  const month = refDate.getMonth();
  const day = refDate.getDate();

  let startYear = year;
  let startMonth = month;
  if (day < startDay) {
    if (month === 0) {
      startYear = year - 1;
      startMonth = 11;
    } else {
      startMonth = month - 1;
    }
  }

  const startDate = new Date(startYear, startMonth, startDay);
  const endYear = startMonth === 11 ? startYear + 1 : startYear;
  const endMonth = startMonth === 11 ? 0 : startMonth + 1;
  const endDate = new Date(endYear, endMonth, startDay - 1, 23, 59, 59);

  const msPerDay = 86400000;
  const totalDays = Math.round((endDate.getTime() - startDate.getTime()) / msPerDay);
  const elapsedDays = Math.floor((refDate.getTime() - startDate.getTime()) / msPerDay) + 1;
  const currentDay = Math.min(totalDays, Math.max(1, elapsedDays));
  const daysRemaining = Math.max(0, totalDays - currentDay);
  const isRolloverDue = refDate >= new Date(endDate.getTime() - msPerDay);
  // Time-gate condition: Active during the last 4 days of the cycle (e.g. 4th through 8th when ending on 8th)
  const isLockWindowActive = daysRemaining <= 4 || isRolloverDue;

  const startStr = startDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  const endStr = endDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

  return {
    cycleLabel: `${startStr} – ${endStr}`,
    currentDay,
    totalDays,
    daysRemaining,
    isRolloverDue,
    isLockWindowActive,
  };
}

export function useGoals() {
  const [settings, setSettings] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY + '_settings');
      if (stored) {
        const parsed = JSON.parse(stored);
        const income = parsed.monthlyIncome || parsed.baseSalary || DEFAULT_SETTINGS.monthlyIncome;
        const budget = parsed.monthlyBudget || ((parsed.essentialNeedsTarget || 0) + (parsed.guiltFreeBudget || 0)) || DEFAULT_SETTINGS.monthlyBudget;
        return {
          ...DEFAULT_SETTINGS,
          ...parsed,
          monthlyIncome: income,
          baseSalary: income,
          monthlyBudget: budget,
        };
      }
    } catch (e) {}
    return DEFAULT_SETTINGS;
  });

  const [goals, setGoals] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY + '_goals');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return INITIAL_GOALS;
  });

  const [spends, setSpends] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY + '_spends');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return INITIAL_SPENDS;
  });

  const [incomes, setIncomes] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY + '_incomes');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return INITIAL_INCOME;
  });

  const [accounts, setAccounts] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY + '_accounts');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return DEFAULT_ACCOUNTS;
  });

  // Cloud Vault Sync State
  const [cloudStatus, setCloudStatus] = useState('connecting'); // 'connecting' | 'synced' | 'syncing' | 'offline'
  const [isCloudLoaded, setIsCloudLoaded] = useState(false);
  const isInitialMount = useRef(true);

  // 1. Initial Load: Fetch latest state from S3 Cloud Vault
  useEffect(() => {
    let isMounted = true;
    async function initVault() {
      try {
        const { data, source } = await fetchVaultData();
        if (!isMounted) return;
        if (data) {
          if (data.settings) setSettings(data.settings);
          if (Array.isArray(data.goals)) setGoals(data.goals);
          if (Array.isArray(data.spends)) setSpends(data.spends);
          if (Array.isArray(data.incomes)) setIncomes(data.incomes);
          if (Array.isArray(data.accounts) && data.accounts.length > 0) setAccounts(data.accounts);
        }
        setCloudStatus(source === 's3' ? 'synced' : 'offline');
      } catch (err) {
        if (isMounted) setCloudStatus('offline');
      } finally {
        if (isMounted) setIsCloudLoaded(true);
      }
    }
    initVault();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Persist state locally and auto-sync to S3 Cloud Vault (debounced)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (!isCloudLoaded) return;

    setCloudStatus('syncing');
    const timer = setTimeout(async () => {
      const res = await saveVaultData({
        settings,
        goals,
        spends,
        incomes,
        accounts,
      });
      setCloudStatus(res.source === 's3' ? 'synced' : 'offline');
    }, 450);

    return () => clearTimeout(timer);
  }, [settings, goals, spends, incomes, accounts, isCloudLoaded]);

  // Manual trigger to force cloud sync
  const syncWithCloudVault = async () => {
    setCloudStatus('syncing');
    const res = await saveVaultData({
      settings,
      goals,
      spends,
      incomes,
      accounts,
    });
    setCloudStatus(res.source === 's3' ? 'synced' : 'offline');
    return res;
  };

  // Primary Operating Account & Net Worth
  const primaryAccount =
    accounts.find((a) => a.isPrimary) ||
    accounts[0] || {
      id: 'acc-1',
      name: 'Primary Checking',
      type: 'primary',
      balance: 0,
    };

  const totalCorpus = accounts.reduce((sum, a) => sum + (Number(a.balance) || 0), 0);
  const totalNetWorth = totalCorpus;

  // Split Percentage Integrity
  const totalSplitPercentage = goals.reduce((sum, g) => sum + (Number(g.splitPercentage) || 0), 0);
  const unallocatedSplit = Math.max(0, 100 - totalSplitPercentage);
  const splitStatus =
    totalSplitPercentage === 100
      ? 'balanced'
      : totalSplitPercentage > 100
      ? 'over'
      : 'under';

  // Compute Cycle Info (9th of month)
  const cycle = computeCycle(settings.cycleStartDay);

  // Compute Pools
  const monthlyIncome = Number(settings.monthlyIncome || settings.baseSalary) || 75000;
  const baseSalary = monthlyIncome;
  const monthlyBudget = Number(settings.monthlyBudget || ((settings.essentialNeedsTarget || 0) + (settings.guiltFreeBudget || 0))) || 35000;
  const needsBudget = monthlyBudget;
  const guiltFreeBudget = monthlyBudget;

  // Extra inflows (Gifts, pocket money, bonus) outside base salary
  const extraInflows = incomes
    .filter((inc) => inc.source !== 'salary')
    .reduce((sum, inc) => sum + inc.amount, 0);

  const totalIncome = monthlyIncome + extraInflows;

  // Expenses spent this cycle (non-goal, non-transfer)
  const spentThisMonth = spends
    .filter((s) => s.type === 'need' || s.type === 'leisure' || s.type === 'expense')
    .reduce((sum, s) => sum + s.amount, 0);

  const budgetRemaining = monthlyBudget - spentThisMonth;

  // Backward compatibility mappings for existing screens
  const needsSpentSelf = spentThisMonth;
  const needsSpentParents = 0;
  const needsSpent = spentThisMonth;

  const leisureSpentSelf = 0;
  const leisureSpentParents = 0;
  const leisureSpent = 0;

  const selfTotalSpent = spentThisMonth;
  const parentsTotalSpent = 0;

  const goalDeposits = spends
    .filter((s) => s.type === 'goal')
    .reduce((sum, s) => sum + s.amount, 0);

  // Available Cash (Live unallocated cash currently in hand)
  const availableCash = Math.max(0, totalIncome - spentThisMonth - goalDeposits);
  const monthlySavingsPool = availableCash;

  // Projected Month-End Savings added to Corpus:
  // If user stays within monthlyBudget, remaining income goes into Corpus/Goals.
  // If user overspends monthlyBudget, the overspend directly reduces this addition.
  const projectedCorpusSavings = Math.max(0, totalIncome - Math.max(spentThisMonth, monthlyBudget) - goalDeposits);
  const projectedSavings = projectedCorpusSavings;

  const guiltFreeRemaining = budgetRemaining;
  const needsRemaining = budgetRemaining;
  const totalSavedAcrossGoals = goals.reduce((sum, g) => sum + (g.savedAmount || 0), 0);

  // 1. Add Expense (deducts from operating cash and logs against monthly budget)
  const addSpend = ({
    amount,
    type = 'expense',
    category = 'Other',
    note = '',
    accountId,
  }) => {
    const numAmount = Number(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      return { success: false, error: 'Please enter a valid amount' };
    }

    if (numAmount > availableCash) {
      return {
        success: false,
        error: `Cannot spend more than available cash (₹${availableCash.toLocaleString('en-IN')} available)`,
      };
    }

    const sourceAccountId = accountId || primaryAccount.id;
    const sourceAcc = accounts.find((a) => a.id === sourceAccountId) || primaryAccount;

    // Deduct from account balance
    setAccounts((prev) =>
      prev.map((acc) =>
        acc.id === sourceAccountId
          ? { ...acc, balance: Math.max(0, (acc.balance || 0) - numAmount) }
          : acc
      )
    );

    const newSpend = {
      id: `sp-${Date.now()}`,
      amount: numAmount,
      type: type === 'need' ? 'need' : 'leisure',
      category,
      paidBy: 'self',
      accountId: sourceAccountId,
      accountName: sourceAcc.name,
      note: (note || '').trim(),
      date: new Date().toISOString(),
    };

    setSpends((prev) => [newSpend, ...prev]);
    return { success: true };
  };

  // 2. Direct Goal Contribution (Deposits money into goal pot with date)
  const contributeToGoal = ({ goalId, amount, note = '', fromAccountId }) => {
    const numAmount = Number(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      return { success: false, error: 'Please enter a valid amount' };
    }
    if (!goalId) {
      return { success: false, error: 'Please select a target' };
    }

    if (numAmount > availableCash) {
      return {
        success: false,
        error: `Deposit exceeds available cash (₹${availableCash.toLocaleString('en-IN')} available)`,
      };
    }

    const matchedGoal = goals.find((g) => g.id === goalId);
    if (!matchedGoal) {
      return { success: false, error: 'Target not found' };
    }

    const sourceAccId = fromAccountId || primaryAccount.id;
    const targetAccId = matchedGoal.accountId || primaryAccount.id;
    const sourceAcc = accounts.find((a) => a.id === sourceAccId) || primaryAccount;
    const targetAcc = accounts.find((a) => a.id === targetAccId) || primaryAccount;

    // Move balance from source account to destination vault
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === sourceAccId && sourceAccId !== targetAccId) {
          return { ...acc, balance: Math.max(0, (acc.balance || 0) - numAmount) };
        }
        if (acc.id === targetAccId && sourceAccId !== targetAccId) {
          return { ...acc, balance: (acc.balance || 0) + numAmount };
        }
        return acc;
      })
    );

    const contributionRecord = {
      id: `sp-${Date.now()}`,
      amount: numAmount,
      type: 'goal',
      category: matchedGoal.name,
      goalId,
      goalName: matchedGoal.name,
      fromAccountId: sourceAccId,
      fromAccountName: sourceAcc.name,
      toAccountId: targetAccId,
      toAccountName: targetAcc.name,
      note: (note || '').trim() || `Deposit to ${matchedGoal.name}`,
      date: new Date().toISOString(),
    };

    setGoals((prev) =>
      prev.map((g) =>
        g.id === goalId
          ? {
              ...g,
              savedAmount: (g.savedAmount || 0) + numAmount,
              spendsCount: (g.spendsCount || 0) + 1,
            }
          : g
      )
    );

    setSpends((prev) => [contributionRecord, ...prev]);
    return { success: true };
  };

  // 2B. Internal Transfer Between Accounts (To-and-Fro)
  const transferBetweenAccounts = ({ fromAccountId, toAccountId, amount, note = '' }) => {
    const numAmount = Number(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      return { success: false, error: 'Please enter a valid amount' };
    }
    if (!fromAccountId || !toAccountId) {
      return { success: false, error: 'Please select both accounts' };
    }
    if (fromAccountId === toAccountId) {
      return { success: false, error: 'Source and destination accounts must be different' };
    }

    const sourceAcc = accounts.find((a) => a.id === fromAccountId);
    const destAcc = accounts.find((a) => a.id === toAccountId);
    if (!sourceAcc || !destAcc) {
      return { success: false, error: 'Account not found' };
    }

    if (numAmount > (sourceAcc.balance || 0)) {
      return {
        success: false,
        error: `Insufficient balance in ${sourceAcc.name} (₹${(sourceAcc.balance || 0).toLocaleString('en-IN')} available)`,
      };
    }

    // Update balances
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === fromAccountId) {
          return { ...acc, balance: Math.max(0, (acc.balance || 0) - numAmount) };
        }
        if (acc.id === toAccountId) {
          return { ...acc, balance: (acc.balance || 0) + numAmount };
        }
        return acc;
      })
    );

    // Record transfer in activity log
    const transferRecord = {
      id: `sp-${Date.now()}`,
      amount: numAmount,
      type: 'transfer',
      category: 'Transfer',
      fromAccountId,
      fromAccountName: sourceAcc.name,
      toAccountId,
      toAccountName: destAcc.name,
      note: (note || '').trim() || `Transfer to ${destAcc.name}`,
      date: new Date().toISOString(),
    };

    setSpends((prev) => [transferRecord, ...prev]);
    return { success: true };
  };

  // 3. Add Extra Cash / Gift / Pocket Money (with Splitter)
  const addExtraCash = ({ amount, source = 'gift', note = '', splits = {} }) => {
    const numAmount = Number(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      return { success: false, error: 'Please enter a valid amount' };
    }

    const newIncome = {
      id: `inc-${Date.now()}`,
      amount: numAmount,
      source,
      note: note.trim() || 'Extra Cash Inflow',
      date: new Date().toISOString(),
    };

    // Apply split into goals
    setGoals((prev) =>
      prev.map((g) => {
        const splitPct = splits[g.id] ?? g.splitPercentage ?? 0;
        const allocated = Math.round((numAmount * splitPct) / 100);
        return {
          ...g,
          savedAmount: (g.savedAmount || 0) + allocated,
          spendsCount: allocated > 0 ? (g.spendsCount || 0) + 1 : (g.spendsCount || 0),
        };
      })
    );

    setIncomes((prev) => [newIncome, ...prev]);
    return { success: true };
  };

  // 4. Purchase Evaluator ("Can I Afford This?") - Evaluates against Monthly Budget & Corpus
  const evaluatePurchase = (input, explicitType) => {
    let amount = 0;
    let type = 'expense';
    let category = '';

    if (typeof input === 'object' && input !== null) {
      amount = Number(input.amount) || 0;
      type = input.type || 'expense';
      category = input.category || '';
    } else {
      amount = Number(input) || 0;
      type = explicitType || 'expense';
    }

    if (amount <= 0) {
      return {
        type,
        amount: 0,
        monthlyBudget,
        budgetRemaining,
        newBudgetRemaining: budgetRemaining,
        availableCash,
        newAvailableCash: availableCash,
        newProjectedSavings: projectedCorpusSavings,
        status: 'neutral',
        message: 'Enter an amount to evaluate',
        // Compatibility properties
        needsBudget: monthlyBudget,
        needsHeadroom: Math.max(0, budgetRemaining),
        needsOverspend: Math.max(0, -budgetRemaining),
        newSavings: availableCash,
        newGuiltFree: budgetRemaining,
        delayDays: 0,
      };
    }

    const newSpent = spentThisMonth + amount;
    const newBudgetRemaining = monthlyBudget - newSpent;
    const isWithinBudget = newBudgetRemaining >= 0;
    const newCash = Math.max(0, availableCash - amount);
    const newProjectedSavings = Math.max(
      0,
      totalIncome - Math.max(newSpent, monthlyBudget) - goalDeposits
    );
    const savingsImpact = Math.max(0, projectedCorpusSavings - newProjectedSavings);

    let status = 'safe'; // 'safe' | 'warning' | 'danger'
    let message = '';

    if (amount > availableCash) {
      status = 'danger';
      message = `Overspend Warning! Exceeds available cash in hand by ₹${(amount - availableCash).toLocaleString('en-IN')}.`;
    } else if (isWithinBudget) {
      status = 'safe';
      message = `Fits within your monthly budget! Leaves ₹${newBudgetRemaining.toLocaleString('en-IN')} remaining.`;
    } else {
      status = 'warning';
      message = `Exceeds this month's budget by ₹${Math.abs(newBudgetRemaining).toLocaleString('en-IN')}. This will reduce the savings added to your Corpus.`;
    }

    return {
      type,
      amount,
      monthlyBudget,
      currentSpent: spentThisMonth,
      newSpent,
      budgetRemaining,
      newBudgetRemaining,
      availableCash,
      newAvailableCash: newCash,
      savingsDrop: savingsImpact,
      newProjectedSavings,
      delayDays: 0,
      status,
      message,
      // Backward compatibility fields
      needsBudget: monthlyBudget,
      needsHeadroom: Math.max(0, newBudgetRemaining),
      needsOverspend: Math.max(0, -newBudgetRemaining),
      newSavings: newCash,
      newGuiltFree: newBudgetRemaining,
      newNeeds: newSpent,
    };
  };

  // 4. Month-End Savings Settlement Directives & Rollover
  const generateSettlementDirectives = () => {
    const surplus = availableCash;
    if (surplus <= 0) return [];

    return goals
      .filter((g) => (g.splitPercentage || 0) > 0)
      .map((g) => {
        const share = Math.round((surplus * (g.splitPercentage || 0)) / 100);
        const targetAcc = accounts.find((a) => a.id === g.accountId) || accounts[1] || primaryAccount;
        return {
          id: `dir-${g.id}`,
          goalId: g.id,
          goalName: g.name,
          splitPercentage: g.splitPercentage,
          amount: share,
          fromAccountId: primaryAccount.id,
          fromAccountName: primaryAccount.name,
          toAccountId: targetAcc.id,
          toAccountName: targetAcc.name,
          completed: false,
        };
      });
  };

  const executeSettlement = (directives = []) => {
    const totalLocked = directives.reduce((sum, d) => sum + (d.amount || 0), 0);

    // 1. Credit target goals
    setGoals((prev) =>
      prev.map((g) => {
        const d = directives.find((item) => item.goalId === g.id);
        if (!d || d.amount <= 0) return g;
        return {
          ...g,
          savedAmount: (g.savedAmount || 0) + d.amount,
          spendsCount: (g.spendsCount || 0) + 1,
        };
      })
    );

    // 2. Adjust account balances: deduct from primary, credit destination accounts
    setAccounts((prev) => {
      let updated = [...prev];
      // Deduct total locked from primary
      updated = updated.map((acc) =>
        acc.id === primaryAccount.id
          ? { ...acc, balance: Math.max(0, (acc.balance || 0) - totalLocked) }
          : acc
      );
      // Credit each destination account
      directives.forEach((d) => {
        if (d.toAccountId !== d.fromAccountId) {
          updated = updated.map((acc) =>
            acc.id === d.toAccountId ? { ...acc, balance: (acc.balance || 0) + d.amount } : acc
          );
        }
      });
      // Credit fresh monthly income to primary account for next cycle
      const nextCycleSalary = Number(settings.monthlyIncome || settings.baseSalary) || 75000;
      updated = updated.map((acc) =>
        acc.id === primaryAccount.id
          ? { ...acc, balance: (acc.balance || 0) + nextCycleSalary }
          : acc
      );
      return updated;
    });

    // 3. Reset cycle spends
    setSpends([]);

    // 4. Record new cycle salary income
    const cycleSalary = Number(settings.monthlyIncome || settings.baseSalary) || 75000;
    setIncomes([
      {
        id: `inc-${Date.now()}`,
        amount: cycleSalary,
        source: 'salary',
        accountId: primaryAccount.id,
        note: 'New Cycle Salary Inflow',
        date: new Date().toISOString(),
      },
    ]);

    return { success: true, lockedAmount: totalLocked };
  };

  // Aliases for backwards compatibility
  const generateCfoDirectives = generateSettlementDirectives;
  const executeCfoSettlement = executeSettlement;

  // Backwards-compatible lockInMonth
  const lockInMonth = () => {
    const directives = generateSettlementDirectives();
    return executeSettlement(directives);
  };

  // 5. Goal Management
  const addGoal = ({ name, targetAmount, splitPercentage = 20, accountId }) => {
    const trimmedName = (name || '').trim();
    const numTarget = Number(targetAmount);

    if (!trimmedName) return { success: false, error: 'Please enter a target name' };
    if (isNaN(numTarget) || numTarget <= 0) return { success: false, error: 'Please enter a valid target amount' };

    const selectedAccId =
      accountId ||
      (accounts.find((a) => a.type === 'investment')?.id || accounts[1]?.id || primaryAccount.id);

    const newGoal = {
      id: `goal-${Date.now()}`,
      name: trimmedName,
      targetAmount: numTarget,
      savedAmount: 0,
      splitPercentage: Number(splitPercentage) || 20,
      accountId: selectedAccId,
      spendsCount: 0,
    };

    setGoals((prev) => [...prev, newGoal]);
    return { success: true };
  };

  const deleteGoal = (goalId) => {
    setGoals((prev) => prev.filter((g) => g.id !== goalId));
  };

  const deleteSpend = (spendId) => {
    const target = spends.find((s) => s.id === spendId);
    if (target && target.type === 'goal' && target.goalId) {
      setGoals((prev) =>
        prev.map((g) =>
          g.id === target.goalId
            ? {
                ...g,
                savedAmount: Math.max(0, (g.savedAmount || 0) - target.amount),
                spendsCount: Math.max(0, (g.spendsCount || 1) - 1),
              }
            : g
        )
      );
    } else if (target && target.paidBy !== 'parents' && target.accountId) {
      // Refund self-paid expense back to account balance
      setAccounts((prev) =>
        prev.map((acc) =>
          acc.id === target.accountId
            ? { ...acc, balance: (acc.balance || 0) + target.amount }
            : acc
        )
      );
    }
    setSpends((prev) => prev.filter((s) => s.id !== spendId));
  };

  // 6. Account Vaults Management
  const addAccount = ({ name, type = 'savings', balance = 0 }) => {
    const trimmed = (name || '').trim();
    if (!trimmed) return { success: false, error: 'Please enter an account name' };
    const newAcc = {
      id: `acc-${Date.now()}`,
      name: trimmed,
      type,
      balance: Number(balance) || 0,
      isPrimary: accounts.length === 0,
    };
    setAccounts((prev) => [...prev, newAcc]);
    return { success: true, account: newAcc };
  };

  const updateAccount = (accountId, updates) => {
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === accountId) {
          return { ...acc, ...updates };
        }
        if (updates.isPrimary && acc.id !== accountId) {
          return { ...acc, isPrimary: false };
        }
        return acc;
      })
    );
    return { success: true };
  };

  const deleteAccount = (accountId) => {
    if (accounts.length <= 1) {
      return { success: false, error: 'Cannot delete the only account' };
    }
    setAccounts((prev) => prev.filter((a) => a.id !== accountId));
    setGoals((prev) =>
      prev.map((g) => (g.accountId === accountId ? { ...g, accountId: primaryAccount.id } : g))
    );
    return { success: true };
  };

  const updateSettings = (newSettings) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      const newIncome = newSettings.monthlyIncome || newSettings.baseSalary;
      if (newIncome && newIncome !== (prev.monthlyIncome || prev.baseSalary)) {
        updated.monthlyIncome = newIncome;
        updated.baseSalary = newIncome;
        setIncomes((curr) =>
          curr.map((inc) =>
            inc.source === 'salary' ? { ...inc, amount: newIncome } : inc
          )
        );
      }
      return updated;
    });
  };

  const clearAllData = () => {
    setSettings(DEFAULT_SETTINGS);
    setGoals([]);
    setSpends([]);
    setIncomes([]);
    setAccounts(DEFAULT_ACCOUNTS);
    try {
      localStorage.removeItem(STORAGE_KEY + '_settings');
      localStorage.removeItem(STORAGE_KEY + '_goals');
      localStorage.removeItem(STORAGE_KEY + '_spends');
      localStorage.removeItem(STORAGE_KEY + '_incomes');
      localStorage.removeItem(STORAGE_KEY + '_accounts');
      localStorage.removeItem(STORAGE_KEY + '_settlements');
      localStorage.removeItem('groww_cloud_vault_cache_v2');
    } catch (e) {}
  };

  const resetData = clearAllData;

  return {
    settings,
    goals,
    spends,
    incomes,
    accounts,
    primaryAccount,
    totalCorpus,
    totalNetWorth,
    totalSplitPercentage,
    unallocatedSplit,
    splitStatus,
    cycle,
    totalIncome,
    monthlyIncome,
    monthlyBudget,
    spentThisMonth,
    budgetRemaining,
    projectedCorpusSavings,
    needsSpent,
    needsSpentSelf,
    needsSpentParents,
    leisureSpent,
    leisureSpentSelf,
    leisureSpentParents,
    selfTotalSpent,
    parentsTotalSpent,
    goalDeposits,
    availableCash,
    monthlySavingsPool,
    projectedSavings,
    needsBudget,
    guiltFreeRemaining,
    needsRemaining,
    totalSavedAcrossGoals,
    addSpend,
    contributeToGoal,
    transferBetweenAccounts,
    addAccount,
    updateAccount,
    deleteAccount,
    generateSettlementDirectives,
    executeSettlement,
    generateCfoDirectives,
    executeCfoSettlement,
    addExtraCash,
    evaluatePurchase,
    lockInMonth,
    addGoal,
    deleteGoal,
    deleteSpend,
    updateSettings,
    resetData,
    clearAllData,
    cloudStatus,
    syncWithCloudVault,
    exportVaultSnapshot,
    importVaultSnapshot,
  };
}
