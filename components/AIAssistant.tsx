

import React, { useState } from 'react';
import { getSymptomAnalysis } from '../services/geminiService';
import { MOCK_PATIENTS } from '../constants';
import { useLanguage } from '../services/localization';

const AIAssistant: React.FC = () => {
  const [selectedPatientId, setSelectedPatientId] = useState<string>(MOCK_PATIENTS[0].id);
  const [symptoms, setSymptoms] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { t } = useLanguage();

  const handleAnalyze = async () => {
    if (!symptoms) {
      setError('Please enter patient symptoms.');
      return;
    }
    setIsLoading(true);
    setError('');
    setAnalysis('');
    
    const patient = MOCK_PATIENTS.find(p => p.id === selectedPatientId);
    const patientHistory = patient 
        ? `Allergies: ${patient.allergies.join(', ') || 'None'}. Past diagnoses: ${patient.medicalHistory.map(h => h.diagnosis).join(', ')}.`
        : "No patient history available.";

    try {
      const result = await getSymptomAnalysis(symptoms, patientHistory);
      setAnalysis(result);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
       <h2 className="text-3xl font-bold text-dark-text dark:text-slate-200">{t('aiAssistant.title')}</h2>
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Input Section */}
            <div className="md:col-span-1 bg-white p-6 rounded-xl shadow-md space-y-4 dark:bg-slate-800 dark:border dark:border-slate-700">
                 <h3 className="text-lg font-semibold text-dark-text dark:text-slate-200">{t('aiAssistant.patientInfo')}</h3>
                 <div>
                    <label htmlFor="patient-select" className="block text-sm font-medium text-light-text mb-1 dark:text-slate-400">{t('aiAssistant.selectPatient')}</label>
                    <select
                        id="patient-select"
                        value={selectedPatientId}
                        onChange={(e) => setSelectedPatientId(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
                    >
                        {MOCK_PATIENTS.map(p => <option key={p.id} value={p.id}>{p.name} ({p.id})</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="symptoms" className="block text-sm font-medium text-light-text mb-1 dark:text-slate-400">{t('aiAssistant.symptoms')}</label>
                    <textarea
                        id="symptoms"
                        rows={8}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:placeholder-slate-400"
                        placeholder={t('aiAssistant.symptomsPlaceholder')}
                        value={symptoms}
                        onChange={(e) => setSymptoms(e.target.value)}
                        disabled={isLoading}
                    />
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <button
                    onClick={handleAnalyze}
                    disabled={isLoading}
                    className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:bg-gray-400 flex items-center justify-center"
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            {t('aiAssistant.analyzing')}
                        </>
                    ) : t('aiAssistant.getAnalysis')}
                </button>
            </div>
            
            {/* Output Section */}
            <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-md dark:bg-slate-800 dark:border dark:border-slate-700">
                <h3 className="text-lg font-semibold text-dark-text mb-4 dark:text-slate-200">{t('aiAssistant.suggestions')}</h3>
                {isLoading && (
                    <div className="text-center p-8">
                        <p className="text-light-text dark:text-slate-400">Generating clinical suggestions based on symptoms...</p>
                    </div>
                )}
                
                {analysis && !isLoading && (
                    <div className="prose prose-sm max-w-none text-gray-800 dark:text-slate-300 dark:prose-headings:text-slate-200" dangerouslySetInnerHTML={{ __html: analysis.replace(/\n/g, '<br />') }} />
                )}
                
                {!analysis && !isLoading && (
                    <div className="text-center p-8 border-2 border-dashed rounded-lg text-light-text dark:border-slate-600 dark:text-slate-400">
                        <p>{t('aiAssistant.suggestionsAppearHere')}</p>
                    </div>
                )}
            </div>
       </div>
    </div>
  );
};

export default AIAssistant;
