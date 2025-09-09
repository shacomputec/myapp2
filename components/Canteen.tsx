import React, { useState, useMemo } from 'react';
import { MOCK_PATIENTS, MOCK_CANTEEN_INVENTORY } from '../constants';
import type { Patient, CanteenItem, DietPlan } from '../types';
import { getMealSuggestionForPatient } from '../services/geminiService';

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; }> = ({ title, value, icon }) => (
  <div className="bg-white p-6 rounded-xl shadow-md flex items-center justify-between dark:bg-slate-800 dark:border dark:border-slate-700">
    <div>
      <p className="text-sm font-medium text-light-text dark:text-slate-400">{title}</p>
      <p className="text-3xl font-bold text-dark-text dark:text-slate-200">{value}</p>
    </div>
    <div className="text-primary">
      {icon}
    </div>
  </div>
);

const MealSuggestionModal: React.FC<{ patient: Patient | null; onClose: () => void; }> = ({ patient, onClose }) => {
    const [suggestion, setSuggestion] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    React.useEffect(() => {
        if (patient) {
            setIsLoading(true);
            setSuggestion('');
            getMealSuggestionForPatient(patient.medicalHistory[0]?.diagnosis, patient.dietaryPlan || 'Standard')
                .then(setSuggestion)
                .catch(() => setSuggestion('Error generating suggestion.'))
                .finally(() => setIsLoading(false));
        }
    }, [patient]);

    if (!patient) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-8 relative dark:bg-slate-800">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <h3 className="text-xl font-bold text-dark-text mb-2 dark:text-slate-200">AI Meal Suggestion for {patient.name}</h3>
                <p className="text-sm text-light-text mb-4 dark:text-slate-400">Diagnosis: {patient.medicalHistory[0]?.diagnosis} | Plan: {patient.dietaryPlan}</p>
                <div className="bg-light-bg p-4 rounded-lg min-h-[200px] max-h-[60vh] overflow-y-auto dark:bg-slate-700">
                    {isLoading ? (
                         <div className="flex justify-center items-center h-full">
                            <p className="text-light-text dark:text-slate-400">Generating meal plan...</p>
                        </div>
                    ) : (
                        <div className="prose prose-sm max-w-none text-gray-800 dark:text-slate-300 dark:[&_strong]:text-slate-200" dangerouslySetInnerHTML={{ __html: suggestion.replace(/\n/g, '<br />') }} />
                    )}
                </div>
            </div>
        </div>
    );
};


const Canteen: React.FC = () => {
    const [patients, setPatients] = useState<Patient[]>(MOCK_PATIENTS);
    const [inventory, setInventory] = useState<CanteenItem[]>(MOCK_CANTEEN_INVENTORY);
    const [activeTab, setActiveTab] = useState<'Diet Plans' | 'Inventory'>('Diet Plans');
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

    const summary = useMemo(() => ({
        specialDiets: patients.filter(p => p.dietaryPlan !== 'Standard').length,
        lowStockItems: inventory.filter(i => i.quantity < i.reorderLevel).length,
        mealsServed: 128, // Mock static value
    }), [patients, inventory]);
    
    const handleDietChange = (patientId: string, newPlan: DietPlan) => {
        setPatients(prev => prev.map(p => p.id === patientId ? { ...p, dietaryPlan: newPlan } : p));
    };

    const dietPlanColors: Record<DietPlan, string> = {
        'Standard': 'bg-gray-100 text-gray-800 dark:bg-slate-600 dark:text-slate-300',
        'Diabetic': 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
        'Low Sodium': 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
        'Soft Foods': 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
        'Liquid': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
    };

    const renderContent = () => {
        if (activeTab === 'Diet Plans') {
            return (
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-light-bg dark:bg-slate-700">
                            <tr>
                                <th className="p-3 font-semibold text-light-text dark:text-slate-300">Patient</th>
                                <th className="p-3 font-semibold text-light-text dark:text-slate-300">Ward</th>
                                <th className="p-3 font-semibold text-light-text dark:text-slate-300">Dietary Plan</th>
                                <th className="p-3 font-semibold text-light-text dark:text-slate-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="dark:text-slate-400">
                            {patients.map(patient => (
                                <tr key={patient.id} className="border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50">
                                    <td className="p-3 font-medium text-dark-text dark:text-slate-200">{patient.name}</td>
                                    <td className="p-3">General</td>
                                    <td className="p-3">
                                        <select 
                                            value={patient.dietaryPlan} 
                                            onChange={e => handleDietChange(patient.id, e.target.value as DietPlan)}
                                            className={`border-none rounded-full px-2 py-1 text-xs font-semibold focus:ring-2 focus:ring-primary ${dietPlanColors[patient.dietaryPlan || 'Standard']}`}
                                        >
                                            <option>Standard</option>
                                            <option>Diabetic</option>
                                            <option>Low Sodium</option>
                                            <option>Soft Foods</option>
                                            <option>Liquid</option>
                                        </select>
                                    </td>
                                    <td className="p-3">
                                        <button onClick={() => setSelectedPatient(patient)} className="bg-secondary text-primary-dark px-3 py-1 rounded-lg hover:bg-yellow-400 transition-colors text-sm font-semibold">
                                            Get AI Meal Suggestion
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        }
        if (activeTab === 'Inventory') {
            return (
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-light-bg dark:bg-slate-700">
                            <tr>
                                <th className="p-3 font-semibold text-light-text dark:text-slate-300">Item</th>
                                <th className="p-3 font-semibold text-light-text dark:text-slate-300">Quantity</th>
                                <th className="p-3 font-semibold text-light-text dark:text-slate-300">Reorder Level</th>
                                <th className="p-3 font-semibold text-light-text dark:text-slate-300">Status</th>
                            </tr>
                        </thead>
                        <tbody className="dark:text-slate-400">
                            {inventory.map(item => {
                                const isLow = item.quantity < item.reorderLevel;
                                return (
                                <tr key={item.id} className="border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50">
                                    <td className="p-3 font-medium text-dark-text dark:text-slate-200">{item.name}</td>
                                    <td className="p-3">{item.quantity} {item.unit}</td>
                                    <td className="p-3">{item.reorderLevel} {item.unit}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${isLow ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' : 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'}`}>
                                            {isLow ? 'Low Stock' : 'In Stock'}
                                        </span>
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                </div>
            );
        }
    };

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-dark-text dark:text-slate-200">Canteen Management</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Meals Served Today" value={summary.mealsServed.toString()} icon={<CanteenIcon />} />
                <StatCard title="Patients on Special Diets" value={summary.specialDiets.toString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857" /></svg>} />
                <StatCard title="Low Stock Food Items" value={summary.lowStockItems.toString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>} />
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md dark:bg-slate-800 dark:border dark:border-slate-700">
                <div className="border-b mb-4 dark:border-slate-700">
                    <nav className="flex space-x-4">
                        {(['Diet Plans', 'Inventory'] as const).map(tab => (
                            <button 
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-3 py-2 font-medium text-sm rounded-t-lg ${activeTab === tab ? 'border-b-2 border-primary text-primary' : 'text-light-text hover:text-dark-text dark:text-slate-400 dark:hover:text-slate-200'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </nav>
                </div>
                {renderContent()}
            </div>
            {selectedPatient && <MealSuggestionModal patient={selectedPatient} onClose={() => setSelectedPatient(null)} />}
        </div>
    );
};

// Canteen Icon for StatCard
const CanteenIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 15 8 15 10c2-1 2.657-1.343 2.657-1.343a8 8 0 010 10z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a6 6 0 006-6c0-2-1-4-2-5" />
    </svg>
);

export default Canteen;
