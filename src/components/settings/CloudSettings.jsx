import React, { useState, useRef } from 'react';
import { Download, Upload, Check } from 'lucide-react';

export function CloudSettings({
  settings,
  goals = [],
  spends = [],
  incomes = [],
  accounts = [],
  onExportVaultSnapshot,
  onImportVaultSnapshot,
}) {
  const fileInputRef = useRef(null);
  const [downloaded, setDownloaded] = useState(false);

  const handleExport = () => {
    if (onExportVaultSnapshot) {
      onExportVaultSnapshot({ settings, goals, spends, incomes, accounts });
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 2500);
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
    <div className="flex flex-col gap-6 pb-20 max-w-md mx-auto">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImport}
        accept=".vault,.bin,.dat,.json"
        className="hidden"
      />

      {/* Unified Flat Surface with Hairline Dividers */}
      <div className="bg-white rounded-2xl border border-slate-200/80 divide-y divide-slate-100 shadow-xs overflow-hidden">
        {/* Export Snapshot File */}
        <div className="p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Download className="size-4 text-slate-500 shrink-0" />
            <div className="min-w-0">
              <div className="text-sm font-medium text-slate-900 tracking-tight">Export Snapshot File</div>
              <div className="text-xs text-slate-400 mt-0.5">Save a portable <span className="font-mono text-slate-600">.vault</span> file to this device</div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleExport}
            className="shrink-0 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
          >
            {downloaded ? (
              <>
                <Check className="size-3 text-emerald-400" />
                <span>Saved!</span>
              </>
            ) : (
              <span>Export</span>
            )}
          </button>
        </div>

        {/* Restore Snapshot File */}
        <div className="p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Upload className="size-4 text-slate-500 shrink-0" />
            <div className="min-w-0">
              <div className="text-sm font-medium text-slate-900 tracking-tight">Restore Snapshot File</div>
              <div className="text-xs text-slate-400 mt-0.5">Import and restore from a previously saved <span className="font-mono text-slate-600">.vault</span></div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="shrink-0 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200/80 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <span>Restore</span>
          </button>
        </div>
      </div>

      {/* Minimalist Left-Border Callout Banner */}
      <div className="border-l-2 border-slate-300 pl-3.5 py-1 text-xs text-slate-500 leading-relaxed">
        <span className="font-semibold text-slate-700">Storage Protection:</span> Browser cache clears will wipe your local records. Export a <span className="font-mono text-slate-700 text-[11px] bg-slate-100 px-1 py-0.5 rounded">.vault</span> backup periodically so you can restore your data at any time.
      </div>
    </div>
  );
}
