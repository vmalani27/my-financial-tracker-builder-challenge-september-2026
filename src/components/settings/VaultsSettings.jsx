import React, { useState } from 'react';
import { Landmark, Shield, TrendingUp, Wallet, MoreVertical, Plus, Check, Trash2, X, Star } from 'lucide-react';

export function VaultsSettings({
  accounts = [],
  onAddAccount,
  onUpdateAccount,
  onDeleteAccount,
}) {
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [editBalance, setEditBalance] = useState('');
  const [balanceSavedMsg, setBalanceSavedMsg] = useState(false);

  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [newAccName, setNewAccName] = useState('');
  const [newAccType, setNewAccType] = useState('savings');
  const [newAccBalance, setNewAccBalance] = useState('');
  const [accountError, setAccountError] = useState('');

  const totalNetWorth = accounts.reduce((sum, a) => sum + (Number(a.balance) || 0), 0);

  const getVaultIcon = (type) => {
    switch (type) {
      case 'primary':
        return <Landmark className="size-4 text-slate-800" />;
      case 'savings':
        return <Shield className="size-4 text-emerald-600" />;
      case 'investment':
        return <TrendingUp className="size-4 text-blue-600" />;
      default:
        return <Wallet className="size-4 text-slate-500" />;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'primary':
        return 'Everyday UPI';
      case 'savings':
        return 'Liquid Savings';
      case 'investment':
        return 'Investment Portfolio';
      default:
        return 'Cash & Wallets';
    }
  };

  const handleOpenAccountDetails = (acc) => {
    setSelectedAccount(acc);
    setEditBalance(String(acc.balance || 0));
    setBalanceSavedMsg(false);
  };

  const handleSaveBalance = (e) => {
    e.preventDefault();
    if (!selectedAccount) return;
    const num = Math.max(0, Number(editBalance) || 0);
    if (onUpdateAccount) {
      onUpdateAccount(selectedAccount.id, { balance: num });
      setSelectedAccount({ ...selectedAccount, balance: num });
      setBalanceSavedMsg(true);
      setTimeout(() => setBalanceSavedMsg(false), 2000);
    }
  };

  const handleSetPrimary = () => {
    if (!selectedAccount || selectedAccount.isPrimary) return;
    if (onUpdateAccount) {
      onUpdateAccount(selectedAccount.id, { isPrimary: true });
      setSelectedAccount({ ...selectedAccount, isPrimary: true });
    }
  };

  const handleDelete = () => {
    if (!selectedAccount || selectedAccount.isPrimary) return;
    if (window.confirm(`Permanently remove "${selectedAccount.name}"?`)) {
      if (onDeleteAccount) {
        onDeleteAccount(selectedAccount.id);
        setSelectedAccount(null);
      }
    }
  };

  const handleCreate = (e) => {
    e.preventDefault();
    setAccountError('');
    if (!newAccName.trim()) {
      setAccountError('Please enter an account name');
      return;
    }
    if (onAddAccount) {
      const res = onAddAccount({
        name: newAccName.trim(),
        type: newAccType,
        balance: Math.max(0, Number(newAccBalance) || 0),
      });
      if (res && !res.success) {
        setAccountError(res.error || 'Failed to add account');
        return;
      }
    }
    setNewAccName('');
    setNewAccBalance('');
    setNewAccType('savings');
    setIsAddingAccount(false);
  };

  return (
    <div className="flex flex-col gap-5 pb-20">
      {/* 1. Integrated Sleek Corpus Summary */}
      <div className="flex items-end justify-between px-1">
        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Total Net Corpus
          </span>
          <div className="text-3xl font-semibold text-slate-900 tracking-tight tabular-nums mt-1">
            ₹{totalNetWorth.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">
            Across {accounts.length} {accounts.length === 1 ? 'account' : 'accounts'}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsAddingAccount(!isAddingAccount)}
          className="text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
        >
          {isAddingAccount ? (
            'Cancel'
          ) : (
            <>
              <Plus className="size-3.5" />
              <span>Add Account</span>
            </>
          )}
        </button>
      </div>

      {/* 2. Add Account Panel (Collapsible Flat Surface) */}
      {isAddingAccount && (
        <form
          onSubmit={handleCreate}
          className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col gap-4 animate-fadeIn"
        >
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Add New Account</h3>
            <p className="text-xs text-slate-500 mt-0.5">Connect an operating, savings, or investment account.</p>
          </div>

          <div className="flex flex-col gap-3">
            <div>
              <label className="text-[11px] font-medium text-slate-600 mb-1 block">Account Name</label>
              <input
                type="text"
                autoFocus
                value={newAccName}
                onChange={(e) => setNewAccName(e.target.value)}
                placeholder="e.g. HDFC Bank, Zerodha, Liquid Savings"
                className="w-full text-sm text-slate-900 bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-slate-400 focus:bg-white transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] font-medium text-slate-600 mb-1 block">Account Type</label>
                <select
                  value={newAccType}
                  onChange={(e) => setNewAccType(e.target.value)}
                  className="w-full text-xs text-slate-900 bg-slate-50/70 border border-slate-200 rounded-xl px-2.5 py-2.5 focus:outline-none focus:border-slate-400 focus:bg-white transition-all"
                >
                  <option value="primary">Primary (UPI / Inflows)</option>
                  <option value="savings">Liquid Savings</option>
                  <option value="investment">Investments / Stocks</option>
                  <option value="wallet">Cash & Wallet</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-600 mb-1 block">Current Balance (₹)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={newAccBalance}
                  onChange={(e) => setNewAccBalance(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="0"
                  className="w-full text-xs text-slate-900 tabular-nums bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-slate-400 focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>

          {accountError && (
            <div className="text-xs text-red-600 font-medium">{accountError}</div>
          )}

          <button
            type="submit"
            className="w-full h-10 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center cursor-pointer transition-colors shadow-xs"
          >
            Save Account
          </button>
        </form>
      )}

      {/* 3. Unified Accounts List Container with Hairline Dividers */}
      <div className="flex flex-col gap-2">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1">
          Connected Accounts ({accounts.length})
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 divide-y divide-slate-100 shadow-xs overflow-hidden">
          {accounts.map((acc) => (
            <div
              key={acc.id}
              onClick={() => handleOpenAccountDetails(acc)}
              className="p-4 flex items-center justify-between hover:bg-slate-50/70 cursor-pointer transition-colors group"
            >
              {/* Left: Icon & Account Info */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="size-9 rounded-xl bg-slate-100 border border-slate-200/60 flex items-center justify-center shrink-0">
                  {getVaultIcon(acc.type)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-sm font-semibold text-slate-900 tracking-tight truncate">
                      {acc.name}
                    </span>
                    {acc.isPrimary && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-slate-100 text-slate-600 border border-slate-200/70 shrink-0">
                        Primary
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {getTypeLabel(acc.type)}
                  </div>
                </div>
              </div>

              {/* Right: Amount & Kebab Menu */}
              <div className="flex items-center gap-3 shrink-0 ml-3">
                <span className="text-sm font-semibold text-slate-900 tracking-tight tabular-nums">
                  ₹{(Number(acc.balance) || 0).toLocaleString('en-IN')}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenAccountDetails(acc);
                  }}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 cursor-pointer transition-colors"
                  title="Manage account"
                >
                  <MoreVertical className="size-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Account Actions Bottom Sheet / Modal */}
      {selectedAccount && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-xs animate-fadeIn p-0 sm:p-4">
          {/* Backdrop Click to Close */}
          <div
            className="absolute inset-0"
            onClick={() => setSelectedAccount(null)}
          />

          <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl p-6 border border-slate-200 shadow-xl flex flex-col gap-5 animate-slideUp z-10">
            {/* Sheet Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-slate-100 border border-slate-200/60 flex items-center justify-center">
                  {getVaultIcon(selectedAccount.type)}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-base font-semibold text-slate-900">
                      {selectedAccount.name}
                    </h3>
                    {selectedAccount.isPrimary && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-slate-100 text-slate-600 border border-slate-200/70">
                        Primary
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400">
                    {getTypeLabel(selectedAccount.type)}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedAccount(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Quick Balance Update Form */}
            <form onSubmit={handleSaveBalance} className="flex flex-col gap-2 pt-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Current Balance
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus-within:border-slate-400 focus-within:bg-white transition-all">
                  <span className="text-sm font-semibold text-slate-400 mr-1 select-none">₹</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={editBalance}
                    onChange={(e) => setEditBalance(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full text-sm font-semibold text-slate-900 tracking-tight tabular-nums bg-transparent focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="h-10 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors shadow-2xs"
                >
                  {balanceSavedMsg ? (
                    <span className="flex items-center gap-1 text-emerald-400">
                      <Check className="size-3.5" />
                      <span>Saved</span>
                    </span>
                  ) : (
                    'Update'
                  )}
                </button>
              </div>
            </form>

            {/* Actions List */}
            <div className="border border-slate-200/80 rounded-xl divide-y divide-slate-100 overflow-hidden text-xs">
              {!selectedAccount.isPrimary ? (
                <button
                  type="button"
                  onClick={handleSetPrimary}
                  className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-50 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <Star className="size-4 text-slate-400 group-hover:text-slate-800" />
                    <div>
                      <div className="font-semibold text-slate-900">Make Primary Account</div>
                      <div className="text-[11px] text-slate-400">Route salary and default UPI spends here</div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-blue-600">Set</span>
                </button>
              ) : (
                <div className="p-3.5 flex items-center gap-2 text-slate-500 bg-slate-50/50">
                  <Check className="size-4 text-emerald-600" />
                  <span>Primary account for salary inflows and payments</span>
                </div>
              )}

              {!selectedAccount.isPrimary && accounts.length > 1 && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="w-full p-3.5 flex items-center justify-between text-left hover:bg-red-50 text-red-600 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <Trash2 className="size-4 text-red-500" />
                    <div>
                      <div className="font-semibold">Delete Account</div>
                      <div className="text-[11px] text-red-400">Remove from your corpus tracking</div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold">Delete</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
