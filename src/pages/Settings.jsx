import React, { useState } from 'react';
import {
  ChevronRight,
  ArrowLeft,
  Wallet,
  Landmark,
  HardDrive,
  Trash2,
  CalendarCheck,
  AlertTriangle,
  X,
} from 'lucide-react';
import { BudgetSettings } from '../components/settings/BudgetSettings';
import { VaultsSettings } from '../components/settings/VaultsSettings';
import { CloudSettings } from '../components/settings/CloudSettings';

export function Settings({
  cycle,
  settings,
  goals = [],
  spends = [],
  incomes = [],
  accounts = [],
  monthlySavingsPool = 0,
  cloudStatus = 'synced',
  onUpdateSettings,
  onAddAccount,
  onUpdateAccount,
  onDeleteAccount,
  onSyncCloudVault,
  onExportVaultSnapshot,
  onImportVaultSnapshot,
  onOpenLockCycle,
  onResetData,
  onClearData,
}) {
  const getInitialSubPage = () => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const sub = searchParams.get('section');
      if (['hub', 'budget', 'accounts', 'backup'].includes(sub)) {
        return sub;
      }
      const saved = localStorage.getItem('settings_sub_page');
      if (['hub', 'budget', 'accounts', 'backup'].includes(saved)) {
        return saved;
      }
    } catch (e) {}
    return 'hub';
  };

  const [activeSubPage, setActiveSubPage] = useState(getInitialSubPage);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [clearInput, setClearInput] = useState('');

  const handleClear = () => {
    if (clearInput.trim().toUpperCase() !== 'CLEAR') return;
    onClearData();
    setConfirmClearOpen(false);
    setClearInput('');
  };

  const handleSetSubPage = (sub) => {
    setActiveSubPage(sub);
    try {
      localStorage.setItem('settings_sub_page', sub);
      const url = new URL(window.location.href);
      if (sub === 'hub') {
        url.searchParams.delete('section');
      } else {
        url.searchParams.set('section', sub);
      }
      window.history.replaceState({}, '', url.toString());
    } catch (e) {}
  };

  // Render Sub-pages when active
  if (activeSubPage === 'budget') {
    return (
      <div className="flex flex-col gap-4 pb-20">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => handleSetSubPage('hub')}
            className="p-1.5 -ml-1.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Back to Settings"
          >
            <ArrowLeft className="size-5" />
          </button>
          <h1 className="text-lg font-semibold text-slate-900 tracking-tight">Monthly Budget</h1>
        </div>
        <BudgetSettings
          initialSettings={settings}
          onSave={(newSettings) => {
            onUpdateSettings(newSettings);
            handleSetSubPage('hub');
          }}
          onCancel={() => handleSetSubPage('hub')}
        />
      </div>
    );
  }

  if (activeSubPage === 'accounts') {
    return (
      <div className="flex flex-col gap-4 pb-20">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => handleSetSubPage('hub')}
            className="p-1.5 -ml-1.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Back to Settings"
          >
            <ArrowLeft className="size-5" />
          </button>
          <h1 className="text-lg font-semibold text-slate-900 tracking-tight">Corpus & Accounts</h1>
        </div>
        <VaultsSettings
          accounts={accounts}
          onAddAccount={onAddAccount}
          onUpdateAccount={onUpdateAccount}
          onDeleteAccount={onDeleteAccount}
        />
      </div>
    );
  }

  if (activeSubPage === 'backup') {
    return (
      <div className="flex flex-col gap-5 pb-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => handleSetSubPage('hub')}
              className="p-1.5 -ml-1.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Back to Settings"
            >
              <ArrowLeft className="size-5" />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-slate-900 tracking-tight">Backup & Storage</h1>
              <div className="text-xs text-slate-400 mt-0.5">
                {accounts.length} {accounts.length === 1 ? 'account' : 'accounts'} • {goals.length} {goals.length === 1 ? 'goal' : 'goals'} • {spends.length} {spends.length === 1 ? 'spend' : 'spends'}
              </div>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60 shrink-0">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            100% Offline
          </span>
        </div>
        <CloudSettings
          settings={settings}
          goals={goals}
          spends={spends}
          incomes={incomes}
          accounts={accounts}
          onExportVaultSnapshot={onExportVaultSnapshot}
          onImportVaultSnapshot={onImportVaultSnapshot}
        />
      </div>
    );
  }

  const totalCorpus = accounts.reduce((sum, a) => sum + (Number(a.balance) || 0), 0);

  // Main Settings Menu
  return (
    <div className="flex flex-col gap-6 pb-20 max-w-md mx-auto">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Settings</h1>
        <p className="text-xs text-slate-500 mt-0.5">Preferences & financial configuration</p>
      </div>

      {/* 1. Planning & Accounts */}
      <div className="flex flex-col gap-2">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1">
          Planning & Accounts
        </span>

        <div className="bg-white rounded-2xl border border-slate-200/80 divide-y divide-slate-100 shadow-xs overflow-hidden">
          {/* Monthly Budget */}
          <button
            type="button"
            onClick={() => handleSetSubPage('budget')}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50/70 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-xl bg-slate-100 border border-slate-200/60 text-slate-700 flex items-center justify-center shrink-0">
                <Wallet className="size-4" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900 tracking-tight">Monthly Budget</div>
                <div className="text-xs text-slate-400 mt-0.5">Salary, spending allowance & cycle</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {Number(settings?.monthlyIncome) > 0 && (
                <span className="text-xs font-semibold text-slate-700 tabular-nums">
                  ₹{Number(settings.monthlyIncome).toLocaleString('en-IN')}
                </span>
              )}
              <ChevronRight className="size-4 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all shrink-0" />
            </div>
          </button>

          {/* Account Vaults */}
          <button
            type="button"
            onClick={() => handleSetSubPage('accounts')}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50/70 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-xl bg-slate-100 border border-slate-200/60 text-slate-700 flex items-center justify-center shrink-0">
                <Landmark className="size-4" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900 tracking-tight">Corpus & Accounts</div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {accounts.length} {accounts.length === 1 ? 'account' : 'accounts'} connected
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {totalCorpus > 0 && (
                <span className="text-xs font-semibold text-slate-700 tabular-nums">
                  ₹{totalCorpus.toLocaleString('en-IN')}
                </span>
              )}
              <ChevronRight className="size-4 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all shrink-0" />
            </div>
          </button>
        </div>
      </div>

      {/* 2. Month-End Routine */}
      {onOpenLockCycle && (
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1">
            Month-End Routine
          </span>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <button
              type="button"
              onClick={onOpenLockCycle}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50/70 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-xl bg-slate-100 border border-slate-200/60 text-slate-700 flex items-center justify-center shrink-0">
                  <CalendarCheck className="size-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900 tracking-tight">Settle & Lock Month</div>
                  <div className="text-xs text-slate-400 mt-0.5">Review unrecorded spends & lock cycle</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {cycle?.isLockWindowActive ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-amber-50 text-amber-700 border border-amber-200/70">
                    Cycle Ending
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-500 border border-slate-200/60">
                    Day {cycle?.currentDay || 1}
                  </span>
                )}
                <ChevronRight className="size-4 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all shrink-0" />
              </div>
            </button>
          </div>
        </div>
      )}

      {/* 3. Data & Storage */}
      <div className="flex flex-col gap-2">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1">
          Data & Storage
        </span>

        <div className="bg-white rounded-2xl border border-slate-200/80 divide-y divide-slate-100 shadow-xs overflow-hidden">
          {/* Backup & Storage */}
          <button
            type="button"
            onClick={() => handleSetSubPage('backup')}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50/70 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-xl bg-slate-100 border border-slate-200/60 text-slate-700 flex items-center justify-center shrink-0">
                <HardDrive className="size-4" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900 tracking-tight">Backup & Storage</div>
                <div className="text-xs text-slate-400 mt-0.5">Export or restore local .vault files</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                Local Only
              </span>
              <ChevronRight className="size-4 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all shrink-0" />
            </div>
          </button>

          {/* Clear All Data */}
          <button
            type="button"
            onClick={() => setConfirmClearOpen(true)}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-red-50/50 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-xl bg-red-50 border border-red-100 text-red-600 flex items-center justify-center shrink-0">
                <Trash2 className="size-4" />
              </div>
              <div>
                <div className="text-sm font-semibold text-red-600 tracking-tight">Clear All Data</div>
                <div className="text-xs text-slate-400 mt-0.5">Erase stored records and reset app</div>
              </div>
            </div>
            <ChevronRight className="size-4 text-slate-300 group-hover:text-red-500 group-hover:translate-x-0.5 transition-all shrink-0" />
          </button>
        </div>
      </div>

      {/* Clear All Data Confirmation Bottom Sheet / Modal */}
      {confirmClearOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-xs animate-fadeIn p-0 sm:p-4">
          <div
            className="absolute inset-0"
            onClick={() => {
              setConfirmClearOpen(false);
              setClearInput('');
            }}
          />

          <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl p-6 border border-slate-200 shadow-xl flex flex-col gap-4 animate-slideUp z-10">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-red-50 border border-red-100 text-red-600 flex items-center justify-center shrink-0">
                  <AlertTriangle className="size-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900">Clear All Financial Data?</h3>
                  <p className="text-xs text-slate-500 mt-0.5">This action cannot be undone.</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setConfirmClearOpen(false);
                  setClearInput('');
                }}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              This will permanently wipe all your goals, accounts, recorded spends, incomes, and settings stored in this browser.
            </p>

            <div className="p-3 bg-red-50/70 rounded-xl border border-red-200 flex flex-col gap-2">
              <span className="text-xs font-medium text-red-700">
                To confirm permanent deletion, type <strong className="underline">CLEAR</strong> below:
              </span>
              <input
                type="text"
                autoFocus
                value={clearInput}
                onChange={(e) => setClearInput(e.target.value)}
                placeholder='Type "CLEAR"'
                className="w-full text-xs font-mono text-slate-900 bg-white border border-red-300 rounded-lg px-3 py-2 focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  setConfirmClearOpen(false);
                  setClearInput('');
                }}
                className="flex-1 h-10 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={clearInput.trim().toUpperCase() !== 'CLEAR'}
                onClick={handleClear}
                className={`flex-1 h-10 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 text-white transition-all ${
                  clearInput.trim().toUpperCase() === 'CLEAR'
                    ? 'bg-red-600 hover:bg-red-700 cursor-pointer shadow-xs'
                    : 'bg-red-300 cursor-not-allowed'
                }`}
              >
                <Trash2 className="size-3.5" />
                <span>Delete Everything</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
