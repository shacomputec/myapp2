import React from 'react';
import type { Page, Permission } from '../types';
import { SIDEBAR_MENU, SETTINGS_NAV_ITEM } from '../constants';
import { useLanguage } from '../services/localization';
import { useAuth } from '../services/auth';

interface SidebarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage }) => {
  const { t } = useLanguage();
  const { hasPermission } = useAuth();

  const NavLink: React.FC<{ item: { page: Page; icon: React.ReactNode; translationKey: string } }> = ({ item }) => {
    const isActive = currentPage === item.page;
    return (
      <button
        onClick={() => setCurrentPage(item.page)}
        className={`flex items-center w-full px-4 py-3 my-1 text-left transition-colors duration-200 rounded-lg ${
          isActive
            ? 'bg-primary text-white shadow-lg'
            : 'text-gray-600 hover:bg-primary-dark hover:text-white dark:text-slate-300 dark:hover:bg-primary'
        }`}
      >
        <span className="mr-4">{item.icon}</span>
        <span className="font-medium">{t(item.translationKey)}</span>
      </button>
    );
  };

  const filteredMenu = SIDEBAR_MENU.map(group => ({
      ...group,
      items: group.items.filter(item => item.permission === null || hasPermission(item.permission as Permission))
  })).filter(group => group.items.length > 0);

  return (
    <aside className="flex flex-col w-64 bg-white shadow-xl h-full dark:bg-slate-800">
      <div className="flex items-center justify-center h-20 border-b dark:border-slate-700">
         <div className="bg-primary text-white rounded-full h-12 w-12 flex items-center justify-center text-2xl font-bold">
            GH
         </div>
        <h1 className="text-xl font-bold text-primary ml-3">GH-HMS</h1>
      </div>
      <nav className="flex-1 p-4 overflow-y-auto">
        {filteredMenu.map((group) => (
          <div key={group.title} className="mb-4">
            <h3 className="px-4 py-2 text-xs font-semibold text-light-text uppercase tracking-wider dark:text-slate-400">
              {t(group.translationKey)}
            </h3>
            {group.items.map((item) => (
              <NavLink key={item.page} item={item} />
            ))}
          </div>
        ))}
      </nav>
      {hasPermission(SETTINGS_NAV_ITEM.permission as Permission) && (
          <div className="p-4 border-t dark:border-slate-700">
              <NavLink item={SETTINGS_NAV_ITEM} />
          </div>
      )}
    </aside>
  );
};

export default Sidebar;
