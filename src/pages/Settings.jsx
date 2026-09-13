import React, { useState } from 'react';
import {
  ChevronRight,
  ArrowLeft,
  Wallet,
  Landmark,
  Cloud,
  Trash2,
  CalendarCheck,
} from 'lucide-react';
import { BudgetSettings } from '../components/settings/BudgetSettings';
import { VaultsSettings } from '../components/settings/VaultsSettings';
import { CloudSettings } from '../components/settings/CloudSettings';
import { ResetSettings } from '../components/settings/ResetSettings';

export function Settings({
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
      if (['hub', 'budget', 'accounts', 'backup', 'reset'].includes(sub)) {
        return sub;
      }
      const saved = localStorage.getItem('settings_sub_page');
      if (['hub', 'budget', 'accounts', 'backup', 'reset'].includes(saved)) {
        return saved;
      }
    } catch (e) {}
    return 'hub';
  };

  // 'hub' | 'budget' | 'accounts' | 'backup' | 'reset'
  const [activeSubPage, setActiveSubPage] = useState(getInitialSubPage);

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
      <div className="flex flex-col gap-3 pb-20">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleSetSubPage('hub')}
            className="p-1 -ml-1 text-[#1A1A1A] hover:text-[#2563EB] cursor-pointer"
          >
            <ArrowLeft className="size-5" />
          </button>
          <h1 className="text-lg font-semibold text-[#1A1A1A]">Monthly Budget</h1>
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
      <div className="flex flex-col gap-3 pb-20">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleSetSubPage('hub')}
            className="p-1 -ml-1 text-[#1A1A1A] hover:text-[#2563EB] cursor-pointer"
          >
            <ArrowLeft className="size-5" />
          </button>
          <h1 className="text-lg font-semibold text-[#1A1A1A]">Corpus & Accounts</h1>
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
      <div className="flex flex-col gap-3 pb-20">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleSetSubPage('hub')}
            className="p-1 -ml-1 text-[#1A1A1A] hover:text-[#2563EB] cursor-pointer"
          >
            <ArrowLeft className="size-5" />
          </button>
          <h1 className="text-lg font-semibold text-[#1A1A1A]">Data Backup</h1>
        </div>
        <CloudSettings
          cloudStatus={cloudStatus}
          settings={settings}
          goals={goals}
          spends={spends}
          incomes={incomes}
          accounts={accounts}
          onSyncCloudVault={onSyncCloudVault}
          onExportVaultSnapshot={onExportVaultSnapshot}
          onImportVaultSnapshot={onImportVaultSnapshot}
        />
      </div>
    );
  }

  if (activeSubPage === 'reset') {
    return (
      <div className="flex flex-col gap-3 pb-20">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleSetSubPage('hub')}
            className="p-1 -ml-1 text-[#1A1A1A] hover:text-[#2563EB] cursor-pointer"
          >
            <ArrowLeft className="size-5" />
          </button>
          <h1 className="text-lg font-semibold text-[#1A1A1A]">Clear All Data</h1>
        </div>
        <ResetSettings
          goals={goals}
          spends={spends}
          accounts={accounts}
          onClearData={onClearData}
          onBack={() => handleSetSubPage('hub')}
        />
      </div>
    );
  }
  // Main Settings Menu
  return (
    <div className="flex flex-col gap-4 pb-20">
      <h1 className="text-lg font-semibold text-[#1A1A1A]">Settings</h1>

      <div className="bg-white rounded-2xl border border-[#E5E5E5] divide-y divide-[#E5E5E5] overflow-hidden shadow-sm">
        {/* 1. Monthly Budget */}
        <button
          type="button"
          onClick={() => handleSetSubPage('budget')}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50/70 transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0">
              <Wallet className="size-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-[#1A1A1A]">Monthly Budget</div>
              <div className="text-xs text-[#6B7280] mt-0.5">Spending allowance & corpus savings</div>
            </div>
          </div>
          <ChevronRight className="size-5 text-[#9CA3AF] group-hover:text-[#2563EB] group-hover:translate-x-0.5 transition-all shrink-0" />
        </button>

        {/* 2. Corpus & Accounts */}
        <button
          type="button"
          onClick={() => handleSetSubPage('accounts')}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50/70 transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#16A34A] flex items-center justify-center shrink-0">
              <Landmark className="size-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-[#1A1A1A]">Corpus & Accounts</div>
              <div className="text-xs text-[#6B7280] mt-0.5">{accounts.length} accounts holding your corpus</div>
            </div>
          </div>
          <ChevronRight className="size-5 text-[#9CA3AF] group-hover:text-[#16A34A] group-hover:translate-x-0.5 transition-all shrink-0" />
        </button>

        {/* 3. Data Backup */}
        <button
          type="button"
          onClick={() => handleSetSubPage('backup')}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50/70 transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-[#4F46E5] flex items-center justify-center shrink-0">
              <Cloud className="size-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-[#1A1A1A]">Data Backup</div>
              <div className="text-xs text-[#6B7280] mt-0.5">
                {cloudStatus === 'synced' ? 'Up to date' : 'Syncing...'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`size-2 rounded-full ${
                cloudStatus === 'synced' ? 'bg-[#16A34A]' : 'bg-[#2563EB] animate-pulse'
              }`}
            />
            <ChevronRight className="size-5 text-[#9CA3AF] group-hover:text-[#4F46E5] group-hover:translate-x-0.5 transition-all shrink-0" />
          </div>
        </button>

        {/* 4. Settle & Lock Month (Early / Manual Review) */}
        {onOpenLockCycle && (
          <button
            type="button"
            onClick={onOpenLockCycle}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50/70 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <CalendarCheck className="size-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-[#1A1A1A]">Settle & Lock Month</div>
                <div className="text-xs text-[#6B7280] mt-0.5">Review pending logs & lockdown cycle</div>
              </div>
            </div>
            <ChevronRight className="size-5 text-[#9CA3AF] group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all shrink-0" />
          </button>
        )}

        {/* 5. Clear All Data */}
        <button
          type="button"
          onClick={() => handleSetSubPage('reset')}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50/70 transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-[#DC2626] flex items-center justify-center shrink-0">
              <Trash2 className="size-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-[#1A1A1A]">Clear All Data</div>
              <div className="text-xs text-[#6B7280] mt-0.5">Erase all financial records and start fresh</div>
            </div>
          </div>
          <ChevronRight className="size-5 text-[#9CA3AF] group-hover:text-[#DC2626] group-hover:translate-x-0.5 transition-all shrink-0" />
        </button>
      </div>
    </div>
  );
}
