import React from 'react';

const AccessDenied: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center bg-white p-8 rounded-xl shadow-md dark:bg-slate-800 dark:border dark:border-slate-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-accent mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
            <h2 className="text-3xl font-bold text-dark-text mb-2 dark:text-slate-200">Access Denied</h2>
            <p className="text-light-text max-w-md dark:text-slate-400">
                You do not have the necessary permissions to view this page. Please contact an administrator if you believe this is an error.
            </p>
        </div>
    );
};

export default AccessDenied;
