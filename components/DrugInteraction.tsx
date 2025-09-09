
import React, { useState } from 'react';
import { getDrugInteractionAnalysis } from '../services/geminiService';
import type { DrugInteractionResult } from '../types';

const DrugInteraction: React.FC = () => {
    const [drugList, setDrugList] = useState('');
    const [results, setResults] = useState<DrugInteractionResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleCheckInteractions = async () => {
        const drugs = drugList.split('\n').map(d => d.trim()).filter(d => d.length > 0);
        if (drugs.length < 2) {
            setError('Please enter at least two drugs to check for interactions.');
            return;
        }

        setIsLoading(true);
        setError('');
        setResults([]);

        try {
            const analysis = await getDrugInteractionAnalysis(drugs);
            setResults(analysis);
        } catch (e: any) {
            setError(e.message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const severityStyles: Record<DrugInteractionResult['severity'], { bg: string, text: string, border: string }> = {
        'Severe': { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-500' },
        'Moderate': { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-500' },
        'Minor': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-500' },
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-dark-text">Drug Interaction Checker</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 bg-white p-6 rounded-xl shadow-md space-y-4">
                    <h3 className="text-lg font-semibold text-dark-text">Enter Medications</h3>
                    <p className="text-sm text-light-text">Enter one drug per line. Include both brand and generic names if possible for best results.</p>
                    <textarea
                        rows={10}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
                        placeholder="e.g., Warfarin&#10;Aspirin&#10;Lisinopril"
                        value={drugList}
                        onChange={(e) => setDrugList(e.target.value)}
                        disabled={isLoading}
                    />
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    <button
                        onClick={handleCheckInteractions}
                        disabled={isLoading}
                        className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:bg-gray-400 flex items-center justify-center"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Checking...
                            </>
                        ) : 'Check for Interactions'}
                    </button>
                </div>
                
                <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-md">
                    <h3 className="text-lg font-semibold text-dark-text mb-4">AI Analysis Results</h3>
                    <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                        {isLoading && (
                            <div className="text-center p-8 text-light-text">
                                Analyzing potential interactions...
                            </div>
                        )}
                        {!isLoading && results.length === 0 && (
                            <div className="text-center p-8 border-2 border-dashed rounded-lg text-light-text">
                                <p>No interactions found, or no analysis performed yet.</p>
                            </div>
                        )}
                        {!isLoading && results.map((result, index) => {
                            const styles = severityStyles[result.severity];
                            return (
                                <div key={index} className={`p-4 rounded-lg border-l-4 ${styles.bg} ${styles.border}`}>
                                    <div className="flex justify-between items-center">
                                        <h4 className="font-bold text-dark-text">{result.drugsInvolved.join(' + ')}</h4>
                                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${styles.bg} ${styles.text}`}>{result.severity}</span>
                                    </div>
                                    <p className="mt-2 text-sm text-dark-text">{result.explanation}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DrugInteraction;
