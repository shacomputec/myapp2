import React, { useState } from 'react';
import { useAuth } from '../services/auth';

const Login: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            await login(username, password);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-light-bg dark:bg-slate-900">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-lg dark:bg-slate-800">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center bg-primary text-white rounded-full h-16 w-16 text-3xl font-bold mb-4">
                        GH
                    </div>
                    <h2 className="text-2xl font-bold text-dark-text dark:text-slate-200">
                        Sign in to GH-HMS
                    </h2>
                    <p className="mt-2 text-sm text-light-text dark:text-slate-400">
                        Ghana Hospital Management System
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="username" className="sr-only">Username</label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                autoComplete="username"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:placeholder-slate-400 dark:text-white"
                                placeholder="Username"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                        <div>
                            <label htmlFor="password-sr" className="sr-only">Password</label>
                            <input
                                id="password-sr"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:placeholder-slate-400 dark:text-white"
                                placeholder="Password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-md">
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark disabled:bg-gray-400"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Signing in...
                                </>
                            ) : (
                                'Sign in'
                            )}
                        </button>
                    </div>
                </form>
                 <div className="text-center text-xs text-light-text dark:text-slate-500">
                    <p>Demo credentials:</p>
                    <p><strong>Admin:</strong> shacomputec</p>
                    <p><strong>User:</strong> user (pw: password123)</p>
                    <p><strong>Visitor:</strong> visitor (pw: password123)</p>
                    <p><strong>Doctor:</strong> evelyn.adjei (pw: password123)</p>
                    <p><strong>Developer Contact:</strong> +233530941750</p>
                </div>
            </div>
        </div>
    );
};

export default Login;