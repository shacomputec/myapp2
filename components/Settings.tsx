
import React from 'react';
import { useLanguage, Language } from '../services/localization';
import { useSystem } from '../services/system';
import { useAuth } from '../services/auth';

const Settings: React.FC = () => {
    const { language, setLanguage, t } = useLanguage();
    const { isSystemLocked, toggleSystemLock, systemMode, setSystemMode } = useSystem();
    const { hasPermission } = useAuth();


    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setLanguage(e.target.value as Language);
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-dark-text dark:text-slate-200">{t('settings.title')}</h2>

            <div className="bg-white p-6 rounded-xl shadow-md max-w-2xl dark:bg-slate-800">
                <h3 className="text-xl font-semibold text-dark-text mb-4 dark:text-slate-200">{t('settings.preferences')}</h3>
                
                <div className="space-y-4">
                    {/* Language Selection */}
                    <div>
                        <label htmlFor="language-select" className="block text-sm font-medium text-light-text mb-1 dark:text-slate-400">
                            {t('settings.languageSupport')}
                        </label>
                        <p className="text-xs text-light-text mb-2 dark:text-slate-400">{t('settings.languageDescription')}</p>
                        <select
                            id="language-select"
                            value={language}
                            onChange={handleLanguageChange}
                            className="w-full md:w-1/2 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
                        >
                            <option value="en">English</option>
                            <option value="ak">Akan (Twi)</option>
                        </select>
                    </div>
                    
                    {/* Notifications */}
                    <div className="border-t pt-4 dark:border-slate-700">
                        <h4 className="text-md font-medium text-dark-text dark:text-slate-200">Notifications</h4>
                        <div className="mt-2 space-y-2">
                             <label className="flex items-center">
                                <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary dark:bg-slate-600 dark:border-slate-500" defaultChecked/>
                                <span className="ml-2 text-sm text-dark-text dark:text-slate-300">Email Notifications</span>
                            </label>
                             <label className="flex items-center">
                                <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary dark:bg-slate-600 dark:border-slate-500" />
                                <span className="ml-2 text-sm text-dark-text dark:text-slate-300">SMS Alerts for Critical Events</span>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="mt-6 border-t pt-4 dark:border-slate-700">
                    <button className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors">
                        Save Changes
                    </button>
                </div>
            </div>

             {hasPermission('admin:settings') && (
                 <div className="bg-white p-6 rounded-xl shadow-md max-w-2xl dark:bg-slate-800 border-t-4 border-accent">
                    <h3 className="text-xl font-semibold text-dark-text mb-4 dark:text-slate-200">System Controls</h3>
                    <div className="space-y-4">
                        {/* System Lock */}
                        <div className="flex items-center justify-between p-3 bg-light-bg rounded-lg dark:bg-slate-700">
                            <div>
                                <label htmlFor="system-lock" className="font-medium text-dark-text dark:text-slate-200">Lock System (Read-Only)</label>
                                <p className="text-xs text-light-text dark:text-slate-400">When locked, no data can be created or modified.</p>
                            </div>
                            <label htmlFor="system-lock" className="flex items-center cursor-pointer">
                                <div className="relative">
                                    <input type="checkbox" id="system-lock" className="sr-only" checked={isSystemLocked} onChange={toggleSystemLock} />
                                    <div className={`block w-14 h-8 rounded-full transition-colors ${isSystemLocked ? 'bg-accent' : 'bg-gray-300 dark:bg-slate-600'}`}></div>
                                    <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${isSystemLocked ? 'transform translate-x-6' : ''}`}></div>
                                </div>
                            </label>
                        </div>
                        {/* System Mode */}
                        <div className="flex items-center justify-between p-3 bg-light-bg rounded-lg dark:bg-slate-700">
                             <div>
                                <p className="font-medium text-dark-text dark:text-slate-200">System Mode</p>
                                <p className="text-xs text-light-text dark:text-slate-400">"Demo" mode will display a banner across the app.</p>
                            </div>
                            <div className="flex space-x-2 rounded-lg bg-gray-200 p-1 dark:bg-slate-600">
                                <button onClick={() => setSystemMode('live')} className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${systemMode === 'live' ? 'bg-primary text-white shadow' : 'text-gray-600 dark:text-slate-300'}`}>Live</button>
                                <button onClick={() => setSystemMode('demo')} className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${systemMode === 'demo' ? 'bg-secondary text-primary-dark shadow' : 'text-gray-600 dark:text-slate-300'}`}>Demo</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;
