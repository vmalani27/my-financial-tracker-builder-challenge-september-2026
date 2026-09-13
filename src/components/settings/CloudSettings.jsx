import React, { useState, useRef } from 'react';
import { Cloud, Download, Upload, RefreshCw, CheckCircle2, ShieldCheck, HardDrive } from 'lucide-react';

export function CloudSettings({
  cloudStatus = 'synced',
  settings,
  goals = [],
  spends = [],
  incomes = [],
  accounts = [],
  onSyncCloudVault,
  onExportVaultSnapshot,
  onImportVaultSnapshot,
}) {
  const fileInputRef = useRef(null);
  const [syncingState, setSyncingState] = useState(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState(false);

  const handleManualSync = async () => {
    setSyncingState(true);
    if (onSyncCloudVault) {
      await onSyncCloudVault();
      setSyncSuccessMsg(true);
      setTimeout(() => setSyncSuccessMsg(false), 2000);
    }
    setSyncingState(false);
  };

  const handleExport = () => {
    if (onExportVaultSnapshot) {
      onExportVaultSnapshot({ settings, goals, spends, incomes, accounts });
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (onImportVaultSnapshot) {
        await onImportVaultSnapshot(file);
        window.location.reload();
      }
    } catch (err) {
      alert('Failed to restore backup: ' + err.message);
    }
    e.target.value = '';
  };

  return (
    <div className="flex flex-col gap-4 pb-20">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImport}
        accept=".vault,.bin,.dat,.json"
        className="hidden"
      />

      {/* Backup Status Card */}
      <div className="bg-white rounded-2xl p-4 border border-[#E5E5E5] flex flex-col gap-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0">
              <Cloud className="size-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-[#1A1A1A]">Data Backup</div>
              <div className="text-xs text-[#6B7280]">
                {cloudStatus === 'synced' ? 'Up to date' : cloudStatus === 'syncing' ? 'Syncing...' : 'Connecting...'}
              </div>
            </div>
          </div>

          <span
            className={`text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5 ${
              cloudStatus === 'synced'
                ? 'bg-green-50 text-[#16A34A] border border-green-200'
                : 'bg-blue-50 text-[#2563EB] border border-blue-200'
            }`}
          >
            <span
              className={`size-2 rounded-full ${
                cloudStatus === 'synced' ? 'bg-[#16A34A]' : 'bg-[#2563EB] animate-pulse'
              }`}
            />
            {cloudStatus === 'synced' ? 'Connected' : 'Syncing...'}
          </span>
        </div>

        <p className="text-xs text-[#6B7280] leading-relaxed">
          Your goals, accounts, and expenses are automatically backed up so you never lose your data.
        </p>

        <button
          type="button"
          onClick={handleManualSync}
          disabled={syncingState}
          className="w-full h-10 bg-[#2563EB] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className={`size-3.5 ${syncingState ? 'animate-spin' : ''}`} />
          <span>{syncSuccessMsg ? 'Backed Up!' : syncingState ? 'Backing Up...' : 'Back Up Now'}</span>
        </button>
      </div>

      {/* Manual Backup & Restore */}
      <div className="flex flex-col gap-2">
        <div className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide px-1">
          Backup Files
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E5E5] divide-y divide-[#E5E5E5] overflow-hidden shadow-sm">
          <button
            type="button"
            onClick={handleExport}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-100 text-[#1A1A1A] flex items-center justify-center">
                <Download className="size-4" />
              </div>
              <div>
                <div className="text-sm font-medium text-[#1A1A1A]">Download Backup</div>
                <div className="text-xs text-[#6B7280]">Save a copy to your device</div>
              </div>
            </div>
            <span className="text-xs text-[#2563EB] font-semibold">Download</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-100 text-[#1A1A1A] flex items-center justify-center">
                <Upload className="size-4" />
              </div>
              <div>
                <div className="text-sm font-medium text-[#1A1A1A]">Restore from Backup</div>
                <div className="text-xs text-[#6B7280]">Upload a previously saved backup file</div>
              </div>
            </div>
            <span className="text-xs text-[#2563EB] font-semibold">Restore</span>
          </button>
        </div>
      </div>

      {/* Privacy Note */}
      <div className="p-3.5 rounded-xl bg-gray-50 border border-[#E5E5E5] flex items-start gap-2.5 text-xs text-[#6B7280]">
        <ShieldCheck className="size-4 text-[#16A34A] shrink-0 mt-0.5" />
        <div>
          Your financial data is private, secure, and stored safely on your device.
        </div>
      </div>
    </div>
  );
}
