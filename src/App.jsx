import React, { useState, useEffect } from 'react';
import { useGoals } from './hooks/useGoals';
import { BottomNav } from './components/BottomNav';
import { AddSpendSheet } from './components/AddSpendSheet';
import { DepositGoalSheet } from './components/DepositGoalSheet';
import { CanIAffordSheet } from './components/CanIAffordSheet';
import { ExtraCashSheet } from './components/ExtraCashSheet';
import { TransferSheet } from './components/TransferSheet';
import { LockCycleSheet } from './components/LockCycleSheet';

// Pages
import { Home } from './pages/Home';
import { Goals } from './pages/Goals';
import { Spends } from './pages/Spends';
import { Settings } from './pages/Settings';

function getInitialTab() {
  // 1. Check path (e.g. /goals, /spends, /settings)
  const path = window.location.pathname.replace(/^\//, '').toLowerCase().split('/')[0];
  if (['home', 'goals', 'spends', 'settings'].includes(path)) {
    return path;
  }
  // 2. Check hash (e.g. #/goals, #/spends, #/settings)
  const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase().split('/')[0];
  if (['home', 'goals', 'spends', 'settings'].includes(hash)) {
    return hash;
  }
  // 3. Fallback to localStorage
  try {
    const saved = localStorage.getItem('active_tab');
    if (['home', 'goals', 'spends', 'settings'].includes(saved)) {
      return saved;
    }
  } catch (e) {}
  return 'home';
}

export function App() {
  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [isAddSpendOpen, setIsAddSpendOpen] = useState(false);
  const [isCanIAffordOpen, setIsCanIAffordOpen] = useState(false);
  const [isExtraCashOpen, setIsExtraCashOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isLockCycleOpen, setIsLockCycleOpen] = useState(false);
  const [isDepositGoalOpen, setIsDepositGoalOpen] = useState(false);
  const [depositTargetGoal, setDepositTargetGoal] = useState(null);

  const handleSelectTab = (tab) => {
    if (!['home', 'goals', 'spends', 'settings'].includes(tab)) return;
    setActiveTab(tab);
    try {
      localStorage.setItem('active_tab', tab);
    } catch (e) {}
    const targetPath = tab === 'home' ? '/' : `/${tab}`;
    if (window.location.pathname !== targetPath) {
      window.history.pushState({ tab }, '', targetPath);
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.replace(/^\//, '').toLowerCase().split('/')[0];
      const target = ['home', 'goals', 'spends', 'settings'].includes(path) ? path : 'home';
      setActiveTab(target);
      try {
        localStorage.setItem('active_tab', target);
      } catch (e) {}
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Ensure current URL matches activeTab if user loaded with empty path but had saved tab
  useEffect(() => {
    const path = window.location.pathname.replace(/^\//, '').toLowerCase().split('/')[0];
    const targetPath = activeTab === 'home' ? '/' : `/${activeTab}`;
    if (path !== (activeTab === 'home' ? '' : activeTab)) {
      window.history.replaceState({ tab: activeTab }, '', targetPath);
    }
  }, []);

  const {
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
    monthlySavingsPool,
    projectedSavings,
    needsBudget,
    guiltFreeRemaining,
    needsRemaining,
    totalSavedAcrossGoals,
    goalDeposits,
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
  } = useGoals();

  const handleOpenAddSpend = () => {
    setIsAddSpendOpen(true);
  };

  const handleOpenDepositGoal = (goalOrId) => {
    if (!goalOrId) return;
    const matchedGoal = typeof goalOrId === 'string' ? goals.find((g) => g.id === goalOrId) : goalOrId;
    if (matchedGoal) {
      setDepositTargetGoal(matchedGoal);
      setIsDepositGoalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex justify-center">
      {/* Mobile container - strictly max-w-[390px] */}
      <div className="w-full max-w-[390px] min-h-screen bg-[#F5F5F5] flex flex-col relative px-4 py-4">
        {/* Active Page */}
        <main className="flex-1">
          {activeTab === 'home' && (
            <Home
              cycle={cycle}
              settings={settings}
              monthlyIncome={monthlyIncome}
              monthlyBudget={monthlyBudget}
              spentThisMonth={spentThisMonth}
              budgetRemaining={budgetRemaining}
              projectedCorpusSavings={projectedCorpusSavings}
              totalCorpus={totalCorpus}
              monthlySavingsPool={monthlySavingsPool}
              projectedSavings={projectedSavings}
              needsRemaining={budgetRemaining}
              needsSpent={spentThisMonth}
              totalIncome={totalIncome}
              goals={goals}
              spends={spends}
              accounts={accounts}
              totalNetWorth={totalCorpus}
              onOpenAddSpend={handleOpenAddSpend}
              onOpenDepositGoal={handleOpenDepositGoal}
              onOpenCanIAfford={() => setIsCanIAffordOpen(true)}
              onOpenExtraCash={() => setIsExtraCashOpen(true)}
              onOpenTransfer={() => setIsTransferOpen(true)}
              onOpenLockCycle={() => setIsLockCycleOpen(true)}
              onNavigateToGoals={() => handleSelectTab('goals')}
            />
          )}

          {activeTab === 'goals' && (
            <Goals
              goals={goals}
              accounts={accounts}
              totalSplitPercentage={totalSplitPercentage}
              unallocatedSplit={unallocatedSplit}
              splitStatus={splitStatus}
              onAddGoal={addGoal}
              onDeleteGoal={deleteGoal}
              onOpenDepositGoal={handleOpenDepositGoal}
              onOpenAddSpend={handleOpenAddSpend}
            />
          )}

          {activeTab === 'spends' && (
            <Spends
              spends={spends}
              needsSpent={needsSpent}
              needsSpentSelf={needsSpentSelf}
              needsSpentParents={needsSpentParents}
              leisureSpent={leisureSpent}
              goalDeposits={goalDeposits}
              selfTotalSpent={selfTotalSpent}
              parentsTotalSpent={parentsTotalSpent}
              onOpenAddSpend={handleOpenAddSpend}
              onDeleteSpend={deleteSpend}
            />
          )}

          {activeTab === 'settings' && (
            <Settings
              settings={settings}
              goals={goals}
              spends={spends}
              incomes={incomes}
              accounts={accounts}
              monthlySavingsPool={monthlySavingsPool}
              cloudStatus={cloudStatus}
              onUpdateSettings={updateSettings}
              onAddAccount={addAccount}
              onUpdateAccount={updateAccount}
              onDeleteAccount={deleteAccount}
              onSyncCloudVault={syncWithCloudVault}
              onExportVaultSnapshot={exportVaultSnapshot}
              onImportVaultSnapshot={importVaultSnapshot}
              onOpenLockCycle={() => setIsLockCycleOpen(true)}
              resetData={resetData}
              clearAllData={clearAllData}
            />
          )}
        </main>

        {/* Bottom Navigation */}
        <BottomNav
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
        />

        {/* 1. Pay / Out (Expense) Bottom Sheet */}
        <AddSpendSheet
          isOpen={isAddSpendOpen}
          onClose={() => setIsAddSpendOpen(false)}
          monthlySavingsPool={monthlySavingsPool}
          needsSpent={spentThisMonth}
          needsBudget={monthlyBudget}
          budgetRemaining={budgetRemaining}
          onAddSpend={addSpend}
        />

        {/* 2. Direct Deposit to Goal Bottom Sheet */}
        <DepositGoalSheet
          isOpen={isDepositGoalOpen}
          onClose={() => {
            setIsDepositGoalOpen(false);
            setDepositTargetGoal(null);
          }}
          goal={depositTargetGoal}
          accounts={accounts}
          availableCash={monthlySavingsPool}
          onContributeToGoal={contributeToGoal}
        />

        {/* 3. "Can I Afford This?" Purchase Evaluator Bottom Sheet */}
        <CanIAffordSheet
          isOpen={isCanIAffordOpen}
          onClose={() => setIsCanIAffordOpen(false)}
          onEvaluate={evaluatePurchase}
          onLogPurchase={addSpend}
        />

        {/* 4. Extra Cash & Gift Splitter Bottom Sheet */}
        <ExtraCashSheet
          isOpen={isExtraCashOpen}
          onClose={() => setIsExtraCashOpen(false)}
          goals={goals}
          onAddExtraCash={addExtraCash}
        />

        {/* 5. To-and-Fro Vault Transfer Bottom Sheet */}
        <TransferSheet
          isOpen={isTransferOpen}
          onClose={() => setIsTransferOpen(false)}
          accounts={accounts}
          onTransfer={transferBetweenAccounts}
        />

        {/* 6. Month-End Review & Lockdown Bottom Sheet */}
        <LockCycleSheet
          isOpen={isLockCycleOpen}
          onClose={() => setIsLockCycleOpen(false)}
          cycle={cycle}
          monthlySavingsPool={monthlySavingsPool}
          totalIncome={totalIncome}
          needsSpent={spentThisMonth}
          monthlyBudget={monthlyBudget}
          onOpenAddSpend={() => {
            setIsLockCycleOpen(false);
            setIsAddSpendOpen(true);
          }}
          executeSettlement={executeSettlement}
        />
      </div>
    </div>
  );
}

export default App;
