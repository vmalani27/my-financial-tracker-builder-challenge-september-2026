import React, { useState } from 'react';
import { Landmark, Shield, TrendingUp, Wallet, Edit2, Plus, Check, X, Trash2 } from 'lucide-react';

export function VaultsSettings({
  accounts = [],
  onAddAccount,
  onUpdateAccount,
  onDeleteAccount,
}) {
  const [editingAccountId, setEditingAccountId] = useState(null);
  const [editBalance, setEditBalance] = useState('');
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [newAccName, setNewAccName] = useState('');
  const [newAccType, setNewAccType] = useState('savings');
  const [newAccBalance, setNewAccBalance] = useState('');
  const [accountError, setAccountError] = useState('');

  const totalNetWorth = accounts.reduce((sum, a) => sum + (Number(a.balance) || 0), 0);

  const getVaultIcon = (type) => {
    switch (type) {
      case 'primary':
        return <Landmark className="size-4 text-[#2563EB]" />;
      case 'savings':
        return <Shield className="size-4 text-[#16A34A]" />;
      case 'investment':
        return <TrendingUp className="size-4 text-[#2563EB]" />;
      default:
        return <Wallet className="size-4 text-[#6B7280]" />;
    }
  };

  const handleStartEdit = (acc) => {
    setEditingAccountId(acc.id);
    setEditBalance((acc.balance || 0).toString());
  };

  const handleSaveEdit = (accId) => {
    const num = Number(editBalance);
    if (!isNaN(num) && num >= 0 && onUpdateAccount) {
      onUpdateAccount(accId, { balance: num });
    }
    setEditingAccountId(null);
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
        balance: Number(newAccBalance) || 0,
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
    <div className="flex flex-col gap-4 pb-20">
      {/* Overview Card */}
      <div className="bg-white rounded-2xl p-4 border border-[#E5E5E5] flex items-center justify-between shadow-sm">
        <div>
          <div className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">
            Total Corpus
          </div>
          <div className="text-2xl font-bold text-[#1A1A1A] mt-0.5">
            ₹{totalNetWorth.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-[#6B7280] mt-0.5">
            Across {accounts.length} accounts holding your corpus
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsAddingAccount(!isAddingAccount)}
          className="text-xs font-semibold text-[#2563EB] bg-blue-50 border border-blue-200 px-3.5 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer hover:bg-blue-100 transition-colors"
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

      {/* Add New Account Form */}
      {isAddingAccount && (
        <form
          onSubmit={handleCreate}
          className="bg-white rounded-2xl p-4 border border-[#E5E5E5] flex flex-col gap-3 shadow-sm"
        >
          <div className="text-xs font-semibold text-[#1A1A1A] uppercase tracking-wide">
            Add New Account
          </div>

          <div>
            <div className="text-xs text-[#6B7280] mb-1">Account Name</div>
            <input
              type="text"
              value={newAccName}
              onChange={(e) => setNewAccName(e.target.value)}
              placeholder="e.g. HDFC Bank, PayTM Wallet, Zerodha"
              className="w-full text-sm text-[#1A1A1A] bg-white border border-[#E5E5E5] rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#2563EB]"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="text-xs text-[#6B7280] mb-1">Account Type</div>
              <select
                value={newAccType}
                onChange={(e) => setNewAccType(e.target.value)}
                className="w-full text-sm text-[#1A1A1A] bg-white border border-[#E5E5E5] rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#2563EB]"
              >
                <option value="primary">Primary (UPI / Everyday)</option>
                <option value="savings">Savings Account</option>
                <option value="investment">Investments / Stocks</option>
                <option value="wallet">Cash / Wallet</option>
              </select>
            </div>

            <div>
              <div className="text-xs text-[#6B7280] mb-1">Current Balance (₹)</div>
              <input
                type="number"
                inputMode="numeric"
                value={newAccBalance}
                onChange={(e) => setNewAccBalance(e.target.value)}
                placeholder="0"
                className="w-full text-sm text-[#1A1A1A] bg-white border border-[#E5E5E5] rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#2563EB]"
              />
            </div>
          </div>

          {accountError && (
            <div className="text-xs text-[#DC2626] font-medium">{accountError}</div>
          )}

          <button
            type="submit"
            className="w-full h-10 bg-[#2563EB] text-white rounded-xl text-xs font-semibold flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors mt-1"
          >
            Save Account
          </button>
        </form>
      )}

      {/* Accounts List */}
      <div className="flex flex-col gap-2">
        <div className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide px-1">
          Your Accounts ({accounts.length})
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E5E5] divide-y divide-[#E5E5E5] overflow-hidden shadow-sm">
          {accounts.map((acc) => {
            const isEditing = editingAccountId === acc.id;
            return (
              <div key={acc.id} className="p-3.5 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-[#F5F5F5] border border-[#E5E5E5]">
                      {getVaultIcon(acc.type)}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[#1A1A1A] flex items-center gap-1.5">
                        <span>{acc.name}</span>
                        {acc.isPrimary && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-50 text-[#2563EB] font-medium border border-blue-200">
                            Primary
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#6B7280] capitalize">
                        {acc.type === 'primary' ? 'Everyday UPI' : acc.type === 'savings' ? 'Savings' : acc.type === 'investment' ? 'Investments' : 'Cash'}
                      </div>
                    </div>
                  </div>

                  {/* Actions & Balance */}
                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-[#6B7280]">₹</span>
                        <input
                          type="number"
                          inputMode="numeric"
                          value={editBalance}
                          onChange={(e) => setEditBalance(e.target.value)}
                          className="w-24 text-xs text-[#1A1A1A] border border-[#2563EB] rounded px-2 py-1 focus:outline-none"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(acc.id)}
                          className="p-1 text-[#16A34A] hover:bg-green-50 rounded cursor-pointer"
                          title="Save balance"
                        >
                          <Check className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingAccountId(null)}
                          className="p-1 text-[#6B7280] hover:bg-gray-100 rounded cursor-pointer"
                          title="Cancel"
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold text-[#1A1A1A]">
                          ₹{(acc.balance || 0).toLocaleString('en-IN')}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleStartEdit(acc)}
                          className="p-1 text-[#6B7280] hover:text-[#2563EB] cursor-pointer"
                          title="Edit balance"
                        >
                          <Edit2 className="size-3" />
                        </button>
                      </div>
                    )}

                    {!acc.isPrimary && (
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Delete account "${acc.name}"?`)) {
                            onDeleteAccount(acc.id);
                          }
                        }}
                        className="p-1 text-gray-300 hover:text-[#DC2626] cursor-pointer ml-1"
                        title="Delete account"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {!acc.isPrimary && !isEditing && (
                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => onUpdateAccount(acc.id, { isPrimary: true })}
                      className="text-[11px] text-[#2563EB] hover:underline cursor-pointer"
                    >
                      Make Primary Account
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
