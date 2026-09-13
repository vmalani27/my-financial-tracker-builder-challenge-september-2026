import React from 'react';
import { Home, Target, Receipt, Settings } from 'lucide-react';

export function BottomNav({ activeTab, onSelectTab }) {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'spends', label: 'Spends', icon: Receipt },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-[390px] mx-auto bg-white border-t border-[#E5E5E5] h-16 z-30 flex items-center justify-around px-2">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelectTab(tab.id)}
            className="flex-1 flex flex-col items-center justify-center h-full py-1 transition-none"
          >
            <Icon
              className={`size-5 ${
                isActive ? 'text-[#2563EB]' : 'text-gray-400'
              }`}
            />
            <span
              className={`text-xs mt-1 ${
                isActive ? 'text-[#2563EB] font-medium' : 'text-gray-400'
              }`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
